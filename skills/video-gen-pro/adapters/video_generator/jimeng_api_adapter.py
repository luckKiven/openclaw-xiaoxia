"""
Jimeng AI Adapter - 即梦 AI 视频生成适配器 (官方 API 版)

使用火山引擎官方 API 调用即梦 AI
支持文生视频、图生视频

API 文档：
- 视频生成 3.0: https://www.volcengine.com/docs/85621/1792707
- 文生视频接口：https://www.volcengine.com/docs/85621/1792702

@author jixiang
"""

import os
import time
import json
import requests
from typing import Dict, Optional
from .base_adapter import VideoGeneratorAdapter


class JimengAPIAdapter(VideoGeneratorAdapter):
    """即梦 AI 适配器（官方 API 版）"""
    
    # 火山引擎 API 端点
    BASE_URL = "https://api.volcengine.com"
    API_VERSION = "2024-08-13"
    
    def __init__(self, project_id: str, config: Dict = None):
        super().__init__(project_id, config)
        
        # API 认证
        self.access_key = config.get("access_key") or os.getenv("VOLC_ACCESS_KEY")
        self.secret_key = config.get("secret_key") or os.getenv("VOLC_SECRET_KEY")
        
        if not self.access_key or not self.secret_key:
            print("⚠️  缺少火山引擎 API Key")
            print("   请设置环境变量:")
            print("   VOLC_ACCESS_KEY=your_access_key")
            print("   VOLC_SECRET_KEY=your_secret_key")
        
        # 生成配置
        self.model_version = config.get("model", "video-3.0")  # video-3.0 / video-3.0-pro
        self.quality = config.get("quality", "720p")  # 720p / 1080p
        self.duration = config.get("duration", 5)  # 5 / 10 秒
    
    def generate(self, prompt: str, duration: int = 5, **kwargs) -> Dict:
        """
        生成视频（文生视频）
        
        Args:
            prompt: 提示词
            duration: 视频时长（秒）
            
        Returns:
            生成结果
        """
        if not self.access_key or not self.secret_key:
            return {"status": "error", "message": "缺少 API Key"}
        
        try:
            # API 请求参数
            headers = {
                "Content-Type": "application/json",
                "X-Api-Access-Key": self.access_key,
                "X-Api-Secret-Key": self.secret_key
            }
            
            # 根据画质选择模型
            if self.quality == "1080p":
                model = "video-3.0-1080p"
            else:
                model = "video-3.0-720p"
            
            payload = {
                "model": model,
                "prompt": prompt,
                "duration": duration,
                "resolution": "16:9",
                "seed": int(time.time()) % 1000000
            }
            
            # 发送请求
            print(f"📡 正在调用即梦 AI API...")
            print(f"   模型：{model}")
            print(f"   时长：{duration}秒")
            print(f"   提示词：{prompt[:50]}...")
            
            response = requests.post(
                f"{self.BASE_URL}/api/v1/inference/video-generation",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                task_id = result.get("task_id")
                
                if task_id:
                    print(f"✓ 任务已提交：{task_id}")
                    return {
                        "status": "processing",
                        "task_id": task_id,
                        "platform": "jimeng-api",
                        "prompt": prompt,
                        "duration": duration,
                        "model": model
                    }
                else:
                    return {"status": "error", "message": "未能获取任务 ID"}
            else:
                error_msg = response.text
                print(f"❌ API 请求失败：{response.status_code}")
                print(f"   错误：{error_msg}")
                return {"status": "error", "message": f"API 错误：{response.status_code}"}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def check_status(self, task_id: str) -> Dict:
        """检查任务状态"""
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Api-Access-Key": self.access_key,
                "X-Api-Secret-Key": self.secret_key
            }
            
            response = requests.get(
                f"{self.BASE_URL}/api/v1/inference/task/{task_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                status = result.get("status", "unknown")
                
                if status == "completed":
                    video_url = result.get("video_url")
                    return {
                        "status": "completed",
                        "video_url": video_url
                    }
                elif status == "failed":
                    return {
                        "status": "failed",
                        "message": result.get("error_message", "未知错误")
                    }
                else:
                    progress = result.get("progress", 0)
                    return {
                        "status": "processing",
                        "progress": progress
                    }
            else:
                return {"status": "error", "message": f"查询失败：{response.status_code}"}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def download_result(self, task_id: str, output_path: str) -> bool:
        """下载生成的视频"""
        try:
            # 先查询状态获取视频 URL
            status = self.check_status(task_id)
            
            if status.get("status") != "completed":
                print("❌ 任务未完成，无法下载")
                return False
            
            video_url = status.get("video_url")
            if not video_url:
                print("❌ 未能获取视频 URL")
                return False
            
            # 下载视频
            print(f"📥 正在下载视频...")
            response = requests.get(video_url, stream=True, timeout=300)
            response.raise_for_status()
            
            # 确保目录存在
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"✓ 视频已下载：{output_path}")
            return True
            
        except Exception as e:
            print(f"❌ 下载失败：{e}")
            return False
    
    def get_free_quota(self) -> Dict:
        """获取配额信息"""
        # API 版本需要查询火山引擎控制台
        return {
            "available": True,
            "platform": "jimeng-api",
            "message": "API 调用，按量计费或资源包"
        }
    
    def close(self):
        """清理资源"""
        pass
