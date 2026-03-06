# OpenClaw 小虾 GitHub 自动备份脚本
# 用法：.\github-backup.ps1

$ErrorActionPreference = "SilentlyContinue"
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== 小虾 GitHub 自动备份 ===" -ForegroundColor Cyan
Write-Host "备份时间：$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"

# 备份目录
$Workspace = "C:\Users\14015\.openclaw\workspace"
$Skills = "G:\openClaw\xiaoxia\skills"
$OutputPath = "F:\2025ideazdjx\openClaw-project\xiaoxia\git-backups"

# 创建备份目录
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $OutputPath $timestamp
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# 1. 备份 workspace 配置（排除 node_modules）
Write-Host "[1/3] 备份 Workspace 配置..." -NoNewline
$workspaceBackup = Join-Path $backupDir "workspace"
New-Item -ItemType Directory -Force -Path $workspaceBackup | Out-Null
Get-ChildItem $Workspace -File | Copy-Item -Destination $workspaceBackup
Get-ChildItem $Workspace -Directory -Exclude "node_modules" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $workspaceBackup -Recurse -Force
}
Write-Host " [OK]" -ForegroundColor Green

# 2. 备份 skills（排除 node_modules 和 .git）
Write-Host "[2/3] 备份 Skills..." -NoNewline
$skillsBackup = Join-Path $backupDir "skills"
New-Item -ItemType Directory -Force -Path $skillsBackup | Out-Null
robocopy $Skills $skillsBackup /E /XD node_modules .git /NFL /NDL /NJH /NJS | Out-Null
Write-Host " [OK]" -ForegroundColor Green

# 3. Git 提交并推送
Write-Host "[3/3] Git 提交并推送..." -NoNewline

# Workspace Git
if (Test-Path "$Workspace\.git") {
    Push-Location $Workspace
    git add -A 2>$null
    git commit -m "Auto backup: $timestamp" 2>$null
    git push origin main 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [OK] Workspace" -ForegroundColor Green
    } else {
        Write-Host " [SKIP] 无变更或推送失败" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host " [SKIP] 无 Git 仓库" -ForegroundColor Gray
}

# Skills Git (G 盘)
if (Test-Path "$Skills\.git") {
    Push-Location $Skills
    git add -A 2>$null
    git commit -m "Auto backup: $timestamp" 2>$null
    git push origin main 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [OK] Skills" -ForegroundColor Green
    } else {
        Write-Host " [SKIP] 无变更或推送失败" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host " [SKIP] 无 Git 仓库" -ForegroundColor Gray
}

# 计算备份大小
$backupSize = (Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$backupSizeMB = [math]::Round($backupSize / 1MB, 2)
Write-Host "`n备份完成！大小：$backupSizeMB MB" -ForegroundColor Cyan

# 清理旧备份（保留最近 7 个）
$oldBackups = Get-ChildItem -Path $OutputPath -Directory | Sort-Object Name -Descending | Select-Object -Skip 7
foreach ($old in $oldBackups) {
    Remove-Item -Path $old.FullName -Recurse -Force
    Write-Host "已删除旧备份：$($old.Name)" -ForegroundColor Gray
}

Write-Host "`n=== 备份完成 ===" -ForegroundColor Cyan
