"""
Video-Gen-Pro 主角档案数据库

负责主角档案的 CRUD 操作

@author jixiang
"""

import os
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List


class ProtagonistDB:
    """
    主角档案数据库类
    
    管理视频生成中的主角配置，包括：
    - 创建新主角
    - 获取主角档案
    - 更新主角属性
    - 列出所有主角
    """
    
    def __init__(self, db_dir: str):
        """
        初始化主角数据库
        
        Args:
            db_dir: 数据库目录
        """
        self.db_dir = db_dir
        os.makedirs(db_dir, exist_ok=True)
        self._index_file = os.path.join(db_dir, "protagonists_index.json")
        self._ensure_index()
    
    def _ensure_index(self):
        """确保索引文件存在"""
        if not os.path.exists(self._index_file):
            self._save_index({"protagonists": {}})
    
    def _load_index(self) -> Dict[str, Any]:
        """加载索引"""
        with open(self._index_file, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def _save_index(self, index: Dict[str, Any]):
        """保存索引"""
        with open(self._index_file, "w", encoding="utf-8") as f:
            json.dump(index, f, indent=2, ensure_ascii=False)
    
    def create(self, name: str, reference_images: Optional[List[str]] = None, 
               voice_profile: Optional[Dict[str, Any]] = None,
               visual_style: Optional[Dict[str, Any]] = None,
               personality_traits: Optional[List[str]] = None) -> str:
        """
        创建新主角
        
        Args:
            name: 主角名称
            reference_images: 参考图片路径列表
            voice_profile: 配音配置
            visual_style: 视觉风格配置
            personality_traits: 性格特征列表
            
        Returns:
            protagonist_id: 新主角 ID
        """
        protagonist_id = f"char_{uuid.uuid4().hex[:8]}"
        
        protagonist_data = {
            "protagonist_id": protagonist_id,
            "name": name,
            "description": "",
            "reference_images": reference_images or [],
            "voice_profile": voice_profile or {
                "voice_id": "",
                "style": "专业、亲和、语速适中",
                "pitch": "medium",
                "speed": "1.0",
            },
            "visual_style": visual_style or {
                "color_scheme": ["#0066FF", "#FFFFFF", "#333333"],
                "font_family": "思源黑体",
                "animation_style": "简洁现代",
            },
            "personality_traits": personality_traits or ["专业", "耐心", "幽默"],
            "clip_embedding": None,
            "created_at": datetime.now().isoformat(),
            "video_count": 0,
            "last_used": None,
        }
        
        # 保存主角档案
        protagonist_file = os.path.join(self.db_dir, f"{protagonist_id}.json")
        with open(protagonist_file, "w", encoding="utf-8") as f:
            json.dump(protagonist_data, f, indent=2, ensure_ascii=False)
        
        # 更新索引
        index = self._load_index()
        index["protagonists"][protagonist_id] = {
            "name": name,
            "created_at": protagonist_data["created_at"],
        }
        self._save_index(index)
        
        return protagonist_id
    
    def get(self, protagonist_id: str) -> Optional[Dict[str, Any]]:
        """
        获取主角档案
        
        Args:
            protagonist_id: 主角 ID
            
        Returns:
            主角档案字典，如果不存在则返回 None
        """
        protagonist_file = os.path.join(self.db_dir, f"{protagonist_id}.json")
        
        if not os.path.exists(protagonist_file):
            return None
        
        with open(protagonist_file, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def update(self, protagonist_id: str, updates: Dict[str, Any]) -> bool:
        """
        更新主角属性
        
        Args:
            protagonist_id: 主角 ID
            updates: 要更新的属性字典
            
        Returns:
            是否更新成功
        """
        protagonist_data = self.get(protagonist_id)
        if not protagonist_data:
            return False
        
        # 更新属性
        for key, value in updates.items():
            if key in protagonist_data:
                protagonist_data[key] = value
        
        # 保存更新
        protagonist_file = os.path.join(self.db_dir, f"{protagonist_id}.json")
        with open(protagonist_file, "w", encoding="utf-8") as f:
            json.dump(protagonist_data, f, indent=2, ensure_ascii=False)
        
        # 更新索引中的名称
        if "name" in updates:
            index = self._load_index()
            if protagonist_id in index["protagonists"]:
                index["protagonists"][protagonist_id]["name"] = updates["name"]
                self._save_index(index)
        
        return True
    
    def list_all(self) -> List[Dict[str, Any]]:
        """
        列出所有主角
        
        Returns:
            主角档案列表
        """
        protagonists = []
        index = self._load_index()
        
        for protagonist_id in index["protagonists"].keys():
            protagonist_data = self.get(protagonist_id)
            if protagonist_data:
                protagonists.append(protagonist_data)
        
        return protagonists
    
    def delete(self, protagonist_id: str) -> bool:
        """
        删除主角
        
        Args:
            protagonist_id: 主角 ID
            
        Returns:
            是否删除成功
        """
        protagonist_file = os.path.join(self.db_dir, f"{protagonist_id}.json")
        
        if not os.path.exists(protagonist_file):
            return False
        
        # 删除文件
        os.remove(protagonist_file)
        
        # 更新索引
        index = self._load_index()
        if protagonist_id in index["protagonists"]:
            del index["protagonists"][protagonist_id]
            self._save_index(index)
        
        return True
    
    def increment_video_count(self, protagonist_id: str) -> bool:
        """
        增加主角的视频计数
        
        Args:
            protagonist_id: 主角 ID
            
        Returns:
            是否更新成功
        """
        return self.update(protagonist_id, {
            "video_count": self.get(protagonist_id)["video_count"] + 1,
            "last_used": datetime.now().isoformat(),
        })
    
    def search_by_name(self, name_query: str) -> List[Dict[str, Any]]:
        """
        按名称搜索主角
        
        Args:
            name_query: 名称查询（支持模糊匹配）
            
        Returns:
            匹配的主角档案列表
        """
        results = []
        for protagonist in self.list_all():
            if name_query.lower() in protagonist["name"].lower():
                results.append(protagonist)
        return results
