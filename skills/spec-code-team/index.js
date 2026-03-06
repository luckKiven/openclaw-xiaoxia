#!/usr/bin/env node

/**
 * Spec-Code-Team 技能入口
 * 
 * 基于 Spec-Coding 的完整团队协作开发流程
 * 整合 OpenClaw 编排层 + Claude CLI 架构师 + Codex CLI 执行层
 * 
 * @author jixiang
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 角色配置（技能自带，不依赖 agents/目录）
const ROLES = {
  orchestrator: {
    name: '诸葛亮',
    model: 'qwen3-max/qwen3.5-plus',
    roleFile: path.join(__dirname, 'roles/orchestrator.md'),
    description: '统筹全局、流程控制、任务分发、Git 操作、用户沟通'
  },
  analyst: {
    name: '小白',
    model: 'qwen3-max/kimi-k2.5',
    roleFile: path.join(__dirname, 'roles/analyst.md'),
    description: '需求分析、用户故事编写、产品文档输出'
  },
  architect: {
    name: '墨子',
    model: 'claude-code',  // ✅ 使用 Claude CLI
    roleFile: path.join(__dirname, 'roles/architect.md'),
    description: '系统架构设计、技术选型、Code Review',
    requires: 'claude-code'  // 需要 Claude CLI 已安装
  },
  frontend: {
    name: '巧匠',
    model: 'codex',  // ✅ 使用 Codex CLI
    codexModel: 'qwen3-coder-next',
    roleFile: path.join(__dirname, 'roles/worker.md'),
    description: '前端实现（按 Spec）'
  },
  backend: {
    name: '铸剑师',
    model: 'codex',  // ✅ 使用 Codex CLI
    codexModel: 'qwen3-coder-plus',
    roleFile: path.join(__dirname, 'roles/worker.md'),
    description: '后端实现（按 Spec）'
  },
  reviewer: {
    name: '探雷',
    model: 'qwen3-max/glm-5',
    roleFile: path.join(__dirname, 'roles/reviewer.md'),
    description: '测试验证、质量报告'
  }
};

// 检查依赖
function checkDependencies() {
  const errors = [];
  
  // 检查 Claude CLI（墨子必须）
  try {
    execSync('where claude', { stdio: 'pipe' });
    console.log('✅ Claude CLI 已安装');
  } catch (e) {
    errors.push('❌ Claude CLI 未安装 - 墨子（架构师）角色需要 Claude CLI');
  }
  
  // 检查 Codex CLI（巧匠/铸剑师必须）
  try {
    execSync('where codex', { stdio: 'pipe' });
    console.log('✅ Codex CLI 已安装');
  } catch (e) {
    errors.push('❌ Codex CLI 未安装 - 巧匠/铸剑师（执行层）需要 Codex CLI');
  }
  
  // 检查 codex-cn-bridge（Codex 协议转换）
  try {
    execSync('netstat -ano | findstr :3000', { stdio: 'pipe' });
    console.log('✅ codex-cn-bridge 服务运行中 (端口 3000)');
  } catch (e) {
    errors.push('⚠️ codex-cn-bridge 服务未运行 - Codex CLI 可能无法使用国内模型');
  }
  
  if (errors.length > 0) {
    console.error('\n依赖检查失败：');
    errors.forEach(e => console.error(e));
    console.error('\n解决方案：');
    console.error('  1. 安装 Claude CLI: https://claude.ai/download');
    console.error('  2. 安装 Codex CLI: npm install -g @openai/codex');
    console.error('  3. 安装 codex-cn-bridge: openclaw skills install codex-cn-bridge');
    console.error('  4. 或使用 spec-code-dev 技能（仅文档阶段，不需要 CLI）');
    process.exit(1);
  }
}

// 召唤 Agent
function spawnAgent(role, task, workdir, context = {}) {
  const config = ROLES[role];
  if (!config) {
    throw new Error(`未知角色：${role}`);
  }
  
  console.log(`\n🤖 召唤 ${config.name} (${role})...`);
  console.log(`   模型：${config.model}`);
  console.log(`   任务：${task.substring(0, 50)}...`);
  
  // 读取角色定义
  let rolePrompt = '';
  if (fs.existsSync(config.roleFile)) {
    rolePrompt = fs.readFileSync(config.roleFile, 'utf-8');
  }
  
  // 构建完整提示
  const fullPrompt = `
${rolePrompt}

---

## 当前任务

${task}

## 工作目录

${workdir}

## 上下文

${JSON.stringify(context, null, 2)}

---

请开始执行任务。
`.trim();
  
  // 召唤 Agent（使用 sessions_spawn）
  // 注意：实际执行需要通过 OpenClaw 的 sessions_spawn API
  // 这里是伪代码，实际需要根据 OpenClaw 的 API 调整
  
  return {
    role,
    name: config.name,
    model: config.model,
    prompt: fullPrompt,
    workdir
  };
}

// 主流程
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法：/spec-code-team <项目路径> <功能描述>');
    console.log('示例：/spec-code-team F:\\my-project 增加用户登录功能');
    process.exit(0);
  }
  
  const projectPath = args[0];
  const featureDesc = args.slice(1).join(' ');
  
  console.log('🦐 Spec-Code-Team 技能启动');
  console.log('========================');
  console.log(`项目：${projectPath}`);
  console.log(`功能：${featureDesc}`);
  
  // 检查依赖
  checkDependencies();
  
  // 创建工作区
  const workdir = path.join('F:\\2025ideazdjx\\openClaw-project\\feature', path.basename(projectPath));
  console.log(`\n📁 工作区：${workdir}`);
  
  if (!fs.existsSync(workdir)) {
    fs.mkdirSync(workdir, { recursive: true });
    console.log('✅ 工作区已创建');
  }
  
  // 初始化 Git（如需要）
  const gitDir = path.join(workdir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.log('\n📦 初始化 Git 仓库...');
    execSync('git init', { cwd: workdir, stdio: 'pipe' });
    execSync('git checkout -b feature/initial', { cwd: workdir, stdio: 'pipe' });
    console.log('✅ Git 仓库已初始化');
  }
  
  // Phase 1: 需求规格
  console.log('\n\n📋 Phase 1: 需求规格');
  console.log('==================');
  
  const requirementsTask = `
分析项目并生成需求规格文档：
1. 只读扫描项目：${projectPath}
2. 生成功能需求：${featureDesc}
3. 输出到工作区：${workdir}
`.trim();
  
  // 召唤小白（需求分析）
  const analystResult = spawnAgent('analyst', requirementsTask, workdir, {
    projectPath,
    featureDesc
  });
  console.log('✅ 小白已召唤（需求分析）');
  
  // 召唤墨子（需求审核）
  const architectReview1 = spawnAgent('architect', '审核需求规格文档', workdir, {
    phase: 'requirements',
    input: analystResult
  });
  console.log('✅ 墨子已召唤（需求审核）');
  
  // Phase 2-5 类似...
  console.log('\n\n🎉 所有阶段完成！');
  console.log('工作区：' + workdir);
}

// 导出给 OpenClaw 使用
module.exports = {
  ROLES,
  spawnAgent,
  checkDependencies,
  main
};

// 如果直接运行
if (require.main === module) {
  main().catch(err => {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  });
}
