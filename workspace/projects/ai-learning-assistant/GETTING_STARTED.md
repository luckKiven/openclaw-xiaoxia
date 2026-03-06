# AI Learning Assistant - 项目启动指南

**创建时间：** 2026-03-07  
**状态：** 准备启动 🚀

---

## 🎯 项目目标

1. **技术练习** - 全栈开发 + AI 集成
2. **实际用途** - 自己学习 AI 时能用
3. **spec-coding 实践** - 完整企业级流程
4. **可扩展** - 后续可产品化

---

## 📋 开发计划

### Phase 1: MVP（2 周）- 现在开始！

#### Week 1: 后端基础
- [ ] Day 1: 项目初始化 + FastAPI 框架
- [ ] Day 2: 数据库模型设计
- [ ] Day 3: 笔记 CRUD API
- [ ] Day 4: 标签系统 API
- [ ] Day 5: 搜索 API
- [ ] Day 6-7: 单元测试

#### Week 2: 前端基础
- [ ] Day 8: React 项目初始化
- [ ] Day 9: 笔记列表页面
- [ ] Day 10: 笔记详情/编辑页面
- [ ] Day 11: 标签管理页面
- [ ] Day 12: 搜索功能
- [ ] Day 13-14: 联调 + 测试

---

### Phase 2: AI 增强（2 周）

- [ ] RAG 服务集成
- [ ] AI 问答功能
- [ ] 学习进度追踪

---

### Phase 3: 高级功能（2 周）

- [ ] 数据可视化
- [ ] 导出功能
- [ ] Docker 部署

---

## 🚀 快速开始

### 1. 克隆项目

```bash
cd G:\openClaw\xiaoxia\workspace\projects
# 项目已创建，直接开始
```

### 2. 后端初始化

```bash
cd ai-learning-assistant

# 创建后端目录
mkdir -p backend/app/{models,schemas,api,services,db}
mkdir -p backend/tests

# 创建虚拟环境
cd backend
python -m venv venv
venv\Scripts\activate  # Windows

# 安装依赖
pip install fastapi uvicorn sqlalchemy pydantic
pip install langchain chromadb sentence-transformers
pip install python-dotenv pytest httpx

# 创建 requirements.txt
pip freeze > requirements.txt
```

### 3. 前端初始化

```bash
cd ../frontend

# 创建 React 项目
npm create vite@latest . -- --template react

# 安装依赖
npm install
npm install tailwindcss postcss autoprefixer
npm install react-query zustand axios
npm install @tanstack/react-query-devtools

# 初始化 Tailwind
npx tailwindcss init -p
```

### 4. 开始编码

**后端入口：** `backend/app/main.py`
**前端入口：** `frontend/src/App.jsx`

---

## 📚 学习资源

### 边做边学

| 任务 | 学习资源 |
|------|----------|
| FastAPI | https://fastapi.tiangolo.com/tutorial/ |
| React | https://react.dev/learn |
| SQLAlchemy | https://docs.sqlalchemy.org/ |
| LangChain | https://python.langchain.com/docs/get_started/introduction |
| ChromaDB | https://docs.trychroma.com/ |

### 遇到问题

1. **先自己查文档** - 培养独立解决问题的能力
2. **再问 AI** - 用 AI 辅助理解，不是直接要代码
3. **最后记录** - 把解决方案记到笔记里

---

## 🎯 每日开发流程

```
早上 9:00
  ↓
查看今日任务清单
  ↓
编码实现（2-3 小时）
  ↓
午休
  ↓
继续编码（2-3 小时）
  ↓
写测试
  ↓
提交代码 + 写提交信息
  ↓
记录今日学习心得（到自己的笔记系统！）
```

---

## 📊 进度追踪

### 里程碑

| 里程碑 | 预计完成 | 实际完成 |
|--------|---------|---------|
| Phase 1 MVP | 2026-03-21 | [ ] |
| Phase 2 AI | 2026-04-04 | [ ] |
| Phase 3 部署 | 2026-04-18 | [ ] |

### 技术栈掌握程度

| 技术 | 当前 | 目标 |
|------|------|------|
| FastAPI | ⭐ | ⭐⭐⭐⭐ |
| React | ⭐⭐ | ⭐⭐⭐⭐ |
| SQLAlchemy | ⭐ | ⭐⭐⭐⭐ |
| LangChain | ⭐ | ⭐⭐⭐⭐ |
| Docker | ⭐ | ⭐⭐⭐ |

---

## 💡 开发原则

### ✅ 要做的事

1. **先写测试再编码** - TDD 思想
2. **小步提交** - 每次提交解决一个问题
3. **写提交信息** - 说明为什么改，不只是改了什么
4. **记录心得** - 每天学到什么记下来

### ❌ 避免的事

1. **一次性改太多** - 小步快跑
2. **不写测试** - 后期会后悔
3. **复制粘贴代码** - 理解后再写
4. **熬夜编码** - 保持节奏

---

## 🎁 额外奖励

完成每个阶段后奖励自己：

- [ ] Phase 1 完成 → 吃顿好的
- [ ] Phase 2 完成 → 买个想要的东西
- [ ] Phase 3 完成 → 休息一天 + 写博客总结

---

_**准备好了吗？开始 Phase 1 Day 1！**_

```bash
cd G:\openClaw\xiaoxia\workspace\projects\ai-learning-assistant
mkdir -p backend/app/{models,schemas,api,services,db}
mkdir -p backend/tests
```

**加油！💪**
