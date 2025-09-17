-- =====================================
-- VenturoERP 權限系統設定
-- 執行這個來建立權限系統
-- =====================================

-- 1. 建立新用戶自動設定的函數
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 建立用戶 profile
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'PUBLIC'  -- 預設角色（用於顯示）
  );
  
  -- 授予基本權限（所有新用戶的預設權限）
  INSERT INTO public.user_permissions (user_id, permission, granted_by)
  VALUES 
    -- 基本功能權限
    (NEW.id, 'todos.create', NEW.id),
    (NEW.id, 'todos.update', NEW.id),
    (NEW.id, 'todos.delete', NEW.id),
    (NEW.id, 'todos.view', NEW.id),
    
    -- 生活模式權限（所有人都有）
    (NEW.id, 'mode.life', NEW.id),
    (NEW.id, 'timebox.use', NEW.id),
    (NEW.id, 'soulmagic.use', NEW.id),
    (NEW.id, 'finance.personal', NEW.id),
    (NEW.id, 'calendar.personal', NEW.id);
    
    -- 注意：沒有給 mode.work，需要另外授予
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 綁定觸發器到 auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. 建立權限定義表（用於管理介面）
CREATE TABLE IF NOT EXISTS public.permission_definitions (
  permission TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  required_role TEXT,  -- 最低需要的角色（可選）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 插入權限定義
INSERT INTO public.permission_definitions (permission, category, label, description) VALUES
  -- 模式權限
  ('mode.life', '模式', '生活模式', '使用生活模式功能'),
  ('mode.work', '模式', '工作模式', '使用工作模式功能'),
  
  -- 待辦權限
  ('todos.create', '待辦事項', '建立待辦', '建立新的待辦事項'),
  ('todos.update', '待辦事項', '更新待辦', '編輯待辦事項'),
  ('todos.delete', '待辦事項', '刪除待辦', '刪除待辦事項'),
  ('todos.view', '待辦事項', '查看待辦', '查看待辦事項'),
  ('todos.convert', '待辦事項', '轉換待辦', '將待辦轉為訂單或專案'),
  
  -- 專案權限
  ('projects.create', '專案管理', '建立專案', '建立新專案'),
  ('projects.manage', '專案管理', '管理專案', '管理專案設定和團隊'),
  ('projects.view', '專案管理', '查看專案', '查看專案資訊'),
  ('projects.view_all', '專案管理', '查看所有專案', '查看公司所有專案'),
  
  -- 業務權限
  ('orders.create', '訂單管理', '建立訂單', '建立新訂單'),
  ('orders.update', '訂單管理', '更新訂單', '編輯訂單資訊'),
  ('orders.delete', '訂單管理', '刪除訂單', '刪除訂單'),
  ('orders.approve', '訂單管理', '審核訂單', '審核和批准訂單'),
  
  ('customers.create', '客戶管理', '建立客戶', '新增客戶資料'),
  ('customers.update', '客戶管理', '更新客戶', '編輯客戶資料'),
  ('customers.delete', '客戶管理', '刪除客戶', '刪除客戶資料'),
  ('customers.view_all', '客戶管理', '查看所有客戶', '查看所有客戶資料'),
  
  -- 財務權限
  ('finance.personal', '財務', '個人財務', '管理個人財務'),
  ('finance.company', '財務', '公司財務', '查看公司財務'),
  ('finance.approve', '財務', '財務審核', '審核財務單據'),
  
  -- 管理權限
  ('users.view', '系統管理', '查看用戶', '查看用戶列表'),
  ('users.manage', '系統管理', '管理用戶', '管理用戶帳號'),
  ('permissions.grant', '系統管理', '授予權限', '授予或撤銷權限'),
  ('system.admin', '系統管理', '系統管理', '最高管理權限')
ON CONFLICT (permission) DO UPDATE SET
  category = EXCLUDED.category,
  label = EXCLUDED.label,
  description = EXCLUDED.description;

-- 5. 為現有用戶補充權限（如果他們沒有）
INSERT INTO public.user_permissions (user_id, permission, granted_by)
SELECT 
  p.id as user_id,
  perm.permission,
  p.id as granted_by
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('todos.create'),
    ('todos.update'),
    ('todos.delete'),
    ('todos.view'),
    ('mode.life')
) as perm(permission)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_permissions up 
  WHERE up.user_id = p.id AND up.permission = perm.permission
);

-- 6. 給管理員完整權限
DO $
DECLARE
  admin_id UUID;
BEGIN
  -- 找到管理員 ID
  SELECT id INTO admin_id FROM public.profiles WHERE email = 'williamchien.corner@gmail.com';
  
  IF admin_id IS NOT NULL THEN
    -- 授予所有權限
    INSERT INTO public.user_permissions (user_id, permission, granted_by)
    SELECT admin_id, permission, admin_id
    FROM public.permission_definitions
    ON CONFLICT (user_id, permission) DO NOTHING;
    
    -- 更新角色為 ADMIN
    UPDATE public.profiles SET role = 'ADMIN' WHERE id = admin_id;
  END IF;
END $;

-- 7. 建立權限檢查函數（供 RLS 使用）
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_permissions.user_id = $1 
    AND permission = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 更新 RLS 政策以使用權限
-- 例如：只有有 'todos.view' 權限的人才能看待辦
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
CREATE POLICY "Users can view todos with permission" ON public.todos
  FOR SELECT 
  USING (
    user_id = auth.uid() 
    AND user_has_permission(auth.uid(), 'todos.view')
  );

-- 測試查詢
SELECT 
  p.email,
  p.role,
  array_agg(up.permission ORDER BY up.permission) as permissions
FROM public.profiles p
LEFT JOIN public.user_permissions up ON p.id = up.user_id
GROUP BY p.id, p.email, p.role;
