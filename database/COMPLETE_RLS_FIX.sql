-- =====================================
-- 完整修復 RLS 無限遞迴問題
-- =====================================

-- 步驟 1: 先關閉 RLS 並清理所有舊政策
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks DISABLE ROW LEVEL SECURITY;

-- 刪除所有舊政策
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON public.todos;
DROP POLICY IF EXISTS "Project visibility policy" ON public.projects;

-- =====================================
-- 步驟 2: 確保所有用戶都有 profile
-- =====================================
INSERT INTO public.profiles (id, email, display_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
    'PUBLIC'  -- 預設為一般用戶
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = users.id
);

-- 設定管理員（替換成你的 email）
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email IN ('你的email@example.com');  -- 替換成實際 email

-- =====================================
-- 步驟 3: 建立安全的 RLS 政策
-- =====================================

-- 重新啟用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- === PROFILES 政策 ===
-- 所有登入用戶可以查看所有 profiles（用於顯示用戶名稱等）
CREATE POLICY "profiles_select_authenticated" ON public.profiles
    FOR SELECT 
    TO authenticated
    USING (true);

-- 用戶只能更新自己的 profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id);

-- 新用戶可以建立自己的 profile
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- === TODOS 政策 ===
-- 用戶可以查看自己的所有待辦
CREATE POLICY "todos_select_own" ON public.todos
    FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid());

-- 用戶可以查看工作模式中非私人的待辦（團隊協作）
CREATE POLICY "todos_select_work_shared" ON public.todos
    FOR SELECT 
    TO authenticated
    USING (
        mode = 'work' 
        AND is_private = false 
        AND project_id IN (
            SELECT id FROM public.projects 
            WHERE owner_id = auth.uid() 
            OR auth.uid() = ANY(team_ids)
        )
    );

-- 用戶可以新增自己的待辦
CREATE POLICY "todos_insert_own" ON public.todos
    FOR INSERT 
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 用戶可以更新自己的待辦
CREATE POLICY "todos_update_own" ON public.todos
    FOR UPDATE 
    TO authenticated
    USING (user_id = auth.uid());

-- 用戶可以刪除自己的待辦
CREATE POLICY "todos_delete_own" ON public.todos
    FOR DELETE 
    TO authenticated
    USING (user_id = auth.uid());

-- === PROJECTS 政策（簡化版）===
-- 所有人可以查看公開專案
CREATE POLICY "projects_select_public" ON public.projects
    FOR SELECT 
    TO authenticated
    USING (visibility = 'company');

-- 擁有者和團隊成員可以查看專案
CREATE POLICY "projects_select_member" ON public.projects
    FOR SELECT 
    TO authenticated
    USING (
        owner_id = auth.uid() 
        OR auth.uid() = ANY(team_ids)
    );

-- 用戶可以建立專案
CREATE POLICY "projects_insert" ON public.projects
    FOR INSERT 
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

-- 擁有者可以更新專案
CREATE POLICY "projects_update_owner" ON public.projects
    FOR UPDATE 
    TO authenticated
    USING (owner_id = auth.uid());

-- === PROJECT_TASKS 政策 ===
-- 專案成員可以查看任務
CREATE POLICY "project_tasks_select" ON public.project_tasks
    FOR SELECT 
    TO authenticated
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE owner_id = auth.uid() 
            OR auth.uid() = ANY(team_ids)
        )
    );

-- =====================================
-- 步驟 4: 建立輔助函數（可選但建議）
-- =====================================

-- 檢查用戶是否為管理員的函數（避免遞迴）
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- 步驟 5: 測試查詢
-- =====================================

-- 檢查 profiles
SELECT id, email, role FROM public.profiles;

-- 檢查是否能查詢 todos（應該不會有錯誤）
SELECT COUNT(*) FROM public.todos WHERE user_id = auth.uid();

-- 測試新增待辦（替換成你的 user_id）
-- INSERT INTO public.todos (user_id, title, mode, status, priority, is_private)
-- VALUES (auth.uid(), '測試待辦', 'life', 'pending', 'medium', true);

-- =====================================
-- 步驟 6: 如果還有問題，執行這個緊急修復
-- =====================================
-- 如果上面的方案還是有問題，取消註解執行下面的命令：
-- 這會暫時關閉 RLS，讓網站先能運作

-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.project_tasks DISABLE ROW LEVEL SECURITY;
