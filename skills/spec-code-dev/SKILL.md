---
name: spec-code-dev
description: 实现企业级规格驱动开发流程：根据用户需求分析现有项目，自动生成完整的软件工程文档体系（需求规格、技术设计、数据契约、测试计划），引入独立审核复测机制，支持混合架构检测。适用于新功能开发、跨模块需求。
---

# Spec-Code-Dev 技能 (企业级)

本技能实现完整的 **Spec Coding 四阶段开发流程**，核心原则：**文档即契约、架构自适应、独立审核、自动打回**。

## 核心角色

| 角色 | 职责 |
|-----|------|
| **Spec-Architect** | 主架构师，负责生成各阶段文档 |
| **Spec-Reviewer** | 独立审核员，负责审核文档质量 |

---

## 四阶段流程

### Phase 1: 需求规格 (Requirements)

```
流程：[只读分析] → [生成初稿] → [独立审核] → [有问题则打回修改] → [用户确认]
```

#### 产出文档：
- `constitution.md` - 项目宪法
- `{feature}-requirements-spec.md` - 需求规格文档

### Phase 2: 技术设计 (Technical Design)

```
流程：[基于确认的需求] → [生成设计] → [独立审核] → [有问题则打回修改] → [用户确认]
```

#### 产出文档：
- `{feature}-technical-design.md` - 技术设计文档

### Phase 3: 数据契约 (Data Contract)

```
流程：[基于设计] → [生成三层 Schema] → [独立审核] → [有问题则打回修改] → [用户确认]
```

#### 产出文档：
- `{feature}-data-contract.md` - 数据契约文档（TypeScript + Zod + OpenAPI）

### Phase 4: 测试计划 (Test Plan)

```
流程：[基于需求+设计] → [生成 TDD 计划] → [最终总审] → [用户确认]
```

#### 产出文档：
- `{feature}-test-plan.md` - 测试计划文档

---

## 审核机制

### 审核员职责 (Spec-Reviewer)

每个阶段文档生成后，自动触发独立审核：

| 检查项 | 说明 |
|-------|------|
| **一致性** | 是否违背项目宪法或既有架构？ |
| **完整性** | 是否遗漏异常处理、安全约束、边界条件？ |
| **可测试性** | 需求是否可量化？测试计划是否覆盖所有分支？ |

### 审核结果处理

```
审核结果：
├── ✅ Pass → 继续下一阶段
└── ❌ Issues Found → 自动打回修改
    ├── 修改后重新审核
    └── 最多重试 3 次
```

### 审核输出格式

```markdown
## 审核结果

### ✅ 通过项
- {符合项列表}

### ⚠️ 警告项（建议优化）
- {建议优化项，不阻断}

### ❌ 问题项（必须修复）
- {严重不一致或缺失，阻断流程}
```

---

## 架构自适应检测

### 支持的架构风格

| 架构风格 | 检测特征 |
|---------|---------|
| **Layered** | `controllers/`, `services/`, `models/`, `views/` |
| **Microservices** | `docker-compose.yml`, `k8s/`, 多服务目录 |
| **Event-Driven** | `*Event.*`, `*Handler.*`, Kafka, RabbitMQ |
| **Hexagonal** | `core/`, `adapters/`, `ports/` |
| **Clean Architecture** | `entities/`, `usecases/`, `interfaces/` |
| **Serverless** | `serverless.yml`, `functions/` |
| **Hybrid** | 检测到多种架构特征时自动标注 |

### 混合架构支持

```markdown
# constitution.md 示例

## Architecture Style
- **Type**: Hybrid
- **Core**: Layered (主业务逻辑)
- **Notification**: Event-Driven (消息通知模块)
- **Confidence**: 85%
```

### 置信度阈值

| 置信度 | 处理方式 |
|-------|---------|
| ≥ 60% | 自动选择最高匹配架构 |
| < 60% | 暂停，列出 Top 3 可能性让用户选择 |

---

## 工作区配置

### 默认路径

```
F:\2025ideazdjx\openClaw-project\feature\{project-name}\
```

### 目录结构

```
{project-name}/
├── constitution.md
├── {feature}-requirements-spec.md
├── {feature}-technical-design.md
├── {feature}-data-contract.md
└── {feature}-test-plan.md
```

---

## 执行步骤

### Step 0: 初始化

1. 确定工作区路径
2. 创建项目目录
3. 告知用户工作区位置

### Step 1: 需求规格

1. **只读分析**：扫描项目，识别技术栈、架构风格
2. **生成文档**：创建 `constitution.md` 和 `{feature}-requirements-spec.md`
3. **独立审核**：检查需求清晰度和架构一致性
4. **打回修改**：如有问题自动修复，最多重试 3 次
5. **用户确认**：展示文档要点，等待确认

### Step 2: 技术设计

1. **设计生成**：创建 `{feature}-technical-design.md`
2. **独立审核**：检查非功能性需求和架构符合性
3. **打回修改**：如有问题自动修复
4. **用户确认**：展示设计要点，等待确认

### Step 3: 数据契约

1. **契约生成**：创建 `{feature}-data-contract.md`
   - TypeScript Interfaces
   - Zod Schemas
   - OpenAPI 3.1 Spec
2. **独立审核**：检查字段类型和校验规则
3. **打回修改**：如有问题自动修复
4. **用户确认**：等待确认

### Step 4: 测试计划

1. **计划生成**：创建 `{feature}-test-plan.md`
   - 正常/异常/边界/安全测试场景
   - 验收标准 (Acceptance Criteria)
2. **最终总审**：全链路审查，检查测试覆盖率
3. **交付准备**：提示下一步可调用 schema-gen 或 tdd-runner

---

## 约束规则

1. **工作区隔离**：所有产物存工作区，不修改原项目
2. **架构自适应**：自动检测架构，支持 Hybrid 风格
3. **独立审核**：每个阶段必须经过审核才能继续
4. **自动打回**：审核发现问题自动修复，最多重试 3 次
5. **置信度阈值**：< 60% 时暂停让用户选择
6. **自动备份**：配置变更自动触发 GitHub 备份

---

## 使用示例

### 输入

```
/spec-code-dev 项目地址是: F:\my-projects\ecommerce 增加用户登录功能
```

### 输出

```
工作区：F:\2025ideazdjx\openClaw-project\feature\ecommerce\

Phase 1: 需求规格
├── 生成 constitution.md ✅
├── 生成 user-login-requirements-spec.md ✅
└── 审核通过 ✅

Phase 2: 技术设计
├── 生成 user-login-technical-design.md ✅
├── 审核发现 2 个问题
├── 自动修复 ✅
└── 审核通过 ✅

Phase 3: 数据契约
├── 生成 user-login-data-contract.md ✅
└── 审核通过 ✅

Phase 4: 测试计划
├── 生成 user-login-test-plan.md ✅
└── 最终审核通过 ✅

🎉 所有文档已就绪，可进入开发阶段！
```

---

## 后续集成

四阶段产物可直接作为：
- `schema-gen` 技能的输入（生成三层 Schema 到原项目）
- `tdd-runner` Agent 的输入（在原项目中 TDD 开发）
- `review` 技能的输入（代码审查基准）

---

_小虾 🦐 - 企业级规格驱动开发_