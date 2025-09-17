-- =====================================
-- VenturoERP RLS 修復方案 V2
-- 使用 SECURITY DEFINER 函數避免遞迴
-- =====================================

-- 1. 先關閉所有 RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks DISABLE ROW LEVEL SECURITY;

-- 2. 刪除所有舊政策
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles CASCADE;

DROP POLICY IF EXISTS "Users can manage own todos" ON public.todos CASCADE;
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos CASCADE;
DROP POLICY IF EXISTS "Users can insert own todos" ON public.todos CASCADE;
DROP POLICY IF EXISTS "Users can update own todos" ON public.todos CASCADE;
DROP POLICY IF EXISTS "Users can delete own todos" ON public.todos CASCADE;
DROP POLICY IF EXISTS "todos_select_own" ON public.todos CASCADE;
DROP POLICY IF EXISTS "todos_select_work_shared" ON public.todos CASCADE;
DROP POLICY IF EXISTS "todos_insert_own" ON public.todos CASCADE;
DROP POLICY IF EXISTS "todos_update_own" ON public.todos CASCADE;
DROP POLICY IF EXISTS "todos_delete_own" ON public.todos CASCADE;

-- 3. 建立 SECURITY DEFINER 函數（避免遞迴）
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'PUBLIC');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_access_work_mode()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('ADMIN', 'ASSISTANT', 'ACCOUNTANT', 'SALES', 'STAFF');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重新啟用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- 5. 建立簡化的 RLS 政策

-- PROFILES 政策（簡化版）
CREATE POLICY "profiles_all_authenticated" ON public.profiles
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (auth.uid() = id);

-- TODOS 政策（簡化版）
CREATE POLICY "todos_own" ON public.todos
    FOR ALL 
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- PROJECTS 政策（簡化版）
CREATE POLICY "projects_members" ON public.projects
    FOR ALL 
    TO authenticated
    USING (
        owner_id = auth.uid() 
        OR auth.uid() = ANY(team_ids)
        OR visibility = 'company'
    )
    WITH CHECK (owner_id = auth.uid());

-- PROJECT_TASKS 政策（簡化版）
CREATE POLICY "tasks_project_members" ON public.project_tasks
    FOR ALL 
    TO authenticated
    USING (
        assigned_to = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_ids))
        )
    )
    WITH CHECK (
        assigned_to = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id
            AND p.owner_id = auth.uid()
        )
    );

-- 6. 授予函數執行權限
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_work_mode() TO authenticated;

-- 7. 確保所有用戶都有 profile
INSERT INTO public.profiles (id, email, display_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
    'PUBLIC'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = users.id
)
ON CONFLICT (id) DO NOTHING;

-- 8. 設定管理員（記得替換成實際的 email）
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'williamchien.corner@gmail.com';

-- 測試查詢
-- SELECT * FROM public.profiles WHERE id = auth.uid();
-- SELECT * FROM public.todos WHERE user_id = auth.uid();
