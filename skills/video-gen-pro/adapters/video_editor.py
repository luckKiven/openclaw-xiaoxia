"""
Video-Gen-Pro FFmpeg 视频编辑器

使用 FFmpeg 进行视频合成、剪辑、转场等处理

输出路径：F:\2025ideazdjx\openClaw-project\vedio

@author jixiang
"""

import os
import subprocess
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class VideoEditor:
    """
    FFmpeg 视频编辑器
    
    负责视频合成、剪辑、添加字幕、转场等
    """
    
    def __init__(self, output_dir: str, temp_dir: str = None):
        """
        初始化视频编辑器
        
        Args:
            output_dir: 输出目录
            temp_dir: 临时目录
        """
        self.output_dir = os.path.join(output_dir, "output")
        self.temp_dir = temp_dir or os.path.join(output_dir, "..", "temp")
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def _check_ffmpeg(self) -> bool:
        """检查 FFmpeg 是否可用"""
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def compose(self, project_id: str, step_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        合成视频
        
        Args:
            project_id: 项目 ID
            step_config: 步骤配置，包含：
                - images: 图片列表
                - voiceover: 配音文件
                - bgm: 背景音乐
                - subtitles: 字幕文件
                - duration: 每张图片显示时长
                - transition: 转场效果
                - aspect_ratio: 宽高比
                
        Returns:
            合成结果字典
        """
        # 检查 FFmpeg
        if not self._check_ffmpeg():
            return {
                "error": "FFmpeg not found. Please install FFmpeg first.",
                "install_guide": "https://ffmpeg.org/download.html"
            }
        
        # 获取项目目录
        project_dir = os.path.join(os.path.dirname(__file__), "..", "projects", project_id)
        assets_dir = os.path.join(project_dir, "assets")
        
        # 获取配置
        images = step_config.get("images", [])
        voiceover = step_config.get("voiceover", "")
        bgm = step_config.get("bgm", "")
        subtitles = step_config.get("subtitles", "")
        duration_per_image = step_config.get("duration", 5)
        transition = step_config.get("transition", "fade")
        aspect_ratio = step_config.get("aspect_ratio", "9:16")
        
        # 构建 FFmpeg 命令
        try:
            output_file = os.path.join(
                self.output_dir,
                f"final_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
            )
            
            # 生成视频
            if images and voiceover:
                result = self._compose_with_images(
                    images, voiceover, bgm, subtitles,
                    duration_per_image, transition, aspect_ratio, output_file
                )
            else:
                return {
                    "error": "Missing required inputs",
                    "required": ["images", "voiceover"]
                }
            
            if result["success"]:
                return {
                    "success": True,
                    "output_file": output_file,
                    "duration_seconds": result.get("duration", 0),
                    "resolution": result.get("resolution", "1080x1920"),
                    "file_size_bytes": os.path.getsize(output_file),
                }
            else:
                return result
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Video composition failed"
            }
    
    def _compose_with_images(self, images: List[str], voiceover: str, bgm: str,
                             subtitles: str, duration: int, transition: str,
                             aspect_ratio: str, output_file: str) -> Dict[str, Any]:
        """使用图片序列合成视频"""
        
        # 解析宽高比
        width, height = self._parse_aspect_ratio(aspect_ratio)
        
        # 创建图片列表文件
        list_file = os.path.join(self.temp_dir, "images.txt")
        with open(list_file, "w", encoding="utf-8") as f:
            for img in images:
                f.write(f"file '{img}'\n")
                f.write(f"duration {duration}\n")
            # 最后一张图片重复一次（FFmpeg 要求）
            if images:
                f.write(f"file '{images[-1]}'\n")
        
        # 构建 FFmpeg 命令
        cmd = [
            "ffmpeg", "-y",  # 覆盖输出
            "-f", "concat",
            "-safe", "0",
            "-i", list_file,
            "-vf", f"scale={width}:{height},format=yuv420p",
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
        ]
        
        # 添加配音
        if os.path.exists(voiceover):
            cmd.extend(["-i", voiceover])
        
        # 添加 BGM
        if bgm and os.path.exists(bgm):
            cmd.extend(["-i", bgm])
        
        # 音频混合配置
        audio_filters = []
        audio_inputs = 1  # 从配音开始
        
        if bgm and os.path.exists(bgm):
            audio_inputs += 1
            # BGM 音量降低到 30%
            audio_filters.append("[1:a]volume=0.3[bgm]")
        
        # 最终输出
        cmd.extend(["-c:a", "aac", "-b:a", "128k"])
        
        # 执行命令
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600,  # 10 分钟超时
                cwd=self.temp_dir
            )
            
            if result.returncode == 0:
                # 获取视频信息
                info = self._get_video_info(output_file)
                return {
                    "success": True,
                    "duration": info.get("duration", 0),
                    "resolution": f"{info.get('width', width)}x{info.get('height', height)}",
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr,
                    "command": " ".join(cmd)
                }
                
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Video composition timeout (exceeded 10 minutes)"
            }
    
    def _parse_aspect_ratio(self, aspect_ratio: str) -> tuple:
        """解析宽高比"""
        ratios = {
            "16:9": (1920, 1080),
            "9:16": (1080, 1920),
            "1:1": (1080, 1080),
            "4:3": (1440, 1080),
            "3:4": (1080, 1440),
        }
        return ratios.get(aspect_ratio, (1080, 1920))
    
    def _get_video_info(self, video_file: str) -> Dict[str, Any]:
        """获取视频信息"""
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                video_file
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            data = json.loads(result.stdout)
            
            video_stream = next(
                (s for s in data.get("streams", []) if s.get("codec_type") == "video"),
                {}
            )
            
            return {
                "width": video_stream.get("width", 0),
                "height": video_stream.get("height", 0),
                "duration": float(data.get("format", {}).get("duration", 0)),
            }
        except Exception:
            return {}
    
    def add_subtitles(self, video_file: str, subtitle_file: str, 
                      output_file: str = None) -> Dict[str, Any]:
        """
        添加字幕到视频
        
        Args:
            video_file: 输入视频
            subtitle_file: 字幕文件 (SRT 格式)
            output_file: 输出文件
            
        Returns:
            处理结果
        """
        if not output_file:
            base, ext = os.path.splitext(video_file)
            output_file = f"{base}_subtitled{ext}"
        
        cmd = [
            "ffmpeg", "-y",
            "-i", video_file,
            "-vf", f"subtitles={subtitle_file}",
            "-c:a", "copy",
            output_file
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                return {"success": True, "output_file": output_file}
            else:
                return {"success": False, "error": result.stderr}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def extract_audio(self, video_file: str, output_file: str = None) -> Dict[str, Any]:
        """从视频提取音频"""
        if not output_file:
            base, _ = os.path.splitext(video_file)
            output_file = f"{base}.mp3"
        
        cmd = [
            "ffmpeg", "-y",
            "-i", video_file,
            "-q:a", "0",
            "-map", "a",
            output_file
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if result.returncode == 0:
                return {"success": True, "output_file": output_file}
            else:
                return {"success": False, "error": result.stderr}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def trim_video(self, video_file: str, start_time: str, end_time: str,
                   output_file: str = None) -> Dict[str, Any]:
        """裁剪视频"""
        if not output_file:
            base, ext = os.path.splitext(video_file)
            output_file = f"{base}_trimmed{ext}"
        
        cmd = [
            "ffmpeg", "-y",
            "-i", video_file,
            "-ss", start_time,
            "-to", end_time,
            "-c", "copy",
            output_file
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                return {"success": True, "output_file": output_file}
            else:
                return {"success": False, "error": result.stderr}
        except Exception as e:
            return {"success": False, "error": str(e)}
