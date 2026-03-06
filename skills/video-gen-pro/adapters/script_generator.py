"""
Video-Gen-Pro 脚本生成器

使用免费 Qwen API 生成视频脚本

@author jixiang
"""

import os
import json
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime


class ScriptGenerator:
    """
    脚本生成器
    
    基于内容分析生成视频脚本和旁白
    支持免费 Qwen API 和本地模板生成
    """
    
    # Qwen API 端点（阿里云百炼）
    # 免费额度：新用户赠送
    QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    
    # 脚本模板
    TEMPLATES = {
        "standard": """
# {title}

## 开场（{intro_duration}秒）
{intro}

## 主体内容（{main_duration}秒）
{main_content}

## 结尾（{outro_duration}秒）
{outro}

---
**旁白稿：**
{voiceover_script}
""",
        "tutorial": """
# {title} - 教程

## 引入问题（{intro_duration}秒）
{intro}

## 步骤详解（{main_duration}秒）
{steps}

## 总结（{outro_duration}秒）
{outro}

---
**旁白稿：**
{voiceover_script}
""",
        "story": """
# {title}

## 序幕（{intro_duration}秒）
{intro}

## 发展（{main_duration}秒）
{story_body}

## 高潮与结局（{outro_duration}秒）
{climax}

---
**旁白稿：**
{voiceover_script}
"""
    }
    
    def __init__(self, output_dir: str, api_key: str = None):
        """
        初始化脚本生成器
        
        Args:
            output_dir: 输出目录
            api_key: Qwen API Key（可选，不提供则使用模板）
        """
        self.output_dir = output_dir
        self.api_key = api_key or os.environ.get("QWEN_API_KEY")
        os.makedirs(output_dir, exist_ok=True)
    
    def generate(self, project_id: str, step_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        生成视频脚本
        
        Args:
            project_id: 项目 ID
            step_config: 步骤配置，包含：
                - content: 输入内容
                - template: 模板类型 (standard/tutorial/story)
                - target_duration: 目标时长（秒）
                - style: 风格 (professional/casual/humorous)
                
        Returns:
            生成结果字典
        """
        # 获取配置
        content = step_config.get("content", "")
        template_type = step_config.get("template", "standard")
        target_duration = step_config.get("target_duration", 60)
        style = step_config.get("style", "professional")
        
        # 如果没有内容，尝试从项目加载
        if not content:
            content = self._load_project_content(project_id)
        
        if not content:
            return {"error": "No content provided for script generation"}
        
        # 生成脚本
        if self.api_key:
            # 使用 Qwen API
            result = self._generate_with_qwen(content, template_type, target_duration, style)
        else:
            # 使用模板生成
            result = self._generate_with_template(content, template_type, target_duration, style)
        
        if result.get("success"):
            # 保存脚本
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            script_file = os.path.join(self.output_dir, f"script_{timestamp}.md")
            
            with open(script_file, "w", encoding="utf-8") as f:
                f.write(result["script"])
            
            # 同时保存为项目的主脚本
            project_script = os.path.join(
                os.path.dirname(__file__), "..", "projects", project_id,
                "content_script.md"
            )
            os.makedirs(os.path.dirname(project_script), exist_ok=True)
            with open(project_script, "w", encoding="utf-8") as f:
                f.write(result["script"])
            
            return {
                "success": True,
                "script": result["script"],
                "script_file": script_file,
                "word_count": len(result["script"]),
                "estimated_duration": result.get("estimated_duration", target_duration),
            }
        else:
            return result
    
    def _load_project_content(self, project_id: str) -> str:
        """从项目加载输入内容"""
        project_dir = os.path.join(
            os.path.dirname(__file__), "..", "projects", project_id, "assets", "input"
        )
        
        content_parts = []
        if os.path.exists(project_dir):
            for filename in os.listdir(project_dir):
                filepath = os.path.join(project_dir, filename)
                if filename.endswith((".txt", ".md")):
                    with open(filepath, "r", encoding="utf-8") as f:
                        content_parts.append(f.read())
        
        return "\n\n".join(content_parts)
    
    def _generate_with_qwen(self, content: str, template: str, 
                            duration: int, style: str) -> Dict[str, Any]:
        """使用 Qwen API 生成脚本"""
        
        prompt = f"""你是一名专业的视频脚本作家。请根据以下内容创作一个视频脚本。

**输入内容：**
{content}

**要求：**
- 视频时长：约{duration}秒
- 风格：{style}
- 格式：Markdown，包含开场、主体、结尾
- 需要包含完整的旁白稿，适合 TTS 朗读

请生成完整的视频脚本。
"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "qwen-turbo",
            "input": {
                "messages": [
                    {
                        "role": "system",
                        "content": "你是一名专业的视频脚本作家，擅长将各种内容转化为生动有趣的视频脚本。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            },
            "parameters": {
                "max_tokens": 2000,
                "temperature": 0.7,
            }
        }
        
        try:
            response = requests.post(
                self.QWEN_API_URL,
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                script = data["output"]["choices"][0]["message"]["content"]
                return {
                    "success": True,
                    "script": script,
                    "estimated_duration": duration,
                }
            else:
                return {
                    "success": False,
                    "error": f"API error: {response.status_code}",
                    "fallback": True
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "fallback": True
            }
    
    def _generate_with_template(self, content: str, template: str,
                                 duration: int, style: str) -> Dict[str, Any]:
        """使用模板生成脚本（无需 API）"""
        
        # 简单分析内容
        title = self._extract_title(content)
        intro_duration = int(duration * 0.15)
        main_duration = int(duration * 0.7)
        outro_duration = int(duration * 0.15)
        
        # 生成各部分内容
        intro = self._generate_intro(content, style)
        main_content = self._generate_main(content, style)
        outro = self._generate_outro(content, style)
        
        # 生成旁白稿
        voiceover = self._generate_voiceover(intro, main_content, outro, style)
        
        # 选择模板
        template_str = self.TEMPLATES.get(template, self.TEMPLATES["standard"])
        
        script = template_str.format(
            title=title,
            intro_duration=intro_duration,
            main_duration=main_duration,
            outro_duration=outro_duration,
            intro=intro,
            main_content=main_content,
            steps=main_content,
            story_body=main_content,
            climax=outro,
            outro=outro,
            voiceover_script=voiceover,
        )
        
        return {
            "success": True,
            "script": script,
            "estimated_duration": duration,
        }
    
    def _extract_title(self, content: str) -> str:
        """从内容提取标题"""
        lines = content.strip().split("\n")
        for line in lines:
            if line.strip() and not line.startswith("#"):
                # 取第一行非空内容作为标题
                title = line.strip()[:50]
                return title
        return "视频脚本"
    
    def _generate_intro(self, content: str, style: str) -> str:
        """生成开场白"""
        intros = {
            "professional": "欢迎来到本期视频，今天我们将深入探讨...",
            "casual": "嘿大家好！今天来聊聊一个超有意思的话题...",
            "humorous": "各位观众朋友们好！准备好了吗？今天要讲的内容可能会让你大吃一惊...",
        }
        return intros.get(style, intros["professional"])
    
    def _generate_main(self, content: str, style: str) -> str:
        """生成主体内容"""
        # 简单提取内容要点
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        
        if len(paragraphs) >= 3:
            main_points = "\n".join([f"- {p[:100]}..." for p in paragraphs[:3]])
        else:
            main_points = content[:300] + "..."
        
        return main_points
    
    def _generate_outro(self, content: str, style: str) -> str:
        """生成结尾"""
        outros = {
            "professional": "感谢观看，如有问题欢迎在评论区留言。",
            "casual": "好啦，今天就聊到这里！觉得有用的话记得点赞关注哦～",
            "humorous": "好了好了，再说下去就要收费了！下期见！",
        }
        return outros.get(style, outros["professional"])
    
    def _generate_voiceover(self, intro: str, main: str, outro: str, style: str) -> str:
        """生成完整旁白稿"""
        return f"{intro}\n\n{main}\n\n{outro}"
