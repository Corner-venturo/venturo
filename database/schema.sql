-- VenturoERP 2.0 Database Schema
-- 清空並重建資料庫結構
-- 執行前請確認已備份必要資料

-- =====================================
-- 清理舊資料表
-- =====================================
DROP TABLE IF EXISTS public.todo_conversions CASCADE;
DROP TABLE IF EXISTS public.todos CASCADE;
DROP TABLE IF EXISTS public.timeboxes CASCADE;
DROP TABLE IF EXISTS public.soul_magic CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.project_tasks CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================
-- 核心用戶系統
-- =====================================

-- 用戶 Profile 表（擴展 auth.users）
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (role IN ('ADMIN', 'ASSISTANT', 'ACCOUNTANT', 'SALES', 'STAFF', 'PUBLIC')),
    department TEXT,
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用戶權限表
CREATE TABLE public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, permission)
);

-- =====================================
-- 跨模式共用（生活+工作）
-- =====================================

-- 待辦事項表
CREATE TABLE public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    mode TEXT NOT NULL DEFAULT 'life' CHECK (mode IN ('life', 'work')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    project_id UUID,
    is_private BOOLEAN DEFAULT true,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 待辦轉換記錄表
CREATE TABLE public.todo_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    todo_id UUID REFERENCES public.todos(id) ON DELETE CASCADE,
    converted_to TEXT NOT NULL CHECK (converted_to IN ('order', 'invoice', 'receipt', 'task')),
    entity_id UUID NOT NULL,
    converted_at TIMESTAMPTZ DEFAULT NOW(),
    converted_by UUID REFERENCES auth.users(id)
);

-- =====================================
-- 生活模式專屬
-- =====================================

-- 箱型時間表
CREATE TABLE public.timeboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    actual_start TIME,
    actual_end TIME,
    completion_rate INTEGER CHECK (completion_rate >= 0 AND completion_rate <= 100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 心靈魔法表
CREATE TABLE public.soul_magic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('habit', 'goal', 'ritual', 'affirmation')),
    title TEXT NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}',
    streak_count INTEGER DEFAULT 0,
    last_completed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 英靈測驗結果表
CREATE TABLE public.spirit_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL, -- P000102_0311_120805 格式的編碼

    -- 三高英靈
    primary_god TEXT NOT NULL,
    primary_score INTEGER NOT NULL,
    secondary_god TEXT NOT NULL,
    secondary_score INTEGER NOT NULL,
    tertiary_god TEXT NOT NULL,
    tertiary_score INTEGER NOT NULL,

    -- 二低陰影
    main_shadow TEXT NOT NULL,
    main_shadow_score INTEGER NOT NULL,
    second_shadow TEXT NOT NULL,
    second_shadow_score INTEGER NOT NULL,

    -- 完整分數 JSONB 格式
    full_scores JSONB NOT NULL, -- 12個神祇的完整分數

    -- 測驗資訊
    test_answers JSONB NOT NULL, -- 完整的答題紀錄
    test_duration_minutes INTEGER, -- 測驗時長（分鐘）

    -- 英靈生成內容（管理員回填）
    spirit_generated BOOLEAN DEFAULT false, -- 是否已生成英靈
    spirit_title TEXT, -- 英靈稱號
    spirit_appearance JSONB, -- 外觀描述 {hair, eyes, aura, features}
    spirit_essence TEXT, -- 性格本質
    spirit_amnesia JSONB, -- 失憶設定 {forgotten, impact}
    spirit_growth JSONB, -- 成長預言 {challenge, path, blessing}
    spirit_poem TEXT, -- 靈魂詩籤
    generated_by UUID REFERENCES auth.users(id), -- 生成者
    generated_at TIMESTAMPTZ, -- 生成時間

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 為查詢優化建立索引
CREATE INDEX idx_spirit_profiles_user_id ON public.spirit_profiles(user_id);
CREATE INDEX idx_spirit_profiles_profile_id ON public.spirit_profiles(profile_id);
CREATE INDEX idx_spirit_profiles_primary_god ON public.spirit_profiles(primary_god);

-- =====================================
-- 工作模式
-- =====================================

-- 專案表
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id),
    team_ids UUID[] DEFAULT '{}',
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    visibility TEXT DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'company')),
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 專案任務表
CREATE TABLE public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 業務模組
-- =====================================

-- 客戶表
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 訂單表
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    project_id UUID REFERENCES public.projects(id),
    total_amount DECIMAL(12,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 供應商表
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 財務管理模組
-- =====================================

-- 財務相關枚舉類型
CREATE TYPE asset_type AS ENUM (
  'cash',           -- 現金/錢包
  'bank_account',   -- 銀行帳戶
  'credit_card',    -- 信用卡
  'investment',     -- 投資（股票、基金）
  'insurance',      -- 保險
  'property',       -- 房地產
  'other'           -- 其他資產
);

CREATE TYPE transaction_type AS ENUM (
  'income',         -- 收入
  'expense',        -- 支出
  'transfer',       -- 轉帳
  'adjustment'      -- 調整
);

CREATE TYPE advance_status AS ENUM (
  'pending',        -- 待處理
  'approved',       -- 已批准
  'disbursed',      -- 已撥款
  'reimbursed',     -- 已核銷
  'rejected'        -- 已拒絕
);

-- 資產分類表
CREATE TABLE public.asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 個人資產表
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.asset_categories(id) ON DELETE RESTRICT,
  
  name TEXT NOT NULL,
  description TEXT,
  type asset_type NOT NULL,
  
  -- 帳戶資訊
  account_number TEXT,
  bank_name TEXT,
  currency TEXT DEFAULT 'TWD',
  
  -- 金額資訊
  balance DECIMAL(15, 2) DEFAULT 0,
  credit_limit DECIMAL(15, 2),
  available_credit DECIMAL(15, 2),
  
  -- 投資相關
  cost_basis DECIMAL(15, 2),
  current_value DECIMAL(15, 2),
  
  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  
  -- 同步設定
  auto_sync BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  
  -- 元資料
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 預算分類表
CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.budget_categories(id),
  
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#10B981',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 預算表
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- 預算期間
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- 預算金額
  planned_amount DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
  
  -- 遊戲化元素
  target_savings DECIMAL(12, 2),
  achievement_level INTEGER DEFAULT 1,
  bonus_exp INTEGER DEFAULT 0,
  
  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'monthly', 'quarterly', etc.
  
  -- 提醒設定
  alert_threshold DECIMAL(3, 2) DEFAULT 0.8, -- 80% 時提醒
  alert_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收支交易表
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 關聯資產
  from_asset_id UUID REFERENCES public.assets(id),
  to_asset_id UUID REFERENCES public.assets(id),
  
  -- 預算分類
  budget_category_id UUID REFERENCES public.budget_categories(id),
  
  -- 基本資訊
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TWD',
  type transaction_type NOT NULL,
  
  -- 日期
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- 標籤和分類
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  
  -- 收據和證明
  receipt_url TEXT,
  receipt_data JSONB DEFAULT '{}',
  
  -- 關聯墊款或核銷
  advance_id UUID REFERENCES public.advances(id),
  reimbursement_id UUID REFERENCES public.reimbursements(id),
  
  -- 遊戲化
  exp_earned INTEGER DEFAULT 1,
  achievement_unlocked TEXT[],
  
  -- 狀態
  is_verified BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  
  -- 元資料
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 墊款表（公司墊款管理）
CREATE TABLE public.advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id),
  
  -- 基本資訊
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TWD',
  
  -- 用途
  purpose TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  expected_date DATE,
  
  -- 狀態管理
  status advance_status DEFAULT 'pending',
  
  -- 審批流程
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  due_date DATE,
  
  -- 核銷相關
  reimbursed_amount DECIMAL(12, 2) DEFAULT 0,
  outstanding_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - reimbursed_amount) STORED,
  
  -- 文件和備註
  documents JSONB DEFAULT '{}',
  approval_notes TEXT,
  
  -- 角落API整合
  corner_reference_id TEXT,
  corner_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 核銷表
CREATE TABLE public.reimbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advance_id UUID REFERENCES public.advances(id),
  
  -- 基本資訊
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- 狀態
  status advance_status DEFAULT 'pending',
  
  -- 審批
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  
  -- 文件
  receipts JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  
  -- 備註
  notes TEXT,
  approval_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 財務目標表（遊戲化元素）
CREATE TABLE public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- 期限
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  
  -- 遊戲化
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  reward_exp INTEGER DEFAULT 100,
  milestone_rewards JSONB DEFAULT '{}',
  
  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- RLS (Row Level Security) 政策
-- =====================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_magic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Profiles: 用戶可以查看自己的資料，管理員可以查看所有
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Todos: 用戶可以管理自己的待辦，工作模式的待辦根據權限共享
CREATE POLICY "Users can manage own todos" ON public.todos
    FOR ALL USING (
        user_id = auth.uid() OR
        (mode = 'work' AND NOT is_private AND EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = todos.project_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_ids))
        ))
    );

-- Timeboxes: 完全私人
CREATE POLICY "Users can manage own timeboxes" ON public.timeboxes
    FOR ALL USING (user_id = auth.uid());

-- Soul Magic: 完全私人
CREATE POLICY "Users can manage own soul magic" ON public.soul_magic
    FOR ALL USING (user_id = auth.uid());

-- Projects: 根據可見度和團隊成員
CREATE POLICY "Project visibility policy" ON public.projects
    FOR SELECT USING (
        owner_id = auth.uid() OR
        auth.uid() = ANY(team_ids) OR
        visibility = 'company' OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'ASSISTANT')
        )
    );

-- 財務相關政策（個人資料，只能管理自己的）
CREATE POLICY "Users can manage own asset categories" ON public.asset_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assets" ON public.assets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budget categories" ON public.budget_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own financial goals" ON public.financial_goals
  FOR ALL USING (auth.uid() = user_id);

-- 墊款政策（可以看到自己申請的，管理員可以看到所有）
CREATE POLICY "Users can see own advances" ON public.advances
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'ASSISTANT')
    )
  );

CREATE POLICY "Users can create advances" ON public.advances
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Managers can update advances" ON public.advances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'ASSISTANT')
    )
  );

-- 核銷政策（同墊款）
CREATE POLICY "Users can see relevant reimbursements" ON public.reimbursements
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'ASSISTANT')
    )
  );

CREATE POLICY "Users can create reimbursements" ON public.reimbursements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================
-- 觸發器和函數
-- =====================================

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為所有需要的表創建觸發器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON public.todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeboxes_updated_at BEFORE UPDATE ON public.timeboxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soul_magic_updated_at BEFORE UPDATE ON public.soul_magic
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON public.asset_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON public.budget_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advances_updated_at BEFORE UPDATE ON public.advances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reimbursements_updated_at BEFORE UPDATE ON public.reimbursements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON public.financial_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- 財務專用觸發器和函數
-- =====================================

-- 觸發器：記帳時更新預算支出
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- 只有支出類型才更新預算
  IF NEW.type = 'expense' AND NEW.budget_category_id IS NOT NULL THEN
    UPDATE public.budgets 
    SET spent_amount = spent_amount + NEW.amount
    WHERE category_id = NEW.budget_category_id
      AND period_start <= NEW.transaction_date 
      AND period_end >= NEW.transaction_date
      AND user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_budget_on_transaction 
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- 觸發器：資產餘額更新
CREATE OR REPLACE FUNCTION update_asset_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新來源資產餘額（支出）
  IF NEW.from_asset_id IS NOT NULL THEN
    UPDATE public.assets 
    SET balance = balance - NEW.amount
    WHERE id = NEW.from_asset_id;
  END IF;
  
  -- 更新目標資產餘額（收入）
  IF NEW.to_asset_id IS NOT NULL THEN
    UPDATE public.assets 
    SET balance = balance + NEW.amount
    WHERE id = NEW.to_asset_id;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_asset_balance_on_transaction 
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_asset_balance();

-- 檢視：財務總覽
CREATE VIEW financial_overview AS
SELECT 
  p.id,
  p.display_name,
  
  -- 資產總計
  COALESCE(SUM(a.balance) FILTER (WHERE a.type = 'cash'), 0) as total_cash,
  COALESCE(SUM(a.balance) FILTER (WHERE a.type = 'bank_account'), 0) as total_bank,
  COALESCE(SUM(a.current_value) FILTER (WHERE a.type = 'investment'), 0) as total_investment,
  COALESCE(SUM(a.balance), 0) as total_assets,
  
  -- 本月預算使用情況
  COALESCE(SUM(b.planned_amount) FILTER (
    WHERE b.period_start <= CURRENT_DATE 
    AND b.period_end >= CURRENT_DATE
  ), 0) as monthly_budget,
  
  COALESCE(SUM(b.spent_amount) FILTER (
    WHERE b.period_start <= CURRENT_DATE 
    AND b.period_end >= CURRENT_DATE
  ), 0) as monthly_spent,
  
  -- 本月收支
  COALESCE(SUM(t.amount) FILTER (
    WHERE t.type = 'income' 
    AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
  ), 0) as monthly_income,
  
  COALESCE(SUM(t.amount) FILTER (
    WHERE t.type = 'expense' 
    AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
  ), 0) as monthly_expense

FROM public.profiles p
LEFT JOIN public.assets a ON p.id = a.user_id AND a.is_active = true
LEFT JOIN public.budgets b ON p.id = b.user_id AND b.is_active = true
LEFT JOIN public.transactions t ON p.id = t.user_id
GROUP BY p.id, p.display_name;

-- 索引優化
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_assets_type ON public.assets(type);
CREATE INDEX idx_assets_active ON public.assets(is_active) WHERE is_active = true;

CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_period ON public.budgets(period_start, period_end);
CREATE INDEX idx_budgets_active ON public.budgets(is_active) WHERE is_active = true;

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_budget_category ON public.transactions(budget_category_id);

CREATE INDEX idx_advances_user_id ON public.advances(user_id);
CREATE INDEX idx_advances_status ON public.advances(status);
CREATE INDEX idx_advances_requester ON public.advances(requester_id);

CREATE INDEX idx_reimbursements_user_id ON public.reimbursements(user_id);
CREATE INDEX idx_reimbursements_advance ON public.reimbursements(advance_id);

-- =====================================
-- 初始資料（可選）
-- =====================================

-- 建立管理員帳號後，更新其角色
-- UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'admin@venturo.com';
