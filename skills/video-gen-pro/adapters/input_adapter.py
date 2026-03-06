"""
Video-Gen-Pro 输入处理适配器

支持多种输入格式的解析：文本、Markdown、图片、Word、Excel、PDF

输出路径：F:\2025ideazdjx\openClaw-project\vedio

@author jixiang
"""

import os
import json
from typing import Dict, Any, List, Optional


class InputAdapter:
    """
    输入处理适配器
    
    解析各种格式的输入文件，提取结构化内容
    """
    
    SUPPORTED_FORMATS = [".txt", ".md", ".jpg", ".jpeg", ".png", ".gif", ".webp", 
                         ".doc", ".docx", ".xls", ".xlsx", ".csv", ".pdf"]
    
    def __init__(self):
        pass
    
    def parse_input(self, project_id: str, step_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        解析输入文件
        
        Args:
            project_id: 项目 ID
            step_config: 步骤配置
            
        Returns:
            解析结果字典
        """
        # 获取项目目录
        from core.project_manager import ProjectManager
        pm = ProjectManager(os.path.join(os.path.dirname(__file__), "..", "projects"))
        
        project = pm.load_project(project_id)
        if not project:
            return {"error": f"Project {project_id} not found"}
        
        input_dir = os.path.join(os.path.dirname(__file__), "..", "projects", project_id, "assets", "input")
        
        extracted_content = {
            "text": [],
            "images": [],
            "tables": [],
            "metadata": {},
        }
        
        # 遍历输入目录
        if os.path.exists(input_dir):
            for filename in os.listdir(input_dir):
                filepath = os.path.join(input_dir, filename)
                ext = os.path.splitext(filename)[1].lower()
                
                if ext in [".txt", ".md"]:
                    text_content = self._parse_text(filepath)
                    extracted_content["text"].append(text_content)
                    
                elif ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
                    image_info = self._parse_image(filepath)
                    extracted_content["images"].append(image_info)
                    
                elif ext in [".doc", ".docx"]:
                    doc_content = self._parse_word(filepath)
                    extracted_content["text"].append(doc_content)
                    
                elif ext in [".xls", ".xlsx", ".csv"]:
                    table_content = self._parse_excel(filepath)
                    extracted_content["tables"].append(table_content)
                    
                elif ext == ".pdf":
                    pdf_content = self._parse_pdf(filepath)
                    extracted_content["text"].append(pdf_content)
        
        return {
            "success": True,
            "extracted_content": extracted_content,
            "file_count": len(extracted_content["text"]) + len(extracted_content["images"]) + len(extracted_content["tables"]),
        }
    
    def _parse_text(self, filepath: str) -> Dict[str, Any]:
        """解析文本/Markdown 文件"""
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        return {
            "type": "text",
            "source": os.path.basename(filepath),
            "content": content,
            "length": len(content),
        }
    
    def _parse_image(self, filepath: str) -> Dict[str, Any]:
        """解析图片文件"""
        from PIL import Image
        
        img = Image.open(filepath)
        
        return {
            "type": "image",
            "source": os.path.basename(filepath),
            "path": filepath,
            "width": img.width,
            "height": img.height,
            "format": img.format,
        }
    
    def _parse_word(self, filepath: str) -> Dict[str, Any]:
        """解析 Word 文档（需要 python-docx）"""
        try:
            from docx import Document
            doc = Document(filepath)
            content = "\n".join([para.text for para in doc.paragraphs])
        except ImportError:
            content = "[Word parsing requires python-docx: pip install python-docx]"
        
        return {
            "type": "document",
            "source": os.path.basename(filepath),
            "content": content,
        }
    
    def _parse_excel(self, filepath: str) -> Dict[str, Any]:
        """解析 Excel 文件（需要 openpyxl/pandas）"""
        try:
            import pandas as pd
            if filepath.endswith(".csv"):
                df = pd.read_csv(filepath)
            else:
                df = pd.read_excel(filepath)
            
            return {
                "type": "table",
                "source": os.path.basename(filepath),
                "rows": len(df),
                "columns": list(df.columns),
                "preview": df.head(5).to_dict(),
            }
        except ImportError:
            return {
                "type": "table",
                "source": os.path.basename(filepath),
                "error": "Excel parsing requires pandas: pip install pandas openpyxl",
            }
    
    def _parse_pdf(self, filepath: str) -> Dict[str, Any]:
        """解析 PDF 文件（需要 PyPDF2/pdfplumber）"""
        try:
            import pdfplumber
            text = []
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text.append(page_text)
            
            return {
                "type": "pdf",
                "source": os.path.basename(filepath),
                "content": "\n".join(text),
                "pages": len(text),
            }
        except ImportError:
            return {
                "type": "pdf",
                "source": os.path.basename(filepath),
                "error": "PDF parsing requires pdfplumber: pip install pdfplumber",
            }
