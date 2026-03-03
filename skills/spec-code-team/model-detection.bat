@echo off
chcp 65001 >nul
echo.
echo 🔍 检测 Claude Code 可用性...
echo.

REM ===========================================
REM Step 1: 检测 Claude Code 是否安装
REM ===========================================
where claude >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Claude Code 未安装
    echo.
    echo ⚠️ spec-code-team 技能必须使用 Claude Code
    echo.
    echo 解决方案：
    echo   1. 安装 Claude Code: https://claude.ai/download
    echo   2. 或使用 spec-code-dev 技能（仅文档阶段，不需要 Claude Code）
    echo.
    echo 命令：
    echo   /spec-code-dev 分析 F:\your-project
    echo.
    exit /b 1
)

echo ✅ Claude Code 已安装
echo.

REM ===========================================
REM Step 2: 检测 Claude Code 连接
REM ===========================================
echo 📡 测试 Claude Code 连接...
echo.

REM 使用 timeout 命令限制执行时间（15 秒）
timeout /t 1 /nobreak >nul
claude "connection test" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Claude Code 无法连接到 Anthropic 服务
    echo.
    echo ⚠️ spec-code-team 技能必须使用 Claude Code
    echo.
    echo 解决方案：
    echo   1. 检查网络连接
    echo   2. 检查 API Key 配置
    echo   3. 或使用 spec-code-dev 技能（仅文档阶段）
    echo.
    exit /b 1
)

echo ✅ Claude Code 可用 - 继续执行 spec-code-team 流程
echo.
exit /b 0
