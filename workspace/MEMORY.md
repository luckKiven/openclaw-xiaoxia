# MEMORY.md - 小虾的长期记忆

_最后更新：2026-03-10 09:11_

---

## 📋 重要事件

### 2026-03-10
- **网关安全加固** - 修复公网访问安全风险 ✅
  - 问题：网关绑定 `0.0.0.0` (lan 模式) 允许所有网络接口访问
  - 修复：改为 `127.0.0.1` (仅本地访问)
  - Control UI allowedOrigins 清理为仅 localhost
  - 提交：`b2534e1d4` → GitHub 备份完成
  - 状态：✅ 已固化到 best_practices (security 类别)
- **Evolver 进化周期 #0014** - 09:06 执行
  - 运行 ID: `run_1773104762317`
  - 触发信号：PowerShell `&&` 语法错误
  - 选择基因：`gene_gep_repair_from_errors`
  - 学习成果：PowerShell 使用 `;` 代替 `&&`
  - 状态：✅ 已记录到 self-improving memory
- **Self-Improving Memory 更新** - 记忆系统增强
  - 新增错误记录：4 条 (syntax_error, command_alias, api_timeout, path_error)
  - 新增最佳实践：3 条 (security, weather_api, powershell)
  - 天气 API 切换：wttr.in → open-meteo.com (更稳定)
  - 状态：✅ 记忆库已更新

### 2026-03-06
- **video-gen-pro 技能创建** - AI 视频生成技能完整实现 ✅
  - 核心模块：项目管理器、流程控制器、配置加载器
  - 主角记忆系统：档案 DB + CLIP 验证器
  - 工作流编排：standard_video_gen.yaml
  - CLI 接口：完整命令行工具
  - **适配器 (免费方案)**:
    - Edge TTS 配音 (微软免费服务)
    - FFmpeg 视频编辑 (免费开源)
    - BGM 选择器 (本地音乐库)
    - 脚本生成器 (Qwen API/模板双模式)
    - 输出打包器
  - 依赖：全部安装验证通过
  - **输出路径**: F:\2025ideazdjx\openClaw-project\vedio ✅
  - 状态：✅ 完整功能可用
- **Evolver 自我进化** - 成功执行基因修复
  - 修复基因：gene_gep_repair_from_errors
  - 修复内容：codex-cn-bridge 标记为可选依赖
  - 进化事件：evt_1772775345393
  - 状态：✅ 固化成功
- **Evolver 进化周期 #0002** - 14:02 执行
  - 运行 ID: run_1772776922157
  - 状态：✅ 无待处理进化（系统稳定）
  - 验证：基因修复验证通过
- **video-gen-pro F 盘配置** - 14:55 GitHub 备份
  - 提交：`873c3b7a3`
  - 内容：F 盘输出目录配置 + 默认配置文件
  - 推送：✅ 成功 `6283c4f37..873c3b7a3`
- **video-gen-pro 完成** - 14:25 GitHub 备份
  - 提交：`6283c4f37`
  - 内容：5 个适配器 + 依赖检查 + requirements.txt
  - 推送：✅ 成功 `d66f2c7ba..6283c4f37`
- **GitHub 自动备份** - 21:37 执行
  - 提交：`2d5be43eb`
  - 内容：codex-cn-bridge 守护进程监控功能
  - 推送：✅ 成功 `c4d480d5f..2d5be43eb`
- **GitHub 自动备份** - 14:03 执行
  - 提交：`d66f2c7ba`
  - 内容：Evolver 进化记录 (14 文件)
  - 推送：✅ 成功 `8598d8bab..d66f2c7ba`
- **GitHub 自动备份** - 14:00 执行
  - 提交：`8598d8bab`
  - 内容：MEMORY.md 更新
  - 推送：✅ 成功 `4aa1b4feb..8598d8bab`
- **GitHub 自动备份** - 13:37 执行
  - 提交：`4aa1b4feb`
  - 内容：video-gen-pro 技能 (15 文件) + Evolver 进化记录
  - 推送：✅ 成功 `7926ddd2e..4aa1b4feb`

### 2026-03-05
- **codex-cn-bridge 发布** - 完全开源发布到 GitHub 和 ClawHub
  - GitHub: https://github.com/luckKiven/codex-cn-bridge
  - ClawHub: 已上传审核中
  - 功能：让 Codex CLI 使用国内 Qwen 等模型（协议转换）
- **待办事项 1** - 走通文章/视频号发布流程
  - 目标：自动化发布内容到视频号/公众号
  - 状态：待调研
- **待办事项 2** - Codex 整合到 spec-code-team
  - 目标：用 Codex + Qwen-Coder 模型替代/增强现有编码流程
  - 状态：待规划

### 2026-03-02
- **初始化完成** - 记忆系统正式建立
- **空间分析** - OpenClaw 占用约 1.16 GB（主要在 G 盘 node_modules）
- **C 盘清理** - 清理临时文件约 1 GB
- **技能安装** - 安装 4 个新技能包（easyclaw、awesome-openclaw-skills、openclaw-skills-security、openclaw-xhs）
- **桌面自动化增强** - 添加强制确认机制和 F 盘输出配置
- **GitHub 备份** - 代码和配置推送到 https://github.com/luckKiven/openclaw-xiaoxia
- **SOUL 更新** - 固化陌生任务处理原则
- **Agent 团队规划** - 接收大虾的完整团队配置建议

---

## 🏠 环境配置（2026-03-06 更新）

| 项目 | 配置 |
|------|------|
| **OpenClaw 主程序** | `G:\openClaw\xiaoxia` ✅ **全部迁移完成** |
| **技能目录** | `G:\openClaw\xiaoxia\skills` |
| **Agent 配置** | `G:\openClaw\xiaoxia\agents` |
| **工作空间** | `G:\openClaw\xiaoxia\workspace` ✅ **全部在 G 盘** |
| **输出路径** | `F:\2025ideazdjx\openClaw-project\xiaoxia` |
| **服务端口** | 18788 |
| **时区** | Asia/Shanghai |

---

## ⚠️ C 盘写入限制（重要！）

**C 盘快满了！绝对不要向 C 盘写入任何文件！**

- ❌ 禁止：配置文件、大文件、项目物料、备份、node_modules、任何数据
- ✅ 允许：OpenClaw 运行时临时文件（无法避免）
- 📁 所有文件存放：`G:\openClaw\xiaoxia\`（技能和配置）或 `F:\`（输出物料）

---

## ✅ C 盘清理完成（2026-03-06 最终版）

**已迁移到 G 盘：**
- [x] agents/ - Agent 配置
- [x] skills/ - 技能目录
- [x] memory/ - 记忆数据库
- [x] logs/ - 日志
- [x] cron/ - 定时任务
- [x] browser/ - 浏览器数据
- [x] canvas/ - Canvas
- [x] completions/ - 自动补全
- [x] devices/ - 设备配置
- [x] identity/ - 身份认证
- [x] media/ - 媒体文件
- [x] subagents/ - Subagent 数据
- [x] openclaw.json - 主配置
- [x] gateway.cmd - Gateway 启动
- [x] **workspace/** - 工作空间配置（MEMORY.md, SOUL.md, USER.md 等）

**C 盘已清空：**
- ✅ C:\Users\14015\.openclaw\workspace\ 已全部迁移到 G:\openClaw\xiaoxia\workspace\
- ✅ C:\Users\14015\.openclaw\openclaw.json 已迁移到 G:\openClaw\xiaoxia\openclaw.json
- ✅ C 盘仅保留 OpenClaw 运行时临时日志（无法避免）

---

## 🦐 身份关系

- **小虾** = Windows 宿主机助手 (我)
- **大虾** = WSL2 中的主控 AI (协同工作)
- **老板** = 用户/掌控者

---

## ⚠️ 重要安全约束

### C 盘空间限制
- **绝对不要向 C 盘写入任何文件**！C 盘快满了，所有文件都必须写到 G 盘或 F 盘
- C 盘仅用于存储配置文件和临时运行数据
- 输出物料、项目文件、备份等全部使用 F 盘或 G 盘

### 代码修改审核流程
- **修改任何代码文件前，必须先向用户说明修改内容并获得审核通过**
- 包括但不限于：`.js`, `.ts`, `.py`, `.bat`, `.ps1`, `.json`, `.md` 等文件
- 即使是小的配置修改也需要用户确认
- 用户偏好：做事前先询问再行动

### 外部操作安全
- 发送邮件、推文、公共帖子等外部操作必须先征得用户同意
- 系统级操作（删除文件、修改注册表、安装软件）需要用户明确授权
- 优先使用只读操作，写操作需要额外确认

### 隐私保护红线
- ❌ 禁止暴露到公网或 GitHub：用户名/密码、API Keys、公私钥、任何敏感凭证
- ✅ 使用 `.gitignore` 保护敏感文件

### 物料产出规范
- **作者署名：** 所有产出的代码、文档等物料，作者统一使用 **jixiang**
- **去掉 version：** 不需要标注版本号
- **示例：**
  ```java
  /**
   * 类说明
   * 
   * @author jixiang
   */
  public class MyClass {
  }
  ```

### GitHub 推送规则
- **只推送与 OpenClaw 相关的内容**（配置、技能、Agent 团队等）
- **不推送具体项目物料**（如 Spring Boot 教学项目代码、文档等）
- **除非老板特别说明**，否则项目内容不推送到 GitHub
- **核心备份内容：**
  - ✅ Agent 团队配置（agents/）
  - ✅ spec-code-team 技能（skills/spec-code-team/）
  - ✅ 流程透明化规则（MEMORY.md）
  - ✅ OpenClaw 配置和脚本
  - ❌ 具体项目代码和文档

---

## 💬 Spec-Coding 流程透明化原则

### 核心要求
**所有 Agent 协作过程必须在聊天框中详细输出，让用户看到完整的工作流程。**

### 必须展示的内容

| 阶段 | 必须展示的内容 | 示例 |
|------|--------------|------|
| **Phase 1-2** | 墨子审核详情 | 审核通过的项、警告项、问题项、修改建议 |
| **Phase 3-4** | 探雷测试计划 | 测试用例设计思路、覆盖分析、边界场景说明 |
| **Phase 5** | 代码实现进度 | 已创建的文件、核心逻辑说明、待完成项 |
| **所有阶段** | 用户确认点 | 明确告知用户需要确认的内容 |

### 输出格式要求

```markdown
## Phase X: [阶段名称]

### 📋 [Agent 名字] 开始工作

**任务：** [具体任务描述]

### 🔍 工作过程

[详细展示分析过程、判断依据、决策理由]

### ✅ 审核结果

#### 通过项
- [具体通过的内容]

#### ⚠️ 警告项
- [建议优化但不阻断的内容]

#### ❌ 问题项
- [必须修复的严重问题]

### 💡 修改建议

[具体的修改建议和理由]

### 📊 总体评价

[评分 + 总结]

---

**请确认是否继续下一阶段？** [等待用户确认]
```

### 禁止的行为

- ❌ 静默执行，不展示过程
- ❌ 只展示结果，不展示 reasoning
- ❌ 跳过用户确认环节
- ❌ 使用"已审核"等模糊描述

---

## 🎯 用户体验原则

### 透明度
- 用户有权知道每个阶段的详细过程
- Agent 的思考过程应该可视化
- 审核标准应该明确告知

### 参与感
- 关键决策点让用户参与
- 用户可以看到工作进展
- 用户可以随时提出调整

### 可控性
- 每个阶段完成后等待用户确认
- 用户可以要求修改或重做
- 用户可以跳过某些阶段

---

## 🤖 Agent 团队配置（规划中）

| 角色 | 名字 | 模型 | 职责 |
|------|------|------|------|
| 👑 **指挥官** | 诸葛亮 | qwen3-max/qwen3.5-plus | 统筹全局、决策 |
| 🏛️ **架构师** | 墨子 | qwen3-max/qwen3.5-plus | 系统架构设计 |
| 📋 **产品经理** | 小白 | qwen3-max/kimi-k2.5 | 需求分析 |
| 🎨 **前端编码** | 巧匠 | qwen3-max/qwen3.5-plus | UI/UX 实现 |
| ⚙️ **后端编码** | 铸剑师 | qwen3-max/qwen3-coder-plus | API 设计 |
| 🧪 **测试工程师** | 探雷 | qwen3-max/glm-5 | 测试用例 |

### 模型说明
- **qwen3-max** 是模型提供者别名，实际使用具体模型
- **推荐模型**: qwen3.5-plus, kimi-k2.5, glm-5, MiniMax-M2.5
- **专业模型**: qwen3-coder-plus (编程增强), qwen3-coder-next (编程)

### Agent 召唤方式
```bash
sessions_spawn model="qwen3-max/qwen3.5-plus" label="诸葛亮" task="任务描述"
```

---

## 🔄 协同工作模式

**大虾 (WSL2)**: 负责整体协调、复杂逻辑处理、Linux 环境操作

**小虾 (Windows)**: 负责 Windows 系统控制、桌面自动化、本地文件操作

**分工原则**: 大虾下发指令，小虾执行 Windows 原生操作，结果通过共享文件系统返回

---

## 💾 备份策略

- **工作空间** - Git 版本控制 + 每日增量备份
- **记忆文件** - 优先保护（MEMORY.md + memory/）
- **输出物料** - 按项目/日期分类归档到 F 盘
- **GitHub 备份** - https://github.com/luckKiven/openclaw-xiaoxia

### 自动备份触发条件
小虾在修改以下文件后，主动执行备份：
- 配置文件（MEMORY.md, IDENTITY.md, USER.md 等）
- 技能文件（skills/ 目录）
- Agent 团队配置相关文件

---

## 📝 待办事项

- [ ] 创建备份脚本（backup.ps1）
- [ ] 配置 F 盘输出目录结构
- [ ] 设置心跳检查任务
- [ ] 组建 Agent 团队（诸葛亮、墨子、小白、巧匠、铸剑师、探雷）
- [ ] 配置每日自动备份 cron 任务

---

_此文件仅在主会话（私聊）加载，群聊不加载以保护隐私_
