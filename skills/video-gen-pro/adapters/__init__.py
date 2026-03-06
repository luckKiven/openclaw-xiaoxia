"""
Video-Gen-Pro 技能适配器模块

适配器负责与外部技能/API 集成

@author jixiang
"""

from .input_adapter import InputAdapter
from .voice_synthesizer import VoiceSynthesizer
from .video_editor import VideoEditor
from .bgm_selector import BGMSelector
from .script_generator import ScriptGenerator
from .output_packager import OutputPackager

__all__ = [
    "InputAdapter",
    "VoiceSynthesizer",
    "VideoEditor",
    "BGMSelector",
    "ScriptGenerator",
    "OutputPackager",
]
