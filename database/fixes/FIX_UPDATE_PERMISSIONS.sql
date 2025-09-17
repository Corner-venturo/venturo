-- 修復角色更新和權限系統
-- 執行日期：2025-01-21

-- =====================================
-- 1. 修復 profiles 表的更新政策
-- =====================================

-- 刪除舊的更新政策
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 建立新政策：用戶可以更新自己，管理員可以更新所有人
CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- =====================================
-- 2. 統一權限系統（用權限制，角色只是顯示）
-- =====================================

-- 確保管理員帳號正確
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'williamchien.corner@gmail.com';

-- 給已經是 STAFF 的人工作模式權限（如果還沒有）
INSERT INTO public.user_permissions (user_id, permission, granted_by)
SELECT 
    p.id,
    'mode.work',
    (SELECT id FROM public.profiles WHERE role = 'ADMIN' LIMIT 1)
FROM public.profiles p
WHERE p.role IN ('STAFF', 'ASSISTANT', 'ACCOUNTANT', 'SALES')
    AND NOT EXISTS (
        SELECT 1 FROM public.user_permissions up 
        WHERE up.user_id = p.id AND up.permission = 'mode.work'
    );

-- =====================================
-- 3. 修復 usePermissions 邏輯
-- =====================================

-- 這需要在程式碼中修改，改為：
-- 1. 先查 user_permissions 表
-- 2. 如果沒有，才看 role 的預設權限

-- =====================================
-- 4. 加速查詢的索引
-- =====================================

-- 為常用查詢建立索引
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- =====================================
-- 5. 驗證修復
-- =====================================

-- 檢查更新政策
SELECT policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- 檢查權限
SELECT 
    p.email,
    p.role,
    ARRAY_AGG(up.permission) as permissions
FROM public.profiles p
LEFT JOIN public.user_permissions up ON p.id = up.user_id
GROUP BY p.id, p.email, p.role
ORDER BY p.created_at;
