# Supabase 設定指南

## 重要：執行前請確認
1. 已備份現有資料（如果需要保留）
2. 確認要清空重建資料庫
3. 已取得 Supabase 專案的連線資訊

## 步驟 1：取得 Supabase 連線資訊

從 Supabase Dashboard 取得：
- Project URL: `https://xxxxx.supabase.co`
- Anon Key: `eyJxxxxx...`
- Service Role Key: `eyJxxxxx...` (後端使用)

## 步驟 2：更新環境變數

在 `.env.local` 檔案中設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 步驟 3：執行資料庫 Schema

1. 登入 Supabase Dashboard
2. 進入 SQL Editor
3. 執行 `database/schema.sql` 檔案內容
4. 確認所有表格建立成功

## 步驟 4：設定認證

### Email 認證設定
1. 進入 Authentication > Providers
2. 啟用 Email provider
3. 設定：
   - Enable Email Confirmations: OFF (開發階段)
   - Enable Email Signups: ON

### 建立第一個管理員
1. 進入 Authentication > Users
2. 點擊 "Invite User"
3. 輸入管理員 email
4. 登入後執行 SQL：
   ```sql
   UPDATE public.profiles 
   SET role = 'ADMIN' 
   WHERE email = 'admin@venturo.com';
   ```

## 步驟 5：RLS 政策確認

確認所有 RLS 政策已正確設定：

```sql
-- 檢查 RLS 狀態
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 檢查政策
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

## 步驟 6：Storage Buckets (選用)

如果需要檔案上傳功能：

```sql
-- 建立 Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('avatars', 'avatars', true),
('documents', 'documents', false),
('attachments', 'attachments', false);
```

## 步驟 7：測試連線

建立測試檔案 `test-connection.js`：

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('連線失敗:', error)
  } else {
    console.log('連線成功!')
  }
}

testConnection()
```

## 注意事項

### 資料安全
- 永遠不要將 Service Role Key 暴露在前端
- 使用 RLS 政策保護資料
- 定期備份重要資料

### 開發建議
- 開發環境關閉 email 確認
- 生產環境啟用所有安全功能
- 使用 migrations 管理 schema 變更

### 效能優化
- 為常用查詢建立索引
- 使用 materialized views 加速複雜查詢
- 監控 Database Health

## 疑難排解

### 常見問題

1. **RLS 政策阻擋存取**
   - 檢查用戶角色
   - 確認政策邏輯
   - 使用 Service Role 測試

2. **Foreign Key 錯誤**
   - 確認參照的記錄存在
   - 檢查 CASCADE 設定

3. **權限不足**
   - 確認用戶已登入
   - 檢查 RLS 政策
   - 確認角色設定

## 後續步驟

1. 安裝 Supabase 客戶端：
   ```bash
   npm install @supabase/supabase-js
   ```

2. 建立 Supabase 客戶端：
   ```typescript
   // src/lib/supabase/client.ts
   import { createClient } from '@supabase/supabase-js'
   
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

3. 實作認證功能
4. 建立資料存取層
5. 整合前端功能
