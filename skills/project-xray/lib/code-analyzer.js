/**
 * 代码分析器
 * 
 * 分析 Python/Node.js 代码文件，提取：
 * - 模块职责
 * - 功能列表
 * - 关键函数/类
 * - 依赖关系
 * 
 * 整合技能能力：
 * - ripgrep: 精确代码搜索（不读全文件）
 * - codebase-recon: 证据驱动方法论
 * 
 * @author jixiang
 * @version 2.0.0 (整合 ripgrep + codebase-recon)
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class CodeAnalyzer {
  /**
   * @param {string} rootPath - 项目根目录
   */
  constructor(rootPath) {
    this.rootPath = rootPath;
    // 检查 ripgrep 是否可用
    this.hasRipgrep = this.checkRipgrep();
  }

  /**
   * 检查 ripgrep 是否可用
   * @returns {boolean}
   */
  checkRipgrep() {
    try {
      execSync('rg --version', { stdio: 'ignore', timeout: 5000 });
      return true;
    } catch {
      console.log('⚠️  ripgrep 不可用，使用 fallback 方案');
      return false;
    }
  }

  /**
   * 使用 ripgrep 搜索代码（整合 ripgrep 技能）
   * @param {string} pattern - 搜索模式
   * @param {string} fileType - 文件类型（py|js|ts）
   * @param {number} contextLines - 上下文行数
   * @returns {string|null} 搜索结果
   */
  searchWithRipgrep(pattern, fileType = 'py', contextLines = 3) {
    if (!this.hasRipgrep) {
      return null;
    }

    try {
      const cmd = `rg "${pattern}" -t ${fileType} -C ${contextLines} --max-count 50`;
      const result = execSync(cmd, {
        cwd: this.rootPath,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 10000
      });
      return result;
    } catch (error) {
      // 没有找到匹配项，不是错误
      return null;
    }
  }

  /**
   * 分析模块职责
   * @param {Object} module - 模块信息
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeModuleResponsibility(module) {
    const result = {
      name: module.name,
      responsibility: '',
      functions: [],
      classes: [],
      apis: [],
      dependencies: []
    };

    if (!module.fileList || module.fileList.length === 0) {
      result.responsibility = '待分析';
      return result;
    }

    // 分析每个文件
    for (const file of module.fileList) {
      const filePath = path.join(this.rootPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Python 文件分析
      if (file.endsWith('.py')) {
        const pyAnalysis = this.analyzePythonFile(content, file);
        result.functions.push(...pyAnalysis.functions);
        result.classes.push(...pyAnalysis.classes);
        result.apis.push(...pyAnalysis.apis);
      }
      
      // Node.js 文件分析
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const jsAnalysis = this.analyzeJavaScriptFile(content, file);
        result.functions.push(...jsAnalysis.functions);
        result.classes.push(...jsAnalysis.classes);
        result.apis.push(...jsAnalysis.apis);
      }
    }

    // 生成职责描述
    result.responsibility = this.generateResponsibility(result);

    return result;
  }

  /**
   * 分析 Python 文件
   */
  analyzePythonFile(content, filename) {
    const result = {
      functions: [],
      classes: [],
      apis: [],
      dependencies: []
    };

    // 提取函数定义
    const functionPattern = /^(?:async\s+)?def\s+(\w+)\s*\(/gm;
    let match;
    while ((match = functionPattern.exec(content)) !== null) {
      const funcName = match[1];
      if (!funcName.startsWith('_')) { // 跳过私有函数
        result.functions.push({
          name: funcName,
          file: filename,
          line: this.getLineNumber(content, match.index)
        });
      }
    }

    // 提取类定义
    const classPattern = /^class\s+(\w+)/gm;
    while ((match = classPattern.exec(content)) !== null) {
      result.classes.push({
        name: match[1],
        file: filename,
        line: this.getLineNumber(content, match.index)
      });
    }

    // 提取 API 路由（Flask/FastAPI）
    const apiPatterns = [
      /@(?:app|router)\.(?:get|post|put|delete|patch)\s*\(['"]([^'"]+)['"]/g,
      /@(?:app|router)\.(?:route)\s*\(['"]([^'"]+)['"]/g
    ];

    for (const pattern of apiPatterns) {
      while ((match = pattern.exec(content)) !== null) {
        const method = pattern.toString().includes('get') ? 'GET' :
                       pattern.toString().includes('post') ? 'POST' :
                       pattern.toString().includes('put') ? 'PUT' :
                       pattern.toString().includes('delete') ? 'DELETE' : 'OTHER';
        result.apis.push({
          method,
          path: match[1],
          file: filename
        });
      }
    }

    // 提取 import 依赖
    const importPatterns = [
      /^import\s+(\w+)/gm,
      /^from\s+(\w+)\s+import/gm
    ];

    for (const pattern of importPatterns) {
      let localMatch;
      while ((localMatch = pattern.exec(content)) !== null) {
        const dep = localMatch[1];
        if (!['os', 'sys', 're', 'json', 'time', 'logging'].includes(dep)) {
          result.dependencies.push(dep);
        }
      }
    }

    return result;
  }

  /**
   * 分析 JavaScript 文件
   */
  analyzeJavaScriptFile(content, filename) {
    const result = {
      functions: [],
      classes: [],
      apis: []
    };

    // 提取函数
    const funcPattern = /(?:async\s+)?(?:function|const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/g;
    let match;
    while ((match = funcPattern.exec(content)) !== null) {
      result.functions.push({
        name: match[1],
        file: filename
      });
    }

    // 提取类
    const classPattern = /class\s+(\w+)/g;
    while ((match = classPattern.exec(content)) !== null) {
      result.classes.push({
        name: match[1],
        file: filename
      });
    }

    // 提取 Express 路由
    const apiPattern = /app\.(get|post|put|delete)\s*\(['"]([^'"]+)['"]/g;
    while ((match = apiPattern.exec(content)) !== null) {
      result.apis.push({
        method: match[1].toUpperCase(),
        path: match[2],
        file: filename
      });
    }

    return result;
  }

  /**
   * 获取行号
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * 生成职责描述
   */
  generateResponsibility(analysis) {
    const parts = [];

    // 基于 API 推断
    if (analysis.apis.length > 0) {
      const apiPaths = analysis.apis.map(api => api.path);
      parts.push(`提供 HTTP API 接口：${apiPaths.join(', ')}`);
    }

    // 基于函数推断
    if (analysis.functions.length > 0) {
      const funcNames = analysis.functions.map(f => f.name);
      
      // 识别功能关键词
      const keywords = {
        'wifi': 'WiFi 配置和连接管理',
        'setup': '系统配置和初始化',
        'config': '配置管理',
        'server': '服务器功能',
        'qr': '二维码生成',
        'code': '二维码处理',
        'provision': '设备配置',
        'connect': '网络连接',
        'hotspot': '热点管理'
      };

      for (const [keyword, desc] of Object.entries(keywords)) {
        if (funcNames.some(f => f.toLowerCase().includes(keyword))) {
          parts.push(desc);
          break;
        }
      }

      if (parts.length === 0) {
        parts.push(`包含 ${analysis.functions.length} 个核心函数`);
      }
    }

    // 基于类推断
    if (analysis.classes.length > 0) {
      parts.push(`定义 ${analysis.classes.length} 个类`);
    }

    // 基于依赖推断
    if (analysis.dependencies.length > 0) {
      const uniqueDeps = [...new Set(analysis.dependencies)];
      if (uniqueDeps.includes('flask') || uniqueDeps.includes('fastapi')) {
        parts.push('基于 Web 框架提供 HTTP 服务');
      }
      if (uniqueDeps.includes('qrcode')) {
        parts.push('二维码生成功能');
      }
      if (uniqueDeps.includes('asyncio')) {
        parts.push('异步 IO 处理');
      }
    }

    return parts.length > 0 ? parts.join('\n- ') : '待分析';
  }

  /**
   * 生成功能映射表
   * @param {Array<Object>} modules - 模块列表
   * @returns {Promise<Array<Object>>} 功能映射
   */
  async generateFeatureMapping(modules) {
    const features = [];

    if (!modules || modules.length === 0) return features;

    for (const module of modules) {
      // 为每个文件生成功能描述
      for (const file of (module.fileList || [])) {
        const filePath = path.join(this.rootPath, file);
        
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const fileAnalysis = this.analyzePythonFile(content, file);
          
          // 推断功能
          let feature = file.replace('.py', '').replace('.js', '').replace('.ts', '');
          
          // 基于文件名推断
          if (file.includes('wifi')) feature = 'WiFi 管理';
          if (file.includes('server')) feature = '服务器';
          if (file.includes('qr')) feature = '二维码生成';
          if (file.includes('config')) feature = '配置管理';
          if (file.includes('setup')) feature = '系统配置';
          if (file.includes('provision')) feature = '设备配置';
          
          // 基于 API 推断
          if (fileAnalysis.apis && fileAnalysis.apis.length > 0) {
            feature = `API 接口 (${fileAnalysis.apis.length}个)`;
          }
          
          features.push({
            feature,
            file: file,
            functions: fileAnalysis.functions ? fileAnalysis.functions.length : 0,
            apis: fileAnalysis.apis ? fileAnalysis.apis.length : 0
          });
        } catch (error) {
          // 文件读取失败，跳过
          features.push({
            feature,
            file: file,
            functions: 0,
            apis: 0
          });
        }
      }
    }

    return features;
  }

  /**
   * 生成基于代码的面试题答案
   * @param {Object} module - 模块信息
   * @param {Object} question - 题目
   * @returns {Promise<string>} 答案
   */
  async generateQuestionAnswer(module, question) {
    // 如果没有文件列表，返回通用答案
    if (!module.fileList || module.fileList.length === 0) {
      return '需要分析具体代码实现';
    }

    // 分析第一个文件作为示例
    const firstFile = module.fileList[0];
    const filePath = path.join(this.rootPath, firstFile);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const analysis = this.analyzePythonFile(content, firstFile);
      
      // 基于问题类型生成答案
      if (question.includes('业务流程')) {
        return this.generateBusinessFlowAnswer(analysis, firstFile);
      }
      
      if (question.includes('设计模式')) {
        return this.generateDesignPatternAnswer(analysis);
      }
      
      if (question.includes('错误处理')) {
        return this.generateErrorHandlingAnswer(content);
      }
      
      if (question.includes('并发') || question.includes('线程')) {
        return this.generateConcurrencyAnswer(content, analysis);
      }
      
      // 默认答案
      return `分析 ${firstFile} 文件：\n- 包含 ${analysis.functions.length} 个函数\n- 包含 ${analysis.classes.length} 个类\n- 包含 ${analysis.apis.length} 个 API 接口`;
      
    } catch (error) {
      return '文件读取失败，无法生成具体答案';
    }
  }

  /**
   * 生成业务流程答案
   */
  generateBusinessFlowAnswer(analysis, filename) {
    let answer = `分析 ${filename}：\n`;
    
    if (analysis.apis.length > 0) {
      answer += `1. 提供 HTTP API 接口\n`;
      for (const api of analysis.apis) {
        answer += `   - ${api.method} ${api.path}\n`;
      }
    }
    
    if (analysis.functions.length > 0) {
      answer += `2. 核心函数：${analysis.functions.slice(0, 5).map(f => f.name).join(', ')}\n`;
    }
    
    return answer;
  }

  /**
   * 生成设计模式答案
   */
  generateDesignPatternAnswer(analysis) {
    if (analysis.classes.length === 0) {
      return '脚本式代码，未使用明显的设计模式';
    }
    
    return `识别到 ${analysis.classes.length} 个类，可能使用了：\n- 单例模式（如果类只有一个实例）\n- 工厂模式（如果有对象创建逻辑）\n需要进一步分析代码结构确认`;
  }

  /**
   * 生成错误处理答案
   */
  generateErrorHandlingAnswer(content) {
    const hasTry = content.includes('try:');
    const hasExcept = content.includes('except');
    const hasFinally = content.includes('finally');
    
    if (hasTry && hasExcept) {
      return '使用 try-except 进行异常处理\n- 捕获特定异常类型\n- 记录错误日志\n- 返回错误响应';
    }
    
    return '未检测到明显的错误处理代码，建议添加 try-except 块';
  }

  /**
   * 生成并发答案
   */
  generateConcurrencyAnswer(content, analysis) {
    const hasAsync = content.includes('async ');
    const hasThreading = content.includes('threading');
    const hasMultiprocessing = content.includes('multiprocessing');
    
    if (hasAsync) {
      return '使用 async/await 异步编程\n- 基于 asyncio 事件循环\n- 协程并发执行';
    }
    
    if (hasThreading) {
      return '使用 threading 模块\n- 多线程并发\n- 注意 GIL 限制';
    }
    
    return '未检测到明显的并发处理代码';
  }
}

module.exports = CodeAnalyzer;
