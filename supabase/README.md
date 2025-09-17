# Supabase 資料庫設定

## 建立 receipts 資料表

請依照以下步驟在 Supabase 中建立收款單資料表：

### 步驟 1: 開啟 Supabase Dashboard
1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案

### 步驟 2: 執行 SQL 遷移
1. 在左側選單中點擊 "SQL Editor"
2. 點擊 "New query" 建立新的查詢
3. 複製 `migrations/001_create_receipts_table.sql` 的全部內容
4. 貼上到 SQL Editor 中
5. 點擊 "Run" 執行

### 步驟 3: 驗證資料表建立
1. 在左側選單中點擊 "Table Editor"
2. 您應該能看到 `receipts` 資料表
3. 表中應該已經有 5 筆測試數據

## 資料表結構

### receipts 表
- `id`: UUID 主鍵 (自動生成)
- `receipt_number`: 收款單號 (唯一)
- `order_number`: 訂單編號
- `group_code`: 團號 (可選)
- `group_name`: 團名 (可選)
- `receipt_date`: 收款日期
- `receipt_amount`: 收款金額
- `receipt_type`: 收款方式 (0=現金, 1=轉帳, 2=信用卡)
- `receipt_account`: 收款帳戶 (可選)
- `status`: 狀態 (0=待收, 1=已收, 2=部分收款)
- `note`: 備註 (可選)
- `created_at`: 建立時間
- `updated_at`: 更新時間
- `created_by`: 建立者 UUID
- `updated_by`: 更新者 UUID

## 環境變數設定

確保您的 `.env.local` 文件包含正確的 Supabase 設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 測試連接

建立資料表後，您可以：
1. 啟動開發伺服器：`npm run dev`
2. 前往 `/receipts` 頁面
3. 應該能看到測試資料顯示在表格中