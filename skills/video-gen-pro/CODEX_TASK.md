# Codex 任务：修复 video-gen-pro 浏览器自动化

## 问题描述

当前 `kling_adapter.py` 使用 `midscene` 库进行浏览器自动化，但该库无法通过 pip 安装。

## 需要修复的文件

- `G:\openClaw\xiaoxia\skills\video-gen-pro\adapters\video_generator\kling_adapter.py`

## 修复要求

1. **替换为 Selenium** - 使用成熟的 Selenium 库替代 midscene
2. **保持功能完整** - 登录、生成视频、检查状态、下载结果
3. **优化元素定位** - 使用更稳定的 CSS selector 和 XPath
4. **增加等待机制** - 使用 WebDriverWait 替代固定 sleep
5. **错误处理** - 添加详细的错误日志和重试机制

## 可灵 AI 页面结构

- 登录页：https://klingai.kuaishou.com/login
- 生成页：https://klingai.kuaishou.com/ai/video
- 输入框：`textarea[placeholder*="描述"]` 或第一个 textarea
- 生成按钮：包含"生成"或"Generate"文字的 button
- 任务状态：页面 URL 或任务列表中的状态元素

## 测试命令

```bash
cd G:\openClaw\xiaoxia\skills\video-gen-pro
python cli\main.py ai-generate "测试提示词" --platform kling --duration 5
```

## 依赖

已在 requirements.txt 添加：
- selenium>=4.41.0
- webdriver-manager>=4.0.2

## 输出

修复后的代码应该：
1. 能正常打开浏览器
2. 等待用户登录（5 分钟超时）
3. 导航到生成页面
4. 输入提示词
5. 点击生成按钮
6. 返回任务 ID 或状态
