/**
 * 架构分析器
 * 
 * 分析项目架构：入口点、模块依赖、核心模块识别
 * 
 * @author jixiang
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class ArchitectureAnalyzer {
  /**
   * @param {string} rootPath - 项目根目录
   * @param {Object} techStack - 技术栈信息
   */
  constructor(rootPath, techStack) {
    this.rootPath = rootPath;
    this.techStack = techStack;
  }

  /**
   * 分析架构
   * @returns {Promise<Object>} 分析结果
   */
  async analyze() {
    const entryPoints = await this.findEntryPoints();
    const modules = await this.analyzeModules();
    const dependencyGraph = await this.analyzeDependencies();

    return {
      entryPoints,
      modules,
      dependencyGraph
    };
  }

  /**
   * 查找入口点
   * @returns {Promise<Array<Object>>}
   */
  async findEntryPoints() {
    const entryPoints = [];

    // Node.js 项目
    if (this.techStack.language.includes('Node')) {
      const patterns = ['src/main.ts', 'src/index.ts', 'src/app.ts', 'main.ts', 'index.ts', 'app.ts'];
      
      for (const pattern of patterns) {
        const filePath = path.join(this.rootPath, pattern);
        if (await fs.pathExists(filePath)) {
          entryPoints.push({
            file: pattern,
            type: 'application_bootstrap',
            description: '应用启动入口'
          });
        }
      }
    }

    // Python 项目
    if (this.techStack.language === 'Python') {
      const pythonPatterns = ['main.py', 'app.py', 'manage.py', 'wsgi.py', 'asgi.py'];
      
      for (const pattern of pythonPatterns) {
        const filePath = path.join(this.rootPath, pattern);
        if (await fs.pathExists(filePath)) {
          entryPoints.push({
            file: pattern,
            type: 'application_bootstrap',
            description: 'Python 应用入口'
          });
        }
      }

      // 查找所有 *-server.py 或 server*.py 文件
      const serverFiles = glob.sync('*server*.py', { cwd: this.rootPath });
      for (const file of serverFiles) {
        entryPoints.push({
          file: file,
          type: 'server_script',
          description: '服务器脚本'
        });
      }

      // 如果没有找到标准入口，列出所有 .py 文件
      if (entryPoints.length === 0) {
        const pyFiles = glob.sync('*.py', { cwd: this.rootPath });
        for (const file of pyFiles.slice(0, 5)) {
          entryPoints.push({
            file: file,
            type: 'python_script',
            description: 'Python 脚本'
          });
        }
      }
    }

    return entryPoints;
  }

  /**
   * 分析模块
   * @returns {Promise<Array<Object>>}
   */
  async analyzeModules() {
    const modules = [];

    // Node.js 项目 - 按目录分析
    if (this.techStack.language.includes('Node')) {
      const moduleDirs = ['src/modules', 'src', 'app'];
      
      for (const dir of moduleDirs) {
        const dirPath = path.join(this.rootPath, dir);
        if (await fs.pathExists(dirPath)) {
          const subdirs = await fs.readdir(dirPath);
          for (const subdir of subdirs) {
            const subdirPath = path.join(dirPath, subdir);
            const stat = await fs.stat(subdirPath);
            if (stat.isDirectory()) {
              const files = await this.countFiles(subdirPath);
              modules.push({
                name: subdir,
                path: path.join(dir, subdir),
                files,
                dependencies: [],
                core: files > 5
              });
            }
          }
          break;
        }
      }
    }

    // Python 项目 - 按文件分组分析
    if (this.techStack.language === 'Python') {
      // 按功能分组 Python 文件
      const fileGroups = {
        '服务器脚本': [],
        '工具脚本': [],
        '配置脚本': [],
        '其他脚本': []
      };

      const pyFiles = glob.sync('*.py', { cwd: this.rootPath });
      for (const file of pyFiles) {
        if (file.includes('server') || file.includes('setup')) {
          fileGroups['服务器脚本'].push(file);
        } else if (file.includes('util') || file.includes('helper')) {
          fileGroups['工具脚本'].push(file);
        } else if (file.includes('config') || file.includes('provisioning')) {
          fileGroups['配置脚本'].push(file);
        } else {
          fileGroups['其他脚本'].push(file);
        }
      }

      // 创建模块
      for (const [groupName, files] of Object.entries(fileGroups)) {
        if (files.length > 0) {
          modules.push({
            name: groupName,
            path: '.',
            files: files.length,
            fileList: files,
            dependencies: [],
            core: files.length > 2
          });
        }
      }
    }

    return modules;
  }

  /**
   * 分析依赖
   * @returns {Promise<Object>} 依赖图
   */
  async analyzeDependencies() {
    return {
      nodes: [],
      edges: []
    };
  }

  /**
   * 统计目录文件数
   * @param {string} dirPath - 目录路径
   * @returns {Promise<number>}
   */
  async countFiles(dirPath) {
    try {
      const files = glob.sync('**/*', { cwd: dirPath, nodir: true });
      return files.length;
    } catch {
      return 0;
    }
  }
}

module.exports = ArchitectureAnalyzer;
