# AI Learning Assistant - 技术设计文档

**版本：** 1.0  
**创建时间：** 2026-03-07

---

## 🏗️ 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  笔记管理   │  │  学习路线   │  │  AI 问答     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│                    API Gateway                           │
│              FastAPI + CORS + 中间件                     │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼───────┐ ┌─▼─────────┐ ┌─▼───────────┐
│  笔记服务     │ │ AI 服务    │ │  用户服务   │
│  (CRUD)       │ │ (RAG/LLM) │ │  (进度)     │
└───────┬───────┘ └─────┬─────┘ └─────┬───────┘
        │               │             │
┌───────▼───────────────▼─────────────▼───────┐
│                  数据层                      │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │  SQLite     │  │  ChromaDB (向量)    │   │
│  │  (主数据)   │  │  (Embedding)        │   │
│  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 📦 核心模块设计

### 1. 笔记模块

#### API 设计

```python
# routes/notes.py

# 获取笔记列表
GET /api/notes?page=1&limit=20&tag=python&search=transformer

# 获取笔记详情
GET /api/notes/{note_id}

# 创建笔记
POST /api/notes
{
    "title": "Transformer 学习笔记",
    "content": "# Transformer...\n\n## Self-Attention...",
    "tags": ["transformer", "llm"]
}

# 更新笔记
PUT /api/notes/{note_id}

# 删除笔记（软删除）
DELETE /api/notes/{note_id}

# 搜索笔记
GET /api/notes/search?q=attention+mechanism
```

#### 数据模型

```python
# models/note.py

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Table, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

# 笔记 - 标签 关联表
note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('notes.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class Note(Base):
    __tablename__ = 'notes'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    # 向量嵌入（用于 RAG）
    embedding = Column(JSON, nullable=True)  # List[float]
    
    # 关联
    tags = relationship('Tag', secondary=note_tags, back_populates='notes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'tags': [tag.name for tag in self.tags],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
```

---

### 2. RAG 服务模块

#### 架构图

```
┌──────────────┐
│   笔记内容   │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│  Text Split  │────▶│  Embedding   │
│  (文本分块)  │     │  (向量化)    │
└──────────────┘     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  ChromaDB    │
                     │  (向量存储)  │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  相似度搜索  │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  LLM + Prompt│
                     │  (生成回答)  │
                     └──────────────┘
```

#### 核心代码

```python
# services/rag_service.py

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.llms import QwenLLM
from langchain.chains import RetrievalQA

class RAGService:
    def __init__(self, db_path: str, embedding_model: str = "moka-ai/m3e-base"):
        # 文本分块器
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len
        )
        
        # Embedding 模型（中文优化）
        self.embeddings = HuggingFaceEmbeddings(
            model_name=embedding_model,
            model_kwargs={'device': 'cpu'}
        )
        
        # 向量数据库
        self.vectorstore = Chroma(
            persist_directory=db_path,
            embedding_function=self.embeddings
        )
        
        # LLM（使用 Qwen API）
        self.llm = QwenLLM(
            api_key=os.getenv("QWEN_API_KEY"),
            model="qwen-plus"
        )
    
    def add_note(self, note_id: int, content: str):
        """添加笔记到知识库"""
        # 文本分块
        chunks = self.text_splitter.split_text(content)
        
        # 向量化并存储
        self.vectorstore.add_texts(
            texts=chunks,
            metadatas=[{"note_id": note_id}] * len(chunks)
        )
    
    def search(self, query: str, k: int = 3) -> List[dict]:
        """相似度搜索"""
        docs = self.vectorstore.similarity_search(query, k=k)
        return [
            {"content": doc.page_content, **doc.metadata}
            for doc in docs
        ]
    
    def query(self, question: str) -> str:
        """RAG 问答"""
        # 检索相关文档
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
        
        # 构建 QA 链
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )
        
        # 生成回答
        result = qa_chain({"query": question})
        
        return {
            "answer": result["result"],
            "sources": [doc.metadata for doc in result["source_documents"]]
        }
```

---

### 3. AI 问答模块

#### Prompt 设计

```python
# services/llm_service.py

SYSTEM_PROMPT = """你是一个 AI 学习助手，帮助用户学习大模型技术。

要求：
1. 回答要准确、专业
2. 用通俗易懂的语言解释复杂概念
3. 提供代码示例时要用 Python
4. 如果不确定，要诚实说明
5. 引导用户深入思考，而不是直接给答案

用户的学习阶段：中级程序员，正在系统学习 AI
"""

FEW_SHOT_EXAMPLES = """
用户：什么是 Self-Attention？
助手：Self-Attention（自注意力机制）是 Transformer 的核心...

用户：怎么学习 PyTorch？
助手：建议分 3 个阶段：
1. 先掌握 Tensor 基本操作
2. 理解 autograd 自动微分
3. 动手实现简单网络...
"""
```

#### API 实现

```python
# api/ai.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/ai", tags=["ai"])

class QuestionRequest(BaseModel):
    question: str
    use_rag: bool = True  # 是否使用 RAG

class QuestionResponse(BaseModel):
    answer: str
    sources: list = []
    model: str

@router.post("/question", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """AI 问答"""
    try:
        if request.use_rag:
            # 使用 RAG 检索 + 回答
            result = rag_service.query(request.question)
            return QuestionResponse(
                answer=result["answer"],
                sources=result["sources"],
                model="qwen-plus + RAG"
            )
        else:
            # 直接 LLM 回答
            answer = llm_service.generate(
                request.question,
                system_prompt=SYSTEM_PROMPT
            )
            return QuestionResponse(
                answer=answer,
                model="qwen-plus"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🧪 测试策略

### 单元测试

```python
# tests/test_notes.py

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_note():
    """测试创建笔记"""
    response = client.post(
        "/api/notes",
        json={
            "title": "测试笔记",
            "content": "# 测试内容",
            "tags": ["test"]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "测试笔记"
    assert "id" in data

def test_search_notes():
    """测试搜索笔记"""
    response = client.get("/api/notes/search?q=测试")
    assert response.status_code == 200
    assert len(response.json()) > 0
```

### 集成测试

```python
# tests/test_rag.py

def test_rag_add_and_query():
    """测试 RAG 添加和查询"""
    # 添加笔记
    rag_service.add_note(1, "# Transformer\n\nSelf-Attention 是...")
    
    # 查询
    result = rag_service.query("什么是 Self-Attention？")
    
    assert "Self-Attention" in result["answer"]
    assert len(result["sources"]) > 0
```

---

## 📦 部署方案

### Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./data/app.db
      - QWEN_API_KEY=${QWEN_API_KEY}
    restart: unless-stopped
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  data:
```

---

## 📈 性能优化

### 数据库优化
- [ ] 添加索引（title、created_at）
- [ ] 分页查询（避免全表扫描）
- [ ] 软删除标记（避免物理删除开销）

### API 优化
- [ ] 响应缓存（Redis）
- [ ] 异步处理（Celery）
- [ ] 限流（防止滥用）

### 前端优化
- [ ] 代码分割（按需加载）
- [ ] 图片懒加载
- [ ] Service Worker 缓存

---

_**下一步：** 开始 Phase 1 MVP 开发！_
