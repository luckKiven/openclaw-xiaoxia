"""
Video Generator Adapter - Base Class

所有视频生成适配器的基类

@author jixiang
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import time


class VideoGeneratorAdapter(ABC):
    """视频生成适配器基类"""
    
    def __init__(self, project_id: str, config: Dict = None):
        self.project_id = project_id
        self.config = config or {}
        self.output_dir = None
    
    @abstractmethod
    def generate(self, prompt: str, duration: int = 5, **kwargs) -> Dict:
        """
        生成视频
        
        Args:
            prompt: 提示词
            duration: 视频时长（秒）
            **kwargs: 其他参数
            
        Returns:
            生成结果字典
        """
        pass
    
    @abstractmethod
    def check_status(self, task_id: str) -> Dict:
        """
        检查生成状态
        
        Args:
            task_id: 任务 ID
            
        Returns:
            状态字典
        """
        pass
    
    @abstractmethod
    def download_result(self, task_id: str, output_path: str) -> bool:
        """
        下载生成的视频
        
        Args:
            task_id: 任务 ID
            output_path: 输出路径
            
        Returns:
            是否成功
        """
        pass
    
    def wait_for_completion(self, task_id: str, timeout: int = 300, poll_interval: int = 10) -> Dict:
        """
        等待任务完成
        
        Args:
            task_id: 任务 ID
            timeout: 超时时间（秒）
            poll_interval: 轮询间隔（秒）
            
        Returns:
            最终状态
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = self.check_status(task_id)
            
            if status.get("status") in ["completed", "failed", "error"]:
                return status
            
            print(f"  等待中... ({int(time.time() - start_time)}s)")
            time.sleep(poll_interval)
        
        return {"status": "timeout", "message": "等待超时"}
    
    def get_free_quota(self) -> Dict:
        """
        获取免费额度信息
        
        Returns:
            额度信息字典
        """
        return {
            "available": False,
            "daily_limit": 0,
            "used_today": 0,
            "remaining": 0
        }
