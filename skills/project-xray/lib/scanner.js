/**
 * 项目扫描器
 * 
 * 扫描项目目录结构，统计代码规模，识别架构风格
 * 
 * @author jixiang
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const TechStackDetector = require('./tech-stack-detector');

class ProjectScanner {
  /**
   * @param {string} rootPath - 项目根目录
   */
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'target',
      '__pycache__',
      '.idea',
      '.vscode',
      'coverage',
      '*.log'
    ];
  }

  /**
   * 扫描项目
   * @returns {Promise<Object>} 扫描结果
   */
  async scan() {
    const techStackDetector = new TechStackDetector(this.rootPath);
    const techStack = await techStackDetector.detect();

    const fileStructure = await this.scanDirectory();
    const stats = await this.countLines();
    const architecture = await this.detectArchitecture();

    return {
      projectName: path.basename(this.rootPath),
      rootPath: this.rootPath,
      techStack,
      fileStructure,
      stats,
      architecture
    };
  }

  /**
   * 扫描目录结构
   * @returns {Promise<Object>} 目录树
   */
  async scanDirectory() {
    const files = [];
    
    for (const pattern of ['**/*']) {
      const matches = glob.sync(pattern, {
        cwd: this.rootPath,
        ignore: this.ignorePatterns,
        nodir: true
      });
      files.push(...matches);
    }

    const tree = this.buildDirectoryTree(files);
    return tree;
  }

  /**
   * 构建目录树
   * @param {Array<string>} files - 文件列表
   * @returns {Object} 目录树
   */
  buildDirectoryTree(files) {
    const tree = {};
    
    for (const file of files) {
      const parts = file.split(path.sep);
      let current = tree;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      const filename = parts[parts.length - 1];
      current[filename] = null;
    }

    return tree;
  }

  /**
   * 统计代码行数
   * @returns {Promise<Object>} 统计结果
   */
  async countLines() {
    const stats = {
      totalFiles: 0,
      totalLines: 0,
      codeLines: 0,
      testFiles: 0,
      byExtension: {}
    };

    const files = glob.sync('**/*', {
      cwd: this.rootPath,
      ignore: this.ignorePatterns,
      nodir: true
    });

    for (const file of files) {
      stats.totalFiles++;
      
      const ext = path.extname(file);
      if (!stats.byExtension[ext]) {
        stats.byExtension[ext] = { files: 0, lines: 0 };
      }
      stats.byExtension[ext].files++;

      if (file.includes('.test.') || file.includes('.spec.') || file.includes('test/')) {
        stats.testFiles++;
      }

      const lines = await this.countFileLines(path.join(this.rootPath, file));
      stats.totalLines += lines;
      stats.codeLines += Math.floor(lines * 0.8);
      stats.byExtension[ext].lines += lines;
    }

    return stats;
  }

  /**
   * 统计文件行数
   * @param {string} filePath - 文件路径
   * @returns {Promise<number>}
   */
  async countFileLines(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.split('\n').length;
    } catch {
      return 0;
    }
  }

  /**
   * 识别架构风格
   * @returns {Promise<Object>} 架构信息
   */
  async detectArchitecture() {
    const patterns = {
      'Layered': ['controllers', 'services', 'models', 'repositories'],
      'MVC': ['controllers', 'views', 'models'],
      'Clean Architecture': ['entities', 'usecases', 'interfaces', 'infrastructure'],
      'Microservices': ['docker-compose.yml', 'k8s', 'services']
    };

    const dirs = await fs.readdir(this.rootPath);
    const foundPatterns = [];

    for (const [style, markers] of Object.entries(patterns)) {
      const matches = markers.filter(m => dirs.includes(m));
      if (matches.length >= 2) {
        foundPatterns.push({ style, matches, confidence: matches.length / markers.length });
      }
    }

    if (foundPatterns.length > 0) {
      foundPatterns.sort((a, b) => b.confidence - a.confidence);
      const best = foundPatterns[0];
      return {
        style: best.style,
        confidence: Math.round(best.confidence * 100),
        patterns: best.matches
      };
    }

    return {
      style: 'Unknown',
      confidence: 0,
      patterns: []
    };
  }
}

module.exports = ProjectScanner;
