# OpenClaw 小虾备份脚本
# 用法：.\backup.ps1 [-Full] [-Destination <path>]

param(
    [switch]$Full,
    [string]$Destination = "F:\2025ideazdjx\openClaw-project\xiaoxia\backups"
)

$ErrorActionPreference = "SilentlyContinue"
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 创建备份目录
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $Destination $timestamp
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

Write-Host "=== 小虾备份脚本 ===" -ForegroundColor Cyan
Write-Host "备份时间：$timestamp"
Write-Host "备份目录：$backupDir`n"

# 1. 备份工作空间 (C 盘)
$workspaceSource = "C:\Users\14015\.openclaw\workspace"
$workspaceDest = Join-Path $backupDir "workspace"
Write-Host "[1/3] 备份工作空间..." -NoNewline
if (Test-Path $workspaceSource) {
    # 排除 node_modules 和大文件
    Copy-Item -Path $workspaceSource -Destination $workspaceDest -Recurse -Force
    Write-Host " [OK]" -ForegroundColor Green
} else {
    Write-Host " [FAIL] (目录不存在)" -ForegroundColor Red
}

# 2. 备份记忆文件 (优先保护)
$memorySource = "C:\Users\14015\.openclaw\workspace\memory"
$memoryDest = Join-Path $backupDir "memory"
Write-Host "[2/3] 备份记忆文件..." -NoNewline
if (Test-Path $memorySource) {
    Copy-Item -Path $memorySource -Destination $memoryDest -Recurse -Force
    Write-Host " [OK]" -ForegroundColor Green
} else {
    Write-Host " [FAIL] (目录不存在)" -ForegroundColor Red
}

# 3. 完整备份 (可选，包含 node_modules)
if ($Full) {
    $openclawSource = "G:\openClaw\xiaoxia"
    $openclawDest = Join-Path $backupDir "openclaw-xiaoxia"
    Write-Host "[3/3] 完整备份 OpenClaw (含 node_modules)..." -NoNewline
    if (Test-Path $openclawSource) {
        # 使用 robocopy 更快
        robocopy $openclawSource $openclawDest /E /XD node_modules .git /NFL /NDL /NJH /NJS | Out-Null
        Write-Host " [OK] (排除 node_modules 和 .git)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] (目录不存在)" -ForegroundColor Red
    }
}

# 计算备份大小
$backupSize = (Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$backupSizeGB = [math]::Round($backupSize / 1GB, 2)
Write-Host "`n备份完成！大小：$backupSizeGB GB" -ForegroundColor Cyan

# 清理旧备份 (保留最近 7 个)
$oldBackups = Get-ChildItem -Path $Destination -Directory | Sort-Object Name -Descending | Select-Object -Skip 7
foreach ($old in $oldBackups) {
    Remove-Item -Path $old.FullName -Recurse -Force
    Write-Host "已删除旧备份：$($old.Name)" -ForegroundColor Gray
}

Write-Host "`n=== 备份完成 ===" -ForegroundColor Cyan
