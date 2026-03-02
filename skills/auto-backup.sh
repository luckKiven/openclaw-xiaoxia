#!/bin/bash
# 全局自动备份脚本 - 监控所有OpenClaw配置变更

BACKUP_DIR="/home/test-root/.openclaw/workspace"
GITHUB_REPO="https://github.com/luckKiven/openclaw-full-backup.git"
BACKUP_REPO="/home/test-root/.openclaw/workspace/openclaw-full-backup-auto"

# 检查是否有配置变更
check_changes() {
    cd "$BACKUP_DIR"
    if git status --porcelain | grep -q ".*"; then
        return 0  # 有变更
    else
        return 1  # 无变更
    fi
}

# 执行备份
perform_backup() {
    echo "检测到配置变更，开始备份..."
    
    # 确保备份仓库存在
    if [ ! -d "$BACKUP_REPO" ]; then
        git clone "$GITHUB_REPO" "$BACKUP_REPO"
    fi
    
    # 复制所有配置文件
    cp -r "$BACKUP_DIR"/* "$BACKUP_REPO"/
    
    # 进入备份仓库
    cd "$BACKUP_REPO"
    
    # 添加所有变更
    git add .
    
    # 检查是否有实际变更
    if git diff --cached --quiet; then
        echo "无实际变更，跳过备份"
        return 0
    fi
    
    # 提交变更
    git commit -m "Auto backup: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 推送到GitHub
    git push origin main
    
    echo "✅ 已更新备份至github"
}

# 主函数
main() {
    if check_changes; then
        perform_backup
    else
        echo "无配置变更，跳过备份"
    fi
}

# 执行主函数
main