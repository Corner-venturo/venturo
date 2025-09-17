-- =====================================
-- 完整清理 Supabase 資料庫
-- 警告：這會刪除所有資料！請先備份重要資料
-- =====================================

-- 步驟 1: 先關閉所有 RLS 政策（避免刪除時的權限問題）
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 關閉所有表格的 RLS
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- 步驟 2: 刪除所有政策
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 步驟 3: 刪除所有觸發器
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE trigger_schema = 'public') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table);
    END LOOP;
END $$;

-- 步驟 4: 刪除所有函數
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 步驟 5: 刪除所有表格（按照依賴順序）
-- 先刪除有外鍵依賴的表
DROP TABLE IF EXISTS public.todo_conversions CASCADE;
DROP TABLE IF EXISTS public.project_tasks CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.todos CASCADE;
DROP TABLE IF EXISTS public.timeboxes CASCADE;
DROP TABLE IF EXISTS public.soul_magic CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 步驟 6: 清理其他可能存在的舊表格
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.esims CASCADE;
DROP TABLE IF EXISTS public.finance_records CASCADE;
DROP TABLE IF EXISTS public.timebox_sessions CASCADE;

-- 步驟 7: 清理 Storage Buckets（如果有）
-- 注意：這需要管理員權限
-- DELETE FROM storage.buckets WHERE id IN ('avatars', 'documents', 'attachments', 'invoices', 'receipts');

-- 步驟 8: 清理 auth.users 的測試資料（可選）
-- 警告：這會刪除所有用戶！
-- DELETE FROM auth.users WHERE email != 'admin@venturo.com';

-- =====================================
-- 確認清理結果
-- =====================================

-- 檢查 public schema 的所有表格（應該是空的）
SELECT 'Remaining tables in public schema:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 檢查所有政策（應該是空的）
SELECT 'Remaining policies:' as info;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- 檢查所有觸發器（應該是空的）
SELECT 'Remaining triggers:' as info;
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- =====================================
-- 完成訊息
-- =====================================
SELECT '✓ 資料庫清理完成！現在可以執行 schema.sql 來建立新的資料結構。' as message;
