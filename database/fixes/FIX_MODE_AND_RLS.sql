-- 修復待辦事項 mode 欄位和用戶管理問題
-- 執行日期：2025-01-21

-- =====================================
-- 1. 修改 todos 表的 mode 檢查約束
-- =====================================

-- 先移除舊的檢查約束
ALTER TABLE public.todos 
DROP CONSTRAINT IF EXISTS todos_mode_check;

-- 新增支援 'personal' 的檢查約束
ALTER TABLE public.todos 
ADD CONSTRAINT todos_mode_check 
CHECK (mode IN ('life', 'work', 'personal'));

-- 更新現有資料，統一改為 'personal'
UPDATE public.todos 
SET mode = 'personal' 
WHERE mode IN ('life', 'work');

-- =====================================
-- 2. 新增 notes 欄位（如果不存在）
-- =====================================

ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================
-- 3. 修復 profiles 表的 RLS 政策
-- =====================================

-- 刪除舊政策
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 建立新的統一查看政策（所有登入用戶都可以看到基本資訊）
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 用戶只能更新自己的資料
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 只有管理員可以新增用戶
CREATE POLICY "Only admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- =====================================
-- 4. 修復 user_permissions 表的 RLS
-- =====================================

-- 刪除舊政策（如果存在）
DROP POLICY IF EXISTS "Users can view permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;

-- 所有登入用戶可以查看權限（用於統計）
CREATE POLICY "Authenticated users can view permissions" ON public.user_permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 只有管理員可以管理權限
CREATE POLICY "Only admins can manage permissions" ON public.user_permissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can update permissions" ON public.user_permissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can delete permissions" ON public.user_permissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- =====================================
-- 5. 簡化 todos 的 RLS 政策
-- =====================================

DROP POLICY IF EXISTS "Users can manage own todos" ON public.todos;

-- 用戶可以看到和管理自己的待辦
CREATE POLICY "Users can view own todos" ON public.todos
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own todos" ON public.todos
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own todos" ON public.todos
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own todos" ON public.todos
    FOR DELETE USING (user_id = auth.uid());

-- =====================================
-- 驗證修復
-- =====================================

-- 檢查 todos 表結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position;

-- 檢查 profiles 表的 RLS 政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 檢查現有用戶數量
SELECT COUNT(*) as user_count, role
FROM public.profiles
GROUP BY role;
