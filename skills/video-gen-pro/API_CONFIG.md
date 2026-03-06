# video-gen-pro API 配置说明

## 即梦 AI 官方 API（推荐）

### 1. 获取 API Key

访问火山引擎控制台：https://console.volcengine.com/iam

1. 登录/注册火山引擎账号
2. 进入「访问控制」→「凭证管理」
3. 创建访问密钥（Access Key）
4. 复制 `Access Key ID` 和 `Secret Access Key`

### 2. 配置环境变量

**Windows PowerShell：**
```powershell
$env:VOLC_ACCESS_KEY="your_access_key_here"
$env:VOLC_SECRET_KEY="your_secret_key_here"
```

**或添加到系统环境变量：**
1. 右键「此电脑」→ 属性 → 高级系统设置
2. 环境变量 → 新建系统变量
   - `VOLC_ACCESS_KEY` = `your_access_key`
   - `VOLC_SECRET_KEY` = `your_secret_key`

### 3. 使用 API 生成视频

```bash
cd G:\openClaw\xiaoxia\skills\video-gen-pro

# 使用即梦 AI API 生成
python cli\main.py ai-generate "你的提示词" --platform jimeng-api --duration 5 --quality 720p
```

### 4. 价格说明

| 模型 | 分辨率 | 价格 |
|------|--------|------|
| 视频生成 3.0 | 720p | ¥0.28/秒 |
| 视频生成 3.0 | 1080p | ¥0.63/秒 |
| 视频生成 3.0 Pro | 1080p | ¥1.0/秒 |

**示例：** 5 秒 720p 视频 ≈ ¥1.4

### 5. 免费额度

- 新用户注册送免费积分（约 ¥10-50）
- 可生成约 7-35 个 5 秒视频（720p）

---

## 可灵 AI（备选）

可灵 AI 暂无官方 API，使用浏览器自动化方案（不稳定）

```bash
python cli\main.py ai-generate "你的提示词" --platform kling --duration 5
```

---

## 推荐方案

**生产环境：** 使用即梦 AI 官方 API（稳定、快速）

**个人白嫖：** 注册多个即梦 AI 账号获取免费额度

**批量生成：** 购买火山引擎资源包（更优惠）
