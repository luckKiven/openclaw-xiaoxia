#!/usr/bin/env python3
"""
AI Learning Path CLI

大模型系统学习助手命令行接口

用法:
  /ai-learning-path                    # 显示学习路线
  /ai-learning-path resources pytorch  # 查看 PyTorch 资源
  /ai-learning-path plan --weeks 8     # 生成 8 周学习计划
  /ai-learning-path quiz attention     # Attention 机制小测验
"""

import sys
import os

# 修复 Windows 编码问题
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from index import get_learning_path, get_resources, generate_plan, create_quiz


def print_learning_path():
    """打印学习路线"""
    path = get_learning_path()
    
    print("\n" + "="*60)
    print("📚 大模型系统学习路线")
    print("="*60)
    
    for phase_key, phase in path.items():
        print(f"\n{phase_key.upper().replace('_', ' ')}: {phase['name']} ({phase['duration']})")
        print("-"*60)
        
        for topic in phase["topics"]:
            print(f"\n  📖 {topic['name']}")
            print(f"     资源：{', '.join(topic['resources'])}")
            print(f"     实践：{topic['practice']}")
            print(f"     检查点：{', '.join(topic['checkpoints'])}")
    
    print("\n" + "="*60)
    print("💡 提示：先自己思考再查资料，最后再问 AI")
    print("="*60 + "\n")


def print_resources(topic: str):
    """打印资源"""
    resources = get_resources(topic)
    
    print(f"\n📚 {topic} 推荐资源")
    print("="*60)
    
    if resources:
        for r in resources:
            print(f"  • {r}")
    else:
        print("  未找到相关资源，试试其他关键词")
    
    print()


def print_plan(weeks: int, focus: str):
    """打印学习计划"""
    plan = generate_plan(weeks, focus)
    
    print(f"\n📅 {weeks}周学习计划 (重点：{focus})")
    print("="*60)
    
    for week_plan in plan["weekly_plan"]:
        print(f"\n{week_plan['phase']} (第{week_plan['weeks']}周)")
        print("-"*60)
        for topic in week_plan["topics"]:
            print(f"  • {topic}")
    
    print()


def print_quiz(topic: str):
    """打印小测验"""
    quiz = create_quiz(topic)
    
    print(f"\n📝 {topic} 小测验")
    print("="*60)
    
    if quiz:
        for i, q in enumerate(quiz, 1):
            print(f"\n{i}. {q['q']}")
            input("   按回车查看答案...")
            print(f"   ✅ {q['a']}")
    else:
        print("  未找到相关测验")
    
    print()


def main():
    if len(sys.argv) < 2:
        print_learning_path()
        return
    
    command = sys.argv[1]
    
    if command == "path" or command == "路线":
        print_learning_path()
    
    elif command == "resources" or command == "资源":
        topic = sys.argv[2] if len(sys.argv) > 2 else "all"
        print_resources(topic)
    
    elif command == "plan" or command == "计划":
        weeks = 8
        focus = "all"
        
        if "--weeks" in sys.argv:
            idx = sys.argv.index("--weeks")
            if idx + 1 < len(sys.argv):
                weeks = int(sys.argv[idx + 1])
        
        if "--focus" in sys.argv:
            idx = sys.argv.index("--focus")
            if idx + 1 < len(sys.argv):
                focus = sys.argv[idx + 1]
        
        print_plan(weeks, focus)
    
    elif command == "quiz" or command == "测验":
        topic = sys.argv[2] if len(sys.argv) > 2 else "all"
        print_quiz(topic)
    
    elif command == "help" or command == "--help" or command == "-h":
        print(__doc__)
    
    else:
        print(f"❌ 未知命令：{command}")
        print("使用 /ai-learning-path help 查看帮助")


if __name__ == "__main__":
    main()
