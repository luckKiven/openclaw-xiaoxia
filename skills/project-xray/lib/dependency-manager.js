/**
 * 依赖管理器
 * 
 * 自动检查、安装、验证依赖技能
 * 提供透明的安装报告
 * 
 * @author jixiang
 * @version 1.0.0
 */

const { execSync } = require('child_process');

// 简单的彩色输出函数
const colors = {
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  gray: (str) => `\x1b[90m${str}\x1b[0m`,
  bold: (str) => `\x1b[1m${str}\x1b[0m`
};

class DependencyManager {
  /**
   * 依赖技能清单
   */
  constructor() {
    this.dependencies = [
      // 核心能力借鉴（2 个）
      {
        name: 'codebase-recon',
        package: 'outfitter-dev/agents@codebase-recon',
        required: true,
        description: '置信度追踪 + 证据驱动方法论',
        tokenSaving: 'N/A',
        usage: '集成到 scanner.js 和 analyzer.js，使用证据驱动方法'
      },
      {
        name: 'code-necromancer',
        package: 'erichowens/some_claude_skills@code-necromancer',
        required: false,
        description: '三阶段工作流（考古→复活→rejuvenation）',
        tokenSaving: 'N/A',
        usage: '集成到 bin/xray.js 工作流，使用三阶段流程'
      },
      // Token 优化（4 个）
      {
        name: 'ripgrep',
        package: 'ratacat/claude-skills@ripgrep',
        required: true,
        description: '精确代码搜索（不读全文件）',
        tokenSaving: '90%+',
        usage: '集成到 code-analyzer.js，使用 rg 命令搜索代码'
      },
      {
        name: 'codebase-search',
        package: 'supercent-io/skills-template@codebase-search',
        required: true,
        description: '混合搜索策略（语义+grep）',
        tokenSaving: '80%+',
        usage: '集成到 scanner.js，使用混合搜索策略'
      },
      {
        name: 'multi-agent-patterns',
        package: 'sickn33/antigravity-awesome-skills@multi-agent-patterns',
        required: true,
        description: '子代理上下文隔离',
        tokenSaving: '70%+',
        usage: '集成到工作流设计，每个模块独立分析上下文'
      },
      {
        name: 'session-compression',
        package: 'bobmatnyc/claude-mpm-skills@session-compression',
        required: true,
        description: '长会话压缩',
        tokenSaving: '70-90%',
        usage: '由 OpenClaw 自动管理，压缩长对话上下文'
      }
    ];
  }

  /**
   * 检查并安装所有依赖
   * @returns {Promise<Object>} 安装报告
   */
  async ensureDependencies() {
    console.log('\n' + colors.cyan('📦 检查依赖技能...\n'));
    
    const report = {
      timestamp: new Date().toISOString(),
      total: this.dependencies.length,
      installed: 0,
      skipped: 0,
      failed: 0,
      details: []
    };

    for (const dep of this.dependencies) {
      const result = await this.checkAndInstall(dep);
      report.details.push(result);
      
      if (result.status === 'installed') {
        report.installed++;
      } else if (result.status === 'skipped') {
        report.skipped++;
      } else if (result.status === 'failed') {
        report.failed++;
      }
    }

    // 打印汇总报告
    this.printInstallReport(report);
    
    return report;
  }

  /**
   * 检查并安装单个依赖
   * @param {Object} dep - 依赖配置
   * @returns {Promise<Object>} 安装结果
   */
  async checkAndInstall(dep) {
    console.log(colors.cyan(`📦 检查 ${dep.name}...`));
    
    try {
      // 检查是否已安装
      const isInstalled = await this.checkIfInstalled(dep.package);
      
      if (isInstalled) {
        console.log(colors.green(`✅ ${dep.name} - 已安装`));
        return {
          name: dep.name,
          package: dep.package,
          status: 'skipped',
          message: '已安装',
          tokenSaving: dep.tokenSaving
        };
      }

      // 安装技能
      console.log(colors.cyan(`   安装 ${dep.name}...`));
      await this.installSkill(dep.package);
      
      console.log(colors.green(`✅ ${dep.name} - 安装成功`));
      
      return {
        name: dep.name,
        package: dep.package,
        status: 'installed',
        message: '新安装',
        tokenSaving: dep.tokenSaving
      };
      
    } catch (error) {
      if (dep.required) {
        console.log(colors.red(`❌ ${dep.name} - 安装失败（必须依赖）`));
        throw new Error(`必须依赖 ${dep.name} 安装失败：${error.message}`);
      } else {
        console.log(colors.yellow(`⚠️  ${dep.name} - 安装失败（可选依赖）`));
        return {
          name: dep.name,
          package: dep.package,
          status: 'failed',
          message: error.message,
          tokenSaving: dep.tokenSaving,
          optional: true
        };
      }
    }
  }

  /**
   * 检查技能是否已安装
   * @param {string} packageName - 技能包名
   * @returns {Promise<boolean>} 是否已安装
   */
  async checkIfInstalled(packageName) {
    try {
      // 使用 npx skills list 检查已安装技能
      const output = execSync('npx skills list', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      
      // 提取技能名（去掉@版本）
      const skillName = packageName.split('@')[0];
      return output.includes(skillName);
    } catch {
      return false;
    }
  }

  /**
   * 安装技能
   * @param {string} packageName - 技能包名
   * @returns {Promise<void>}
   */
  async installSkill(packageName) {
    return new Promise((resolve, reject) => {
      const cmd = `npx skills add ${packageName} -g -y`;
      
      try {
        execSync(cmd, {
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 120000 // 120 秒超时
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 打印安装报告
   * @param {Object} report - 安装报告
   */
  printInstallReport(report) {
    const divider = '='.repeat(60);
    
    console.log('\n' + divider);
    console.log(colors.bold(colors.cyan('📊 Project X-Ray 依赖安装报告')));
    console.log(divider);
    console.log(colors.gray(`时间：${report.timestamp}`));
    console.log(colors.gray(`总计：${report.total} 个依赖`));
    
    if (report.installed > 0) {
      console.log(colors.green(`✅ 已安装：${report.installed} 个`));
    }
    if (report.skipped > 0) {
      console.log(colors.blue(`⏭️  已存在：${report.skipped} 个`));
    }
    if (report.failed > 0) {
      console.log(colors.red(`❌ 失败：${report.failed} 个`));
    }
    console.log(divider);
    
    console.log('\n' + colors.bold('📋 详细信息：\n'));
    for (const detail of report.details) {
      const icon = detail.status === 'installed' ? colors.green('🆕') : 
                   detail.status === 'skipped' ? colors.blue('✅') : 
                   colors.red('❌');
      
      console.log(`${icon} ${colors.bold(detail.name)}`);
      console.log(colors.gray(`   用途：${detail.description}`));
      console.log(colors.gray(`   Token 节省：${detail.tokenSaving}`));
      console.log(colors.gray(`   状态：${detail.message}`));
      console.log('');
    }
    
    console.log(divider);
    
    if (report.failed === 0) {
      console.log(colors.bold(colors.green('🎉 依赖安装完成！Project X-Ray 已就绪！\n')));
    } else {
      console.log(colors.bold(colors.yellow('⚠️  部分依赖安装失败，请检查网络或手动安装\n')));
    }
  }
}

module.exports = DependencyManager;
