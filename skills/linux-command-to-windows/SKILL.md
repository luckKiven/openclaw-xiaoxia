---
name: linux-command-to-windows
description: 将 Linux/Unix 命令自动转换为 Windows CMD 等效命令，帮助 AI 助手在 Windows 环境中正确执行系统操作。
---

# Linux Command to Windows Converter

## 📋 技能描述
这个技能提供了一个完整的 Linux 到 Windows CMD 命令转换表，帮助 AI 助手在 Windows 环境中避免使用 Linux 语法，确保命令正确执行。

## 🎯 使用场景
- 当 AI 助手需要在 Windows 系统中执行文件操作、目录导航、进程管理等任务时
- 防止因使用 Linux 语法（如 `&&`、`;`、正斜杠路径）导致的命令失败
- 确保 Windows 环境中的命令兼容性和可靠性

## 📚 命令转换表

### 文件和目录操作
| Linux 命令 | Windows CMD 等效命令 | 说明 |
|------------|---------------------|------|
| `ls` | `dir` | 列出目录内容 |
| `ls -la` | `dir /a` | 列出所有文件（包括隐藏文件） |
| `cd /path/to/dir` | `盘符:\path\to\dir` | 切换目录（注意盘符） |
| `pwd` | `cd` | 显示当前目录 |
| `cp source dest` | `copy source dest` | 复制文件 |
| `cp -r source dest` | `xcopy source dest /e /i` | 复制目录 |
| `mv source dest` | `move source dest` | 移动/重命名文件 |
| `rm file` | `del file` | 删除文件 |
| `rm -rf dir` | `rmdir /s /q dir` | 强制删除目录 |
| `mkdir dir` | `mkdir dir` | 创建目录 |
| `mkdir -p path/to/dir` | `mkdir path\to\dir` | 创建多级目录 |
| `touch file` | `type nul > file` | 创建空文件 |
| `cat file` | `type file` | 显示文件内容 |
| `echo "text" > file` | `echo text > file` | 写入文件 |

### 文本处理
| Linux 命令 | Windows CMD 等效命令 | 说明 |
|------------|---------------------|------|
| `grep "pattern" file` | `findstr "pattern" file` | 在文件中搜索文本 |
| `grep -r "pattern" dir` | `findstr /s "pattern" dir\*` | 递归搜索 |
| `head -n 10 file` | `more +10 file` | 显示文件前10行 |
| `tail -n 10 file` | 需要 PowerShell 或第三方工具 | Windows CMD 无直接等效 |

### 系统信息
| Linux 命令 | Windows CMD 等效命令 | 说明 |
|------------|---------------------|------|
| `ps aux` | `tasklist` | 列出运行进程 |
| `kill -9 pid` | `taskkill /f /pid pid` | 强制终止进程 |
| `df -h` | `dir` (查看磁盘空间) | 磁盘使用情况 |
| `free -h` | `systeminfo` | 系统内存信息 |
| `whoami` | `whoami` | 显示当前用户 |
| `hostname` | `hostname` | 显示主机名 |

### 网络操作
| Linux 命令 | Windows CMD 等效命令 | 说明 |
|------------|---------------------|------|
| `ping host` | `ping host` | 网络连通性测试 |
| `curl url` | `curl url` (Windows 10+) | HTTP 请求 |
| `wget url` | `curl -o file url` | 下载文件 |
| `netstat -tuln` | `netstat -an` | 网络连接状态 |

## ⚠️ 重要规则

### 路径格式
- **Linux**: `/home/user/file.txt`
- **Windows**: `C:\Users\user\file.txt` 或 `C:/Users/user/file.txt`
- **盘符**: 必须指定盘符，如 `G:\openClaw`

### 命令连接
- **Linux**: `command1 && command2` 或 `command1; command2`
- **Windows**: **必须分步执行**，不能使用连接符
  ```cmd
  G:
  cd openClaw
  dir
  ```

### 特殊字符
- **引号**: Windows 中优先使用双引号 `"text"`
- **转义**: Windows 路径中的空格不需要特殊转义，但建议用引号包围

## 🛠️ 使用方法

### 1. 执行命令前检查
每次要执行系统命令前，先查询此转换表，确保使用正确的 Windows 语法。

### 2. 分步执行
将复杂的多步骤命令分解为单个步骤：
```cmd
REM 正确方式
G:
cd openClaw\openclaw-main
dir

REM 错误方式  
cd G:\openClaw\openclaw-main && dir
```

### 3. 路径处理
始终使用 Windows 路径格式：
```cmd
REM 正确
copy G:\source\file.txt G:\dest\

REM 错误
cp /mnt/g/source/file.txt /mnt/g/dest/
```

## 🔄 自动化集成

### 环境检测
AI 助手应首先检测运行环境：
- 如果在 Windows 环境中，**必须**使用此技能
- 如果在 Linux/WSL 环境中，可以使用原生 Linux 命令

### 错误恢复
如果命令执行失败，检查是否使用了错误的语法，并参考此转换表进行修正。

## 📝 示例

### 场景：复制文件并列出目录
**Linux 方式**:
```bash
cp /home/user/config.json /home/user/backup/ && ls -la /home/user/backup/
```

**Windows 方式**:
```cmd
copy C:\Users\user\config.json C:\Users\user\backup\
dir /a C:\Users\user\backup\
```

### 场景：创建目录结构
**Linux 方式**:
```bash
mkdir -p /opt/app/logs /opt/app/data
```

**Windows 方式**:
```cmd
mkdir C:\opt\app\logs
mkdir C:\opt\app\data
```

## 🎯 技能目标
通过此技能，确保 AI 助手在 Windows 环境中能够：
- ✅ 正确执行系统命令
- ✅ 避免语法错误
- ✅ 提高任务成功率
- ✅ 提供可靠的 Windows 系统支持

---
**最后更新**: 2026-02-28
**版本**: 1.0