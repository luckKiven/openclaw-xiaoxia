"""
Video-Gen-Pro 依赖检查脚本

检查所有必需的依赖是否已安装

@author jixiang
"""

import sys
import subprocess
import importlib


def check_package(package_name, import_name=None):
    """检查 Python 包是否已安装"""
    import_name = import_name or package_name.replace("-", "_")
    try:
        importlib.import_module(import_name)
        return True, None
    except ImportError as e:
        return False, str(e)


def check_ffmpeg():
    """检查 FFmpeg 是否已安装"""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version_line = result.stdout.split("\n")[0]
            return True, version_line
        return False, "FFmpeg not found"
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False, "FFmpeg not installed"


def main():
    """主检查函数"""
    print("=" * 60)
    print("Video-Gen-Pro 依赖检查")
    print("=" * 60)
    print()
    
    # Python 版本
    print(f"Python 版本：{sys.version}")
    print()
    
    # 检查 Python 包
    packages = [
        ("PyYAML", "yaml", True),
        ("Pillow", "PIL", True),
        ("edge-tts", "edge_tts", True),
        ("mutagen", "mutagen", False),
        ("requests", "requests", False),
    ]
    
    print("Python 包检查:")
    print("-" * 40)
    
    all_installed = True
    for package, import_name, required in packages:
        installed, error = check_package(package, import_name)
        status = "[OK]" if installed else "[  ]"
        required_mark = "*" if required else " "
        status_text = "已安装" if installed else "未安装"
        print(f"  {status} {required_mark} {package}: {status_text}")
        if required and not installed:
            all_installed = False
    
    print()
    
    # 检查 FFmpeg
    print("外部工具检查:")
    print("-" * 40)
    
    ffmpeg_installed, ffmpeg_info = check_ffmpeg()
    status = "[OK]" if ffmpeg_installed else "[  ]"
    status_text = "已安装" if ffmpeg_installed else "未安装"
    print(f"  {status} * FFmpeg: {status_text}")
    if ffmpeg_installed:
        print(f"      {ffmpeg_info[:80]}...")
    else:
        print("      安装指南：https://ffmpeg.org/download.html")
        print("      Windows: choco install ffmpeg")
    
    print()
    
    # 总结
    print("=" * 60)
    print("检查结果:")
    print("-" * 40)
    
    if all_installed and ffmpeg_installed:
        print("[OK] 所有必需依赖已安装，可以正常使用！")
        return 0
    else:
        print("[WARN] 部分依赖未安装，请执行以下命令安装:")
        print()
        print("  # 安装核心依赖")
        print("  pip install PyYAML Pillow edge-tts")
        print()
        print("  # 安装可选依赖")
        print("  pip install mutagen requests")
        print()
        if not ffmpeg_installed:
            print("  # 安装 FFmpeg (需要手动安装)")
            print("  Windows: choco install ffmpeg")
            print("  或从 https://ffmpeg.org/download.html 下载")
        return 1


if __name__ == "__main__":
    sys.exit(main())
