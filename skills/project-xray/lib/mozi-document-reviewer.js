/**
 * 墨子文档审核器 v5.0 (Mozi Document Reviewer)
 * 
 * 墨子 Agent 配置：`agents/mozi.md`
 * 
 * 角色：Spec-Architect, Spec-Reviewer, Code Reviewer
 * 职责：独立审核员、技术架构师、Code Review 专家
 * 
 * 核心原则：
 * - 文档即契约
 * - 独立审核（调用 Claude Code）
 * - 自动打回（最多 3 次）
 * 
 * 审核方式：
 * 直接调用 Claude Code，让它分析文档和代码，返回审核报告
 * 
 * 调用示例：
 * claude "你帮我审核下这几份项目描述文档是否符合要求 项目地址：xxxx"
 * 
 * @author jixiang
 * @version 5.0.0 (调用 Claude Code 审核)
 */

const fs = require('fs-extra');
const path = require('path');

class MoziDocumentReviewer {
  /**
   * @param {string} outputDir - 文档输出目录
   * @param {Object} options - 配置选项
   */
  constructor(outputDir, options = {}) {
    this.outputDir = outputDir;
    this.documents = [];
    this.options = {
      // AI 审核配置
      useAI: options.useAI !== false,
      preferredModel: options.preferredModel || 'claude-code',
      // 降级链（按优先级）
      fallbackChain: options.fallbackChain || [
        'claude-code',
        'qwen3.5-plus',
        'kimi-k2.5',
        'glm-5',
        'current-session',
        'local-rules'
      ],
      // 重试配置
      maxRetries: options.maxRetries || 3
    };
    this.currentModel = null;
    this.agentIdentity = {
      name: '墨子',
      englishName: 'Spec-Architect',
      roles: ['Spec-Architect', 'Spec-Reviewer', 'Code Reviewer'],
      description: '独立审核员、技术架构师、Code Review 专家'
    };
  }

  /**
   * 检测可用的审核模型
   * @returns {Promise<string>} 可用的模型
   */
  async detectAvailableModel() {
    console.log('🔍 检测可用审核模型...');
    
    // 按降级链检测
    for (const model of this.options.fallbackChain) {
      const available = await this.isModelAvailable(model);
      if (available) {
        this.currentModel = model;
        console.log(`✅ 使用模型：${model}`);
        return model;
      }
    }
    
    // 最终降级为本地规则
    this.currentModel = 'local-rules';
    console.log('⚠️  降级为本地规则审核');
    return 'local-rules';
  }

  /**
   * 检查模型是否可用
   */
  async isModelAvailable(model) {
    try {
      if (model === 'claude-code') {
        // 检查是否有 Claude Code
        const { execSync } = require('child_process');
        execSync('claude --version', { stdio: 'ignore', timeout: 5000 });
        console.log('  ✅ Claude Code 可用');
        return true;
      }
      
      if (model === 'qwen3.5-plus' || 
          model === 'kimi-k2.5' || 
          model === 'glm-5' || 
          model === 'current-session') {
        // OpenClaw 模型，假设都可用
        console.log(`  ✅ ${model} 可用`);
        return true;
      }
      
      if (model === 'local-rules') {
        // 本地规则总是可用
        return true;
      }
      
      return false;
    } catch (error) {
      console.log(`  ❌ ${model} 不可用：${error.message}`);
      return false;
    }
  }

  /**
   * 审核所有文档（调用 Claude Code）
   * @returns {Promise<Object>} 审核结果
   */
  async reviewAll() {
    // 检测可用模型
    const model = await this.detectAvailableModel();
    
    const result = {
      timestamp: new Date().toISOString(),
      overall: 'pass',
      passCount: 0,
      warningCount: 0,
      failCount: 0,
      documents: [],
      items: [],
      reviewer: {
        agent: this.agentIdentity,
        model: model,
        type: model === 'local-rules' ? '本地规则审核' : 'Claude Code 审核',
        roles: this.agentIdentity.roles.join(', ')
      }
    };

    // 加载所有文档
    await this.loadDocuments();

    // 根据模型选择审核方式
    if (this.currentModel === 'claude-code') {
      // 调用 Claude Code 审核
      console.log('🤖 调用 Claude Code 进行审核...');
      return await this.reviewWithClaudeCode(result);
    } else {
      // 降级为本地规则审核
      console.log('⚠️  降级为本地规则审核...');
      return await this.reviewWithLocalRules(result);
    }
  }

  /**
   * 调用 Claude Code 审核（主要方式）
   */
  async reviewWithClaudeCode(result) {
    // 构建简化的审核提示词
    const prompt = `审核项目文档：${this.outputDir}
标准：1.函数分析深度 2.业务流程完整 3.面试题基于代码 4.文档有价值
输出：overall(pass/warning/fail),summary(一句话)`;
    
    console.log('📝 发送审核请求给 Claude Code...');
    console.log(`📂 项目地址：${this.outputDir}`);
    
    try {
      // 调用 Claude Code
      const { execSync } = require('child_process');
      
      // 使用 claude 命令调用
      const claudeCmd = `claude "${prompt.replace(/"/g, '\\"')}"`;
      
      const claudeOutput = execSync(claudeCmd, {
        cwd: this.outputDir,
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024,
        timeout: 300000 // 5 分钟超时
      });
      
      // 简化解析：从输出中提取 overall 和 summary
      const overallMatch = claudeOutput.match(/overall[:\s]*(pass|warning|fail)/i);
      const summaryMatch = claudeOutput.match(/summary[:\s]*(.+?)(?:\n|$)/i);
      
      result.overall = overallMatch ? overallMatch[1].toLowerCase() : 'warning';
      result.summary = summaryMatch ? summaryMatch[1].trim() : claudeOutput.substring(0, 200);
      
      // 统计文档状态
      const passCount = (claudeOutput.match(/合格 | 通过/g) || []).length;
      const failCount = (claudeOutput.match(/不合格 | 失败 | 问题/g) || []).length;
      
      result.passCount = passCount;
      result.warningCount = 0;
      result.failCount = failCount;
      
      // 生成审核报告文件
      const reportPath = path.join(this.outputDir, '99-mozi-review.md');
      const reportContent = `# 墨子审核报告

**审核时间：** ${new Date().toISOString()}

**审核员：** 墨子 (Claude Code)

**审核结果：** ${result.overall.toUpperCase()}

**总结：** ${result.summary}

**详细审核内容：**

\`\`\`
${claudeOutput}
\`\`\`
`;
      await fs.writeFile(reportPath, reportContent);
      
      console.log('✅ 审核报告已保存到 99-mozi-review.md');
      
      return result;
      
    } catch (error) {
      console.error('❌ Claude Code 审核失败：', error.message);
      console.log('⚠️  降级为本地规则审核...');
      return await this.reviewWithLocalRules(result);
    }
  }

  /**
   * 构建审核提示词
   */
  buildReviewPrompt() {
    const docList = this.documents
      .map(doc => `- ${doc.name} (${doc.size} 字节)`)
      .join('\n');
    
    return `你帮我审核下这几份项目描述文档是否符合要求

项目地址：${this.outputDir}

文档清单：
${docList}

审核标准：
1. 函数分析是否深入？（是否说明了功能、参数、返回值、调用关系）
2. 业务流程是否完整？（是否有流程图、步骤说明）
3. 面试题是否基于实际代码？（答案是否引用了具体代码、函数名、行号）
4. 文档是否有实际价值？（开发者看了能懂代码吗？）

请直接输出 JSON 格式审核报告（不要 markdown 代码块，不要多余文字）：
{
  "overall": "pass|warning|fail",
  "summary": "总体评价（一句话）",
  "passCount": 通过文档数量，
  "warningCount": 警告文档数量，
  "failCount": 失败文档数量，
  "items": [
    {
      "severity": "fail|warning",
      "item": "问题项名称",
      "issue": "具体问题描述",
      "evidence": "证据（引用文档内容或行号）",
      "suggestion": "修复建议"
    }
  ],
  "passItems": ["通过项列表"]
}`;
  }

  /**
   * 解析 Claude Code 返回的报告
   */
  parseClaudeReport(output) {
    try {
      // 尝试从输出中提取 JSON（从最后一个完整的 JSON 对象开始）
      const jsonStart = output.lastIndexOf('```json');
      const jsonEnd = output.lastIndexOf('```');
      
      let jsonStr = '';
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        // 从 markdown 代码块中提取
        jsonStr = output.substring(jsonStart + 7, jsonEnd).trim();
      } else {
        // 尝试直接提取 JSON 对象
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }
      
      if (jsonStr) {
        // 清理 JSON 字符串（移除可能的截断部分）
        jsonStr = this.cleanJsonString(jsonStr);
        
        const report = JSON.parse(jsonStr);
        
        // 转换为我们需要的格式
        return this.convertReportFormat(report);
      }
      
      throw new Error('未找到 JSON 内容');
      
    } catch (e) {
      console.error('❌ 解析 JSON 失败：', e.message);
      console.log('原始输出长度：', output.length);
      
      // 解析失败，返回从输出中提取的信息
      return this.extractInfoFromOutput(output);
    }
  }

  /**
   * 清理 JSON 字符串
   */
  cleanJsonString(jsonStr) {
    // 移除末尾可能截断的部分
    const lastBrace = jsonStr.lastIndexOf('}');
    if (lastBrace > 0) {
      jsonStr = jsonStr.substring(0, lastBrace + 1);
    }
    
    // 修复常见的 JSON 问题
    jsonStr = jsonStr
      .replace(/,\s*}/g, '}')  // 移除末尾逗号
      .replace(/,\s*]/g, ']')  // 移除数组末尾逗号
      .replace(/'/g, '"');      // 单引号转双引号
    
    return jsonStr;
  }

  /**
   * 转换报告格式
   */
  convertReportFormat(report) {
    // 根据实际报告结构调整
    return {
      overall: report.overall || report.conclusion ? 'warning' : 'pass',
      summary: report.summary || report.conclusion || '审核完成',
      passCount: report.passCount || 0,
      warningCount: report.warningCount || (report.file_status ? Object.values(report.file_status).filter(f => f.status === '勉强可用').length : 0),
      failCount: report.failCount || (report.file_status ? Object.values(report.file_status).filter(f => f.status === '不合格' || f.status === '未完成' || f.status === '失败').length : 0),
      items: report.items || this.extractIssuesFromReport(report),
      passItems: report.passItems || []
    };
  }

  /**
   * 从报告中提取问题
   */
  extractIssuesFromReport(report) {
    const items = [];
    
    if (report.file_status) {
      for (const [file, info] of Object.entries(report.file_status)) {
        if (info.status !== '通过' && info.status !== '合格') {
          items.push({
            severity: info.status === '未完成' || info.status === '失败' ? 'fail' : 'warning',
            item: file,
            issue: info.issue || '文档有问题',
            evidence: `${file} 状态：${info.status}`,
            suggestion: '修复文档问题'
          });
        }
      }
    }
    
    if (report.suggested_actions) {
      for (const action of report.suggested_actions) {
        items.push({
          severity: action.priority === 'P0' ? 'fail' : 'warning',
          item: action.action,
          issue: action.action,
          evidence: `优先级：${action.priority}`,
          suggestion: action.expected_outcome
        });
      }
    }
    
    return items;
  }

  /**
   * 从输出中提取信息（当 JSON 解析失败时）
   */
  extractInfoFromOutput(output) {
    // 尝试提取关键信息
    const hasIssues = output.includes('不合格') || output.includes('失败') || output.includes('问题');
    
    return {
      overall: hasIssues ? 'warning' : 'pass',
      summary: 'Claude Code 审核完成（JSON 解析失败，从输出提取信息）',
      passCount: 0,
      warningCount: 1,
      failCount: 0,
      items: [
        {
          severity: 'warning',
          item: '文档质量',
          issue: '文档可能存在质量问题',
          evidence: '从输出中检测到问题关键词',
          suggestion: '检查生成的文档内容'
        }
      ],
      passItems: []
    };
  }

  /**
   * 本地规则审核（降级方式）
   */
  async reviewWithLocalRules(result) {
    // 简化的本地规则审核
    for (const doc of this.documents) {
      if (doc.content && doc.size > 100) {
        result.passCount++;
      } else {
        result.warningCount++;
        result.items.push({
          severity: 'warning',
          item: doc.name,
          issue: '文档内容过少或缺失',
          evidence: `${doc.size} 字节`,
          suggestion: '检查文档生成逻辑'
        });
      }
    }
    
    result.summary = `本地规则审核：通过 ${result.passCount} 份，警告 ${result.warningCount} 份`;
    result.overall = result.failCount > 0 ? 'fail' : (result.warningCount > 0 ? 'warning' : 'pass');
    
    return result;
  }

  /**
   * 加载文档
   */
  async loadDocuments() {
    const docFiles = [
      '00-quick-start.md',
      '01-project-overview.md',
      '02-architecture-guide.md',
      '03-core-modules.md',
      '04-code-navigation.md',
      '05-glossary.md'
    ];

    for (const file of docFiles) {
      const filePath = path.join(this.outputDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        this.documents.push({
          name: file,
          path: filePath,
          content,
          size: content.length
        });
      } catch (error) {
        this.documents.push({
          name: file,
          path: filePath,
          content: null,
          size: 0,
          error: error.message
        });
      }
    }
  }

  /**
   * 更新总体结果
   */
  updateOverall(result, docResult) {
    if (docResult.status === 'fail') {
      result.overall = 'fail';
      result.failCount++;
    } else if (docResult.status === 'warning') {
      if (result.overall !== 'fail') {
        result.overall = 'warning';
      }
      result.warningCount++;
    } else {
      result.passCount++;
    }
  }

  /**
   * 审核单份文档
   */
  async reviewDocument(doc) {
    const result = {
      name: doc.name,
      status: 'pass',
      items: []
    };

    // 检查文档是否存在
    if (!doc.content) {
      result.items.push({
        severity: 'fail',
        item: '文档存在性',
        issue: `文档不存在或无法读取`,
        suggestion: `检查文件路径：${doc.path}`
      });
      result.status = 'fail';
      return result;
    }

    // 检查文档大小
    if (doc.size < 100) {
      result.items.push({
        severity: 'warning',
        item: '文档完整性',
        issue: `文档内容过少 (${doc.size} 字节)`,
        suggestion: `检查文档生成逻辑，确保内容完整`
      });
      result.status = 'warning';
    }

    // 根据文档类型审核
    if (doc.name === '00-quick-start.md') {
      const quickStartIssues = this.reviewQuickStart(doc.content);
      result.items.push(...quickStartIssues);
    }

    if (doc.name === '01-project-overview.md') {
      const overviewIssues = this.reviewOverview(doc.content);
      result.items.push(...overviewIssues);
    }

    if (doc.name === '02-architecture-guide.md') {
      const archIssues = this.reviewArchitecture(doc.content);
      result.items.push(...archIssues);
    }

    if (doc.name === '03-core-modules.md') {
      const moduleIssues = await this.reviewCoreModules(doc.content);
      result.items.push(...moduleIssues);
    }

    if (doc.name === '04-code-navigation.md') {
      const navIssues = this.reviewNavigation(doc.content);
      result.items.push(...navIssues);
    }

    if (doc.name === '05-glossary.md') {
      const glossaryIssues = this.reviewGlossary(doc.content);
      result.items.push(...glossaryIssues);
    }

    // 确定文档状态
    const hasFail = result.items.some(i => i.severity === 'fail');
    const hasWarning = result.items.some(i => i.severity === 'warning');
    
    if (hasFail) {
      result.status = 'fail';
    } else if (hasWarning) {
      result.status = 'warning';
    }

    return result;
  }

  /**
   * 审核快速上手指南
   */
  reviewQuickStart(content) {
    const issues = [];

    // 检查是否包含安装步骤
    if (!content.includes('安装依赖') && !content.includes('npm install') && !content.includes('pip install')) {
      issues.push({
        severity: 'fail',
        item: '安装步骤',
        issue: '缺少安装依赖步骤',
        suggestion: '添加安装依赖的具体命令'
      });
    }

    // 检查是否包含启动命令
    if (!content.includes('启动') && !content.includes('run') && !content.includes('start')) {
      issues.push({
        severity: 'warning',
        item: '启动命令',
        issue: '缺少项目启动命令',
        suggestion: '添加启动项目的具体命令'
      });
    }

    // 检查是否包含环境要求
    if (!content.includes('环境') && !content.includes('要求') && !content.includes('Node.js') && !content.includes('Python')) {
      issues.push({
        severity: 'warning',
        item: '环境要求',
        issue: '缺少环境要求说明',
        suggestion: '说明项目运行所需的环境'
      });
    }

    return issues;
  }

  /**
   * 审核项目概览
   */
  reviewOverview(content) {
    const issues = [];

    // 检查是否包含技术栈
    if (!content.includes('技术栈') && !content.includes('语言') && !content.includes('框架')) {
      issues.push({
        severity: 'fail',
        item: '技术栈信息',
        issue: '缺少技术栈信息',
        suggestion: '说明项目使用的编程语言和框架'
      });
    }

    // 检查是否包含代码规模
    if (!content.includes('文件') && !content.includes('代码行数')) {
      issues.push({
        severity: 'warning',
        item: '代码规模',
        issue: '缺少代码规模统计',
        suggestion: '统计项目文件数和代码行数'
      });
    }

    return issues;
  }

  /**
   * 审核架构导览
   */
  reviewArchitecture(content) {
    const issues = [];

    // 检查是否包含 Mermaid 图
    if (!content.includes('```mermaid')) {
      issues.push({
        severity: 'warning',
        item: '架构图',
        issue: '缺少 Mermaid 架构图',
        suggestion: '添加项目架构图'
      });
    }

    // 检查 Mermaid 图是否有效
    const mermaidMatch = content.match(/```mermaid([\s\S]*?)```/);
    if (mermaidMatch) {
      const mermaidContent = mermaidMatch[1].trim();
      if (mermaidContent === 'graph TD' || mermaidContent.length < 20) {
        issues.push({
          severity: 'warning',
          item: '架构图质量',
          issue: 'Mermaid 图内容过少或为空',
          suggestion: '补充架构图的节点和关系'
        });
      }
    }

    // 检查是否包含模块说明
    if (!content.includes('模块') && !content.includes('说明')) {
      issues.push({
        severity: 'warning',
        item: '模块说明',
        issue: '缺少模块说明',
        suggestion: '添加项目模块的详细说明'
      });
    }

    return issues;
  }

  /**
   * 审核核心模块解读
   */
  async reviewCoreModules(content) {
    const issues = [];

    // 检查是否包含模块职责
    if (content.includes('[待分析') || content.includes('待补充')) {
      issues.push({
        severity: 'fail',
        item: '模块职责',
        issue: '模块职责描述为占位符',
        suggestion: '分析代码后填充模块职责描述'
      });
    }

    // 检查是否包含核心函数
    if (!content.includes('函数') && !content.includes('function') && !content.includes('def ')) {
      issues.push({
        severity: 'warning',
        item: '核心函数',
        issue: '缺少核心函数列表',
        suggestion: '列出模块的核心函数'
      });
    }

    // 检查是否包含面试题
    if (!content.includes('面试题') && !content.includes('面试')) {
      issues.push({
        severity: 'warning',
        item: '面试题',
        issue: '缺少面试题',
        suggestion: '为每个模块生成 20 道面试题'
      });
    }

    // 检查面试题答案是否基于代码
    const genericAnswerCount = (content.match(/需要分析具体代码实现/g) || []).length;
    if (genericAnswerCount > 10) {
      issues.push({
        severity: 'warning',
        item: '面试题质量',
        issue: `${genericAnswerCount} 道面试题答案为通用模板`,
        suggestion: '基于实际代码生成具体答案'
      });
    }

    // 检查文档大小
    if (content.length < 5000) {
      issues.push({
        severity: 'warning',
        item: '文档完整性',
        issue: '核心模块文档内容过少',
        suggestion: '补充模块职责、函数、面试题等内容'
      });
    }

    return issues;
  }

  /**
   * 审核代码导航地图
   */
  reviewNavigation(content) {
    const issues = [];

    // 检查是否包含功能映射表
    if (!content.includes('| 功能 |') || !content.includes('| 文件路径 |')) {
      issues.push({
        severity: 'fail',
        item: '功能映射表',
        issue: '缺少功能 - 文件映射表',
        suggestion: '添加功能与文件的映射关系'
      });
    }

    // 检查映射表是否为空
    if (content.includes('[待补充]') || content.includes('[待分析]')) {
      issues.push({
        severity: 'fail',
        item: '映射表内容',
        issue: '功能映射表为占位符',
        suggestion: '分析代码后填充功能映射'
      });
    }

    // 检查是否包含入口文件
    if (!content.includes('入口') && !content.includes('main') && !content.includes('index')) {
      issues.push({
        severity: 'warning',
        item: '入口文件',
        issue: '缺少入口文件说明',
        suggestion: '列出项目的入口文件'
      });
    }

    return issues;
  }

  /**
   * 审核术语表
   */
  reviewGlossary(content) {
    const issues = [];

    // 检查是否包含术语
    if (content.includes('[待补充]') || content.includes('[待分析]')) {
      issues.push({
        severity: 'warning',
        item: '术语内容',
        issue: '术语表为占位符',
        suggestion: '从代码和文档中提取专业术语'
      });
    }

    return issues;
  }

  /**
   * 生成总体评价
   */
  generateSummary(result) {
    const totalDocs = result.documents.length;
    const passDocs = result.documents.filter(d => d.status === 'pass').length;
    const failDocs = result.documents.filter(d => d.status === 'fail').length;

    let summary = `审核了 ${totalDocs} 份文档，通过 ${passDocs} 份`;
    
    if (failDocs > 0) {
      summary += `，${failDocs} 份需要修复`;
    }

    return summary;
  }

  /**
   * 生成审核报告
   * @param {Object} reviewResult - 审核结果
   * @returns {string} Markdown 格式报告
   */
  generateReport(reviewResult) {
    let report = `# Project X-Ray 墨子文档审核报告\n\n`;
    report += `_审核时间：${reviewResult.timestamp}_\n\n`;
    report += `_审核员：**${reviewResult.reviewer.agent.name}** (${reviewResult.reviewer.agent.englishName})_\n\n`;
    report += `_角色：${reviewResult.reviewer.roles}_\n\n`;
    report += `_审核模型：${reviewResult.reviewer.model} (${reviewResult.reviewer.type})_\n\n`;
    report += `---\n\n`;

    // 总体结果
    const statusIcon = reviewResult.overall === 'pass' ? '✅' : 
                       reviewResult.overall === 'warning' ? '⚠️' : '❌';
    report += `## 📊 总体结果 ${statusIcon} ${reviewResult.overall.toUpperCase()}\n\n`;
    report += `${reviewResult.summary}\n\n`;
    report += `- ✅ 通过文档：${reviewResult.passCount}\n`;
    report += `- ⚠️ 警告文档：${reviewResult.warningCount}\n`;
    report += `- ❌ 失败文档：${reviewResult.failCount}\n\n`;

    // 按文档列出审核结果
    for (const doc of reviewResult.documents) {
      const docIcon = doc.status === 'pass' ? '✅' : 
                      doc.status === 'warning' ? '⚠️' : '❌';
      report += `## ${docIcon} ${doc.name}\n\n`;
      
      if (doc.items.length === 0) {
        report += `✅ 无问题\n\n`;
      } else {
        for (const item of doc.items) {
          const icon = item.severity === 'fail' ? '❌' : '⚠️';
          report += `${icon} **${item.item}**: ${item.issue}\n`;
          report += `   - 💡 建议：${item.suggestion}\n\n`;
        }
      }
    }

    report += `---\n\n_由墨子文档审核器生成 🦴_\n`;
    return report;
  }
}

module.exports = MoziDocumentReviewer;
