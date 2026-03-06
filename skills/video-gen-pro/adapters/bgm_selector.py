"""
Video-Gen-Pro 背景音乐选择器

从本地音乐库选择或生成背景音乐

输出路径：F:\2025ideazdjx\openClaw-project\vedio

@author jixiang
"""

import os
import random
import shutil
from typing import Dict, Any, List, Optional
from datetime import datetime


class BGMSelector:
    """
    背景音乐选择器
    
    从本地音乐库选择合适的背景音乐
    """
    
    # 情感分类映射
    EMOTION_CATEGORIES = {
        "happy": ["欢快", "轻松", "愉悦", "阳光"],
        "sad": ["悲伤", "忧郁", "感伤", "抒情"],
        "exciting": ["激情", "动感", "电子", "摇滚"],
        "calm": ["平静", "舒缓", "冥想", "自然"],
        "professional": ["专业", "商务", "科技", "现代"],
        "romantic": ["浪漫", "温馨", "爱情", "柔和"],
    }
    
    def __init__(self, music_lib_dir: str, output_dir: str):
        """
        初始化 BGM 选择器
        
        Args:
            music_lib_dir: 本地音乐库目录
            output_dir: 输出目录
        """
        self.music_lib_dir = music_lib_dir
        self.output_dir = os.path.join(output_dir, "audio")
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 确保音乐库目录存在
        if not os.path.exists(music_lib_dir):
            os.makedirs(music_lib_dir, exist_ok=True)
            # 创建示例分类目录
            for category in ["欢快", "舒缓", "专业", "激情", "浪漫"]:
                os.makedirs(os.path.join(music_lib_dir, category), exist_ok=True)
    
    def select(self, project_id: str, step_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        选择背景音乐
        
        Args:
            project_id: 项目 ID
            step_config: 步骤配置，包含：
                - emotion: 情感类型 (happy/sad/exciting/calm/professional/romantic)
                - duration: 目标时长（秒）
                - volume: 音量 (0.0-1.0)
                - fade_in: 淡入时长（秒）
                - fade_out: 淡出时长（秒）
                
        Returns:
            选择结果字典
        """
        # 获取配置
        emotion = step_config.get("emotion", "professional")
        target_duration = step_config.get("duration", 60)
        volume = step_config.get("volume", 0.3)
        fade_in = step_config.get("fade_in", 2)
        fade_out = step_config.get("fade_out", 3)
        
        # 获取情感对应的中文分类
        categories = self.EMOTION_CATEGORIES.get(emotion, ["专业"])
        
        # 在音乐库中搜索
        selected_music = self._search_music(categories, target_duration)
        
        if not selected_music:
            # 如果没有找到，返回空音乐（静音）
            return {
                "success": True,
                "output_file": None,
                "message": "No background music found, using silence",
                "fallback": True
            }
        
        # 复制音乐到项目目录
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(self.output_dir, f"bgm_{timestamp}.mp3")
        
        try:
            shutil.copy2(selected_music, output_file)
            
            return {
                "success": True,
                "output_file": output_file,
                "source_file": selected_music,
                "emotion": emotion,
                "duration_seconds": self._get_audio_duration(selected_music),
                "settings": {
                    "volume": volume,
                    "fade_in": fade_in,
                    "fade_out": fade_out,
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to copy background music"
            }
    
    def _search_music(self, categories: List[str], target_duration: int) -> Optional[str]:
        """在音乐库中搜索合适的音乐"""
        candidates = []
        
        # 遍历分类目录
        for category in categories:
            category_dir = os.path.join(self.music_lib_dir, category)
            if os.path.exists(category_dir):
                for filename in os.listdir(category_dir):
                    if filename.endswith((".mp3", ".wav", ".m4a", ".flac")):
                        filepath = os.path.join(category_dir, filename)
                        candidates.append(filepath)
        
        if not candidates:
            # 如果分类目录没有找到，搜索整个音乐库
            for root, dirs, files in os.walk(self.music_lib_dir):
                for filename in files:
                    if filename.endswith((".mp3", ".wav", ".m4a", ".flac")):
                        candidates.append(os.path.join(root, filename))
        
        if not candidates:
            return None
        
        # 随机选择一首
        return random.choice(candidates)
    
    def _get_audio_duration(self, audio_file: str) -> float:
        """获取音频时长（秒）"""
        try:
            from mutagen.mp3 import MP3
            audio = MP3(audio_file)
            return round(audio.info.length, 2)
        except ImportError:
            try:
                from mutagen import File
                audio = File(audio_file)
                if audio:
                    return round(audio.info.length, 2)
            except Exception:
                pass
            return 0.0
    
    def add_music(self, filepath: str, category: str = "专业") -> bool:
        """
        添加音乐到库
        
        Args:
            filepath: 音乐文件路径
            category: 分类名称
            
        Returns:
            是否成功
        """
        if not os.path.exists(filepath):
            return False
        
        category_dir = os.path.join(self.music_lib_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        filename = os.path.basename(filepath)
        dest_path = os.path.join(category_dir, filename)
        
        # 如果已存在，添加序号
        counter = 1
        base, ext = os.path.splitext(filename)
        while os.path.exists(dest_path):
            dest_path = os.path.join(category_dir, f"{base}_{counter}{ext}")
            counter += 1
        
        shutil.copy2(filepath, dest_path)
        return True
    
    def list_library(self) -> Dict[str, List[str]]:
        """
        列出音乐库内容
        
        Returns:
            分类到音乐文件的映射
        """
        library = {}
        
        if os.path.exists(self.music_lib_dir):
            for category in os.listdir(self.music_lib_dir):
                category_dir = os.path.join(self.music_lib_dir, category)
                if os.path.isdir(category_dir):
                    music_files = [
                        f for f in os.listdir(category_dir)
                        if f.endswith((".mp3", ".wav", ".m4a", ".flac"))
                    ]
                    if music_files:
                        library[category] = music_files
        
        return library
