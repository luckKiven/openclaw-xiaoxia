# Video-Gen-Pro

AI 自动化视频生成 OpenClaw 技能 - 将任意内容转化为完整视频作品

> **作者:** jixiang  
> **状态:** 开发中 (MVP)

---

## 📋 功能概述

Video-Gen-Pro 是一个一站式视频生成解决方案，支持：

- **多格式输入**: 文本、Markdown、图片、Word、Excel、PDF
- **AI 配音**: 集成 ElevenLabs 语音合成
- **智能配图**: 基于内容自动生成视觉素材
- **主角记忆**: 保持系列视频的形象一致性
- **工作流编排**: 可配置的自动化处理流程

---

## 🚀 快速开始

### 安装依赖

```bash
# 安装 Python 依赖
pip install pyyaml pillow

# 可选：CLIP 验证支持
pip install transformers torch torchvision
```

### 基本使用

```bash
# 1. 创建主角（可选）
python -m video_gen_pro.cli.main protagonist create --name "科技小助手"

# 2. 创建新项目
python -m video_gen_pro.cli.main create "我的视频" --input article.md

# 3. 生成视频
python -m video_gen_pro.cli.main generate --project <project_id>

# 4. 查看状态
python -m video_gen_pro.cli.main status --project <project_id>
```

---

## 📁 项目结构

```
video-gen-pro/
├── core/                    # 核心模块
│   ├── project_manager.py   # 项目管理器
│   ├── flow_controller.py   # 流程控制器
│   └── config_loader.py     # 配置加载器
│
├── adapters/                # 技能适配器（待实现）
│   ├── input_adapter.py     # 输入处理
│   ├── voice_synthesizer.py # 配音合成
│   └── video_editor.py      # 视频编辑
│
├── memory/                  # 主角记忆系统
│   ├── protagonist_db.py    # 主角档案
│   └── clip_validator.py    # CLIP 验证
│
├── workflows/               # 工作流定义
│   └── standard_video_gen.yaml
│
├── cli/                     # 命令行接口
│   └── main.py
│
├── config/                  # 配置文件
│   └── default_config.yaml
│
└── projects/                # 项目输出目录
```

---

## 🔧 配置

### 默认配置 (`config/default_config.yaml`)

```yaml
video_gen_pro:
  default_protagonist: null
  default_template: standard_video_gen
  output_quality: high  # standard/high/ultra
  aspect_ratio: 9:16    # 16:9/9:16/1:1
  
  resource_limits:
    max_memory_gb: 8
    max_disk_usage_gb: 50
```

### 环境变量

```bash
# ElevenLabs API Key（配音必需）
export ELEVENLABS_API_KEY=sk_xxx

# 可选：阿里云 Qwen API（内容生成）
export QWEN_API_KEY=sk_xxx
```

---

## 📊 工作流

标准视频生成流程包含以下步骤：

```
输入解析 → 内容分析 → 脚本生成 → 视觉素材 → 配音合成 → 视频编辑 → 输出打包
                ↓                              ↑
            背景音乐选择 ───────────────────────┘
```

### 步骤说明

| 步骤 | 描述 | 超时 | 重试 |
|------|------|------|------|
| parse_input | 解析输入文件 | 30s | 2 |
| analyze_content | 内容主题分析 | 60s | - |
| generate_script | 生成视频脚本 | 45s | 2 |
| generate_images | 生成配图和封面 | 120s | 3 |
| validate_images | CLIP 一致性验证 | 30s | - |
| synthesize_voice | ElevenLabs 配音 | 180s | 2 |
| select_bgm | 选择背景音乐 | 30s | - |
| edit_video | 视频合成 | 300s | 2 |
| package_output | 输出打包 | 30s | - |

---

## 🎯 主角记忆系统

### 创建主角

```bash
python -m video_gen_pro.cli.main protagonist create \
  --name "科技小助手" \
  --images ref1.jpg,ref2.jpg \
  --voice-id elevenlabs_voice_xxx
```

### 主角档案结构

```json
{
  "protagonist_id": "char_xxx",
  "name": "科技小助手",
  "reference_images": ["ref1.jpg", "ref2.jpg"],
  "voice_profile": {
    "voice_id": "elevenlabs_voice_xxx",
    "style": "专业、亲和"
  },
  "visual_style": {
    "color_scheme": ["#0066FF", "#FFFFFF"],
    "font_family": "思源黑体"
  },
  "video_count": 0
}
```

---

## 📝 输出结构

每个项目生成以下交付物：

```
project_xxx/
├── assets/
│   ├── input/           # 原始输入
│   ├── images/          # 提取/生成的图片
│   ├── audio/           # 配音、BGM
│   └── video_clips/     # 中间视频片段
├── output/
│   ├── final_video.mp4  # 成片
│   ├── cover_image.jpg  # 封面
│   └── subtitles.srt    # 字幕
├── config/
│   ├── project.json     # 项目元数据
│   └── protagonist.json # 主角配置
└── content_script.md    # 内容脚本
```

---

## 🔌 扩展开发

### 注册自定义步骤处理器

```python
from core.flow_controller import FlowController

def my_custom_handler(project_id: str, step_config: dict) -> dict:
    """自定义步骤处理器"""
    # 实现你的逻辑
    return {"output_key": "value"}

# 注册处理器
flow_controller.register_step_handler("my_step", my_custom_handler)
```

### 创建自定义工作流

在 `workflows/` 目录创建 YAML 文件：

```yaml
workflow:
  name: my_custom_workflow
  steps:
    - id: my_step
      name: "我的步骤"
      handler: "my_module.my_handler"
      timeout_seconds: 60
```

---

## ⚠️ 注意事项

1. **API 配额**: ElevenLabs 等 AI 服务有调用限制
2. **磁盘空间**: 视频生成需要足够的临时存储空间
3. **处理时间**: 完整流程可能需要 5-15 分钟
4. **网络依赖**: 需要联网访问 AI 服务 API

---

## 📄 许可证

MIT License

---

_由 spec-code-team 开发 | 基于 Codex CLI + Qwen-Coder 模型_
