---
name: spec-code-team
description: 基于 Spec-Coding 的完整团队协作开发流程：整合 OpenClaw 编排层 + Claude CLI 架构师 + Codex CLI 执行层，实现从需求分析到代码交付的全流程自动化。技能自包含角色定义，无需预先配置 agents。适用于复杂项目、新功能开发、跨模块需求。
---

# Spec-Code-Team 技能 (企业级团队协作版)

> **技能自包含** - 角色定义内置于技能中，无需预先配置 `agents/` 目录
> 
> 用户安装技能后可直接使用，Agent 团队由技能动态召唤。

---

## ⚠️ 依赖要求

使用本技能需要以下环境：

| 依赖 | 用途 | 必需 | 解决方案 |
|------|------|------|----------|
| **OpenClaw 运行时** | 编排层 | ✅ | `openclaw gateway start` |
| **Claude CLI** | 墨子（架构师） | ✅ | https://claude.ai/download |
| **Codex CLI** | 巧匠/铸剑师（执行） | ✅ | `npm install -g @openai/codex` |
| **codex-cn-bridge** | Codex 协议转换（可选） | ✅ | `openclaw skills install codex-cn-bridge` |

**检查依赖：**
```bash
/spec-code-team --check
```

**如果只有 OpenClaw 没有 CLI 工具：**
请使用 `spec-code-dev` 技能（仅文档阶段，不需要 CLI）。

---

## 🎯 核心原则

本技能继承 `spec-code-dev` 的核心思想，保持一致的编码规范：

| 原则 | 说明 |
|------|------|
| **文档即契约** | Spec 文档是开发的唯一依据，不得随意修改 |
| **工作区隔离** | 所有产物存工作区，不直接修改原项目 |
| **架构自适应** | 自动检测项目架构风格，支持 Hybrid |
| **独立审核** | 每个阶段必须经过独立审核 |
| **自动打回** | 审核发现问题自动修复，最多重试 3 次 |
| **物料可追溯** | 所有产出物 Git 管理，可追溯可回滚 |

---

## 🏗️ 三层架构

```
┌─────────────────────────────────────────────────────────┐
│              编排层 (Orchestrator)                       │
│         诸葛亮 (qwen3.5-plus) via sessions_spawn        │
│  职责：流程控制、任务分发、Git 操作、用户沟通              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                架构层 (Architect)                        │
│   小白 (kimi-k2.5) via sessions_spawn                    │
│   墨子 (Claude CLI) ⭐ via claude command                │
│  职责：需求分析、技术设计、数据契约、测试计划、Code Review │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                执行层 (Workers)                          │
│   巧匠 (Codex CLI → qwen3-coder-next)                    │
│   铸剑师 (Codex CLI → qwen3-coder-plus)                  │
│  职责：按 Spec 实现前端/后端代码、单元测试                  │
│                                                          │
│  协议转换：codex-cn-bridge (localhost:3000)              │
│  Codex CLI → 阿里云 Qwen-Coder API                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                质量层 (QA)                               │
│         探雷 (glm-5) via sessions_spawn                 │
│  职责：测试验证、质量报告                                 │
└─────────────────────────────────────────────────────────┘
```

**技能自包含** - 所有角色定义在 `roles/` 目录，无需用户配置 `agents/`。

---

## 🔄 五阶段流程

### Phase 1: 需求规格 (Requirements)

```
流程：[只读分析] → [小白生成初稿] → [墨子审核] → [有问题则打回] → [用户确认]
```

**产出文档：**
- `constitution.md` - 项目宪法
- `{feature}-requirements-spec.md` - 需求规格文档

**负责 Agent：**
- 生成：小白 (kimi-k2.5)
- 审核：墨子 (Claude Code)

---

### Phase 2: 技术设计 (Technical Design)

```
流程：[基于确认的需求] → [墨子生成设计] → [独立审核] → [有问题则打回] → [用户确认]
```

**产出文档：**
- `{feature}-technical-design.md` - 技术设计文档

**负责 Agent：**
- 生成：墨子 (Claude Code) ⭐
- 审核：诸葛亮 (qwen3.5-plus)

---

### Phase 3: 数据契约 (Data Contract)

```
流程：[基于设计] → [墨子生成 Schema] → [独立审核] → [有问题则打回] → [用户确认]
```

**产出文档：**
- `{feature}-data-contract.md` - 数据契约（TypeScript + Zod + OpenAPI）

**负责 Agent：**
- 生成：墨子 (Claude Code) ⭐
- 审核：诸葛亮 (qwen3.5-plus)

---

### Phase 4: 测试计划 (Test Plan)

```
流程：[基于需求 + 设计] → [探雷生成 TDD 计划] → [墨子总审] → [用户确认]
```

**产出文档：**
- `{feature}-test-plan.md` - 测试计划文档

**负责 Agent：**
- 生成：探雷 (glm-5)
- 审核：墨子 (Claude Code) ⭐

---

### Phase 5: 代码实现 (Implementation) ⭐ 已接入 Codex

```
流程：[基于确认的 Spec] → [Codex 执行] → [探雷测试] → [墨子 Review] → [诸葛亮合并]
```

**产出物料：**
- 源代码（按 Spec 实现）
- 单元测试（按 Test Plan）
- Code Review 报告
- Git 提交记录

**负责 Agent：**
- 前端实现：巧匠 → **Codex CLI** (`qwen3-coder-next`) ✅
- 后端实现：铸剑师 → **Codex CLI** (`qwen3-coder-plus`) ✅
- 测试验证：探雷 (glm-5)
- Code Review：墨子 (Claude Code) ⭐
- Git 合并：诸葛亮

**Codex 调用方式：**
```bash
# 前端实现
codex exec --model qwen3-coder-next --prompt "$SpecContent\n\n任务：$Task"

# 后端实现
codex exec --model qwen3-coder-plus --prompt "$SpecContent\n\n任务：$Task"
```

**协议转换：**
```
Codex CLI → codex-cn-bridge (localhost:3000) → 阿里云 Qwen-Coder API
```

---

## 🤖 Agent 角色配置（技能自带）

**技能自包含角色定义** - 无需用户配置 `agents/` 目录，技能内部动态召唤。

### 编排层

| 角色 | 名字 | 模型 | 召唤方式 |
|------|------|------|----------|
| Spec-Orchestrator | 诸葛亮 | `qwen3-max/qwen3.5-plus` | `sessions_spawn` |

### 架构层

| 角色 | 名字 | 模型 | 召唤方式 |
|------|------|------|----------|
| Spec-Analyst | 小白 | `qwen3-max/kimi-k2.5` | `sessions_spawn` |
| Spec-Architect | 墨子 | **Claude CLI** ⭐ | `claude` 命令 |

### 执行层

| 角色 | 名字 | 模型 | 召唤方式 |
|------|------|------|----------|
| Spec-Frontend | 巧匠 | `codex` → `qwen3-coder-next` | `codex exec` |
| Spec-Backend | 铸剑师 | `codex` → `qwen3-coder-plus` | `codex exec` |

### 质量层

| 角色 | 名字 | 模型 | 召唤方式 |
|------|------|------|----------|
| Spec-Reviewer | 探雷 | `qwen3-max/glm-5` | `sessions_spawn` |

### 模型配置说明

**Codex CLI 模型配置**（参考 codex-cn-bridge）：

```bash
# 前端实现（巧匠）
codex exec --model qwen3-coder-next --prompt "$Task"

# 后端实现（铸剑师）
codex exec --model qwen3-coder-plus --prompt "$Task"

# 协议转换（由 codex-cn-bridge 提供）
# Codex CLI → localhost:3000 → 阿里云 Qwen-Coder API
```

**可用模型**（在 codex-cn-bridge 中配置）：

| 模型别名 | 实际提供商 | 用途 |
|---------|-----------|------|
| `qwen3-coder-next` | 阿里云 Qwen-Coder | 前端实现 |
| `qwen3-coder-plus` | 阿里云 Qwen-Coder | 后端实现 |
| `qwen3.5-plus` | 阿里云 Qwen | 通用编码 |
| `kimi-k2.5` | Moonshot | 需求分析 |
| `glm-5` | 智谱 | 测试验证 |

---

## 📁 工作区结构

```
F:\2025ideazdjx\openClaw-project\feature\{project-name}\
├── constitution.md
├── {feature}-requirements-spec.md
├── {feature}-technical-design.md
├── {feature}-data-contract.md
├── {feature}-test-plan.md
├── src/                          # Phase 5 产出
│   ├── frontend/
│   └── backend/
├── tests/                        # Phase 5 产出
│   ├── unit/
│   └── integration/
└── review/                       # Phase 5 产出
    └── code-review.md
```

---

## 🔧 Claude Code 协作细节

### 调用方式

```bash
# 通过命令行调用
claude "任务描述" --verbose

# 工作目录
cd {project-path}
```

### 墨子 (Claude Code) 的核心职责

| 阶段 | 任务 | 为什么必须 Claude |
|------|------|-----------------|
| Phase 1 | 需求审核 | 识别技术风险和边界场景 |
| Phase 2 | 技术设计 | 系统性架构思维，深度推理 |
| Phase 3 | 数据契约 | 理解复杂业务逻辑 |
| Phase 4 | 测试计划审核 | 识别遗漏的测试场景 |
| Phase 5 | Code Review | 深度代码理解，发现潜在问题 |

### 成本优化策略

```
✅ 必须用 Claude Code：
- 架构设计（一次性投入，值得）
- Code Review（质量把关）
- 技术难点攻关

❌ 不需要用 Claude Code：
- 需求文档编写（小白用 Kimi）
- 代码实现（巧匠/铸剑师用 Qwen）
- 单元测试（探雷用 GLM）
```

---

## ⚙️ 执行步骤

### Step 0: 初始化和 Claude Code 验证 ⭐

> **重要：** spec-code-team 技能必须使用 Claude Code，这是硬性要求！

#### 1. Claude Code 可用性验证（必须通过）

**执行检测脚本：**
```bash
# Windows
G:\openClaw\xiaoxia\skills\spec-code-team\model-detection.bat

# 或手动检查
where claude
claude "connection test" --timeout 10
```

**验证逻辑：**
- ✅ 检查 Claude Code 是否已安装 (`where claude`)
- ✅ 验证 Claude Code 能否正常连接 Anthropic 服务 (`claude "test"`)
- ❌ **如果任一检查失败，立即终止并报错**

**错误提示：**
```
❌ Claude Code 不可用

spec-code-team 技能必须使用 Claude Code 进行墨子审核

解决方案：
  1. 安装 Claude Code: https://claude.ai/download
  2. 或使用 spec-code-dev 技能（仅文档阶段，不需要 Claude Code）

命令：
  /spec-code-dev 分析 F:\your-project
```

#### 2. 确定工作区路径

路径：`F:\2025ideazdjx\openClaw-project\feature\{project-name}\`

#### 3. 创建项目目录

```bash
New-Item -ItemType Directory -Path {workdir} -Force
```

#### 4. 告知用户工作区位置

```
工作区：F:\2025ideazdjx\openClaw-project\feature\{project-name}\
✅ Claude Code 验证通过 - 继续执行 spec-code-team 流程
```

#### 5. 初始化 Git 仓库（如需要）

```bash
cd {workdir}
git init
git checkout -b feature/{feature-name}
```

---

### Step 1: 需求规格

### Step 1: 需求规格

1. **只读分析**：扫描项目，识别技术栈、架构风格
2. **生成文档**：小白创建 `constitution.md` 和 `{feature}-requirements-spec.md`
3. **独立审核**：墨子检查需求清晰度和架构一致性
4. **打回修改**：如有问题自动修复，最多重试 3 次
5. **用户确认**：展示文档要点，等待确认

### Step 2: 技术设计

1. **设计生成**：墨子创建 `{feature}-technical-design.md`
2. **独立审核**：诸葛亮检查非功能性需求和架构符合性
3. **打回修改**：如有问题自动修复
4. **用户确认**：展示设计要点，等待确认

### Step 3: 数据契约

1. **契约生成**：墨子创建 `{feature}-data-contract.md`
   - TypeScript Interfaces
   - Zod Schemas
   - OpenAPI 3.1 Spec
2. **独立审核**：诸葛亮检查字段类型和校验规则
3. **打回修改**：如有问题自动修复
4. **用户确认**：等待确认

### Step 4: 测试计划

1. **计划生成**：探雷创建 `{feature}-test-plan.md`
   - 正常/异常/边界/安全测试场景
   - 验收标准 (Acceptance Criteria)
2. **最终总审**：墨子全链路审查
3. **用户确认**：等待确认

### Step 5: 代码实现（渐进式编码方案）⭐

**渐进式编码** - 分阶段、可追溯、自动回滚

```
┌─────────────────────────────────────────────────────────┐
│  Phase 5: 代码实现 (渐进式)                              │
├─────────────────────────────────────────────────────────┤
│  5.1 任务分发 → 5.2 增量实现 → 5.3 单元测试 → 5.4 验证  │
│       ↓              ↓              ↓             ↓     │
│  5.5 Code Review → 5.6 问题修复 → 5.7 合并主干          │
└─────────────────────────────────────────────────────────┘
```

#### 5.1 任务分发

诸葛亮将任务分解为前端和后端：

```bash
# 前端任务
巧匠，请实现登录表单组件
- Spec: user-login-requirements-spec.md
- 设计：user-login-technical-design.md
- 契约：user-login-data-contract.md

# 后端任务
铸剑师，请实现登录 API
- Spec: user-login-requirements-spec.md
- 设计：user-login-technical-design.md
- 契约：user-login-data-contract.md
```

#### 5.2 增量实现（使用 Codex CLI）

**巧匠（前端）：**
```bash
# 通过 Codex CLI 实现（协议转换到 Qwen-Coder）
codex exec --model qwen3-coder-next \
  --prompt "$(cat user-login-data-contract.md)\n\n实现登录表单组件" \
  --output-dir src/frontend/
```

**铸剑师（后端）：**
```bash
# 通过 Codex CLI 实现（协议转换到 Qwen-Coder-Plus）
codex exec --model qwen3-coder-plus \
  --prompt "$(cat user-login-data-contract.md)\n\n实现登录 API" \
  --output-dir src/backend/
```

#### 5.3 单元测试

探雷按 Test Plan 编写测试：

```bash
# 前端测试
npm test -- src/frontend/LoginForm.test.tsx

# 后端测试
npm test -- src/backend/auth.test.ts
```

#### 5.4 验证

探雷执行测试并报告覆盖率：

```
✅ 单元测试：32/32 通过
✅ 覆盖率：95%
⚠️ 边界场景：2 个失败（需修复）
```

#### 5.5 Code Review

墨子审查代码质量：

```bash
# Claude CLI 审查
claude "请审查 src/ 目录的代码，检查是否符合 Spec 设计"
```

输出：
```markdown
## Code Review 报告

### ✅ 通过项
- 代码结构清晰
- 遵循 Spec 设计
- 错误处理完善

### ⚠️ 建议优化
- 第 45 行：提取为独立函数

### ❌ 必须修复
- [严重] 第 123 行：密码未加密
```

#### 5.6 问题修复

根据 Code Review 结果：
- ✅ 通过项 → 继续
- ⚠️ 建议项 → 记录到 TODO
- ❌ 必须修复 → 打回重做（最多 3 次）

#### 5.7 合并主干

诸葛亮合并代码：

```bash
git add .
git commit -m "feat: 实现用户登录功能

- 前端：登录表单组件
- 后端：登录 API
- 测试：覆盖率 95%
- Review: 墨子通过"
git push origin feature/user-login
```

---

### 🔄 渐进式编码的优势

| 特性 | 传统方式 | 渐进式编码 |
|------|---------|-----------|
| **追溯性** | 难以追溯 | 每次提交关联 Spec |
| **可回滚** | 困难 | Git 分支管理 |
| **问题定位** | 困难 | 分阶段验证 |
| **Code Review** | 最后一次性 | 每阶段审查 |
| **测试覆盖** | 可能遗漏 | Test Plan 驱动 |

---

## 📊 与 spec-code-dev 的对比

| 特性 | spec-code-dev (旧) | spec-code-team (新) |
|------|-------------------|---------------------|
| **阶段** | Phase 1-4（文档） | Phase 1-5（文档 + 实现） |
| **依赖** | 无（纯文档） | Claude Code + Agent 团队 |
| **模型** | 任意模型 | 墨子=Claude，其他=Qwen |
| **适用场景** | 需求分析、设计阶段 | 完整项目开发 |
| **安装要求** | 单独安装 | openclaw + claude-code + agents |
| **代码实现** | ❌ 无 | ✅ 包含 |
| **Git 操作** | ❌ 无 | ✅ 自动提交 |
| **向后兼容** | ✅ 保持独立可用 | N/A（新技能） |

---

## 🚀 使用示例

### 安装

```bash
# 通过 ClawHub 安装（推荐）
openclaw skills install spec-code-team

# 或从 GitHub 克隆
git clone https://github.com/luckKiven/openclaw-xiaoxia.git
cp -r openclaw-xiaoxia/skills/spec-code-team ~/.openclaw/skills/
```

### 检查依赖

```bash
/spec-code-team --check

# 输出示例：
# ✅ Claude CLI 已安装
# ✅ Codex CLI 已安装
# ✅ codex-cn-bridge 服务运行中 (端口 3000)
# ✅ 所有依赖检查通过
```

### 运行

```
/spec-code-team F:\my-projects\ecommerce 增加用户登录功能
```

### 输出示例

```
🦐 Spec-Code-Team 技能启动
========================
项目：F:\my-projects\ecommerce
功能：增加用户登录功能

✅ Claude CLI 已安装
✅ Codex CLI 已安装
✅ codex-cn-bridge 服务运行中 (端口 3000)

📁 工作区：F:\2025ideazdjx\openClaw-project\feature\ecommerce\
✅ 工作区已创建
📦 Git 仓库已初始化

📋 Phase 1: 需求规格
==================
🤖 召唤 小白 (analyst)...
   模型：qwen3-max/kimi-k2.5
   任务：分析项目并生成需求规格文档...
✅ 小白已召唤（需求分析）

🤖 召唤 墨子 (architect)...
   模型：claude-code
   任务：审核需求规格文档...
✅ 墨子已召唤（需求审核）

✅ constitution.md 已生成
✅ user-login-requirements-spec.md 已生成
✅ 墨子审核通过

请确认是否继续 Phase 2: 技术设计？ [y/n]
```

---

## 📦 ClawHub 发布

### 元数据 (`_meta.json`)

```json
{
  "name": "spec-code-team",
  "version": "1.0.0",
  "description": "基于 Spec-Coding 的完整团队协作开发流程",
  "author": "jixiang",
  "license": "MIT",
  "dependencies": [
    "codex-cn-bridge"
  ],
  "requires": {
    "claude-cli": true,
    "codex-cli": true
  },
  "tags": ["spec-coding", "team", "claude", "codex", "enterprise"]
}
```

### 发布流程

```bash
# 1. 更新版本号
# 编辑 _meta.json

# 2. 打包
cd G:\openClaw\xiaoxia\skills
tar -czf spec-code-team.tar.gz spec-code-team/

# 3. 上传 ClawHub
# 访问 https://clawhub.com 上传
```

---

## ⚠️ 约束规则

1. **工作区隔离** - 所有产物存工作区，不修改原项目（Phase 5 除外）
2. **架构自适应** - 自动检测架构，支持 Hybrid 风格
3. **独立审核** - 每个阶段必须经过审核才能继续
4. **自动打回** - 审核发现问题自动修复，最多重试 3 次
5. **置信度阈值** - < 60% 时暂停让用户选择
6. **自动备份** - 配置变更自动触发 GitHub 备份
7. **Claude Code 使用** - 仅在关键节点调用，节省成本

---

## 🔗 后续集成

五阶段产物可直接作为：
- `schema-gen` 技能的输入（生成三层 Schema 到原项目）
- `tdd-runner` Agent 的输入（在原项目中 TDD 开发）
- `review` 技能的输入（代码审查基准）

---

_小虾 🦐 - 企业级 Spec-Coding 团队协作版_
