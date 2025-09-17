# VenturoERP 2.0

> Work-Life Integration, Not Balance

## 專案簡介

VenturoERP 2.0 是一個創新的工作與生活整合平台，不是平衡生活與工作，而是讓兩者自然融合。

### 核心特色

- **雙模式系統** - 生活模式與工作模式無縫切換
- **箱型時間管理** - 原創的自律時間系統
- **心靈魔法系統** - 將顯化概念融入生產力工具
- **人性化 ERP** - 企業級功能，但介面溫暖有溫度

## 技術架構

- **前端**: Next.js 15.5.3 + React 19 + TypeScript
- **樣式**: Tailwind CSS 4 + Catalyst UI Kit
- **後端**: Supabase (PostgreSQL + Auth)
- **部署**: 待定（原 Vercel，準備遷移）

## 開發設置

### 環境需求

- Node.js 18+
- npm 或 yarn
- Supabase 帳號

### 安裝步驟

1. Clone 專案
```bash
git clone https://github.com/Corner-venturo/venturo.git
cd venturo
```

2. 安裝依賴
```bash
npm install
```

3. 設定環境變數
複製 `.env.local.example` 為 `.env.local` 並填入您的 Supabase 設定：
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 執行資料庫設定
在 Supabase SQL Editor 中執行：
- `database/schema.sql` - 建立資料表
- `database/RLS_FIX_V2.sql` - 設定 RLS 政策

5. 啟動開發伺服器
```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

## 專案結構

```
venturo/
├── src/
│   ├── app/           # Next.js App Router 頁面
│   ├── components/    # React 元件
│   ├── hooks/         # 自訂 Hooks
│   └── lib/           # 工具函式與 API
├── database/          # 資料庫相關檔案
├── catalyst-ui-kit/   # UI 元件庫
├── public/            # 靜態資源
└── scripts/           # 工具腳本
```

## 功能模組

### 生活模式 (Life Mode)
- 個人待辦事項
- 個人行事曆
- 個人財務管理
- 箱型時間管理（開發中）
- 心靈魔法系統（規劃中）

### 工作模式 (Work Mode)
- 工作待辦事項
- 專案管理（開發中）
- 15個業務模組（規劃中）

## 開發進度

- [x] 專案架構設定
- [x] Supabase 整合
- [x] 認證系統
- [x] 基礎頁面
- [x] 生活/工作模式切換
- [ ] 箱型時間系統
- [ ] 專案管理
- [ ] 業務模組

## 團隊

- **產品規劃**: Venturo Team
- **系統架構**: William Chien
- **聯絡方式**: williamchien.corner@gmail.com

## 授權

此專案為私有專案，版權所有 © 2025 Corner Venturo

## 相關文件

- [專案概念](PROJECT_CONCEPT_MERGED.md)
- [開發原則](DEVELOPMENT_PRINCIPLES.md)
- [問題追蹤](ISSUES_TRACKING.md)

---

**版本**: 0.1.0  
**最後更新**: 2025-01-21
