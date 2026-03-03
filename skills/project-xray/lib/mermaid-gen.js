/**
 * Mermaid 图表生成器
 * 
 * 生成 Mermaid 格式的架构图、依赖图、数据流图
 * 
 * @author jixiang
 * @version 1.0.0
 */

class MermaidGenerator {
  /**
   * 生成模块依赖图
   * @param {Array<Object>} modules - 模块列表
   * @returns {string} Mermaid 代码
   */
  generateModuleDependencyGraph(modules) {
    if (!modules || modules.length === 0) {
      return 'graph TD\n    A[项目] --> B[模块]\n';
    }

    let mermaid = 'graph TD\n';
    
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const nodeId = `M${i}_${this.sanitizeId(module.name)}`;
      mermaid += `    ${nodeId}[${module.name} (${module.files}文件)]\n`;
    }

    // 添加依赖关系
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const fromId = `M${i}_${this.sanitizeId(module.name)}`;
      for (const dep of module.dependencies) {
        const depIndex = modules.findIndex(m => m.name === dep);
        if (depIndex >= 0) {
          const toId = `M${depIndex}_${this.sanitizeId(dep)}`;
          mermaid += `    ${fromId} --> ${toId}\n`;
        }
      }
    }

    return mermaid;
  }

  /**
   * 生成数据流图
   * @param {Array<Object>} flows - 数据流列表
   * @returns {string} Mermaid 代码
   */
  generateDataFlowDiagram(flows) {
    let mermaid = 'graph LR\n';
    
    for (const flow of flows) {
      const fromId = this.sanitizeId(flow.from);
      const toId = this.sanitizeId(flow.to);
      const label = flow.label ? `|${flow.label}|` : '';
      mermaid += `    ${fromId} ${label}--> ${toId}\n`;
    }

    return mermaid;
  }

  /**
   * 生成序列图
   * @param {Array<Object>} steps - 步骤列表
   * @returns {string} Mermaid 代码
   */
  generateSequenceDiagram(steps) {
    let mermaid = 'sequenceDiagram\n';
    
    const participants = [...new Set(steps.map(s => s.actor))];
    for (const actor of participants) {
      mermaid += `    participant ${this.sanitizeId(actor)}\n`;
    }

    for (const step of steps) {
      const from = this.sanitizeId(step.from);
      const to = this.sanitizeId(step.to);
      const msg = step.message;
      mermaid += `    ${from}->>${to}: ${msg}\n`;
    }

    return mermaid;
  }

  /**
   * 清理 ID（只保留字母数字）
   * @param {string} str - 原始字符串
   * @returns {string}
   */
  sanitizeId(str) {
    // 移除所有非字母数字字符，包括下划线开头
    return str.replace(/[^a-zA-Z0-9]/g, '').replace(/^_+/, '');
  }
}

module.exports = MermaidGenerator;
