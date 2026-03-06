# TODO - 待办事项

_最后更新：2026-03-05 11:17_

---

## 🔥 高优先级

### 1. 走通文章/视频号发布流程

**目标：** 实现自动化内容发布到视频号/公众号

**需要调研：**
- [ ] 视频号开放平台 API
- [ ] 公众号发布接口
- [ ] 内容格式要求（视频、图文）
- [ ] 认证和授权流程

**可能用到的技能：**
- 浏览器自动化（上传内容）
- 视频处理（ffmpeg-video-editor）
- 内容生成（AI 写作）

**预期流程：**
```
内容生成 → 格式处理 → 自动上传 → 发布
```

---

### 2. Codex 整合到 spec-code-team

**目标：** 用 Codex + Qwen-Coder 模型增强 spec-code-team 编码流程

**整合点：**
- [ ] 替换现有编码 Agent 为 Codex
- [ ] 配置 qwen-coder-plus 模型
- [ ] 测试编码质量和效率
- [ ] 更新 spec-code-team 文档

**优势：**
- Codex CLI 原生支持代码执行
- qwen-coder-plus 编程能力强
- 协议转换已完成（codex-cn-bridge）

**预期架构：**
```
spec-code-team
    ↓
Codex CLI (qwen-coder-plus)
    ↓
codex-cn-bridge (协议转换)
    ↓
阿里云 Qwen-Coder API
```

---

## ✅ 已完成

- [x] C 盘技能清理（移到 G 盘）
- [x] codex-cn-bridge 服务迁移到 G 盘
- [x] 定时任务配置：
  - [x] 每小时执行 /evolve
  - [x] 每小时自动备份 GitHub

---

## 📋 常规待办

- [ ] C 盘空间检查
- [ ] Temp 目录清理
- [ ] 记忆文件同步

---

_记录重要待办事项，完成后移到 MEMORY.md_
