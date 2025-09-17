-- 檢查並修復 todos 表結構
-- 執行日期：2025-01-21

-- =====================================
-- 1. 檢查 todos 表現有欄位
-- =====================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'todos'
ORDER BY ordinal_position;

-- =====================================
-- 2. 新增缺少的 notes 欄位（如果不存在）
-- =====================================
ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================
-- 3. 測試更新（檢查 RLS）
-- =====================================
-- 取得一個測試 todo
SELECT id, title, user_id, mode, notes 
FROM public.todos 
LIMIT 1;

-- 測試更新（替換下面的 ID）
-- UPDATE public.todos 
-- SET notes = '測試更新', updated_at = NOW()
-- WHERE id = 'YOUR_TODO_ID_HERE';

-- =====================================
-- 4. 檢查 RLS 政策
-- =====================================
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'todos'
    AND cmd = 'UPDATE';
