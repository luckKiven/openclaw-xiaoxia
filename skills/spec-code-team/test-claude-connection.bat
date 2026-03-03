@echo off
chcp 65001 >nul
echo.
echo 🧪 Testing Claude Code Connection...
echo.

REM ===========================================
REM Quick Connection Test
REM ===========================================
timeout /t 1 /nobreak >nul
claude "test" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Claude Code connection failed
    echo.
    echo ⚠️ Claude Code is required for spec-code-team skill
    echo.
    echo Please use spec-code-dev skill instead (document-only mode)
    echo.
    exit /b 1
)

echo ✅ Claude Code connection successful
echo.
exit /b 0
