# CornerERP 收款單遷移文件

## 🎯 遷移目標
從 CornerERP 遷移收款單功能到 VenturoERP，保持 100% 業務邏輯相同，只改變 UI 外觀。

## ✅ 已完成項目

### 1. 核心檔案遷移
- ✅ `ReceiptApi.ts` - 收款單 API 層
- ✅ `Receipts.tsx` - 主組件
- ✅ `ReceiptsHeader.tsx` - 標題和操作按鈕
- ✅ `ReceiptsTable.tsx` - 資料表格
- ✅ `receiptTypes.ts` - 收款方式常數
- ✅ `receiptStatus.ts` - 收款狀態常數

### 2. UI 組件替換
- ✅ `@mui/material` Button → Catalyst Button
- ✅ `@mui/material` Typography → 原生 HTML
- ✅ `@mui/material` Paper → Tailwind div
- ✅ `FuseLoading` → 原生載入提示
- ✅ `FuseSvgIcon` → Heroicons
- ✅ `DataTable` → MaterialReactTable

### 3. 技術架構適配
- ✅ BaseAPI → Supabase createClient
- ✅ RTK Query → 自定義 useGetReceiptsQuery hook
- ✅ 資料轉換邏輯 (snake_case ↔ camelCase)

## ⚠️ 已知問題和限制

### 1. 功能缺失
- ❌ **ReceiptSearchDialog** - 詳細搜尋對話框未實現
  - 影響：無法進行進階搜尋 (日期範圍、狀態篩選等)
  - 替代方案：MaterialReactTable 內建的全域搜尋
  - 優先級：中等

### 2. 資料庫依賴
- ⚠️ **receipts 資料表** - 需在 Supabase 中建立
  ```sql
  CREATE TABLE public.receipts (
      receipt_number TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      receipt_date TIMESTAMPTZ NOT NULL,
      receipt_amount NUMERIC(12,2) NOT NULL,
      actual_amount NUMERIC(12,2) NOT NULL,
      receipt_type TEXT,
      receipt_account TEXT DEFAULT '',
      email TEXT DEFAULT '',
      pay_dateline TIMESTAMPTZ,
      note TEXT DEFAULT '',
      status INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT NOT NULL,
      modified_at TIMESTAMPTZ,
      modified_by TEXT
  );
  ```

### 3. 樣式兼容性
- ⚠️ **MaterialReactTable 樣式** - 可能與 Tailwind 設計不完全一致
  - 影響：視覺風格可能突兀
  - 解決方案：需要自定義 CSS 覆蓋

### 4. 效能考量
- ⚠️ **Bundle Size** - MaterialReactTable 增加約 300KB
  - 影響：首次載入時間
  - 考慮：是否需要代碼分割或替代方案

## 🔄 待完成項目

### 高優先級
1. **建立 Supabase receipts 表** - 功能測試必需
2. **實現 ReceiptSearchDialog** - 恢復進階搜尋功能
3. **批量新增功能** - /receipts/batch-create 頁面

### 中優先級
1. **樣式優化** - 統一 MaterialReactTable 外觀
2. **錯誤處理** - 完善 API 錯誤處理和用戶提示
3. **RLS 政策** - 設定 Supabase Row Level Security

### 低優先級
1. **效能優化** - 考慮表格虛擬化或懶加載
2. **單元測試** - 補充 API 和組件測試

## 🎨 深色模式支援

### 現狀檢查
- ❓ **MaterialReactTable** - 需確認是否支援深色模式
- ❓ **Catalyst UI** - 需確認深色模式配置
- ❓ **Tailwind Config** - 需檢查深色模式設定

### 建議行動
1. 檢查 tailwind.config.js 中的 darkMode 設定
2. 測試 MaterialReactTable 在深色模式下的表現
3. 如需要，添加深色模式專用樣式

## 📋 測試檢查清單

### 基本功能
- [ ] 頁面正常載入 (無 JavaScript 錯誤)
- [ ] 收款單列表顯示
- [ ] 排序功能
- [ ] 搜尋功能
- [ ] 分頁功能
- [ ] Excel 匯出
- [ ] 批量新增按鈕

### 資料操作
- [ ] 新增收款單
- [ ] 編輯收款單
- [ ] 刪除收款單
- [ ] 狀態更新

### UI/UX
- [ ] 響應式設計 (手機/桌面)
- [ ] 載入狀態顯示
- [ ] 錯誤訊息顯示
- [ ] 深色模式兼容性

## 🚀 部署狀態

**最新部署：** `ed7849f` - 修復 FuseSvgIcon 錯誤
**部署 URL：** https://venturo-five.vercel.app/receipts
**狀態：** ✅ 基本功能可用，待建立資料表

---

*最後更新：2025-09-17*
*負責人：Claude*