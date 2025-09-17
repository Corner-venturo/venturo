-- 修復 RLS 無限遞迴問題
-- 先移除有問題的政策

-- 1. 移除 profiles 表的所有政策
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. 移除 todos 表的政策
DROP POLICY IF EXISTS "Users can manage own todos" ON public.todos;

-- 3. 重新建立簡化的 profiles 政策（避免遞迴）
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. 重新建立簡化的 todos 政策
CREATE POLICY "Users can view own todos" ON public.todos
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own todos" ON public.todos
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own todos" ON public.todos
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own todos" ON public.todos
    FOR DELETE USING (user_id = auth.uid());

-- 5. 確認你的 profile 存在
INSERT INTO public.profiles (id, email, display_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
    'ADMIN'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = users.id
);

-- 6. 測試查詢
SELECT COUNT(*) as profile_count FROM public.profiles;
SELECT COUNT(*) as todo_count FROM public.todos;
