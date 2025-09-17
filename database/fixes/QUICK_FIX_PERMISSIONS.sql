-- 快速修復：簡化權限系統
-- 執行日期：2025-01-21

-- =====================================
-- 1. 更新用戶角色（給員工工作模式權限）
-- =====================================

-- 將所有非 PUBLIC 用戶改為 STAFF（如果他們還不是）
UPDATE public.profiles
SET role = 'STAFF'
WHERE email != 'williamchien.corner@gmail.com'  -- 不是管理員
  AND role = 'PUBLIC';  -- 目前是一般用戶

-- 確認管理員角色
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'williamchien.corner@gmail.com';

-- =====================================
-- 2. 清理不必要的權限資料（簡化系統）
-- =====================================

-- 清空 user_permissions 表（我們只用 role 判斷）
TRUNCATE TABLE public.user_permissions;

-- =====================================
-- 3. 建立簡單的權限定義表（供介面顯示用）
-- =====================================

CREATE TABLE IF NOT EXISTS public.permission_definitions (
    permission TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT
);

-- 插入基本權限定義
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
ON CONFLICT (permission) DO NOTHING;

-- =====================================
-- 4. 驗證修復
-- =====================================

-- 查看所有用戶及角色
SELECT id, email, display_name, role 
FROM public.profiles
ORDER BY created_at;

-- 統計各角色人數
SELECT role, COUNT(*) as count
FROM public.profiles
GROUP BY role;
