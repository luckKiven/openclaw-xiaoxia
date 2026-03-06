"""
Video Generator Adapters

视频生成适配器模块

@author jixiang
"""

from .base_adapter import VideoGeneratorAdapter
from .kling_adapter import KlingAdapter
from .jimeng_adapter import JimengAdapter

__all__ = [
    "VideoGeneratorAdapter",
    "KlingAdapter",
    "JimengAdapter",
]


def get_adapter(platform: str, project_id: str, config: dict = None):
    """
    获取视频生成适配器
    
    Args:
        platform: 平台名称 (kling/jimeng)
        project_id: 项目 ID
        config: 配置字典
        
    Returns:
        适配器实例
    """
    adapters = {
        "kling": KlingAdapter,
        "jimeng": JimengAdapter,
        "可灵": KlingAdapter,
        "即梦": JimengAdapter,
    }
    
    adapter_class = adapters.get(platform.lower())
    if not adapter_class:
        raise ValueError(f"不支持的平台：{platform}，支持的平台：{list(adapters.keys())}")
    
    return adapter_class(project_id, config)
