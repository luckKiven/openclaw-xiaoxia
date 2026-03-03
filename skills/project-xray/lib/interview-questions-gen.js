/**
 * 面试题生成器
 * 
 * 为每个核心模块生成 20 道深度面试题
 * 4 个维度：业务流程（5 题）+ 技术实现（8 题）+ 边界场景（4 题）+ 优化思考（3 题）
 * 
 * @author jixiang
 * @version 1.0.0
 */

class InterviewQuestionsGenerator {
  /**
   * 为模块生成 20 道面试题
   * @param {Object} module - 模块信息
   * @returns {Object} 面试题集合
   */
  generateForModule(module) {
    return {
      moduleName: module.name,
      totalQuestions: 20,
      categories: {
        business: this.generateBusinessQuestions(module),
        technical: this.generateTechnicalQuestions(module),
        edgeCase: this.generateEdgeCaseQuestions(module),
        optimization: this.generateOptimizationQuestions(module)
      }
    };
  }

  /**
   * 生成业务流程题（5 题）
   * @param {Object} module - 模块信息
   * @returns {Array<Object>}
   */
  generateBusinessQuestions(module) {
    return [
      {
        id: 1,
        category: 'business',
        question: `${module.name} 的核心业务流程是什么？`,
        hints: [
          '从入口点开始追踪',
          '识别关键步骤',
          '理解数据流转'
        ],
        answer: `需要分析具体代码实现。关注：\n1. 入口函数/方法\n2. 主要处理步骤\n3. 数据输入输出\n4. 与其他模块的交互`,
        difficulty: 'medium'
      },
      {
        id: 2,
        category: 'business',
        question: `用户执行关键操作后，${module.name} 内部发生了什么？`,
        hints: [
          '追踪请求处理链路',
          '识别状态变化',
          '理解副作用'
        ],
        answer: `分析请求处理流程：\n1. 接收请求\n2. 参数校验\n3. 业务逻辑处理\n4. 数据持久化\n5. 返回响应`,
        difficulty: 'medium'
      },
      {
        id: 3,
        category: 'business',
        question: `${module.name} 如何保证数据一致性？`,
        hints: [
          '事务管理',
          '锁机制',
          '补偿机制'
        ],
        answer: `数据一致性保障：\n1. 数据库事务\n2. 分布式锁（如 Redis）\n3. 最终一致性方案\n4. 补偿事务`,
        difficulty: 'hard'
      },
      {
        id: 4,
        category: 'business',
        question: `${module.name} 和哪些相关模块协作？`,
        hints: [
          '依赖的模块',
          '被依赖的模块',
          '数据流向'
        ],
        answer: `模块协作关系：\n1. 直接依赖的模块\n2. 提供服务的模块\n3. 数据流转路径`,
        difficulty: 'medium'
      },
      {
        id: 5,
        category: 'business',
        question: `如果关键步骤失败，${module.name} 如何处理？`,
        hints: [
          '错误处理机制',
          '回滚策略',
          '告警通知'
        ],
        answer: `失败处理机制：\n1. 捕获异常\n2. 回滚操作\n3. 记录日志\n4. 发送告警\n5. 返回错误响应`,
        difficulty: 'medium'
      }
    ];
  }

  /**
   * 生成技术实现题（8 题）
   * @param {Object} module - 模块信息
   * @returns {Array<Object>}
   */
  generateTechnicalQuestions(module) {
    return [
      {
        id: 6,
        category: 'technical',
        question: `${module.name} 用了什么设计模式？为什么？`,
        hints: [
          '观察代码结构',
          '识别常见模式',
          '理解选择理由'
        ],
        answer: `设计模式分析：\n1. 识别使用的模式（如策略、工厂、单例等）\n2. 分析为什么选择这个模式\n3. 相比其他方案的优劣`,
        difficulty: 'medium'
      },
      {
        id: 7,
        category: 'technical',
        question: `${module.name} 的核心算法/逻辑是什么？时间复杂度是多少？`,
        hints: [
          '找到核心函数',
          '分析算法逻辑',
          '计算复杂度'
        ],
        answer: `核心算法分析：\n1. 定位核心函数\n2. 理解算法逻辑\n3. 分析时间/空间复杂度`,
        difficulty: 'hard'
      },
      {
        id: 8,
        category: 'technical',
        question: `${module.name} 如何保证线程安全/并发安全？`,
        hints: [
          '锁机制',
          '原子操作',
          '不可变数据'
        ],
        answer: `并发安全保障：\n1. 同步锁/互斥锁\n2. 原子操作\n3. 线程安全集合\n4. 不可变数据结构`,
        difficulty: 'hard'
      },
      {
        id: 9,
        category: 'technical',
        question: `${module.name} 的缓存策略是什么？缓存失效如何处理？`,
        hints: [
          '缓存位置',
          '失效策略',
          '更新机制'
        ],
        answer: `缓存策略：\n1. 缓存类型（内存/Redis）\n2. 失效策略（TTL/LRU）\n3. 缓存更新机制\n4. 缓存穿透/雪崩处理`,
        difficulty: 'medium'
      },
      {
        id: 10,
        category: 'technical',
        question: `${module.name} 依赖哪些外部服务？如何保证可靠性？`,
        hints: [
          '外部依赖列表',
          '容错机制',
          '降级方案'
        ],
        answer: `外部依赖管理：\n1. 识别外部服务\n2. 超时重试机制\n3. 熔断降级\n4. 健康检查`,
        difficulty: 'medium'
      },
      {
        id: 11,
        category: 'technical',
        question: `${module.name} 的错误处理机制是什么？`,
        hints: [
          '异常捕获',
          '错误分类',
          '处理策略'
        ],
        answer: `错误处理机制：\n1. 异常捕获位置\n2. 错误分类处理\n3. 错误日志记录\n4. 错误响应格式`,
        difficulty: 'medium'
      },
      {
        id: 12,
        category: 'technical',
        question: `${module.name} 的日志记录策略是什么？`,
        hints: [
          '日志级别',
          '日志内容',
          '日志输出'
        ],
        answer: `日志策略：\n1. 日志级别（INFO/WARN/ERROR）\n2. 关键日志点\n3. 日志格式\n4. 日志输出目标`,
        difficulty: 'easy'
      },
      {
        id: 13,
        category: 'technical',
        question: `${module.name} 的配置如何管理？`,
        hints: [
          '配置来源',
          '配置加载',
          '配置更新'
        ],
        answer: `配置管理：\n1. 配置文件位置\n2. 环境变量\n3. 配置加载机制\n4. 动态配置支持`,
        difficulty: 'easy'
      }
    ];
  }

  /**
   * 生成边界场景题（4 题）
   * @param {Object} module - 模块信息
   * @returns {Array<Object>}
   */
  generateEdgeCaseQuestions(module) {
    return [
      {
        id: 14,
        category: 'edgeCase',
        question: `如果数据库连接失败，${module.name} 会怎么处理？`,
        hints: [
          '重试机制',
          '降级方案',
          '错误响应'
        ],
        answer: `数据库故障处理：\n1. 捕获数据库异常\n2. 重试机制（指数退避）\n3. 降级方案（返回缓存/默认值）\n4. 返回 503 错误\n5. 记录日志并告警`,
        difficulty: 'hard'
      },
      {
        id: 15,
        category: 'edgeCase',
        question: `如果网络超时，${module.name} 会怎么处理？`,
        hints: [
          '超时设置',
          '重试策略',
          '熔断机制'
        ],
        answer: `网络超时处理：\n1. 超时时间设置\n2. 重试策略\n3. 熔断机制\n4. 错误响应`,
        difficulty: 'hard'
      },
      {
        id: 16,
        category: 'edgeCase',
        question: `如果传入非法参数，${module.name} 会怎么处理？`,
        hints: [
          '参数校验',
          '错误提示',
          '安全处理'
        ],
        answer: `非法参数处理：\n1. 参数校验逻辑\n2. 返回 400 错误\n3. 错误提示信息\n4. 安全处理（防止注入）`,
        difficulty: 'medium'
      },
      {
        id: 17,
        category: 'edgeCase',
        question: `如果并发量突增，${module.name} 的瓶颈在哪里？`,
        hints: [
          '性能瓶颈',
          '资源限制',
          '扩展方案'
        ],
        answer: `并发瓶颈分析：\n1. 识别瓶颈点（CPU/内存/IO）\n2. 资源限制分析\n3. 扩展方案`,
        difficulty: 'hard'
      }
    ];
  }

  /**
   * 生成优化思考题（3 题）
   * @param {Object} module - 模块信息
   * @returns {Array<Object>}
   */
  generateOptimizationQuestions(module) {
    return [
      {
        id: 18,
        category: 'optimization',
        question: `如果 QPS 提升 10 倍，${module.name} 的瓶颈会在哪里？如何优化？`,
        hints: [
          '性能瓶颈',
          '优化方案',
          '架构调整'
        ],
        answer: `性能优化方案：\n1. 瓶颈分析（数据库/缓存/网络）\n2. 优化方案（索引/缓存/异步）\n3. 架构调整（分库分表/读写分离）`,
        difficulty: 'hard'
      },
      {
        id: 19,
        category: 'optimization',
        question: `如果数据量增长 100 倍，${module.name} 如何扩展？`,
        hints: [
          '存储扩展',
          '查询优化',
          '架构演进'
        ],
        answer: `数据扩展方案：\n1. 存储扩展（分库分表）\n2. 查询优化（索引/分区）\n3. 架构演进（微服务化）`,
        difficulty: 'hard'
      },
      {
        id: 20,
        category: 'optimization',
        question: `${module.name} 有哪些可以优化的地方？`,
        hints: [
          '代码质量',
          '性能优化',
          '可维护性'
        ],
        answer: `优化建议：\n1. 代码重构点\n2. 性能优化点\n3. 可维护性提升\n4. 技术债务清理`,
        difficulty: 'medium'
      }
    ];
  }

  /**
   * 生成 Markdown 格式
   * @param {Object} questions - 面试题集合
   * @returns {string} Markdown 文本
   */
  toMarkdown(questions) {
    let md = `## 🎯 ${questions.moduleName} 面试题（20 题）\n\n`;
    
    const categories = {
      business: '一、业务流程（5 题）',
      technical: '二、技术实现（8 题）',
      edgeCase: '三、边界场景（4 题）',
      optimization: '四、优化思考（3 题）'
    };

    for (const [key, title] of Object.entries(categories)) {
      md += `### ${title}\n\n`;
      for (const q of questions.categories[key]) {
        md += `#### 题 ${q.id}：${q.question}\n\n`;
        md += `**思考提示：**\n`;
        for (const hint of q.hints) {
          md += `- ${hint}\n`;
        }
        md += `\n**参考答案：**\n${q.answer}\n\n---\n\n`;
      }
    }

    return md;
  }
}

module.exports = InterviewQuestionsGenerator;
