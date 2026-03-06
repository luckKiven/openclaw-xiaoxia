# AI-Learning-Path - 大模型系统学习助手

**帮助程序员摆脱 AI 依赖，系统学习大模型底层知识**

---

## 🎯 适用人群

- ✅ 会用大模型，但想了解原理的程序员
- ✅ 感觉"AI 依赖症"，想重拾底层知识的开发者
- ✅ 想学习 PyTorch/Transformer/大模型调优的工程师
- ✅ 想从应用层深入到架构层的技术人员

---

## 🚀 使用方式

```bash
# 获取个性化学习路线
/ai-learning-path --level intermediate --goal "understand_transformer"

# 查看推荐资源
/ai-learning-path resources --topic "pytorch"

# 生成学习计划
/ai-learning-path plan --weeks 8 --focus "deep_learning"

# 测试知识掌握
/ai-learning-path quiz --topic "attention_mechanism"
```

---

## 📚 学习路线

### Phase 1: 基础重建（2-4 周）

**目标：** 重建数学和编程基础，摆脱对 AI 的过度依赖

#### 1.1 数学基础
- [ ] **线性代数** - 矩阵运算、特征值、SVD
  - 资源：3Blue1Brown 线性代数本质
  - 实践：NumPy 实现矩阵运算
  
- [ ] **微积分** - 导数、梯度、链式法则
  - 资源：3Blue1Brown 微积分本质
  - 实践：手动计算神经网络梯度

- [ ] **概率统计** - 分布、贝叶斯、最大似然
  - 资源：可汗学院概率统计
  - 实践：用 Python 实现常见分布

#### 1.2 编程基础
- [ ] **Python 高级** - 装饰器、生成器、上下文管理器
  - 资源：Fluent Python
  - 实践：重写常用工具库

- [ ] **数据结构** - 树、图、哈希表
  - 资源：LeetCode 专项练习
  - 实践：实现自己的数据结构库

---

### Phase 2: 深度学习基础（4-6 周）

**目标：** 理解神经网络原理，能手写基础模型

#### 2.1 神经网络基础
- [ ] **感知机与多层感知机**
  - 理论：前向传播、反向传播
  - 实践：**从零实现 MLP（不用框架）**

- [ ] **激活函数**
  - 理论：Sigmoid、ReLU、GELU
  - 实践：对比不同激活函数效果

- [ ] **优化器**
  - 理论：SGD、Adam、AdamW
  - 实践：**手写 Adam 优化器**

#### 2.2 PyTorch 核心
- [ ] **Tensor 操作**
  - 资源：Official PyTorch Tutorial
  - 实践：实现常见 Tensor 操作

- [ ] **自动微分**
  - 理论：计算图、autograd
  - 实践：**用 autograd 实现简单网络**

- [ ] **nn.Module**
  - 理论：模块设计、参数管理
  - 实践：**实现自己的 Layer 类**

#### 2.3 经典网络架构
- [ ] **CNN** - 卷积、池化、经典架构
  - 实践：从零实现 ResNet

- [ ] **RNN/LSTM** - 序列建模
  - 实践：实现字符级语言模型

- [ ] **Attention** - 注意力机制
  - 论文：Attention Is All You Need
  - 实践：**从零实现 Self-Attention**

---

### Phase 3: Transformer 与大模型（6-8 周）

**目标：** 深入理解 Transformer，能微调和优化大模型

#### 3.1 Transformer 详解
- [ ] **架构拆解**
  - Multi-Head Attention
  - Positional Encoding
  - LayerNorm
  - FFN
  - 实践：**从零实现完整 Transformer**

- [ ] **训练技巧**
  - Learning Rate Schedule
  - Gradient Accumulation
  - Mixed Precision
  - 实践：训练小型 Transformer

#### 3.2 大模型架构
- [ ] **GPT 系列** -  Decoder-only 架构
  - 论文：GPT-1/2/3 论文
  - 实践：实现 GPT-style 模型

- [ ] **BERT 系列** - Encoder-only 架构
  - 论文：BERT 论文
  - 实践：实现 Masked LM

- [ ] **T5 系列** - Encoder-Decoder 架构
  - 论文：T5 论文
  - 实践：实现 Seq2Seq 模型

#### 3.3 大模型调优
- [ ] **Fine-tuning**
  - 全量微调
  - 实践：微调 BERT 做分类

- [ ] **Parameter-Efficient Tuning**
  - LoRA、Adapter、Prefix Tuning
  - 论文：LoRA 论文
  - 实践：**用 LoRA 微调 LLaMA**

- [ ] **量化与压缩**
  - INT8/INT4量化
  - 知识蒸馏
  - 实践：量化自己的模型

---

### Phase 4: 实战与深入（持续）

**目标：** 能独立设计和优化大模型应用

#### 4.1 实战项目
- [ ] **从零训练一个语言模型**
  - 数据收集与清洗
  - Tokenizer 训练
  - 模型训练与评估

- [ ] **大模型应用开发**
  - RAG 系统
  - Agent 系统
  - 实践：构建自己的 AI 助手

#### 4.2 前沿跟踪
- [ ] **论文阅读**
  - 每周 1-2 篇顶会论文
  - 推荐：ACL、EMNLP、NeurIPS、ICLR

- [ ] **开源贡献**
  - 参与 HuggingFace、vLLM 等项目
  - 提交 PR、修复 Bug

---

## 📖 推荐资源

### 课程
| 课程 | 平台 | 难度 |
|------|------|------|
| Deep Learning Specialization | Coursera | ⭐⭐ |
| Full Stack Deep Learning | 官网 | ⭐⭐⭐ |
| Stanford CS224N | YouTube | ⭐⭐⭐⭐ |
| MIT 6.S191 | YouTube | ⭐⭐⭐ |

### 书籍
| 书籍 | 作者 | 难度 |
|------|------|------|
| 深度学习 | Ian Goodfellow | ⭐⭐⭐⭐ |
| 动手学深度学习 | 李沐 | ⭐⭐⭐ |
| Natural Language Processing with Transformers | O'Reilly | ⭐⭐⭐ |

### 实践平台
- **Kaggle** - 数据科学竞赛
- **HuggingFace** - 模型库与数据集
- **Papers With Code** - 论文与代码
- **Colab** - 免费 GPU

---

## 🎯 学习原则

### ✅ 要做的事
1. **手写代码** - 不依赖框架实现基础算法
2. **推导公式** - 手动推导反向传播
3. **阅读论文** - 读原始论文而非博客解读
4. **做项目** - 从零构建完整系统
5. **写博客** - 输出倒逼输入

### ❌ 避免的事
1. **过度依赖 AI** - 先自己思考再问 AI
2. **只看教程不动手** - 看懂≠会做
3. **追求最新忽视基础** - 基础比新技术重要
4. **收藏不看** - 精选资源深度学习

---

## 💡 AI 使用建议

**正确使用 AI 辅助学习：**

1. **解释概念** - "用通俗语言解释 Attention"
2. **代码审查** - "帮我 review 这段实现"
3. **调试帮助** - "这个错误是什么原因"
4. **资源推荐** - "推荐学习 X 的资料"

**避免：**
- ❌ "帮我写这个作业"
- ❌ "直接给我答案"
- ❌ "不用解释，只要代码"

---

## 📊 进度追踪

```python
# 学习进度追踪模板
learning_progress = {
    "phase_1_math": {
        "linear_algebra": 0.8,  # 80% 完成
        "calculus": 0.5,
        "probability": 0.3
    },
    "phase_2_dl": {
        "nn_basics": 0.0,
        "pytorch": 0.0,
        "cnn_rnn": 0.0
    },
    "phase_3_transformer": {
        "attention": 0.0,
        "transformer": 0.0,
        "llm_finetune": 0.0
    }
}
```

---

## 🤝 学习社区

- **Reddit:** r/MachineLearning
- **知乎:** 机器学习、深度学习话题
- **Discord:** HuggingFace、PyTorch 官方
- **本地:** 技术沙龙、Meetup

---

_**记住：AI 是工具，不是大脑。保持思考，保持学习。**_

**作者：** jixiang  
**版本：** 1.0  
**最后更新：** 2026-03-07
