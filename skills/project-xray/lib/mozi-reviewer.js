/**
 * 墨子审核器 (Mozi Reviewer)
 * 
 * 独立审核 Project X-Ray 生成的文档质量
 * 核心原则：文档即契约、独立审核、自动打回
 * 
 * @author jixiang
 * @version 1.0.0
 */

class MoziReviewer {
  /**
   * 审核文档
   * @param {Object} analysis - 分析结果
   * @returns {Promise<Object>} 审核结果
   */
  async review(analysis) {
    const result = {
      timestamp: new Date().toISOString(),
      overall: 'pass',
      passCount: 0,
      warningCount: 0,
      failCount: 0,
      items: []
    };

    // 审核 1: 技术栈识别
    const techStackResult = this.reviewTechStack(analysis.techStack);
    result.items.push(techStackResult);
    this.updateOverall(result, techStackResult);

    // 审核 2: 架构分析
    const archResult = this.reviewArchitecture(analysis.architecture);
    result.items.push(archResult);
    this.updateOverall(result, archResult);

    // 审核 3: 入口点识别
    const entryResult = this.reviewEntryPoints(analysis.entryPoints);
    result.items.push(entryResult);
    this.updateOverall(result, entryResult);

    // 审核 4: 模块分析
    const moduleResult = this.reviewModules(analysis.modules);
    result.items.push(moduleResult);
    this.updateOverall(result, moduleResult);

    // 审核 5: 文档完整性
    const docResult = this.reviewDocumentCompleteness(analysis);
    result.items.push(docResult);
    this.updateOverall(result, docResult);

    return result;
  }

  /**
   * 更新总体结果
   */
  updateOverall(result, itemResult) {
    if (itemResult.status === 'fail') {
      result.overall = 'fail';
      result.failCount++;
    } else if (itemResult.status === 'warning') {
      if (result.overall !== 'fail') {
        result.overall = 'warning';
      }
      result.warningCount++;
    } else {
      result.passCount++;
    }
  }

  /**
   * 审核 1: 技术栈识别
   */
  reviewTechStack(techStack) {
    const issues = [];
    const warnings = [];
    const passes = [];

    // 检查语言识别
    if (!techStack.language || techStack.language === 'unknown') {
      issues.push({
        severity: 'fail',
        item: '技术栈识别',
        issue: '无法识别项目语言',
        suggestion: '检查项目根目录是否有 package.json/pom.xml/requirements.txt 等配置文件'
      });
    } else {
      passes.push(`成功识别编程语言：${techStack.language}`);
    }

    // 检查框架识别
    if (!techStack.framework || techStack.framework === 'unknown') {
      warnings.push({
        severity: 'warning',
        item: '框架识别',
        issue: '无法识别具体框架',
        suggestion: '建议手动指定框架或检查依赖配置文件'
      });
    } else {
      passes.push(`成功识别框架：${techStack.framework}`);
    }

    // 检查关键依赖
    if (!techStack.dependencies || techStack.dependencies.length === 0) {
      warnings.push({
        severity: 'warning',
        item: '依赖分析',
        issue: '未提取到关键依赖',
        suggestion: '建议分析 package.json 或 requirements.txt 提取核心依赖'
      });
    } else {
      passes.push(`提取到 ${techStack.dependencies.length} 类关键依赖`);
    }

    return {
      name: '技术栈识别审核',
      status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warning' : 'pass'),
      passes,
      warnings,
      issues
    };
  }

  /**
   * 审核 2: 架构分析
   */
  reviewArchitecture(architecture) {
    const issues = [];
    const warnings = [];
    const passes = [];

    // 检查架构风格识别
    if (!architecture.style || architecture.style === 'Unknown') {
      warnings.push({
        severity: 'warning',
        item: '架构风格',
        issue: '无法识别架构风格',
        suggestion: '可能是扁平项目结构，建议按功能分组分析'
      });
    } else {
      passes.push(`识别架构风格：${architecture.style}`);
    }

    // 检查置信度
    if (architecture.confidence < 60) {
      warnings.push({
        severity: 'warning',
        item: '置信度',
        issue: `架构识别置信度低 (${architecture.confidence}%)`,
        suggestion: '置信度低于 60%，建议人工确认架构风格'
      });
    } else {
      passes.push(`架构识别置信度：${architecture.confidence}%`);
    }

    return {
      name: '架构分析审核',
      status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warning' : 'pass'),
      passes,
      warnings,
      issues
    };
  }

  /**
   * 审核 3: 入口点识别
   */
  reviewEntryPoints(entryPoints) {
    const issues = [];
    const warnings = [];
    const passes = [];

    if (!entryPoints || entryPoints.length === 0) {
      issues.push({
        severity: 'fail',
        item: '入口点识别',
        issue: '未找到任何入口点',
        suggestion: '检查项目是否有 main.py、app.py、index.js 等入口文件'
      });
    } else {
      passes.push(`找到 ${entryPoints.length} 个入口点`);
      
      // 检查入口点描述
      const noDescCount = entryPoints.filter(ep => !ep.description).length;
      if (noDescCount > 0) {
        warnings.push({
          severity: 'warning',
          item: '入口点描述',
          issue: `${noDescCount} 个入口点缺少描述`,
          suggestion: '为每个入口点添加清晰的描述信息'
        });
      }
    }

    return {
      name: '入口点识别审核',
      status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warning' : 'pass'),
      passes,
      warnings,
      issues
    };
  }

  /**
   * 审核 4: 模块分析
   */
  reviewModules(modules) {
    const issues = [];
    const warnings = [];
    const passes = [];

    if (!modules || modules.length === 0) {
      issues.push({
        severity: 'fail',
        item: '模块分析',
        issue: '未分析到任何模块',
        suggestion: '检查项目结构，按目录或功能分组分析'
      });
    } else {
      passes.push(`分析到 ${modules.length} 个模块`);

      // 检查模块职责描述
      const noResponsibilityCount = modules.filter(m => !m.responsibility).length;
      if (noResponsibilityCount > 0) {
        warnings.push({
          severity: 'warning',
          item: '模块职责',
          issue: `${noResponsibilityCount} 个模块缺少职责描述`,
          suggestion: '为每个模块补充职责说明，包括核心功能和对外接口'
        });
      }

      // 检查模块文件数
      const emptyModules = modules.filter(m => m.files === 0);
      if (emptyModules.length > 0) {
        issues.push({
          severity: 'fail',
          item: '模块文件',
          issue: `${emptyModules.length} 个模块没有文件`,
          suggestion: '检查模块路径是否正确'
        });
      }
    }

    return {
      name: '模块分析审核',
      status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warning' : 'pass'),
      passes,
      warnings,
      issues
    };
  }

  /**
   * 审核 5: 文档完整性
   */
  reviewDocumentCompleteness(analysis) {
    const issues = [];
    const warnings = [];
    const passes = [];

    // 检查必要字段
    if (!analysis.projectName) {
      issues.push({
        severity: 'fail',
        item: '项目名称',
        issue: '缺少项目名称',
        suggestion: '从路径提取项目名称'
      });
    } else {
      passes.push(`项目名称：${analysis.projectName}`);
    }

    // 检查代码规模统计
    if (!analysis.stats || !analysis.stats.totalFiles) {
      issues.push({
        severity: 'fail',
        item: '代码规模',
        issue: '缺少代码规模统计',
        suggestion: '统计项目文件数和代码行数'
      });
    } else {
      passes.push(`代码规模：${analysis.stats.totalFiles} 文件，${analysis.stats.totalLines} 行代码`);
    }

    return {
      name: '文档完整性审核',
      status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warning' : 'pass'),
      passes,
      warnings,
      issues
    };
  }

  /**
   * 生成审核报告
   * @param {Object} reviewResult - 审核结果
   * @returns {string} Markdown 格式报告
   */
  generateReport(reviewResult) {
    let report = `# Project X-Ray 墨子审核报告\n\n`;
    report += `_审核时间：${reviewResult.timestamp}_\n\n`;
    report += `---\n\n`;

    // 总体结果
    const statusIcon = reviewResult.overall === 'pass' ? '✅' : 
                       reviewResult.overall === 'warning' ? '⚠️' : '❌';
    report += `## 📊 总体结果 ${statusIcon} ${reviewResult.overall.toUpperCase()}\n\n`;
    report += `- ✅ 通过项：${reviewResult.passCount}\n`;
    report += `- ⚠️ 警告项：${reviewResult.warningCount}\n`;
    report += `- ❌ 问题项：${reviewResult.failCount}\n\n`;

    // 详细审核结果
    for (const item of reviewResult.items) {
      const itemIcon = item.status === 'pass' ? '✅' : 
                       item.status === 'warning' ? '⚠️' : '❌';
      report += `## ${itemIcon} ${item.name}\n\n`;
      
      if (item.passes.length > 0) {
        report += `### ✅ 通过项\n`;
        for (const pass of item.passes) {
          report += `- ${pass}\n`;
        }
        report += `\n`;
      }

      if (item.warnings.length > 0) {
        report += `### ⚠️ 警告项\n`;
        for (const warn of item.warnings) {
          report += `- **${warn.item}**: ${warn.issue}\n`;
          report += `  - 💡 建议：${warn.suggestion}\n`;
        }
        report += `\n`;
      }

      if (item.issues.length > 0) {
        report += `### ❌ 问题项\n`;
        for (const issue of item.issues) {
          report += `- **${issue.item}**: ${issue.issue}\n`;
          report += `  - 🔧 修复：${issue.suggestion}\n`;
        }
        report += `\n`;
      }
    }

    report += `---\n\n_由墨子审核器生成 🦴_\n`;
    return report;
  }
}

module.exports = MoziReviewer;
