"""
Video-Gen-Pro CLI 入口

提供命令行接口用于视频生成操作

@author jixiang
"""

import argparse
import sys
import os

# 添加父目录到路径以便导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.project_manager import ProjectManager
from core.flow_controller import FlowController
from core.config_loader import ConfigLoader
from memory.protagonist_db import ProtagonistDB


def main():
    """CLI 主入口"""
    parser = argparse.ArgumentParser(
        description="Video-Gen-Pro - AI 视频生成工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s create "我的视频" --input article.md
  %(prog)s generate --project proj_20260306_001 --protagonist char_001
  %(prog)s protagonist create --name "科技小助手"
  %(prog)s status --project proj_20260306_001
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="可用命令")
    
    # create 命令
    create_parser = subparsers.add_parser("create", help="创建新项目")
    create_parser.add_argument("name", help="项目名称")
    create_parser.add_argument("--input", "-i", required=True, help="输入文件路径")
    create_parser.add_argument("--protagonist", "-p", help="主角 ID")
    create_parser.add_argument("--output-dir", "-o", help="项目输出目录")
    
    # generate 命令
    gen_parser = subparsers.add_parser("generate", help="生成视频")
    gen_parser.add_argument("--project", required=True, help="项目 ID")
    gen_parser.add_argument("--protagonist", "-p", help="主角 ID")
    gen_parser.add_argument("--template", "-t", default="standard_video_gen", help="工作流模板")
    gen_parser.add_argument("--quality", "-q", choices=["standard", "high", "ultra"], default="high")
    
    # protagonist 命令
    prot_parser = subparsers.add_parser("protagonist", help="主角管理")
    prot_subparsers = prot_parser.add_subparsers(dest="subcommand")
    
    # protagonist create
    prot_create = prot_subparsers.add_parser("create", help="创建新主角")
    prot_create.add_argument("--name", "-n", required=True, help="主角名称")
    prot_create.add_argument("--images", help="参考图片路径（逗号分隔）")
    prot_create.add_argument("--voice-id", help="ElevenLabs 声音 ID")
    
    # protagonist list
    prot_subparsers.add_parser("list", help="列出所有主角")
    
    # protagonist delete
    prot_delete = prot_subparsers.add_parser("delete", help="删除主角")
    prot_delete.add_argument("--id", required=True, help="主角 ID")
    
    # status 命令
    status_parser = subparsers.add_parser("status", help="查看项目状态")
    status_parser.add_argument("--project", required=True, help="项目 ID")
    
    # resume 命令
    resume_parser = subparsers.add_parser("resume", help="恢复失败的项目")
    resume_parser.add_argument("--project", required=True, help="项目 ID")
    resume_parser.add_argument("--from-step", help="从指定步骤恢复")
    
    # list 命令
    list_parser = subparsers.add_parser("list", help="列出所有项目")
    list_parser.add_argument("--status", "-s", choices=["created", "running", "completed", "failed"], help="状态过滤")
    
    # config 命令
    config_parser = subparsers.add_parser("config", help="配置管理")
    config_parser.add_argument("--show", action="store_true", help="显示当前配置")
    config_parser.add_argument("--template", help="设置默认模板")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # 初始化路径
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    projects_dir = os.path.join(base_dir, "projects")
    db_dir = os.path.join(base_dir, "memory", "protagonists")
    config_dir = os.path.join(base_dir, "config")
    workflows_dir = os.path.join(base_dir, "workflows")
    
    # 初始化组件
    project_manager = ProjectManager(projects_dir)
    config_loader = ConfigLoader(config_dir)
    protagonist_db = ProtagonistDB(db_dir)
    flow_controller = FlowController(project_manager, workflows_dir)
    
    # 处理命令
    if args.command == "create":
        project_id = project_manager.create_project(args.input, args.name, args.protagonist)
        print(f"✓ 项目创建成功: {project_id}")
        print(f"  项目目录：{os.path.join(projects_dir, project_id)}")
        
    elif args.command == "generate":
        project = project_manager.load_project(args.project)
        if not project:
            print(f"✗ 项目不存在：{args.project}")
            sys.exit(1)
        
        print(f"开始生成视频 - 项目：{args.project}")
        print(f"  模板：{args.template}")
        print(f"  质量：{args.quality}")
        
        # TODO: 注册实际的步骤处理器
        success = flow_controller.execute_workflow(args.project, args.template)
        
        if success:
            print("✓ 视频生成完成")
        else:
            print("✗ 视频生成失败，请检查日志")
            sys.exit(1)
            
    elif args.command == "protagonist":
        if args.subcommand == "create":
            images = args.images.split(",") if args.images else []
            voice_profile = {"voice_id": args.voice_id} if args.voice_id else None
            
            protagonist_id = protagonist_db.create(
                name=args.name,
                reference_images=images,
                voice_profile=voice_profile,
            )
            print(f"✓ 主角创建成功：{protagonist_id}")
            print(f"  名称：{args.name}")
            
        elif args.subcommand == "list":
            protagonists = protagonist_db.list_all()
            if not protagonists:
                print("暂无主角")
            else:
                print(f"主角列表 ({len(protagonists)}):")
                for p in protagonists:
                    print(f"  - {p['protagonist_id']}: {p['name']} (视频数：{p['video_count']})")
                    
        elif args.subcommand == "delete":
            if protagonist_db.delete(args.id):
                print(f"✓ 主角已删除：{args.id}")
            else:
                print(f"✗ 主角不存在：{args.id}")
                sys.exit(1)
        else:
            prot_parser.print_help()
            
    elif args.command == "status":
        project = project_manager.load_project(args.project)
        if not project:
            print(f"✗ 项目不存在：{args.project}")
            sys.exit(1)
        
        print(f"项目状态：{args.project}")
        print(f"  名称：{project.get('name', 'N/A')}")
        print(f"  状态：{project.get('status', 'N/A')}")
        print(f"  创建时间：{project.get('created_at', 'N/A')}")
        print(f"  工作流：{project.get('workflow', {}).get('name', 'N/A')}")
        print(f"  进度：{project.get('workflow', {}).get('steps_completed', 0)}/{project.get('workflow', {}).get('steps_total', 0)}")
        
    elif args.command == "resume":
        next_step = flow_controller.recover(args.project)
        if next_step:
            print(f"从步骤恢复：{next_step}")
            # TODO: 实现恢复逻辑
        else:
            print("无可恢复的检查点")
            
    elif args.command == "list":
        projects = project_manager.list_projects(args.status)
        if not projects:
            print("暂无项目")
        else:
            print(f"项目列表 ({len(projects)}):")
            for p in projects:
                print(f"  - {p['project_id']}: {p.get('name', 'N/A')} [{p.get('status', 'N/A')}]")
                
    elif args.command == "config":
        config = config_loader.load_config()
        if args.show:
            import json
            print(json.dumps(config, indent=2, ensure_ascii=False))
        elif args.template:
            # TODO: 实现配置保存
            print(f"默认模板已设置：{args.template}")


if __name__ == "__main__":
    main()
