-- =====================================
-- 快速修復：給管理員所有權限
-- =====================================

-- 1. 確認您的 user_id
SELECT id, email, role FROM profiles 
WHERE email = 'williamchien.corner@gmail.com';

-- 2. 給您的帳號工作模式權限
INSERT INTO user_permissions (user_id, permission, granted_by)
SELECT 
    id,
    'mode.work',
    id
FROM auth.users
WHERE email = 'williamchien.corner@gmail.com'
ON CONFLICT (user_id, permission) DO NOTHING;

-- 3. 給管理員帳號所有權限
INSERT INTO user_permissions (user_id, permission, granted_by)
SELECT 
    u.id,
    p.permission,
    u.id
FROM auth.users u
CROSS JOIN (
    VALUES 
    ('mode.life'),
    ('mode.work'),
    ('system.admin'),
    ('users.manage'),
    ('permissions.grant')
) AS p(permission)
WHERE u.email = 'williamchien.corner@gmail.com'
ON CONFLICT (user_id, permission) DO NOTHING;

-- 4. 暫時關閉 RLS 以提升效能（解決登入慢的問題）
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions DISABLE ROW LEVEL SECURITY;

-- 5. 確認權限已設定
SELECT * FROM user_permissions 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'williamchien.corner@gmail.com'
);