"""
Video-Gen-Pro Edge TTS 配音适配器

使用微软 Edge TTS 免费配音服务

输出路径：F:\2025ideazdjx\openClaw-project\vedio

@author jixiang
"""

import os
import asyncio
import edge_tts
from typing import Dict, Any, List, Optional
from datetime import datetime


class VoiceSynthesizer:
    """
    Edge TTS 配音合成器
    
    使用微软 Edge 浏览器的免费 TTS 服务
    支持多种语言和声音
    """
    
    # 常用中文声音列表
    VOICES = {
        "zh-CN-XiaoxiaoNeural": "晓晓 (女，温暖亲切)",
        "zh-CN-YunxiNeural": "云希 (男，专业稳重)",
        "zh-CN-YunyangNeural": "云扬 (男，新闻播报)",
        "zh-CN-XiaoyiNeural": "晓伊 (女，活泼)",
        "zh-CN-YunjianNeural": "云健 (男，运动激情)",
        "zh-CN-XiaochenNeural": "晓晨 (女，客服)",
        "zh-HK-HiuGaaiNeural": "嘉怡 (粤语，女)",
        "zh-TW-HsiaoChenNeural": "晓臻 (台语，女)",
    }
    
    DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
    
    def __init__(self, output_dir: str):
        """
        初始化配音合成器
        
        Args:
            output_dir: 输出目录
        """
        self.output_dir = os.path.join(output_dir, "audio")
        os.makedirs(self.output_dir, exist_ok=True)
    
    def synthesize(self, project_id: str, step_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        合成配音
        
        Args:
            project_id: 项目 ID
            step_config: 步骤配置，包含：
                - text: 要合成的文本
                - voice: 声音 ID (可选，默认 zh-CN-XiaoxiaoNeural)
                - rate: 语速 (可选，默认 +0%)
                - pitch: 音调 (可选，默认 +0Hz)
                - volume: 音量 (可选，默认 +0%)
                
        Returns:
            合成结果字典
        """
        # 获取项目目录
        from core.project_manager import ProjectManager
        pm = ProjectManager(os.path.join(os.path.dirname(__file__), "..", "projects"))
        project = pm.load_project(project_id)
        
        if not project:
            return {"error": f"Project {project_id} not found"}
        
        # 获取脚本内容
        script = step_config.get("script", "")
        if not script:
            # 尝试从项目加载脚本
            script_path = os.path.join(os.path.dirname(__file__), "..", "projects", project_id, "content_script.md")
            if os.path.exists(script_path):
                with open(script_path, "r", encoding="utf-8") as f:
                    script = f.read()
        
        if not script:
            return {"error": "No script content found"}
        
        # 提取纯文本（去掉 Markdown 格式）
        text = self._extract_plain_text(script)
        
        # 获取配置
        voice = step_config.get("voice", self.DEFAULT_VOICE)
        rate = step_config.get("rate", "+0%")
        pitch = step_config.get("pitch", "+0Hz")
        volume = step_config.get("volume", "+0%")
        
        # 生成输出文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(self.output_dir, f"voiceover_{timestamp}.mp3")
        
        try:
            # 异步合成
            asyncio.run(self._synthesize_async(text, voice, rate, pitch, volume, output_file))
            
            return {
                "success": True,
                "output_file": output_file,
                "voice": voice,
                "duration_seconds": self._get_audio_duration(output_file),
                "file_size_bytes": os.path.getsize(output_file),
                "settings": {
                    "rate": rate,
                    "pitch": pitch,
                    "volume": volume,
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "TTS synthesis failed"
            }
    
    async def _synthesize_async(self, text: str, voice: str, rate: str, pitch: str, 
                                 volume: str, output_file: str):
        """异步合成配音"""
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
        await communicate.save(output_file)
    
    def _extract_plain_text(self, markdown_text: str) -> str:
        """从 Markdown 提取纯文本"""
        import re
        
        # 去掉标题
        text = re.sub(r'^#+\s*', '', markdown_text, flags=re.MULTILINE)
        
        # 去掉粗体/斜体标记
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        
        # 去掉链接
        text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
        
        # 去掉图片
        text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
        
        # 去掉代码块
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        
        # 去掉行内代码
        text = re.sub(r'`(.*?)`', r'\1', text)
        
        # 去掉列表标记
        text = re.sub(r'^[\-\*\+]\s*', '', text, flags=re.MULTILINE)
        
        # 去掉多余空行
        text = re.sub(r'\n\s*\n', '\n', text)
        
        return text.strip()
    
    def _get_audio_duration(self, audio_file: str) -> float:
        """获取音频时长（秒）"""
        try:
            # 尝试使用 mutagen 库
            from mutagen.mp3 import MP3
            audio = MP3(audio_file)
            return round(audio.info.length, 2)
        except ImportError:
            # 如果未安装 mutagen，返回估算值
            # Edge TTS 大约 150 字/分钟
            with open(audio_file, "rb") as f:
                # 简单估算：文件大小 / 16KB/s ≈ 秒数
                return round(os.path.getsize(audio_file) / 16000, 2)
        except Exception:
            return 0.0
    
    def list_available_voices(self) -> List[Dict[str, str]]:
        """列出可用声音"""
        return [
            {"id": voice_id, "name": voice_name}
            for voice_id, voice_name in self.VOICES.items()
        ]
    
    def preview_voice(self, voice_id: str, text: str = "你好，这是声音预览") -> str:
        """
        预览声音
        
        Args:
            voice_id: 声音 ID
            text: 预览文本
            
        Returns:
            预览音频文件路径
        """
        if voice_id not in self.VOICES:
            raise ValueError(f"Unknown voice: {voice_id}")
        
        output_file = os.path.join(self.output_dir, f"preview_{voice_id}.mp3")
        asyncio.run(self._synthesize_async(text, voice_id, "+0%", "+0Hz", "+0%", output_file))
        return output_file
