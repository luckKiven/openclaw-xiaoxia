/**
 * 大模型代码分析器
 * 
 * 使用大模型深度分析代码，而不是简单的正则提取
 * 
 * 工作流程：
 * 1. 脚本收集原始代码
 * 2. 调用大模型深度分析
 * 3. 输出深度分析结果
 * 
 * @author jixiang
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class LLMCodeAnalyzer {
  /**
   * @param {string} rootPath - 项目根目录
   * @param {string} model - 使用的模型（默认 claude-code）
   */
  constructor(rootPath, model = 'claude-code') {
    this.rootPath = rootPath;
    this.model = model;
    this.cache = new Map();
  }

  /**
   * 深度分析项目
   * @returns {Promise<Object>} 深度分析结果
   */
  async analyzeProject() {
    console.log('🔍 开始深度分析项目...');
    
    // 1. 扫描所有源代码文件
    const sourceFiles = await this.scanSourceFiles();
    console.log(`📂 找到 ${sourceFiles.length} 个源代码文件`);
    
    // 2. 识别入口点
    const entryPoints = await this.findEntryPoints(sourceFiles);
    console.log(`🚀 找到 ${entryPoints.length} 个入口点`);
    
    // 3. 深度分析每个入口点
    const analysisResults = [];
    for (const entry of entryPoints) {
      console.log(`\n📝 分析入口点：${entry.file}`);
      const result = await this.analyzeEntryPoint(entry, sourceFiles);
      analysisResults.push(result);
    }
    
    // 4. 梳理业务流程
    console.log('\n🔗 梳理业务流程...');
    const flowResults = await this.traceBusinessFlows(analysisResults);
    
    return {
      entryPoints,
      modules: analysisResults,
      flows: flowResults
    };
  }

  /**
   * 扫描源代码文件
   */
  async scanSourceFiles() {
    const files = [];
    const extensions = ['.py', '.js', '.ts', '.java', '.go'];
    
    const scan = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            // 跳过常见忽略目录
            if (['node_modules', '.git', '__pycache__', 'dist', 'build', '.venv', 'venv', 'env'].includes(entry.name)) {
              continue;
            }
            scan(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push({
                path: path.relative(this.rootPath, fullPath),
                fullPath,
                ext
              });
            }
          }
        }
      } catch (e) {
        // 忽略无法读取的目录
      }
    };
    
    scan(this.rootPath);
    return files;
  }

  /**
   * 查找入口点（改进版）
   */
  async findEntryPoints(files) {
    const entryPatterns = {
      '.py': ['main.py', 'app.py', 'manage.py'],
      '.js': ['index.js', 'app.js', 'main.js'],
      '.ts': ['index.ts', 'app.ts', 'main.ts']
    };
    
    const entryPoints = [];
    
    for (const file of files) {
      const patterns = entryPatterns[file.ext] || [];
      const basename = path.basename(file.path);
      
      // 精确匹配
      if (patterns.includes(basename)) {
        entryPoints.push(file);
        continue;
      }
      
      // 通配符匹配（*_server.py 等）
      if (file.ext === '.py' && basename.includes('_server.py')) {
        entryPoints.push(file);
      }
    }
    
    console.log(`  🚀 入口点：${entryPoints.map(e => e.path).join(', ') || '无'}`);
    
    return entryPoints;
  }

  /**
   * 深度分析入口点
   */
  async analyzeEntryPoint(entry, allFiles) {
    // 1. 读取入口文件
    const content = await fs.readFile(entry.fullPath, 'utf-8');
    
    // 2. 提取关键信息
    const extractedInfo = this.extractCodeInfo(content, entry.ext);
    
    // 3. 调用大模型深度分析
    const analysis = await this.callLLM({
      prompt: this.buildAnalysisPrompt(entry, content, extractedInfo),
      model: this.model
    });
    
    // 4. 解析大模型返回的结果
    const parsedAnalysis = this.parseAnalysisResult(analysis, entry);
    
    return parsedAnalysis;
  }

  /**
   * 提取代码信息（脚本完成）
   */
  extractCodeInfo(content, ext) {
    const info = {
      functions: [],
      classes: [],
      imports: [],
      strings: []
    };
    
    if (ext === '.py') {
      // 提取函数定义
      const funcPattern = /^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)/gm;
      let match;
      while ((match = funcPattern.exec(content)) !== null) {
        info.functions.push({
          name: match[1],
          params: match[2],
          line: content.substring(0, match.index).split('\n').length
        });
      }
      
      // 提取类定义
      const classPattern = /^class\s+(\w+)/gm;
      while ((match = classPattern.exec(content)) !== null) {
        info.classes.push({
          name: match[1],
          line: content.substring(0, match.index).split('\n').length
        });
      }
      
      // 提取 import
      const importPattern = /^(?:from\s+(\S+)\s+)?import\s+(.+)/gm;
      while ((match = importPattern.exec(content)) !== null) {
        info.imports.push({
          module: match[1] || '',
          names: match[2]
        });
      }
      
      // 提取字符串（可能是 API 端点、错误信息等）
      const stringPattern = /["']([^"']{10,100})["']/g;
      while ((match = stringPattern.exec(content)) !== null) {
        if (match[1].includes('http') || match[1].includes('/') || match[1].includes('error')) {
          info.strings.push(match[1]);
        }
      }
    }
    
    return info;
  }

  /**
   * 构建分析提示词（简化版）
   */
  buildAnalysisPrompt(entry, content, extractedInfo) {
    const funcList = extractedInfo.functions.map(f => `- ${f.name}`).join('\n');
    
    return `分析文件：${entry.path}
内容：${content.substring(0, 3000)}
函数：${funcList || '无'}
输出 JSON:{"file":"${entry.path}","purpose":"文件功能","functions":[{"name":"函数名","purpose":"功能","parameters":"参数"}],"flows":["流程步骤"]}
直接输出 JSON，不要其他文字`;
  }

  /**
   * 调用大模型（简化版）
   */
  async callLLM({ prompt, model = 'claude-code' }) {
    try {
      console.log(`  🤖 调用 ${model} 分析...`);
      
      const { execSync } = require('child_process');
      
      // 简化提示词，直接让 Claude 输出分析结果
      const simplePrompt = `分析这个文件，输出简短总结：${prompt.substring(0, 2000)}`;
      
      const output = execSync(`claude "${simplePrompt.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 120000
      });
      
      // 直接返回输出文本，不强制解析 JSON
      return {
        rawOutput: output,
        purpose: output.substring(0, 500),
        functions: [],
        flows: [],
        designDecisions: []
      };
      
    } catch (error) {
      console.error(`  ❌ 调用失败：`, error.message);
      return {
        rawOutput: '',
        purpose: '分析失败',
        functions: [],
        flows: [],
        designDecisions: []
      };
    }
  }

  /**
   * 解析分析结果
   */
  parseAnalysisResult(analysis, entry) {
    return {
      file: entry.path,
      purpose: analysis.purpose || '待分析',
      functions: analysis.functions || [],
      flows: analysis.flows || [],
      designDecisions: analysis.designDecisions || [],
      rawAnalysis: analysis
    };
  }

  /**
   * 梳理业务流程
   */
  async traceBusinessFlows(analysisResults) {
    // 收集所有函数和调用关系
    const allFunctions = [];
    for (const result of analysisResults) {
      for (const func of result.functions) {
        allFunctions.push({
          file: result.file,
          ...func
        });
      }
    }
    
    // 调用大模型梳理流程
    if (allFunctions.length > 0) {
      const prompt = `基于以下函数列表，梳理完整的业务流程：

${allFunctions.map(f => `- ${f.file}: ${f.name} - ${f.purpose || ''}`).join('\n')}

请输出：
1. 主流程步骤
2. 关键决策点
3. 异常处理流程

用 Mermaid 流程图和文字说明。`;
      
      try {
        const { execSync } = require('child_process');
        const output = execSync(`claude "${prompt.replace(/"/g, '\\"')}"`, {
          encoding: 'utf-8',
          maxBuffer: 50 * 1024 * 1024,
          timeout: 300000
        });
        
        return output;
      } catch (e) {
        return '业务流程梳理失败';
      }
    }
    
    return '无足够信息梳理业务流程';
  }
}

module.exports = LLMCodeAnalyzer;
