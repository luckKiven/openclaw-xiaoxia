---
name: spec-code-team
description: 基于 Spec-Coding 的完整团队协作开发流程：整合 OpenClaw 编排层 + Claude Code 架构师 + 执行层 Agent，实现从需求分析到代码交付的全流程自动化。适用于复杂项目、新功能开发、跨模块需求。
---

# Spec-Code-Team 技能 (企业级团队协作版)

> ⚠️ **依赖要求**
>
> 使用本技能需要以下环境：
> - ✅ OpenClaw 运行时（编排层）
> - ✅ Claude Code 已安装并配置（架构师角色）
> - ✅ Agent 团队配置（`agents/` 目录）
>
> 如果只有 OpenClaw 没有 Claude Code，请使用 `spec-code-dev` 技能（仅文档阶段）。

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
┌─────────────────────────────────────────────────┐
│           编排层 (Orchestrator)                  │
│           诸葛亮 (qwen3.5-plus)                  │
│  职责：流程控制、任务分发、Git 操作、用户沟通       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│             架构层 (Architect)                   │
│      小白 (kimi-k2.5) + 墨子 (Claude Code) ⭐    │
│  职责：需求分析、技术设计、数据契约、测试计划      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│             执行层 (Workers)                     │
│   巧匠 (qwen3-coder-next) + 铸剑师 (qwen3-coder-plus) │
│  职责：按 Spec 实现前端/后端代码、单元测试          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│             质量层 (QA)                          │
│            探雷 (glm-5)                          │
│  职责：测试验证、Code Review、质量报告            │
└─────────────────────────────────────────────────┘
```

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

### Phase 5: 代码实现 (Implementation) ⭐ 新增

```
流程：[基于确认的 Spec] → [巧匠/铸剑师实现] → [探雷测试] → [墨子 Review] → [诸葛亮合并]
```

**产出物料：**
- 源代码（按 Spec 实现）
- 单元测试（按 Test Plan）
- Code Review 报告
- Git 提交记录

**负责 Agent：**
- 前端实现：巧匠 (qwen3-coder-next)
- 后端实现：铸剑师 (qwen3-coder-plus)
- 测试验证：探雷 (glm-5)
- Code Review：墨子 (Claude Code) ⭐
- Git 合并：诸葛亮

---

## 🤖 Agent 角色配置

### 编排层

| 角色 | 名字 | 模型 | 职责 |
|------|------|------|------|
| Spec-Orchestrator | 诸葛亮 | qwen3.5-plus | 流程控制、任务分发、Git 操作 |

### 架构层

| 角色 | 名字 | 模型 | 职责 |
|------|------|------|------|
| Spec-Analyst | 小白 | kimi-k2.5 | 需求分析、文档编写 |
| Spec-Architect | 墨子 | **Claude Code** ⭐ | 技术设计、架构审核、Code Review |

### 执行层

| 角色 | 名字 | 模型 | 职责 |
|------|------|------|------|
| Spec-Frontend | 巧匠 | qwen3-coder-next | 前端实现 |
| Spec-Backend | 铸剑师 | qwen3-coder-plus | 后端实现 |

### 质量层

| 角色 | 名字 | 模型 | 职责 |
|------|------|------|------|
| Spec-Reviewer | 探雷 | glm-5 | 测试验证、质量报告 |

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

### Step 0: 初始化

1. 确定工作区路径：`F:\2025ideazdjx\openClaw-project\feature\{project-name}\`
2. 创建项目目录
3. 告知用户工作区位置
4. 初始化 Git 仓库（如需要）

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

### Step 5: 代码实现

1. **任务分发**：诸葛亮分配任务给巧匠（前端）和铸剑师（后端）
2. **代码实现**：按 Spec 实现功能代码
3. **单元测试**：按 Test Plan 编写测试
4. **测试验证**：探雷执行测试并报告
5. **Code Review**：墨子审查代码质量
6. **Git 合并**：诸葛亮创建分支、提交代码、推送仓库

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

### 输入

```
/spec-code-team 项目地址是：F:\my-projects\ecommerce 增加用户登录功能
```

### 输出

```
工作区：F:\2025ideazdjx\openClaw-project\feature\ecommerce\

Phase 1: 需求规格
├── 小白生成 constitution.md ✅
├── 小白生成 user-login-requirements-spec.md ✅
├── 墨子审核通过 ✅
└── 用户确认 ✅

Phase 2: 技术设计
├── 墨子生成 user-login-technical-design.md ✅
├── 诸葛亮审核通过 ✅
└── 用户确认 ✅

Phase 3: 数据契约
├── 墨子生成 user-login-data-contract.md ✅
├── 诸葛亮审核通过 ✅
└── 用户确认 ✅

Phase 4: 测试计划
├── 探雷生成 user-login-test-plan.md ✅
├── 墨子总审通过 ✅
└── 用户确认 ✅

Phase 5: 代码实现
├── 巧匠实现前端组件 ✅
├── 铸剑师实现后端 API ✅
├── 探雷执行测试 (覆盖率 95%) ✅
├── 墨子 Code Review 通过 ✅
└── 诸葛亮 Git 提交 ✅

🎉 所有阶段完成！代码已提交到仓库。
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
