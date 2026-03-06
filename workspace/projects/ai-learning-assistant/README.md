# AI Learning Assistant 🚀

**一个帮助你系统学习 AI 的个人知识管理系统**

> 33 岁程序员的 AI 学习伴侣 - 边学边练，练完能用

---

## ✨ 特性

### 📝 笔记管理
- 创建、编辑、删除笔记
- 标签分类
- 全文搜索

### 🤖 AI 增强
- RAG 知识库问答
- 基于你的笔记内容回答
- 学习问题解答

### 📊 学习追踪
- 学习路线配置
- 进度可视化
- 完成度统计

### 📦 导出分享
- 导出 Markdown/PDF
- 批量导出
- Docker 一键部署

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + Vite + TailwindCSS |
| **后端** | FastAPI + SQLAlchemy |
| **数据库** | SQLite + ChromaDB |
| **AI** | LangChain + Qwen API |
| **部署** | Docker + docker-compose |

---

## 🚀 快速开始

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up -d
```

---

## 📚 文档

- [项目需求](PRD.md)
- [技术设计](TECH_DESIGN.md)
- [快速开始](GETTING_STARTED.md)

---

## 📅 开发计划

| 阶段 | 内容 | 时间 |
|------|------|------|
| Phase 1 | MVP（笔记 + 标签 + 搜索） | 2 周 |
| Phase 2 | AI 增强（RAG + 问答） | 2 周 |
| Phase 3 | 高级功能（可视化 + 部署） | 2 周 |

---

## 🎯 为什么做这个项目？

1. **技术练习** - 全栈开发 + AI 集成
2. **实际用途** - 自己学习 AI 时能用
3. **spec-coding 实践** - 完整企业级流程
4. **可扩展** - 后续可产品化变现

---

## 📝 学习心得

_在这里记录你的学习过程和收获..._

---

## 📄 License

MIT

---

_**Made with ❤️ by 老板 (jixiang)**_
