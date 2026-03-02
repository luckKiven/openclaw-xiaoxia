# Windows 指令速查技能

## 🎯 技能目标
帮助小虾在 Windows 环境中正确使用原生命令，避免习惯性使用 Linux 命令。

## 📋 Windows vs Linux 命令对照表

| 功能 | Windows CMD | Linux Bash | 小虾使用规则 |
|------|-------------|------------|-------------|
| **文件列表** | `dir [path]` | `ls [path]` | ✅ 只用 `dir` |
| **复制文件** | `copy source dest` | `cp source dest` | ✅ 只用 `copy` |
| **移动文件** | `move source dest` | `mv source dest` | ✅ 只用 `move` |
| **删除文件** | `del filename` | `rm filename` | ✅ 只用 `del` |
| **删除目录** | `rmdir dirname` | `rm -rf dirname` | ✅ 只用 `rmdir` |
| **创建目录** | `mkdir dirname` | `mkdir -p dirname` | ✅ 只用 `mkdir` |
| **查看文件** | `type filename` | `cat filename` | ✅ 只用 `type` |
| **查找文本** | `findstr "text" file` | `grep "text" file` | ✅ 只用 `findstr` |
| **当前目录** | `cd` | `pwd` | ✅ 只用 `cd` |
| **清屏** | `cls` | `clear` | ✅ 只用 `cls` |

## 🔧 路径格式规则
- **正确**: `G:\openClaw\openclaw-main\file.txt`
- **错误**: `/mnt/g/openClaw/openclaw-main/file.txt`
- **环境变量**: `%USERPROFILE%\.ssh\id_rsa` (不是 `$HOME/.ssh/id_rsa`)

## 🚨 执行前检查清单
每次要执行命令前，必须问自己：
1. 这是在 Windows 环境吗？✅ 是的，我是小虾 🦐
2. 我要用的是 CMD 命令还是 PowerShell？✅ 优先 CMD 原生命令
3. 路径格式正确吗？✅ 使用反斜杠 `\`
4. 命令在对照表中有对应吗？✅ 查表确认

## 💡 使用示例

### ❌ 错误用法（Linux 习惯）
```bash
ls G:/openClaw
cp source.txt dest.txt  
rm -rf old_dir
mkdir -p new/sub/dir
```

### ✅ 正确用法（Windows 原生）
```cmd
dir G:\openClaw
copy source.txt dest.txt
rmdir old_dir
mkdir new\sub\dir
```

## 🔄 自动替换规则
当检测到要使用以下 Linux 命令时，自动替换为 Windows 对应命令：

- `ls` → `dir`
- `cp` → `copy`  
- `mv` → `move`
- `rm` → `del` (文件) / `rmdir` (目录)
- `mkdir -p` → `mkdir`
- `cat` → `type`
- `grep` → `findstr`
- `pwd` → `cd`
- `clear` → `cls`

## 📝 集成到 SOUL
此技能已集成到 SOUL.md 的 "Windows 环境适配" 部分，确保每次启动都会加载。