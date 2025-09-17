-- 緊急修復：確保管理員可以更新角色
-- 執行日期：2025-01-21

-- =====================================
-- 1. 先確認您的管理員身份
-- =====================================
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- 取得管理員 ID
    SELECT id INTO admin_id FROM public.profiles 
    WHERE email = 'williamchien.corner@gmail.com';
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION '找不到管理員帳號';
    END IF;
    
    -- 確保是管理員角色
    UPDATE public.profiles 
    SET role = 'ADMIN' 
    WHERE id = admin_id;
    
    RAISE NOTICE '管理員角色已確認';
END $$;

-- =====================================
-- 2. 完全重建 profiles 的 RLS 政策
-- =====================================

-- 關閉 RLS（暫時）
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 刪除所有舊政策
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON public.profiles;

-- 重新啟用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 建立新的簡單政策
-- 1. 所有登入用戶都能看到所有 profiles（需要顯示用戶列表）
CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);

-- 2. 用戶可以更新自己的 profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. 管理員可以更新任何人的 profile
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 4. 只有管理員可以插入新 profile
CREATE POLICY "Only admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- =====================================
-- 3. 測試更新其他用戶（手動測試用）
-- =====================================

-- 顯示所有用戶
SELECT id, email, display_name, role 
FROM public.profiles
ORDER BY created_at;

-- 將第一個非管理員用戶改為 STAFF（測試用）
UPDATE public.profiles
SET role = 'STAFF'
WHERE email != 'williamchien.corner@gmail.com'
  AND role = 'PUBLIC'
LIMIT 1;

-- =====================================
-- 4. 確保 permission_definitions 表存在
-- =====================================

CREATE TABLE IF NOT EXISTS public.permission_definitions (
    permission TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT
);

-- 插入基本權限定義（如果不存在）
INSERT INTO public.permission_definitions (permission, category, label, description)
VALUES 
    ('mode.work', '模式', '工作模式', '可以切換到工作模式'),
    ('mode.life', '模式', '生活模式', '可以使用生活模式'),
    ('todos.create', '待辦', '建立待辦', '可以建立待辦事項'),
    ('todos.convert', '待辦', '轉換待辦', '可以將待辦轉換為訂單等'),
    ('projects.create', '專案', '建立專案', '可以建立新專案'),
    ('projects.view', '專案', '查看專案', '可以查看專案'),
    ('orders.view', '訂單', '查看訂單', '可以查看訂單'),
    ('customers.view', '客戶', '查看客戶', '可以查看客戶資料'),
    ('users.manage', '管理', '用戶管理', '可以管理用戶'),
    ('permissions.grant', '管理', '權限管理', '可以授予權限'),
    ('system.admin', '管理', '系統管理', '系統管理員權限')
ON CONFLICT DO NOTHING;

-- =====================================
-- 5. 給自己所有權限（確保管理員有完整權限）
-- =====================================

DO $$
DECLARE
    admin_id UUID;
    perm RECORD;
BEGIN
    -- 取得管理員 ID
    SELECT id INTO admin_id FROM public.profiles 
    WHERE email = 'williamchien.corner@gmail.com';
    
    -- 給管理員所有權限
    FOR perm IN SELECT permission FROM public.permission_definitions
    LOOP
        INSERT INTO public.user_permissions (user_id, permission, granted_by)
        VALUES (admin_id, perm.permission, admin_id)
        ON CONFLICT (user_id, permission) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '管理員權限已設定完成';
END $$;

-- =====================================
-- 6. 驗證結果
-- =====================================

-- 顯示 RLS 政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 顯示管理員權限
SELECT 
    p.email,
    p.role,
    COUNT(up.permission) as permission_count
FROM public.profiles p
LEFT JOIN public.user_permissions up ON p.id = up.user_id
WHERE p.email = 'williamchien.corner@gmail.com'
GROUP BY p.id, p.email, p.role;
