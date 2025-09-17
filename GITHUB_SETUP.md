# 📦 GitHub 新專案設定指南

## 初始化步驟

### 1. 在 GitHub 創建新的 Repository
- Repository name: `venturoerp-v2` (建議)
- Description: "VenturoERP 2.0 - Work-Life Integration Platform"
- Private: 建議設為 Private
- **不要**初始化 README、.gitignore 或 license

### 2. 在本地初始化 Git

```bash
# 進入專案目錄
cd /Users/williamchien/Desktop/Venturo/venturoerp-tailwind

# 初始化 git
git init

# 添加所有檔案
git add .

# 第一次提交
git commit -m "Initial commit: VenturoERP 2.0 foundation"

# 設定主分支名稱為 main
git branch -M main

# 連接到你的 GitHub repository (替換 YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/venturoerp-v2.git

# 推送到 GitHub
git push -u origin main
```

### 3. 設定 GitHub Secrets（為未來部署準備）

在 GitHub Repository 的 Settings > Secrets and variables > Actions 中添加：

- `NEXT_PUBLIC_SUPABASE_URL`: `https://ddortadiljxoxgxxcwoc.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (從 .env.local 複製)

## 已清理的檔案

✅ 已移除：
- `.vercel/` - Vercel 設定資料夾
- `.git/` - 舊的 Git 歷史
- `.env.vercel` - Vercel 環境變數
- `vercel-api-research.md` - Vercel 研究文件
- `deploy.sh` - Vercel 部署腳本  
- `direct-deploy.js` - 直接部署腳本
- `DEPLOYMENT_CHECKLIST.md` - Vercel 部署清單
- `sidebar-correct-design.html` - 測試檔案
- 多餘的資料庫修復檔案

✅ 已保留：
- 所有源碼 (`src/`)
- 套件設定 (`package.json`, `tsconfig.json`)
- 專案文件 (概念、原則、問題追蹤)
- 資料庫核心檔案 (`schema.sql`, `RLS_FIX_V2.sql`)
- 環境變數範本 (`.env.local`, `.env.production`)

## 專案結構（清理後）

```
venturoerp-tailwind/
├── src/                    # 源碼
├── public/                 # 靜態資源
├── database/              # 資料庫檔案
│   ├── schema.sql         # 資料庫結構
│   ├── RLS_FIX_V2.sql    # RLS 修復腳本
│   └── SUPABASE_SETUP.md # Supabase 設定文件
├── catalyst-ui-kit/       # UI 元件庫
├── scripts/               # 工具腳本
├── .env.local            # 本地環境變數
├── .env.production       # 生產環境變數
├── .gitignore            # Git 忽略規則
├── package.json          # 專案依賴
└── [專案文件].md         # 各種文件

```

## 下一步建議

### 1. 修復 RLS 問題
在 Supabase SQL Editor 執行 `database/RLS_FIX_V2.sql`

### 2. 本地測試
```bash
npm install  # 如果需要
npm run dev  # 啟動開發伺服器
```

### 3. 考慮新的部署平台
- **Netlify**: 簡單易用，免費額度充足
- **Railway**: 適合全端應用
- **Render**: 自動部署，價格實惠
- **自建 VPS**: 完全控制

### 4. 更新專案文件
- 移除所有 Vercel 相關的參考
- 更新部署說明
- 調整環境變數說明

## 問題回報
如有任何問題，請參考 `ISSUES_TRACKING.md`

---
更新時間：2025-01-21
