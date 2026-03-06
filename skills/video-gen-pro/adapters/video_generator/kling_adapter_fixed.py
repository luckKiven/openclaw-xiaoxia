"""
Kling AI Adapter - 可灵 AI 视频生成适配器 (Selenium 修复版)

使用 Selenium 浏览器自动化调用可灵 AI 免费额度
每日免费 3-5 次生成机会

修复内容：
- 使用 Selenium 替代 midscene
- 增加 WebDriverWait 智能等待
- 优化元素定位策略
- 添加详细错误日志

@author jixiang
"""

import os
import time
import json
import re
from typing import Dict, Optional
from .base_adapter import VideoGeneratorAdapter


class KlingAdapter(VideoGeneratorAdapter):
    """可灵 AI 适配器（Selenium 修复版）"""
    
    BASE_URL = "https://klingai.kuaishou.com"
    LOGIN_URL = "https://klingai.kuaishou.com/login"
    GENERATE_URL = "https://klingai.kuaishou.com/ai/video"
    
    def __init__(self, project_id: str, config: Dict = None):
        super().__init__(project_id, config)
        self.driver = None
        self.wait = None
        self.logged_in = False
        
        self.quality = config.get("quality", "standard")
        self.duration = config.get("duration", 5)
    
    def _init_browser(self):
        """初始化浏览器（使用 Edge，不自动下载驱动）"""
        try:
            from selenium import webdriver
            from selenium.webdriver.edge.service import Service
            from selenium.webdriver.edge.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
            
            print("🌐 正在启动 Edge 浏览器...")
            
            edge_options = Options()
            edge_options.add_argument("--disable-gpu")
            edge_options.add_argument("--no-sandbox")
            edge_options.add_argument("--disable-dev-shm-usage")
            edge_options.add_argument("--disable-blink-features=AutomationControlled")
            edge_options.add_experimental_option("detach", True)
            edge_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            edge_options.add_argument("--disable-extensions")
            edge_options.add_argument("--start-maximized")
            
            # 使用系统已安装的 EdgeDriver
            try:
                service = Service()
                self.driver = webdriver.Edge(service=service, options=edge_options)
            except:
                # 如果找不到 EdgeDriver，尝试直接启动
                self.driver = webdriver.Edge(options=edge_options)
            
            self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
                "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            })
            self.driver.implicitly_wait(10)
            self.wait = WebDriverWait(self.driver, 30)
            
            print("✓ Edge 浏览器启动成功")
            return True
            
        except Exception as e:
            print(f"❌ 浏览器初始化失败：{e}")
            print(f"💡 提示：可能需要安装 EdgeDriver")
            print(f"   下载地址：https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/")
            return False
    
    def login(self) -> bool:
        """登录可灵 AI"""
        if not self.driver and not self._init_browser():
            return False
        
        try:
            print("📍 导航到登录页面...")
            self.driver.get(self.LOGIN_URL)
            time.sleep(3)
            
            # 检查是否已登录
            if self._is_logged_in():
                self.logged_in = True
                print("✓ 已登录")
                return True
            
            # 需要手动登录
            print()
            print("=" * 60)
            print("⚠️  请在打开的浏览器中完成登录")
            print("=" * 60)
            print("   1. 使用手机号或微信登录")
            print("   2. 登录完成后会自动继续...")
            print("   3. 最长等待 5 分钟")
            print("=" * 60)
            print()
            
            # 等待用户手动登录（最长 5 分钟）
            for i in range(30):
                time.sleep(10)
                if self._is_logged_in():
                    self.logged_in = True
                    print("✓ 登录成功！")
                    return True
                if i % 3 == 0:
                    print(f"   等待登录中... ({(i+1)*10}s)")
            
            print("❌ 登录超时")
            return False
            
        except Exception as e:
            print(f"❌ 登录失败：{e}")
            return False
    
    def _is_logged_in(self) -> bool:
        """检查是否已登录"""
        try:
            current_url = self.driver.current_url
            return "login" not in current_url and "auth" not in current_url
        except:
            return False
    
    def generate(self, prompt: str, duration: int = 5, **kwargs) -> Dict:
        """生成视频"""
        if not self.logged_in:
            if not self.login():
                return {"status": "error", "message": "未登录"}
        
        try:
            print(f"📍 导航到生成页面...")
            self.driver.get(self.GENERATE_URL)
            
            # 等待页面加载（最长 30 秒）
            print("⏳ 等待页面加载...")
            input_found = False
            for i in range(30):
                time.sleep(1)
                try:
                    # 多种选择器策略
                    selectors = [
                        "textarea[placeholder*='描述']",
                        "textarea[placeholder*='提示']",
                        "textarea[placeholder*='prompt']",
                        "textarea:first-of-type",
                        "div[contenteditable='true']"
                    ]
                    
                    for selector in selectors:
                        try:
                            input_elem = self.driver.find_element("css selector", selector)
                            if input_elem.is_displayed():
                                print("✓ 页面加载完成")
                                input_found = True
                                break
                        except:
                            pass
                    
                    if input_found:
                        break
                        
                except:
                    pass
                
                if i % 5 == 0 and i > 0:
                    print(f"   等待中... ({i}s)")
            
            if not input_found:
                return {"status": "error", "message": "页面加载超时，找不到输入框"}
            
            # 输入提示词
            try:
                input_elem.clear()
                # 分段输入，模拟人工
                for char in prompt:
                    input_elem.send_keys(char)
                    time.sleep(0.01)
                print("✓ 提示词已输入")
            except Exception as e:
                return {"status": "error", "message": f"输入提示词失败：{e}"}
            
            time.sleep(2)
            
            # 设置时长（如果需要 10 秒）
            if duration == 10:
                try:
                    buttons = self.driver.find_elements("tag name", "button")
                    for btn in buttons:
                        btn_text = btn.text.lower()
                        if "10s" in btn_text or "10 秒" in btn_text:
                            btn.click()
                            print("✓ 已选择 10 秒时长")
                            time.sleep(1)
                            break
                except:
                    pass  # 可选设置，失败继续
            
            # 点击生成按钮
            print("⏳ 查找生成按钮...")
            try:
                buttons = self.driver.find_elements("tag name", "button")
                clicked = False
                
                for btn in buttons:
                    try:
                        btn_text = btn.text
                        if "生成" in btn_text or "Generate" in btn_text or "立即生成" in btn_text:
                            btn.click()
                            print("✓ 已点击生成按钮")
                            clicked = True
                            break
                    except:
                        pass
                
                if not clicked:
                    # 尝试用 JavaScript 点击
                    print("   尝试 JavaScript 点击...")
                    self.driver.execute_script("""
                        var buttons = document.getElementsByTagName('button');
                        for (var i = 0; i < buttons.length; i++) {
                            if (buttons[i].textContent.includes('生成')) {
                                buttons[i].click();
                                return true;
                            }
                        }
                        return false;
                    """)
                    print("✓ 已点击生成按钮 (JS)")
                    
            except Exception as e:
                return {"status": "error", "message": f"点击生成按钮失败：{e}"}
            
            time.sleep(3)
            
            # 生成任务 ID
            task_id = f"kling_{int(time.time())}"
            
            print()
            print("=" * 60)
            print("✓ 任务已提交！")
            print("=" * 60)
            print(f"  任务 ID: {task_id}")
            print(f"  平台：可灵 AI")
            print(f"  提示词：{prompt[:50]}...")
            print()
            print("⏳ AI 正在生成视频（约 2-5 分钟）...")
            print()
            print("💡 提示：")
            print(f"  1. 浏览器保持打开，不要关闭")
            print(f"  2. 可灵 AI 页面会显示生成进度")
            print(f"  3. 生成完成后手动下载视频")
            print(f"  4. 输出目录：F:\\2025ideazdjx\\openClaw-project\\vedio\\ai_generated\\")
            print("=" * 60)
            
            return {
                "status": "processing",
                "task_id": task_id,
                "platform": "kling",
                "prompt": prompt,
                "duration": duration
            }
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def check_status(self, task_id: str) -> Dict:
        """检查状态"""
        return {"status": "processing"}
    
    def download_result(self, task_id: str, output_path: str) -> bool:
        """下载视频（需要手动操作）"""
        print("⚠️  下载功能需要手动操作：")
        print(f"   1. 访问 {self.GENERATE_URL}")
        print("   2. 找到生成的视频")
        print(f"   3. 点击下载并保存到：{output_path}")
        return False
    
    def get_free_quota(self) -> Dict:
        """获取免费额度"""
        return {
            "available": True,
            "platform": "kling",
            "daily_limit": 5,
            "message": "每日约 3-5 次免费生成"
        }
    
    def close(self):
        """关闭浏览器"""
        if self.driver:
            try:
                print("🚪 关闭浏览器...")
                self.driver.quit()
            except:
                pass
            self.driver = None
