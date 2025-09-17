# 系統設計指南

## 核心概念

### 全域狀態管理
系統只有**兩個核心狀態**：
1. **用戶角色** - 決定用戶擁有哪些權限
2. **當前模式** - 決定用戶當前使用哪種工作環境

### 模式設計理念
- **生活模式**：基礎個人管理功能
- **工作模式**：生活模式 + 業務管理功能（進階版）

## 功能分類

### 🟢 共用功能（兩種模式都有）
這些功能在生活模式和工作模式下都會顯示，資料完全共享：

- **代辦事項** (`/todos`)
  - 不分模式，統一管理
  - 資料庫中無 `mode` 欄位
  - 兩種模式下看到相同資料

- **行事曆** (`/calendar`)
  - 不分模式，統一管理
  - 兩種模式下看到相同行程

### 🔵 生活模式專屬功能
只在生活模式下顯示：

- **財務管理** (`/finance`) - 個人財務管理
- **箱型時間** (`/timebox`) - 時間管理工具
- **心靈魔法** (`/soulmagic`) - 個人成長工具

### 🟠 工作模式專屬功能
只在工作模式下顯示：

#### 業務管理模組

##### ✅ 已實作並在導航選單中（16個）
- **專案管理** (`/projects`) ✅
- **客戶管理** (`/customers`) ✅
- **團體管理** (`/groups`) ✅ - 團體旅遊管理
- **訂單管理** (`/orders`) ✅
- **收款單** (`/receipts`) ✅
- **請款單** (`/invoices`) ✅
- **出納單** (`/cashflow`) ✅
- **供應商** (`/suppliers`) ✅
- **網卡管理** (`/simcards`) ✅
- **員工管理** (`/employees`) ✅
- **報價單** (`/quotations`) ✅
- **行程設計** (`/itinerary`) ✅
- **旅遊團** (`/tours`) ✅
- **合約** (`/contracts`) ✅
- **確認單** (`/confirmations`) ✅
- **成本資料** (`/costs`) ✅

##### ✅ 已實作但未在導航選單中
- **控制面板** (`/dashboard`) - 總覽儀表板

##### ❌ 規劃中或缺失的模組
- **庫存管理** - 產品/物料庫存
- **採購管理** - 採購流程管理
- **銷售報表** - 業務分析報表
- **文件管理** - 合約/文件存檔
- **客服管理** - 客戶服務工單
- **行銷管理** - 行銷活動追蹤

## Layout 統一性現況

### 🎨 設計一致性狀態

#### ✅ 完全配合統一 Layout（7個）
- **客戶管理** - 標準化頁面結構、統計badges、搜尋篩選
- **訂單管理** - 完整統計、營收展示、卡片式列表
- **旅遊團管理** - 統計badges、狀態篩選、響應式設計
- **團體管理** - Catalyst UI 組件、表格展示
- **心靈魔法** ✅ - 已調整配合統一layout，保留特殊視覺效果
- **箱型時間** ✅ - 已調整配合統一layout，含統計badges
- **收款單** ✅ - 已調整配合統一layout，移除自定義Header

#### 🔴 使用 ComingSoonPage（11個）
- 專案管理、請款單、出納單、供應商、網卡管理
- 員工管理、報價單、行程設計、合約、確認單、成本資料

### 📐 統一 Layout 標準

所有模組都應遵循以下結構：

```tsx
<div className="h-full">
  {/* 標題區域 */}
  <div className="mx-auto max-w-6xl px-8 py-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">模組名稱</h1>
        <p className="mt-2 text-sm">模組描述</p>
      </div>
      <div className="flex items-center space-x-3">
        {/* 操作按鈕 */}
      </div>
    </div>
    {/* 統計 badges */}
    <div className="mt-6 grid grid-cols-4 gap-4">
      {/* 統計數據 */}
    </div>
  </div>

  {/* 內容容器 */}
  <div className="mx-auto max-w-6xl">
    <div className="px-8 py-6">
      {/* 主要內容 */}
    </div>
  </div>
</div>
```

## 模組現況統計

### 📊 整體進度
- **生活模式功能**: 3個 ✅ (已配合統一layout)
  - 財務管理 ✅
  - 箱型時間 ✅
  - 心靈魔法 ✅

- **共用功能**: 2個 ✅ (已配合統一layout)
  - 待辦事項 ✅
  - 行事曆 ✅

- **工作模式業務功能**: 16個已實作 / ~22個規劃
  - 已完成且配合layout: 4個 ✅
  - 實作但未上線: 1個（控制面板）
  - 規劃中: 6個 ⏳

### 🎯 開發優先級建議
1. **高優先級** - 基礎營運必需
   - 庫存管理 🔴
   - 採購管理 🔴

2. **中優先級** - 提升效率
   - 銷售報表 🟡
   - 控制面板上線 🟡

3. **低優先級** - 附加功能
   - 文件管理 🟢
   - 客服管理 🟢
   - 行銷管理 🟢

## 權限系統

### 角色權限
- **一般用戶**：只有生活模式權限
- **企業用戶**：生活模式 + 工作模式權限
- **管理員**：所有權限 + 系統管理權限

### 權限標記
```typescript
// 導航選單配置
const navItems = [
  { label: '代辦事項', href: '/todos' },           // 無標記 = 共用
  { label: '行事曆', href: '/calendar' },          // 無標記 = 共用
  { label: '財務管理', href: '/finance', lifeOnly: true },    // 生活專屬
  { label: '箱型時間', href: '/timebox', lifeOnly: true },    // 生活專屬
  { label: '客戶管理', href: '/customers', workOnly: true },  // 工作專屬
]
```

## 實作原則

### ✅ 正確做法

1. **共用功能**
   - 資料庫不需要 `mode` 欄位
   - 不根據模式過濾資料
   - 兩種模式下功能完全一致

2. **模式專屬功能**
   - 使用 `workOnly: true` 或 `lifeOnly: true`
   - 根據當前模式和權限顯示/隱藏

3. **狀態管理**
   - 模式切換不影響共用功能的資料
   - 只影響導航選單的顯示項目

### ❌ 錯誤做法

1. **不要在共用功能中加入模式邏輯**
   ```typescript
   // ❌ 錯誤
   .eq('mode', currentMode)

   // ✅ 正確 - 共用功能不過濾模式
   .eq('user_id', user.id)
   ```

2. **不要在組件中傳遞不必要的 mode 參數**
   ```typescript
   // ❌ 錯誤
   <TodoDialog mode={currentMode} />

   // ✅ 正確 - 共用組件不需要 mode
   <TodoDialog />
   ```

3. **不要在初始化時重置用戶的模式偏好**
   ```typescript
   // ❌ 錯誤
   clearSession: () => set({ currentMode: 'life' })

   // ✅ 正確 - 保持用戶選擇
   initializeFromAuth: () => {
     // 只有在失去權限時才重置模式
   }
   ```

## 開發檢查清單

開發新功能時，請先確認：

- [ ] 這是共用功能還是模式專屬功能？
- [ ] 如果是共用功能，是否移除了所有模式相關邏輯？
- [ ] 如果是模式專屬功能，是否正確設定了 `workOnly` 或 `lifeOnly`？
- [ ] 是否在導航選單中正確配置？
- [ ] 是否會意外影響全域的模式狀態？

## 常見問題

**Q: 為什麼代辦事項和行事曆是共用的？**
A: 因為個人的待辦和行程不應該因為工作/生活模式而分割，用戶需要統一管理所有事務。

**Q: 工作模式和生活模式的關係？**
A: 工作模式是生活模式的超集，包含所有生活功能 + 額外的業務功能。

**Q: 如何判斷新功能應該放在哪個模式？**
A:
- 個人事務管理 → 共用功能
- 個人成長工具 → 生活模式專屬
- 企業業務管理 → 工作模式專屬

## 部署流程

### 💻 多電腦開發環境

專案支援多台電腦同步開發：
- **主要開發機**：iMac（主力開發）
- **輔助開發機**：MacBook（外出開發）
- **兩台電腦都已配置 SSH Key**，可以直接推送到 GitHub

### 🚀 Vercel 自動部署流程

本專案使用 **GitHub + Vercel** 進行自動化部署：

#### 部署架構
```
本地開發（任一台電腦）→ SSH推送到GitHub → Vercel自動部署 → 生產環境
```

#### 標準部署步驟

1. **本地開發完成**
   ```bash
   # 測試構建
   npm run build
   npm run dev  # 本地測試
   ```

2. **提交代碼到GitHub**
   ```bash
   # 添加所有變更
   git add .

   # 提交變更（使用規範化commit訊息）
   git commit -m "功能描述

   詳細說明變更內容：
   - 變更項目1
   - 變更項目2
   - 變更項目3

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"

   # 推送到GitHub（透過SSH）
   git push origin main
   ```

3. **Vercel自動部署**
   - GitHub收到推送後自動觸發Vercel構建
   - Vercel執行 `npm run build`
   - 自動部署到生產環境
   - 提供預覽URL和生產URL

#### Commit 訊息規範

為保持代碼歷史清晰，請遵循以下格式：

```bash
git commit -m "簡短描述（50字以內）

詳細說明（如有需要）：
- 具體變更1
- 具體變更2
- 修復的問題

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 環境變數設置

在 Vercel Dashboard 中設置環境變數：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### 部署檢查清單

- [ ] 本地構建成功 (`npm run build`)
- [ ] 功能測試通過
- [ ] 遵循 Layout 統一性標準
- [ ] 更新相關文件
- [ ] Commit 訊息清晰
- [ ] 推送到 GitHub
- [ ] 確認 Vercel 部署成功

#### 常見部署問題

**問題1：構建失敗**
```bash
# 檢查依賴
npm install
npm run build
```

**問題2：環境變數缺失**
- 檢查 Vercel Dashboard 環境變數設定
- 確認 `.env.local` 格式正確

**問題3：TypeScript 錯誤**
```bash
# 類型檢查
npm run type-check
```

#### 🖥️ 當前電腦部署方式

**這台電腦（目前使用中）的部署步驟：**

1. **檢查 Git 狀態**
   ```bash
   git status
   ```

2. **添加變更**
   ```bash
   git add .
   ```

3. **提交變更**
   ```bash
   git commit -m "功能描述

   詳細說明：
   - 變更項目1
   - 變更項目2

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

4. **推送到 GitHub**
   ```bash
   git push origin main
   ```

#### 🔧 故障排除記錄

**如果遇到 Git 倉庫損壞（通常因磁盤空間不足）：**

1. **重新初始化 Git**
   ```bash
   rm -rf .git
   git init
   git remote add origin git@github.com:Corner-venturo/venturo.git
   ```

2. **分批提交**
   ```bash
   # 先提交基本文件
   git add package.json
   git commit -m "Initial commit"
   git push --force origin main

   # 再提交其他文件
   git add .
   git commit -m "Complete project files"
   git push origin main
   ```

#### 快速部署命令

```bash
# 完整部署流程（一鍵執行）
git add . && \
git commit -m "部署更新

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>" && \
git push origin main
```

#### 📱 Vercel 部署監控

部署完成後可以檢查：
- Vercel Dashboard: https://vercel.com/corner-venturo
- 生產環境 URL: [由 Vercel 自動生成]
- 預覽環境 URL: [每次 commit 自動生成]