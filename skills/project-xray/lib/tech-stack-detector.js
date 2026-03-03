/**
 * 技术栈识别器
 * 
 * 识别项目的技术栈（语言、框架、关键依赖）
 * 
 * @author jixiang
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');

class TechStackDetector {
  /**
   * @param {string} rootPath - 项目根目录
   */
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  /**
   * 检测技术栈
   * @returns {Promise<Object>} 技术栈信息
   */
  async detect() {
    const result = {
      language: 'unknown',
      framework: 'unknown',
      dependencies: [],
      configFiles: []
    };

    // 检测 Node.js 项目
    if (await this.hasFile('package.json')) {
      result.language = 'TypeScript/JavaScript';
      const pkg = await this.readPackageJson();
      result.framework = this.detectNodeFramework(pkg);
      result.dependencies = this.extractKeyDependencies(pkg);
      result.configFiles.push('package.json');
    }

    // 检测 Java 项目
    if (await this.hasFile('pom.xml')) {
      result.language = 'Java';
      result.framework = 'Spring Boot';
      result.configFiles.push('pom.xml');
    } else if (await this.hasFile('build.gradle')) {
      result.language = 'Java';
      result.framework = 'Spring Boot/Gradle';
      result.configFiles.push('build.gradle');
    }

    // 检测 Python 项目
    if (await this.hasFile('requirements.txt')) {
      result.language = 'Python';
      result.framework = this.detectPythonFramework();
      result.configFiles.push('requirements.txt');
    }

    // 检测 Go 项目
    if (await this.hasFile('go.mod')) {
      result.language = 'Go';
      result.framework = this.detectGoFramework();
      result.configFiles.push('go.mod');
    }

    return result;
  }

  /**
   * 检查文件是否存在
   * @param {string} filename - 文件名
   * @returns {Promise<boolean>}
   */
  async hasFile(filename) {
    const filePath = path.join(this.rootPath, filename);
    return await fs.pathExists(filePath);
  }

  /**
   * 读取 package.json
   * @returns {Promise<Object>}
   */
  async readPackageJson() {
    const pkgPath = path.join(this.rootPath, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * 检测 Node.js 框架
   * @param {Object} pkg - package.json 内容
   * @returns {string} 框架名称
   */
  detectNodeFramework(pkg) {
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    if (deps['@nestjs/core']) return 'NestJS';
    if (deps['express']) return 'Express';
    if (deps['koa']) return 'Koa';
    if (deps['fastify']) return 'Fastify';
    if (deps['next']) return 'Next.js';
    if (deps['nuxt']) return 'Nuxt.js';
    if (deps['react']) return 'React';
    if (deps['vue']) return 'Vue';
    if (deps['angular']) return 'Angular';

    return 'Node.js';
  }

  /**
   * 提取关键依赖
   * @param {Object} pkg - package.json 内容
   * @returns {Array<Object>} 关键依赖列表
   */
  extractKeyDependencies(pkg) {
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    const keyDeps = [];
    const patterns = {
      database: ['pg', 'mysql', 'mongodb', 'mongoose', 'typeorm', 'sequelize', 'prisma'],
      auth: ['passport', 'jsonwebtoken', 'bcrypt', 'bcryptjs'],
      testing: ['jest', 'mocha', 'chai', 'vitest'],
      build: ['webpack', 'vite', 'rollup', 'esbuild']
    };

    for (const [category, libs] of Object.entries(patterns)) {
      const found = libs.filter(lib => deps[lib]);
      if (found.length > 0) {
        keyDeps.push({ category, libs: found });
      }
    }

    return keyDeps;
  }

  /**
   * 检测 Python 框架
   * @returns {string}
   */
  detectPythonFramework() {
    return 'Django/Flask/FastAPI';
  }

  /**
   * 检测 Go 框架
   * @returns {string}
   */
  detectGoFramework() {
    return 'Gin/Echo/Fiber';
  }
}

module.exports = TechStackDetector;
