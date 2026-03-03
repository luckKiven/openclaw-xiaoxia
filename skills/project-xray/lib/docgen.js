/**
 * 文档生成器
 * 
 * 根据分析结果生成 7 份文档（含面试题）
 * 
 * @author jixiang
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const MermaidGenerator = require('./mermaid-gen');
const InterviewQuestionsGenerator = require('./interview-questions-gen');
const LLMCodeAnalyzer = require('./llm-code-analyzer');

class DocumentGenerator {
  /**
   * @param {string} templateDir - 模板目录
   * @param {string} rootPath - 项目根目录
   */
  constructor(templateDir, rootPath) {
    this.templateDir = templateDir;
    this.rootPath = rootPath;
    this.mermaidGen = new MermaidGenerator();
    this.questionsGen = new InterviewQuestionsGenerator();
    this.llmAnalyzer = new LLMCodeAnalyzer(rootPath);
  }

  /**
   * 生成所有文档（先 LLM 深度分析）
   * 输出路径：F:\2025ideazdjx\openClaw-project\project-desc\{project-name}-xray\
   * @param {Object} analysis - 分析结果
   * @param {string} outputDir - 输出目录
   * @returns {Promise<void>}
   */
  async generateAll(analysis, outputDir) {
    try {
      // 1. 先进行 LLM 深度分析
      console.log('🤖 开始 LLM 深度代码分析...');
      const llmAnalysis = await this.llmAnalyzer.analyzeProject();
      
      // 2. 合并分析结果
      const fullAnalysis = {
        ...analysis,
        ...llmAnalysis
      };
      
      await fs.ensureDir(outputDir);
      await fs.ensureDir(path.join(outputDir, 'diagrams'));
      await fs.ensureDir(path.join(outputDir, 'inventory'));

      await this.generateQuickStart(fullAnalysis, outputDir);
      await this.generateOverview(fullAnalysis, outputDir);
      await this.generateArchitectureGuide(fullAnalysis, outputDir);
      await this.generateCoreModules(fullAnalysis, outputDir);
      await this.generateCodeNavigation(fullAnalysis, outputDir);
      await this.generateGlossary(fullAnalysis, outputDir);
      await this.generateInventory(fullAnalysis, outputDir);
      
    } catch (error) {
      console.error('❌ LLM 分析失败：', error.message);
      console.log('⚠️  降级到基础分析...');
      
      // 降级到基础分析
      await fs.ensureDir(outputDir);
      await this.generateAllBasic(analysis, outputDir);
    }
  }
  
  /**
   * 生成所有文档（基础版，降级用）
   */
  async generateAllBasic(analysis, outputDir) {
    await fs.ensureDir(outputDir);
    await fs.ensureDir(path.join(outputDir, 'diagrams'));
    await fs.ensureDir(path.join(outputDir, 'inventory'));

    await this.generateQuickStart(analysis, outputDir);
    await this.generateOverview(analysis, outputDir);
    await this.generateArchitectureGuide(analysis, outputDir);
    await this.generateCoreModules(analysis, outputDir);
    await this.generateCodeNavigation(analysis, outputDir);
    await this.generateGlossary(analysis, outputDir);
    await this.generateInventory(analysis, outputDir);
  }

  /**
   * 生成快速上手指南
   */
  async generateQuickStart(analysis, outputDir) {
    const content = this.renderQuickStart(analysis);
    await fs.writeFile(path.join(outputDir, '00-quick-start.md'), content);
  }

  /**
   * 生成项目概览
   */
  async generateOverview(analysis, outputDir) {
    const content = this.renderOverview(analysis);
    await fs.writeFile(path.join(outputDir, '01-project-overview.md'), content);
  }

  /**
   * 生成架构导览
   */
  async generateArchitectureGuide(analysis, outputDir) {
    const mermaidGraph = this.mermaidGen.generateModuleDependencyGraph(analysis.modules || []);
    await fs.writeFile(
      path.join(outputDir, 'diagrams', 'module-dependency.mmd'),
      mermaidGraph
    );

    const content = this.renderArchitectureGuide({ ...analysis, mermaidGraph });
    await fs.writeFile(path.join(outputDir, '02-architecture-guide.md'), content);
  }

  /**
   * 生成核心模块解读（含面试题）
   */
  async generateCoreModules(analysis, outputDir) {
    const content = await this.renderCoreModulesWithAnalysis(analysis);
    await fs.writeFile(path.join(outputDir, '03-core-modules.md'), content);
  }

  /**
   * 生成代码导航地图
   */
  async generateCodeNavigation(analysis, outputDir) {
    const content = await this.renderCodeNavigationWithAnalysis(analysis);
    await fs.writeFile(path.join(outputDir, '04-code-navigation.md'), content);
  }

  /**
   * 生成术语表
   */
  async generateGlossary(analysis, outputDir) {
    const content = this.renderGlossary(analysis);
    await fs.writeFile(path.join(outputDir, '05-glossary.md'), content);
  }

  /**
   * 生成清单文件
   */
  async generateInventory(analysis, outputDir) {
    await fs.writeFile(
      path.join(outputDir, 'inventory', 'tech-stack.json'),
      JSON.stringify(analysis.techStack, null, 2)
    );
    await fs.writeFile(
      path.join(outputDir, 'inventory', 'file-structure.json'),
      JSON.stringify(analysis.fileStructure, null, 2)
    );
  }

  // 渲染方法（简化版，实际应从模板文件读取）
  renderQuickStart(analysis) {
    return `# ${analysis.projectName} - 快速上手指南

_5 分钟快速启动项目_

---

## 📋 环境要求

- 根据项目技术栈准备相应环境

---

## 🚀 快速启动

### 1. 安装依赖

\`\`\`bash
${this.getInstallCommand(analysis.techStack)}
\`\`\`

### 2. 配置环境变量

\`\`\`bash
cp .env.example .env
# 编辑 .env 文件，填入配置
\`\`\`

### 3. 启动项目

\`\`\`bash
${this.getStartCommand(analysis.techStack)}
\`\`\`

---

## 🧪 运行测试

\`\`\`bash
npm test
\`\`\`

---

_由 Project X-Ray 生成 🦴_
`;
  }

  renderOverview(analysis) {
    return `# ${analysis.projectName} - 项目概览

---

## 📦 技术栈

- **语言：** ${analysis.techStack.language}
- **框架：** ${analysis.techStack.framework}

---

## 📊 代码规模

- **总文件数：** ${analysis.stats?.totalFiles || 0}
- **总代码行数：** ${analysis.stats?.totalLines || 0}
- **测试文件数：** ${analysis.stats?.testFiles || 0}

---

## 🏗️ 架构风格

- **风格：** ${analysis.architecture?.style || 'Unknown'}
- **置信度：** ${analysis.architecture?.confidence || 0}%

---

_由 Project X-Ray 生成 🦴_
`;
  }

  renderArchitectureGuide(analysis) {
    return `# ${analysis.projectName} - 架构导览

---

## 📐 架构图

\`\`\`mermaid
${analysis.mermaidGraph || 'graph TD\n    A[App] --> B[Modules]'}
\`\`\`

---

## 📋 模块说明

${(analysis.modules || []).map(m => `- **${m.name}**: ${m.files} 个文件`).join('\n')}

---

_由 Project X-Ray 生成 🦴_
`;
  }

  /**
   * 生成核心模块解读（使用 LLM 分析结果）
   */
  async renderCoreModulesWithAnalysis(analysis) {
    let content = `# ${analysis.projectName} - 核心模块解读\n\n---\n\n`;
    
    // 使用 LLM 分析结果
    if (analysis.modules && analysis.modules.length > 0) {
      for (const module of analysis.modules) {
        content += `## 📦 ${module.file || '未知模块'}\n\n`;
        content += `**功能：** ${module.purpose || '待分析'}\n\n`;
        
        if (module.functions && module.functions.length > 0) {
          content += `**核心函数：**\n`;
          for (const func of module.functions) {
            content += `- \`${func.name}\` - ${func.purpose || '功能说明'}\n`;
          }
          content += `\n`;
        }
        
        if (module.flows && module.flows.length > 0) {
          content += `**业务流程：**\n`;
          for (const step of module.flows) {
            content += `- ${step}\n`;
          }
          content += `\n`;
        }
        
        // 生成面试题
        content += await this.renderQuestionsFromLLM(module);
      }
    } else {
      content += `*LLM 深度分析未完成，显示基础信息*\n\n`;
      
      // 降级到基础分析
      for (const module of analysis.modules || []) {
        content += `## 📦 ${module.name}\n\n`;
        content += `**路径：** ${module.path}\n\n`;
        content += `**文件数：** ${module.files}\n\n`;
      }
    }
    
    return content;
  }

  /**
   * 从 LLM 分析结果生成面试题
   */
  async renderQuestionsFromLLM(module) {
    const questions = this.questionsGen.generateForModule({
      name: module.file || '模块',
      fileList: module.file ? [module.file] : []
    });
    
    let content = `## 🎯 ${module.file || '模块'} 面试题（20 题）\n\n`;
    
    const categories = {
      business: '一、业务流程（5 题）',
      technical: '二、技术实现（8 题）',
      edgeCase: '三、边界场景（4 题）',
      optimization: '四、优化思考（3 题）'
    };

    for (const [key, title] of Object.entries(categories)) {
      content += `### ${title}\n\n`;
      for (const q of questions.categories[key]) {
        content += `#### 题 ${q.id}：${q.question}\n\n`;
        content += `**思考提示：**\n`;
        for (const hint of q.hints) {
          content += `- ${hint}\n`;
        }
        content += `\n**参考答案：**\n${q.answer}\n\n---\n\n`;
      }
    }

    return content;
  }

  /**
   * 生成面试题（带代码分析）
   */
  async renderQuestionsWithAnalysis(module) {
    const questions = this.questionsGen.generateForModule(module);
    let content = `## 🎯 ${module.name} 面试题（20 题）\n\n`;
    
    const categories = {
      business: '一、业务流程（5 题）',
      technical: '二、技术实现（8 题）',
      edgeCase: '三、边界场景（4 题）',
      optimization: '四、优化思考（3 题）'
    };

    for (const [key, title] of Object.entries(categories)) {
      content += `### ${title}\n\n`;
      for (const q of questions.categories[key]) {
        content += `#### 题 ${q.id}：${q.question}\n\n`;
        content += `**思考提示：**\n`;
        for (const hint of q.hints) {
          content += `- ${hint}\n`;
        }
        
        // 生成基于代码的答案
        const answer = await this.codeAnalyzer.generateQuestionAnswer(module, q.question);
        content += `\n**参考答案：**\n${answer}\n\n---\n\n`;
      }
    }

    return content;
  }

  renderCodeNavigation(analysis) {
    return `# ${analysis.projectName} - 代码导航地图

---

## 🗺️ 功能 - 文件映射

| 功能 | 文件路径 |
|------|---------|
| [待补充] | [待分析] |

---

_由 Project X-Ray 生成 🦴_
`;
  }

  /**
   * 生成代码导航地图（带代码分析）
   */
  async renderCodeNavigationWithAnalysis(analysis) {
    let content = `# ${analysis.projectName} - 代码导航地图\n\n---\n\n`;
    content += `## 🗺️ 功能 - 文件映射表\n\n`;
    content += `| 功能 | 文件路径 | 说明 |\n`;
    content += `|------|---------|------|\n`;
    
    // 分析每个模块的功能
    for (const module of (analysis.modules || [])) {
      const features = await this.codeAnalyzer.generateFeatureMapping([module]);
      for (const feature of features) {
        content += `| ${feature.feature} | \`${feature.file}\` | ${feature.functions} 函数，${feature.apis} API |\n`;
      }
    }
    
    content += `\n---\n\n`;
    content += `## 📍 关键文件位置\n\n`;
    content += `### 配置文件\n\n`;
    content += `- \`package.json\` - 项目配置\n`;
    content += `- \`.env.example\` - 环境变量示例\n\n`;
    content += `### 入口文件\n\n`;
    if (analysis.entryPoints && analysis.entryPoints.length > 0) {
      for (const ep of analysis.entryPoints) {
        content += `- \`${ep.file}\` - ${ep.description}\n`;
      }
    }
    
    return content;
  }

  renderGlossary(analysis) {
    return `# ${analysis.projectName} - 术语表

---

## 📖 术语解释

| 术语 | 解释 |
|------|------|
| [待补充] | [待分析] |

---

_由 Project X-Ray 生成 🦴_
`;
  }

  getInstallCommand(techStack) {
    if (techStack?.language?.includes('Node')) return 'npm install';
    if (techStack?.language === 'Python') return 'pip install -r requirements.txt';
    if (techStack?.language === 'Java') return 'mvn install';
    if (techStack?.language === 'Go') return 'go mod download';
    return '安装依赖';
  }

  getStartCommand(techStack) {
    if (techStack?.language?.includes('Node')) return 'npm run dev';
    if (techStack?.language === 'Python') return 'python manage.py runserver';
    if (techStack?.language === 'Java') return 'mvn spring-boot:run';
    if (techStack?.language === 'Go') return 'go run main.go';
    return '启动项目';
  }
}

module.exports = DocumentGenerator;
