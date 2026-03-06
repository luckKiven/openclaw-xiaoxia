"""
Video-Gen-Pro 输出打包器

整理和打包最终交付物

@author jixiang
"""

import os
import json
import shutil
from typing import Dict, Any, List, Optional
from datetime import datetime


class OutputPackager:
    """
    输出打包器
    
    整理视频、文案、元数据等交付物
    """
    
    def __init__(self, output_dir: str):
        """
        初始化打包器
        
        Args:
            output_dir: 输出目录
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def package(self, project_id: str, step_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        打包最终交付物
        
        Args:
            project_id: 项目 ID
            step_config: 步骤配置，包含：
                - video_file: 最终视频
                - script_file: 脚本文件
                - cover_image: 封面图片
                - subtitles: 字幕文件
                - metadata: 元数据
                
        Returns:
            打包结果字典
        """
        # 获取项目目录
        project_dir = os.path.join(
            os.path.dirname(__file__), "..", "projects", project_id
        )
        
        # 创建交付目录
        deliver_dir = os.path.join(project_dir, "deliverables")
        os.makedirs(deliver_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # 收集交付物
        deliverables = {
            "video": None,
            "script": None,
            "cover": None,
            "subtitles": None,
            "metadata": None,
        }
        
        # 复制视频
        video_file = step_config.get("video_file")
        if video_file and os.path.exists(video_file):
            dest_video = os.path.join(deliver_dir, f"final_video_{timestamp}.mp4")
            shutil.copy2(video_file, dest_video)
            deliverables["video"] = dest_video
        
        # 复制脚本
        script_file = step_config.get("script_file")
        if script_file and os.path.exists(script_file):
            dest_script = os.path.join(deliver_dir, f"script_{timestamp}.md")
            shutil.copy2(script_file, dest_script)
            deliverables["script"] = dest_script
        
        # 复制封面
        cover_image = step_config.get("cover_image")
        if cover_image and os.path.exists(cover_image):
            dest_cover = os.path.join(deliver_dir, f"cover_{timestamp}.jpg")
            shutil.copy2(cover_image, dest_cover)
            deliverables["cover"] = dest_cover
        
        # 复制字幕
        subtitles = step_config.get("subtitles")
        if subtitles and os.path.exists(subtitles):
            dest_subtitles = os.path.join(deliver_dir, f"subtitles_{timestamp}.srt")
            shutil.copy2(subtitles, dest_subtitles)
            deliverables["subtitles"] = dest_subtitles
        
        # 生成元数据
        metadata = self._generate_metadata(project_id, step_config, deliverables)
        metadata_file = os.path.join(deliver_dir, f"metadata_{timestamp}.json")
        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        deliverables["metadata"] = metadata_file
        
        # 生成交付清单
        manifest = self._generate_manifest(deliver_dir, deliverables)
        manifest_file = os.path.join(deliver_dir, "DELIVER_MANIFEST.txt")
        with open(manifest_file, "w", encoding="utf-8") as f:
            f.write(manifest)
        
        return {
            "success": True,
            "deliver_dir": deliver_dir,
            "deliverables": deliverables,
            "manifest_file": manifest_file,
            "file_count": len([v for v in deliverables.values() if v]),
        }
    
    def _generate_metadata(self, project_id: str, step_config: Dict[str, Any],
                           deliverables: Dict[str, Any]) -> Dict[str, Any]:
        """生成元数据"""
        # 加载项目信息
        from core.project_manager import ProjectManager
        pm = ProjectManager(os.path.join(os.path.dirname(__file__), "..", "projects"))
        project = pm.load_project(project_id)
        
        metadata = {
            "project_id": project_id,
            "project_name": project.get("name", "Unknown") if project else "Unknown",
            "created_at": datetime.now().isoformat(),
            "author": "jixiang",
            "tool": "Video-Gen-Pro",
            "version": "1.0.0",
            "deliverables": {},
            "workflow": project.get("workflow", {}) if project else {},
            "protagonist": project.get("protagonist") if project else None,
        }
        
        # 添加文件信息
        for key, filepath in deliverables.items():
            if filepath and os.path.exists(filepath):
                metadata["deliverables"][key] = {
                    "filename": os.path.basename(filepath),
                    "size_bytes": os.path.getsize(filepath),
                }
        
        return metadata
    
    def _generate_manifest(self, deliver_dir: str, 
                           deliverables: Dict[str, Any]) -> str:
        """生成交付清单"""
        lines = [
            "=" * 60,
            "Video-Gen-Pro 交付清单",
            "=" * 60,
            f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"作者：jixiang",
            "",
            "交付文件列表:",
            "-" * 40,
        ]
        
        for key, filepath in deliverables.items():
            if filepath and os.path.exists(filepath):
                filename = os.path.basename(filepath)
                size = os.path.getsize(filepath)
                size_str = self._format_size(size)
                lines.append(f"  [{key.upper()}] {filename} ({size_str})")
        
        lines.extend([
            "",
            "-" * 40,
            "使用说明:",
            "  1. final_video.mp4 - 最终视频文件",
            "  2. script.md - 视频脚本/旁白稿",
            "  3. cover.jpg - 视频封面",
            "  4. subtitles.srt - 字幕文件",
            "  5. metadata.json - 元数据信息",
            "",
            "=" * 60,
            "Generated by Video-Gen-Pro | Author: jixiang",
            "=" * 60,
        ])
        
        return "\n".join(lines)
    
    def _format_size(self, size_bytes: int) -> str:
        """格式化文件大小"""
        for unit in ["B", "KB", "MB", "GB"]:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} TB"
    
    def create_archive(self, deliver_dir: str, archive_name: str = None) -> Dict[str, Any]:
        """
        创建压缩包
        
        Args:
            deliver_dir: 交付目录
            archive_name: 压缩包名称
            
        Returns:
            压缩结果
        """
        if not archive_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_name = f"video_package_{timestamp}"
        
        archive_path = shutil.make_archive(
            os.path.join(os.path.dirname(deliver_dir), archive_name),
            "zip",
            deliver_dir
        )
        
        return {
            "success": True,
            "archive_file": archive_path + ".zip",
            "size_bytes": os.path.getsize(archive_path + ".zip"),
        }
