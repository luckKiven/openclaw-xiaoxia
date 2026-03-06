"""
AI Learning Path - 大模型系统学习助手

帮助程序员摆脱 AI 依赖，系统学习大模型底层知识

@author jixiang
"""

import json
import os
from typing import Dict, List

# 学习路线数据
LEARNING_PATH = {
    "phase_1": {
        "name": "基础重建",
        "duration": "2-4 周",
        "topics": [
            {
                "name": "线性代数",
                "resources": ["3Blue1Brown 线性代数本质", "MIT 18.06"],
                "practice": "NumPy 实现矩阵运算",
                "checkpoints": ["矩阵乘法", "特征值分解", "SVD"]
            },
            {
                "name": "微积分",
                "resources": ["3Blue1Brown 微积分本质", "可汗学院微积分"],
                "practice": "手动计算神经网络梯度",
                "checkpoints": ["导数", "梯度", "链式法则"]
            },
            {
                "name": "概率统计",
                "resources": ["可汗学院概率统计", "PRML 前 3 章"],
                "practice": "Python 实现常见分布",
                "checkpoints": ["贝叶斯定理", "最大似然", "常见分布"]
            }
        ]
    },
    "phase_2": {
        "name": "深度学习基础",
        "duration": "4-6 周",
        "topics": [
            {
                "name": "神经网络基础",
                "resources": ["Deep Learning Book", "CS231n"],
                "practice": "从零实现 MLP（不用框架）",
                "checkpoints": ["前向传播", "反向传播", "激活函数"]
            },
            {
                "name": "PyTorch 核心",
                "resources": ["Official Tutorial", "PyTorch 深度学习"],
                "practice": "实现 autograd 和 nn.Module",
                "checkpoints": ["Tensor", "autograd", "Module"]
            },
            {
                "name": "经典架构",
                "resources": ["CS231n", "CS224n"],
                "practice": "实现 ResNet 和 LSTM",
                "checkpoints": ["CNN", "RNN", "Attention"]
            }
        ]
    },
    "phase_3": {
        "name": "Transformer 与大模型",
        "duration": "6-8 周",
        "topics": [
            {
                "name": "Transformer 详解",
                "resources": ["Attention Is All You Need", "The Illustrated Transformer"],
                "practice": "从零实现完整 Transformer",
                "checkpoints": ["Self-Attention", "Positional Encoding", "LayerNorm"]
            },
            {
                "name": "大模型架构",
                "resources": ["GPT/BERT/T5论文"],
                "practice": "实现 GPT-style 模型",
                "checkpoints": ["Decoder-only", "Encoder-only", "Encoder-Decoder"]
            },
            {
                "name": "大模型调优",
                "resources": ["LoRA 论文", "HuggingFace Course"],
                "practice": "用 LoRA 微调 LLaMA",
                "checkpoints": ["Fine-tuning", "LoRA", "量化"]
            }
        ]
    }
}

def get_learning_path(level: str = "intermediate") -> Dict:
    """获取学习路线"""
    return LEARNING_PATH

def get_resources(topic: str) -> List[str]:
    """获取指定主题的资源"""
    resources = []
    for phase in LEARNING_PATH.values():
        for topic_item in phase["topics"]:
            if topic.lower() in topic_item["name"].lower():
                resources.extend(topic_item["resources"])
    return resources

def generate_plan(weeks: int = 8, focus: str = "all") -> Dict:
    """生成学习计划"""
    plan = {
        "duration": f"{weeks}周",
        "focus": focus,
        "weekly_plan": []
    }
    
    weeks_per_phase = weeks // 3
    for i, (phase_key, phase) in enumerate(LEARNING_PATH.items()):
        plan["weekly_plan"].append({
            "phase": phase["name"],
            "weeks": f"{i*weeks_per_phase + 1}-{(i+1)*weeks_per_phase}",
            "topics": [t["name"] for t in phase["topics"]]
        })
    
    return plan

def create_quiz(topic: str) -> Dict:
    """创建小测验"""
    quizzes = {
        "linear_algebra": [
            {"q": "矩阵乘法的条件是什么？", "a": "第一个矩阵的列数等于第二个矩阵的行数"},
            {"q": "什么是特征值？", "a": "Av = λv 中的λ"}
        ],
        "attention": [
            {"q": "Self-Attention 的 QKV 分别代表什么？", "a": "Query, Key, Value"},
            {"q": "Attention 的计算公式？", "a": "softmax(QK^T/√d)V"}
        ]
    }
    return quizzes.get(topic.lower(), [])

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("用法：python ai_learning_path.py [path|resources|plan|quiz] [args]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "path":
        path = get_learning_path()
        print(json.dumps(path, indent=2, ensure_ascii=False))
    
    elif command == "resources":
        topic = sys.argv[2] if len(sys.argv) > 2 else "all"
        resources = get_resources(topic)
        print(f"推荐资源 ({topic}):")
        for r in resources:
            print(f"  - {r}")
    
    elif command == "plan":
        weeks = int(sys.argv[2]) if len(sys.argv) > 2 else 8
        plan = generate_plan(weeks)
        print(json.dumps(plan, indent=2, ensure_ascii=False))
    
    elif command == "quiz":
        topic = sys.argv[2] if len(sys.argv) > 2 else "all"
        quiz = create_quiz(topic)
        print(f"小测验 ({topic}):")
        for i, q in enumerate(quiz, 1):
            print(f"{i}. {q['q']}")
            print(f"   答案：{q['a']}")
    
    else:
        print(f"未知命令：{command}")
        sys.exit(1)
