"""
Jimeng AI Adapter - 即梦 AI 视频生成适配器

使用浏览器自动化调用即梦 AI 免费额度
注册送免费积分，新用户约 10-20 次生成机会

@author jixiang
"""

import os
import time
import json
from typing import Dict, Optional
from .base_adapter import VideoGeneratorAdapter


class JimengAdapter(VideoGeneratorAdapter):
    """即梦 AI 适配器"""
    
    BASE_URL = "https://jimeng.jianying.com"
    LOGIN_URL = "https://jimeng.jianying.com/login"
    GENERATE_URL = "https://jimeng.jianying.com/ai-tool/video"
    
    def __init__(self, project_id: str, config: Dict = None):
        super().__init__(project_id, config)
        self.browser = None
        self.logged_in = False
        
        # 即梦配置
        self.model_version = config.get("model", "3.0")  # 3.0/3.0 Pro/S2.0
        self.quality = config.get("quality", "720p")  # 720p/1080p
        self.duration = config.get("duration", 5)  # 5/10 秒
        self.aspect_ratio = config.get("aspect_ratio", "16:9")
    
    def _init_browser(self):
        """初始化浏览器"""
        try:
            from midscene import Page
            self.browser = Page()
            return True
        except ImportError:
            print("⚠️  需要安装 midscene: pip install midscene")
            return False
        except Exception as e:
            print(f"❌ 浏览器初始化失败：{e}")
            return False
    
    def login(self) -> bool:
        """
        登录即梦 AI
        
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
            print("   即梦 AI 支持抖音/头条/手机号登录")
            print("   新用户注册送免费积分！")
            
            # 等待用户手动登录（最长 5 分钟）
            for i in range(30):
                time.sleep(10)
                if self._is_logged_in():
                    self.logged_in = True
                    print("✓ 登录成功")
                    
                    # 显示免费额度
                    quota = self.get_free_quota()
                    if quota.get("available"):
                        print(f"🎁 免费额度：剩余 {quota.get('remaining', '?')} 次")
                    
                    return True
            
            print("❌ 登录超时")
            return False
            
        except Exception as e:
            print(f"❌ 登录失败：{e}")
            return False
    
    def _is_logged_in(self) -> bool:
        """检查是否已登录"""
        try:
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
            input_selector = "textarea[placeholder*='描述'], textarea[placeholder*='提示词']"
            self.browser.type(input_selector, prompt)
            
            # 设置模型版本
            if self.model_version == "3.0 Pro":
                self.browser.click("button:contains('3.0 Pro'), button:contains('Pro')")
            elif self.model_version == "S2.0":
                self.browser.click("button:contains('S2.0')")
            
            # 设置画质
            if self.quality == "1080p":
                self.browser.click("button:contains('1080p'), button:contains('高清')")
            
            # 设置时长
            if duration == 10:
                self.browser.click("button:contains('10s')")
            
            # 点击生成
            generate_button = "button:contains('生成'), button:contains('立即生成')"
            self.browser.click(generate_button)
            
            # 等待任务创建
            time.sleep(3)
            
            # 获取任务 ID
            task_id = self._get_current_task_id()
            
            if task_id:
                print(f"✓ 任务已创建：{task_id}")
                
                # 消耗积分提示
                cost = self._estimate_cost()
                print(f"💰 预计消耗：{cost} 积分")
                
                return {
                    "status": "processing",
                    "task_id": task_id,
                    "platform": "jimeng",
                    "prompt": prompt,
                    "duration": duration,
                    "model": self.model_version,
                    "quality": self.quality
                }
            else:
                return {"status": "error", "message": "未能获取任务 ID"}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _get_current_task_id(self) -> Optional[str]:
        """获取当前任务 ID"""
        try:
            task_info = self.browser.evaluate("""() => {
                const url = window.location.href;
                const match = url.match(/task\/([a-zA-Z0-9]+)/);
                if (match) return match[1];
                
                const taskElement = document.querySelector('[data-task-id], [class*="task-"]');
                if (taskElement) {
                    return taskElement.getAttribute('data-task-id') || 
                           taskElement.getAttribute('id');
                }
                
                return null;
            }""")
            return task_info
        except:
            return None
    
    def _estimate_cost(self) -> int:
        """估算积分消耗"""
        # 即梦定价（参考）
        # 720p 5 秒 ≈ 10-15 积分
        # 1080p 5 秒 ≈ 20-30 积分
        base_cost = 15 if self.quality == "720p" else 25
        if self.duration == 10:
            base_cost *= 2
        if self.model_version == "3.0 Pro":
            base_cost = int(base_cost * 1.5)
        return base_cost
    
    def check_status(self, task_id: str) -> Dict:
        """检查生成状态"""
        try:
            task_url = f"{self.GENERATE_URL}/{task_id}"
            self.browser.navigate(task_url)
            time.sleep(2)
            
            status_info = self.browser.evaluate("""() => {
                const statusElement = document.querySelector('.task-status, [class*="status"], [class*="progress"]');
                if (!statusElement) return { status: 'unknown' };
                
                const text = statusElement.textContent.toLowerCase();
                
                if (text.includes('完成') || text.includes('completed') || text.includes('success')) {
                    return { status: 'completed' };
                } else if (text.includes('失败') || text.includes('failed') || text.includes('error')) {
                    return { status: 'failed' };
                } else if (text.includes('生成') || text.includes('generating') || text.includes('processing')) {
                    // 尝试获取进度
                    const progressElement = document.querySelector('.progress-bar, [class*="progress"]');
                    let progress = 50;
                    if (progressElement) {
                        const style = progressElement.getAttribute('style');
                        if (style) {
                            const match = style.match(/width:\\s*(\\d+)%/);
                            if (match) progress = parseInt(match[1]);
                        }
                    }
                    return { status: 'processing', progress };
                } else if (text.includes('排队') || text.includes('queue')) {
                    return { status: 'queuing' };
                }
                
                return { status: 'unknown' };
            }""")
            
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
                const video = document.querySelector('video');
                if (video) return video.src;
                
                const downloadBtn = document.querySelector('a[download], button:contains("下载"), button:contains("保存")');
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
            
            import requests
            
            response = requests.get(video_url, stream=True)
            response.raise_for_status()
            
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
            
            # 导航到积分页面
            self.browser.navigate(f"{self.BASE_URL}/credit")
            time.sleep(2)
            
            quota_info = self.browser.evaluate("""() => {
                const creditElement = document.querySelector('.credit-count, [class*="credit"], [class*="积分"]');
                if (!creditElement) return null;
                
                const text = creditElement.textContent;
                const match = text.match(/(\\d+)/);
                
                return {
                    remaining: match ? parseInt(match[1]) : 0
                };
            }""")
            
            if quota_info:
                remaining = quota_info.get("remaining", 0)
                # 估算可生成次数（平均每次 15-25 积分）
                estimated_times = remaining // 20
                
                return {
                    "available": True,
                    "platform": "jimeng",
                    "credit_remaining": remaining,
                    "estimated_generations": estimated_times,
                    "message": f"剩余{remaining}积分，约可生成{estimated_times}次"
                }
            
            return {
                "available": True,
                "platform": "jimeng",
                "message": "新用户注册送免费积分"
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
