---
name: spec-code-bug
description: 专门用于bug修复场景的Spec Coding流程：分析现有项目中的bug，生成bug修复spec文档和测试用例，调用bug-fix技能进行根因分析和验证文档生成。适用于修复现有功能的问题，而非新增功能。
---

# Spec-Code-Bug 技能

本技能专门处理**bug修复场景**，与功能开发的spec-code-dev技能形成互补。

## 适用场景
- 修复现有功能的bug（如：WiFi密码错误导致热点关闭）
- 修复崩溃、性能问题、逻辑错误
- 修复安全漏洞或数据一致性问题
- **不适用于**新功能开发或功能增强

## 工作流程

### 阶段1：Bug分析和重现
- 分析用户提供的bug描述
- 读取相关代码文件理解上下文
- 生成精确的重现步骤文档

### 阶段2：调用bug-fix技能
- 使用已安装的bug-fix技能进行根因分析
- 生成完整的bug修复验证文档
- 包含重现步骤、根因分析、修复方案、验证方法

### 阶段3：生成测试用例
- 基于bug场景生成回归测试用例
- 覆盖边缘情况和异常路径
- 确保测试能捕获原始bug

## 执行步骤

### Step 1: 确认工作区位置
- 默认工作区：`F:\2025ideazdjx\openClaw-project\bug\`
- 创建项目特定目录：`{workzone}/bug/{project-name}\`

### Step 2: 分析bug上下文
- 读取用户指定的项目文件
- 理解现有代码逻辑和架构
- 识别bug影响范围和严重程度

### Step 3: 生成bug修复spec文档
- 文件名格式：`{bug-description}-bug-spec.md`
- **必须使用简体中文编写**
- 必须包含以下章节：

```markdown
# Bug修复：{bug描述}

## Bug现象
{详细描述bug的表现}

## 重现步骤
1. {步骤1}
2. {步骤2}
3. {触发bug的具体操作}

## 预期行为
{应该发生的行为}

## 实际行为  
{实际发生的错误行为}

## 影响范围
{受影响的功能、用户、环境}

## 修复约束
{修复时需要遵守的技术约束}
```

### Step 4: 调用bug-fix技能
- 将分析结果传递给bug-fix技能
- 生成完整的根因分析和验证文档
- 输出到工作区目录

### Step 5: 生成测试用例
- 创建回归测试用例
- 覆盖原始bug场景和边缘情况
- 确保测试用例能验证修复效果

## 产物位置
所有产物存储在：`F:\2025ideazdjx\openClaw-project\bug\{project-name}\`

包含文件：
- `{bug}-bug-spec.md` - bug修复规格文档
- `bug-fix-analysis.md` - 根因分析和验证文档（来自bug-fix技能）
- `regression-tests.md` - 回归测试用例

## 与spec-code-dev的区别

| 方面 | spec-code-bug | spec-code-dev |
|------|---------------|---------------|
| **适用场景** | bug修复 | 新功能开发 |
| **产物** | spec + 测试用例 | constitution + spec + plan |
| **数据约束** | 不需要 | 需要定义数据契约 |
| **工作区** | `...\bug\` | `...\feature\` |
| **依赖技能** | bug-fix技能 | schema-gen, tdd-runner等 |

## 使用示例

用户输入："/spec-code-bug 项目地址是: F:\my-projects\wifi-helper WiFi密码错误导致热点关闭"

执行结果：
- 工作区：`F:\2025ideazdjx\openClaw-project\bug\wifi-helper\`
- 产物：
  - `wifi-password-hotspot-bug-spec.md`
  - `bug-fix-analysis.md` 
  - `regression-tests.md`

## 模型切换策略
- **bug分析阶段**：使用reasoner模型进行深度根因分析
- **文档生成阶段**：使用qwen模型确保中文质量
- **测试生成阶段**：使用coder-model生成测试代码