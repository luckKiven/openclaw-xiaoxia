"""
Kling AI Adapter - 可灵 AI 视频生成适配器

使用浏览器自动化调用可灵 AI 免费额度
每日免费 3-5 次生成机会

@author jixiang
"""

import os
import time
import json
from typing import Dict, Optional
from .base_adapter import VideoGeneratorAdapter


class KlingAdapter(VideoGeneratorAdapter):
    """可灵 AI 适配器"""
    
    BASE_URL = "https://klingai.kuaishou.com"
    LOGIN_URL = "https://klingai.kuaishou.com/login"
    GENERATE_URL = "https://klingai.kuaishou.com/ai/video"
    
    def __init__(self, project_id: str, config: Dict = None):
        super().__init__(project_id, config)
        self.browser = None
        self.logged_in = False
        
        # 可灵配置
        self.quality = config.get("quality", "standard")  # standard/high
        self.duration = config.get("duration", 5)  # 5/10 秒
        self.aspect_ratio = config.get("aspect_ratio", "16:9")
    
    def _init_browser(self):
        """初始化浏览器"""
        try:
            # 使用 Midscene 进行浏览器自动化
            from midscene import Page
            
            self.browser = Page()
            return True
        except ImportError:
            print("⚠️  需要安装 midscene: pip install midscene")
            return False
        except Exception as e:
            print(f"❌ 浏览器初始化失败：{e}")
            return False
    
    def login(self, phone: str = None) -> bool:
        """
        登录可灵 AI
        
        Args:
            phone: 手机号（可选，用于自动登录）
            
        Returns:
            是否登录成功
        """
        if not self.browser and not self._init_browser():
            return False
        
        try:
            # 导航到登录页
            self.browser.navigate(self.LOGIN_URL)
            time.sleep(2)
            
            # 检查是否已登录
            if self._is_logged_in():
                self.logged_in = True
                print("✓ 已登录")
                return True
            
            # 需要手动登录
            print("⚠️  请在浏览器中完成登录...")
            print("   可灵 AI 支持手机号/微信登录")
            
            # 等待用户手动登录（最长 5 分钟）
            for i in range(30):
                time.sleep(10)
                if self._is_logged_in():
                    self.logged_in = True
                    print("✓ 登录成功")
                    return True
            
            print("❌ 登录超时")
            return False
            
        except Exception as e:
            print(f"❌ 登录失败：{e}")
            return False
    
    def _is_logged_in(self) -> bool:
        """检查是否已登录"""
        try:
            # 检查页面元素判断登录状态
            current_url = self.browser.evaluate("() => window.location.href")
            return "login" not in current_url
        except:
            return False
    
    def generate(self, prompt: str, duration: int = 5, **kwargs) -> Dict:
        """
        生成视频
        
        Args:
            prompt: 提示词
            duration: 视频时长（秒）
            
        Returns:
            生成结果
        """
        if not self.logged_in:
            if not self.login():
                return {"status": "error", "message": "未登录"}
        
        try:
            # 导航到生成页面
            self.browser.navigate(self.GENERATE_URL)
            time.sleep(2)
            
            # 输入提示词
            input_selector = "textarea[placeholder*='描述'], textarea[placeholder*='提示']"
            self.browser.type(input_selector, prompt)
            
            # 设置时长
            if duration == 10:
                # 选择 10 秒选项
                self.browser.click("button:contains('10s')")
            
            # 点击生成
            generate_button = "button:contains('生成'), button:contains('Generate')"
            self.browser.click(generate_button)
            
            # 等待任务创建
            time.sleep(3)
            
            # 获取任务 ID
            task_id = self._get_current_task_id()
            
            if task_id:
                print(f"✓ 任务已创建：{task_id}")
                return {
                    "status": "processing",
                    "task_id": task_id,
                    "platform": "kling",
                    "prompt": prompt,
                    "duration": duration
                }
            else:
                return {"status": "error", "message": "未能获取任务 ID"}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _get_current_task_id(self) -> Optional[str]:
        """获取当前任务 ID"""
        try:
            # 从页面 URL 或元素中提取任务 ID
            task_info = self.browser.evaluate("""() => {
                // 尝试从 URL 获取
                const url = window.location.href;
                const match = url.match(/task\/([a-zA-Z0-9]+)/);
                if (match) return match[1];
                
                // 尝试从页面元素获取
                const taskElement = document.querySelector('[data-task-id]');
                if (taskElement) return taskElement.getAttribute('data-task-id');
                
                return null;
            }""")
            return task_info
        except:
            return None
    
    def check_status(self, task_id: str) -> Dict:
        """检查生成状态"""
        try:
            # 导航到任务页面
            task_url = f"{self.GENERATE_URL}/{task_id}"
            self.browser.navigate(task_url)
            time.sleep(2)
            
            # 获取状态
            status_info = self.browser.evaluate("""() => {
                // 查找状态元素
                const statusElement = document.querySelector('.task-status, [class*="status"]');
                if (!statusElement) return { status: 'unknown' };
                
                const text = statusElement.textContent.toLowerCase();
                
                if (text.includes('完成') || text.includes('completed') || text.includes('success')) {
                    return { status: 'completed' };
                } else if (text.includes('失败') || text.includes('failed') || text.includes('error')) {
                    return { status: 'failed' };
                } else if (text.includes('生成') || text.includes('generating') || text.includes('processing')) {
                    return { status: 'processing', progress: 50 };
                } else if (text.includes('排队') || text.includes('queue')) {
                    return { status: 'queuing' };
                }
                
                return { status: 'unknown' };
            }""")
            
            # 检查是否有下载链接
            if status_info.get("status") == "completed":
                video_url = self._get_video_url(task_id)
                if video_url:
                    status_info["video_url"] = video_url
            
            return status_info
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _get_video_url(self, task_id: str) -> Optional[str]:
        """获取视频下载 URL"""
        try:
            video_url = self.browser.evaluate("""() => {
                // 查找视频元素
                const video = document.querySelector('video');
                if (video) return video.src;
                
                // 查找下载按钮
                const downloadBtn = document.querySelector('a[download], button:contains("下载")');
                if (downloadBtn) {
                    return downloadBtn.href || downloadBtn.getAttribute('data-url');
                }
                
                return null;
            }""")
            return video_url
        except:
            return None
    
    def download_result(self, task_id: str, output_path: str) -> bool:
        """下载生成的视频"""
        try:
            video_url = self._get_video_url(task_id)
            
            if not video_url:
                print("❌ 未能获取视频 URL")
                return False
            
            # 使用 requests 下载
            import requests
            
            response = requests.get(video_url, stream=True)
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
        """获取免费额度信息"""
        try:
            if not self.logged_in:
                return {
                    "available": False,
                    "message": "未登录"
                }
            
            # 导航到个人中心
            self.browser.navigate(f"{self.BASE_URL}/user/credit")
            time.sleep(2)
            
            quota_info = self.browser.evaluate("""() => {
                // 查找额度信息
                const creditElement = document.querySelector('.credit-count, [class*="credit"]');
                if (!creditElement) return null;
                
                const text = creditElement.textContent;
                const match = text.match(/(\\d+)/);
                
                return {
                    remaining: match ? parseInt(match[1]) : 0,
                    daily_limit: 5,
                    used_today: 0
                };
            }""")
            
            if quota_info:
                return {
                    "available": True,
                    "platform": "kling",
                    "daily_limit": 5,
                    "used_today": 5 - quota_info.get("remaining", 0),
                    "remaining": quota_info.get("remaining", 0)
                }
            
            return {
                "available": True,
                "platform": "kling",
                "daily_limit": 5,
                "message": "每日约 3-5 次免费机会"
            }
            
        except Exception as e:
            return {
                "available": False,
                "message": str(e)
            }
    
    def close(self):
        """关闭浏览器"""
        if self.browser:
            try:
                self.browser.close()
            except:
                pass
            self.browser = None
