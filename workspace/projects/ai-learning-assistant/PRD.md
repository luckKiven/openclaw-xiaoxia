# AI Learning Assistant - 项目需求文档

**版本：** 1.0  
**创建时间：** 2026-03-07  
**作者：** 老板（jixiang）

---

## 🎯 项目概述

### 一句话描述
个人 AI 学习知识管理系统，帮助 33+ 程序员系统学习大模型技术

### 核心目标
1. **技术练习** - 覆盖前端/后端/数据库/AI 全栈技术
2. **实际用途** - 自己学习 AI 时能用
3. **spec-coding 实践** - 完整走一遍企业级开发流程
4. **可扩展** - 后续可产品化变现

---

## 📋 功能需求

### Phase 1: MVP（2 周）

#### 1.1 笔记管理
- [ ] 创建笔记（标题、内容、标签）
- [ ] 编辑笔记
- [ ] 删除笔记（软删除）
- [ ] 笔记列表（分页、筛选）
- [ ] 笔记详情

**技术练习点：**
- RESTful API 设计
- 数据库 CRUD
- 前端表单处理

#### 1.2 标签系统
- [ ] 创建标签
- [ ] 笔记关联多标签
- [ ] 按标签筛选笔记

**技术练习点：**
- 多对多关系设计
- 联表查询

#### 1.3 全文搜索
- [ ] 标题搜索
- [ ] 内容搜索
- [ ] 标签搜索

**技术练习点：**
- 数据库全文索引
- 搜索 API 设计

---

### Phase 2: AI 增强（2 周）

#### 2.1 RAG 知识库
- [ ] 笔记向量化存储
- [ ] 向量相似度搜索
- [ ] 相关知识推荐

**技术练习点：**
- Embedding 原理
- 向量数据库（ChromaDB）
- 相似度计算

#### 2.2 AI 问答
- [ ] 基于笔记内容问答
- [ ] 学习问题解答
- [ ] 对话历史保存

**技术练习点：**
- LLM API 集成
- Prompt 工程
- 流式响应

#### 2.3 学习进度
- [ ] 学习路线配置
- [ ] 进度追踪
- [ ] 完成度统计

**技术练习点：**
- 状态管理
- 数据可视化

---

### Phase 3: 高级功能（2 周）

#### 3.1 可视化
- [ ] 学习进度图表
- [ ] 知识图谱
- [ ] 时间线视图

**技术练习点：**
- 前端图表库（ECharts/Chart.js）
- 数据转换

#### 3.2 导出功能
- [ ] 导出 Markdown
- [ ] 导出 PDF
- [ ] 批量导出

**技术练习点：**
- 文件生成
- 流式下载

#### 3.3 部署
- [ ] Docker 镜像
- [ ] docker-compose 编排
- [ ] 一键部署脚本

**技术练习点：**
- Dockerfile 编写
- 容器编排
- 生产环境配置

---

## 🏗️ 技术架构

### 技术栈选型

```
┌─────────────────────────────────────────┐
│              前端 (React)                │
│  React 18 + Vite + TailwindCSS          │
│  + React Query + Zustand                │
└─────────────────┬───────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────┐
│              后端 (FastAPI)              │
│  FastAPI + SQLAlchemy + Pydantic        │
│  + LangChain + ChromaDB                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              数据库                      │
│  SQLite (主数据) + ChromaDB (向量)      │
└─────────────────────────────────────────┘
```

### 目录结构

```
ai-learning-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 入口
│   │   ├── models/              # 数据模型
│   │   │   ├── note.py
│   │   │   ├── tag.py
│   │   │   └── learning_path.py
│   │   ├── schemas/             # Pydantic Schema
│   │   ├── api/                 # API 路由
│   │   │   ├── notes.py
│   │   │   ├── tags.py
│   │   │   └── ai.py
│   │   ├── services/            # 业务逻辑
│   │   │   ├── rag_service.py
│   │   │   └── llm_service.py
│   │   └── db/                  # 数据库配置
│   ├── tests/                   # 测试
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # React 组件
│   │   ├── pages/               # 页面
│   │   ├── stores/              # 状态管理
│   │   └── hooks/               # 自定义 Hook
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── docs/
    ├── API.md
    └── DEPLOY.md
```

---

## 📊 数据模型

### Note（笔记）

```python
class Note(Base):
    id: int (PK)
    title: str (max 200)
    content: text
    tags: List[Tag] (M:M)
    created_at: datetime
    updated_at: datetime
    is_deleted: bool (软删除)
    embedding: List[float] (向量，可选)
```

### Tag（标签）

```python
class Tag(Base):
    id: int (PK)
    name: str (unique)
    color: str (可选)
    notes: List[Note] (M:M)
```

### LearningPath（学习路线）

```python
class LearningPath(Base):
    id: int (PK)
    name: str
    phases: JSON (阶段配置)
    progress: float (0-100)
    created_at: datetime
```

---

## 🧪 测试计划

### 后端测试

| 模块 | 测试类型 | 覆盖率目标 |
|------|---------|-----------|
| API | 单元测试 | 80%+ |
| 数据库 | 集成测试 | 核心功能 100% |
| RAG 服务 | 集成测试 | 核心流程 |

### 前端测试

| 模块 | 测试类型 | 工具 |
|------|---------|------|
| 组件 | 单元测试 | Vitest |
| 页面 | E2E 测试 | Playwright |
| API 调用 | Mock 测试 | MSW |

---

## 📅 开发计划

### Week 1-2: MVP
- Day 1-2: 项目初始化 + 数据库设计
- Day 3-5: 笔记 CRUD API
- Day 6-7: 标签系统
- Day 8-10: 前端基础页面
- Day 11-14: 联调 + 测试

### Week 3-4: AI 增强
- Day 15-17: RAG 服务
- Day 18-20: AI 问答
- Day 21-24: 学习进度
- Day 25-28: 联调 + 测试

### Week 5-6: 高级功能
- Day 29-32: 可视化
- Day 33-35: 导出功能
- Day 36-38: Docker 部署
- Day 39-42: 文档 + 优化

---

## 🎯 验收标准

### MVP 验收
- [ ] 能创建/编辑/删除笔记
- [ ] 能添加标签并筛选
- [ ] 能搜索笔记
- [ ] API 测试通过率 80%+

### AI 增强验收
- [ ] 能上传文档到知识库
- [ ] AI 能基于知识库问答
- [ ] 能追踪学习进度

### 高级功能验收
- [ ] 有学习进度图表
- [ ] 能导出笔记
- [ ] 能用 Docker 一键部署

---

## 💡 技术亮点（简历加分项）

1. **RAG 系统** - 向量数据库 + Embedding + LLM
2. **全栈开发** - React + FastAPI + SQLite
3. **AI 集成** - LangChain + Prompt 工程
4. **容器化** - Docker + docker-compose
5. **企业级流程** - Spec-Coding + 测试覆盖

---

_**备注：** 这个项目做完，您能系统练习全栈开发 + AI 集成，还能自己用来学习 AI 知识！_
