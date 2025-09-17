-- =====================================
-- CornerERP 相容性資料庫表
-- 100% 相容於 CornerERP 原始架構
-- =====================================

-- =====================================
-- 客戶管理表 (Customers)
-- =====================================
CREATE TABLE public.customers (
    id TEXT PRIMARY KEY,                           -- 客戶ID (與 CornerERP 相同)
    name TEXT NOT NULL,                           -- 姓名
    birthday TEXT,                                -- 生日 (YYYY-MM-DD 格式)
    passport_romanization TEXT,                   -- 護照羅馬拼音
    passport_number TEXT,                         -- 護照號碼
    passport_valid_to TEXT,                      -- 護照有效期 (YYYY-MM-DD 格式)
    email TEXT,                                  -- 電子郵件
    phone TEXT,                                  -- 電話
    note TEXT,                                   -- 備註
    created_at TIMESTAMPTZ DEFAULT NOW(),        -- 創建時間
    created_by TEXT NOT NULL,                    -- 創建人員
    modified_at TIMESTAMPTZ,                     -- 修改時間
    modified_by TEXT                             -- 修改人員
);

-- =====================================
-- 旅遊團管理表 (Groups)
-- =====================================
CREATE TABLE public.groups (
    group_code TEXT PRIMARY KEY,                 -- 團號 (與 CornerERP 相同)
    group_name TEXT NOT NULL,                    -- 團名
    departure_date TIMESTAMPTZ NOT NULL,         -- 出發日期
    return_date TIMESTAMPTZ NOT NULL,            -- 回程日期
    customer_count INTEGER DEFAULT 0,            -- 旅客數量
    traveller_ids TEXT[] DEFAULT ARRAY[]::TEXT[], -- 旅客ID陣列
    sales_person TEXT,                           -- 業務員
    op_id TEXT,                                  -- OP員
    status INTEGER DEFAULT 0,                    -- 團狀態 (0=進行中, 1=已結團, 2=特殊團)
    branch_bonus NUMERIC(10,2),                  -- 分公司獎金比例
    sale_bonus NUMERIC(10,2),                    -- 業務獎金比例
    op_bonus NUMERIC(10,2),                      -- OP獎金比例
    profit_tax NUMERIC(12,2),                    -- 營收稅額
    created_at TIMESTAMPTZ DEFAULT NOW(),        -- 創建時間
    created_by TEXT NOT NULL,                    -- 創建人員
    modified_at TIMESTAMPTZ,                     -- 修改時間
    modified_by TEXT                             -- 修改人員
);

-- =====================================
-- 訂單管理表 (Orders)
-- =====================================
CREATE TABLE public.orders (
    order_number TEXT PRIMARY KEY,               -- 訂單編號 (與 CornerERP 相同)
    group_code TEXT NOT NULL,                    -- 關聯團號
    group_name TEXT,                             -- 團名 (冗餘欄位，加速查詢)
    contact_person TEXT NOT NULL,                -- 聯絡人
    contact_phone TEXT NOT NULL,                 -- 聯絡電話
    order_type TEXT NOT NULL,                    -- 訂單類型
    sales_person TEXT NOT NULL,                  -- 業務員
    op_id TEXT,                                  -- OP員
    total_amount NUMERIC(12,2),                  -- 總金額
    paid_amount NUMERIC(12,2) DEFAULT 0,         -- 已付金額
    remaining_amount NUMERIC(12,2),              -- 剩餘金額
    payment_status TEXT DEFAULT 'PENDING',       -- 付款狀態 (PENDING, PARTIAL, PAID, REFUNDED, OVERDUE)
    created_at TIMESTAMPTZ DEFAULT NOW(),        -- 創建時間
    created_by TEXT NOT NULL,                    -- 創建人員
    modified_at TIMESTAMPTZ,                     -- 修改時間
    modified_by TEXT,                            -- 修改人員

    -- 外鍵約束
    CONSTRAINT fk_orders_group_code FOREIGN KEY (group_code) REFERENCES public.groups(group_code)
);

-- =====================================
-- 收款單管理表 (Receipts)
-- =====================================
CREATE TABLE public.receipts (
    receipt_number TEXT PRIMARY KEY,             -- 收款單號 (與 CornerERP 相同)
    order_number TEXT NOT NULL,                  -- 關聯訂單編號
    receipt_date TIMESTAMPTZ NOT NULL,           -- 收款日期
    receipt_amount NUMERIC(12,2) NOT NULL,       -- 收款金額
    actual_amount NUMERIC(12,2) NOT NULL,        -- 實收金額
    receipt_type TEXT,                           -- 付款方式 (現金、轉帳、支票等，不含刷卡)
    receipt_account TEXT DEFAULT '',             -- 收款帳號
    email TEXT DEFAULT '',                       -- 收款Email
    pay_dateline TIMESTAMPTZ,                    -- 付款截止日
    note TEXT DEFAULT '',                        -- 備註
    status INTEGER DEFAULT 0,                    -- 狀態 (0=待確認, 1=已確認, 2=已出帳)
    created_at TIMESTAMPTZ DEFAULT NOW(),        -- 創建時間
    created_by TEXT NOT NULL,                    -- 創建人員
    modified_at TIMESTAMPTZ,                     -- 修改時間
    modified_by TEXT,                            -- 修改人員

    -- 外鍵約束
    CONSTRAINT fk_receipts_order_number FOREIGN KEY (order_number) REFERENCES public.orders(order_number)
);

-- =====================================
-- 請款單管理表 (Invoices)
-- =====================================
CREATE TABLE public.invoices (
    invoice_number TEXT PRIMARY KEY,             -- 請款單號 (與 CornerERP 相同)
    group_code TEXT NOT NULL,                    -- 關聯團號
    order_number TEXT,                           -- 關聯訂單編號 (可選)
    invoice_date TIMESTAMPTZ NOT NULL,           -- 請款日期
    status INTEGER DEFAULT 0,                    -- 狀態 (0=待確認, 1=已確認, 2=已出帳)
    amount NUMERIC(12,2),                        -- 總金額
    created_at TIMESTAMPTZ DEFAULT NOW(),        -- 創建時間
    created_by TEXT NOT NULL,                    -- 創建人員
    modified_at TIMESTAMPTZ,                     -- 修改時間
    modified_by TEXT,                            -- 修改人員

    -- 外鍵約束
    CONSTRAINT fk_invoices_group_code FOREIGN KEY (group_code) REFERENCES public.groups(group_code),
    CONSTRAINT fk_invoices_order_number FOREIGN KEY (order_number) REFERENCES public.orders(order_number)
);

-- =====================================
-- 請款項目明細表 (Invoice Items)
-- =====================================
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,                -- 關聯請款單號
    invoice_type INTEGER NOT NULL,               -- 請款類型
    pay_for TEXT NOT NULL,                       -- 付款供應商代號
    supplier_name TEXT,                          -- 供應商名稱 (冗餘欄位)
    price NUMERIC(12,2) NOT NULL,                -- 價格
    quantity INTEGER NOT NULL DEFAULT 1,         -- 數量
    note TEXT,                                   -- 備註
    created_at TIMESTAMPTZ DEFAULT NOW(),        -- 創建時間

    -- 外鍵約束
    CONSTRAINT fk_invoice_items_invoice_number FOREIGN KEY (invoice_number) REFERENCES public.invoices(invoice_number) ON DELETE CASCADE
);

-- =====================================
-- 供應商管理表 (Suppliers)
-- =====================================
CREATE TABLE public.suppliers (
    supplier_code TEXT PRIMARY KEY,              -- 供應商代號 (與 CornerERP 相同)
    supplier_name TEXT NOT NULL,                 -- 供應商名稱
    contact_person TEXT,                         -- 聯絡人
    contact_phone TEXT,                          -- 聯絡電話
    contact_email TEXT,                          -- 聯絡Email
    address TEXT,                                -- 地址
    tax_id TEXT,                                 -- 統一編號
    bank_account TEXT,                           -- 銀行帳號
    note TEXT,                                   -- 備註
    is_active BOOLEAN DEFAULT true,              -- 是否啟用
    created_at TIMESTAMPTZ DEFAULT NOW(),        -- 創建時間
    created_by TEXT NOT NULL,                    -- 創建人員
    modified_at TIMESTAMPTZ,                     -- 修改時間
    modified_by TEXT                             -- 修改人員
);

-- =====================================
-- 建立索引以提升查詢效能
-- =====================================

-- Customers 索引
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_created_at ON public.customers(created_at);

-- Groups 索引
CREATE INDEX idx_groups_group_name ON public.groups(group_name);
CREATE INDEX idx_groups_departure_date ON public.groups(departure_date);
CREATE INDEX idx_groups_return_date ON public.groups(return_date);
CREATE INDEX idx_groups_sales_person ON public.groups(sales_person);
CREATE INDEX idx_groups_op_id ON public.groups(op_id);
CREATE INDEX idx_groups_status ON public.groups(status);
CREATE INDEX idx_groups_created_at ON public.groups(created_at);

-- Orders 索引
CREATE INDEX idx_orders_group_code ON public.orders(group_code);
CREATE INDEX idx_orders_contact_person ON public.orders(contact_person);
CREATE INDEX idx_orders_sales_person ON public.orders(sales_person);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);

-- Receipts 索引
CREATE INDEX idx_receipts_order_number ON public.receipts(order_number);
CREATE INDEX idx_receipts_receipt_date ON public.receipts(receipt_date);
CREATE INDEX idx_receipts_status ON public.receipts(status);
CREATE INDEX idx_receipts_created_at ON public.receipts(created_at);

-- Invoices 索引
CREATE INDEX idx_invoices_group_code ON public.invoices(group_code);
CREATE INDEX idx_invoices_order_number ON public.invoices(order_number);
CREATE INDEX idx_invoices_invoice_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_created_at ON public.invoices(created_at);

-- Invoice Items 索引
CREATE INDEX idx_invoice_items_invoice_number ON public.invoice_items(invoice_number);
CREATE INDEX idx_invoice_items_supplier_code ON public.invoice_items(pay_for);

-- Suppliers 索引
CREATE INDEX idx_suppliers_supplier_name ON public.suppliers(supplier_name);
CREATE INDEX idx_suppliers_is_active ON public.suppliers(is_active);
CREATE INDEX idx_suppliers_created_at ON public.suppliers(created_at);

-- =====================================
-- Row Level Security (RLS) 政策
-- =====================================

-- 啟用 RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Customers 政策
CREATE POLICY "Users can view customers if they have permission" ON public.customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('customers.view', 'admin.full')
        )
    );

CREATE POLICY "Users can manage customers if they have permission" ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('customers.manage', 'admin.full')
        )
    );

-- Groups 政策
CREATE POLICY "Users can view groups if they have permission" ON public.groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('groups.view', 'admin.full')
        )
    );

CREATE POLICY "Users can manage groups if they have permission" ON public.groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('groups.manage', 'admin.full')
        )
    );

-- Orders 政策
CREATE POLICY "Users can view orders if they have permission" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('orders.view', 'admin.full')
        )
    );

CREATE POLICY "Users can manage orders if they have permission" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('orders.manage', 'admin.full')
        )
    );

-- Receipts 政策
CREATE POLICY "Users can view receipts if they have permission" ON public.receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('receipts.view', 'finance.view', 'admin.full')
        )
    );

CREATE POLICY "Users can manage receipts if they have permission" ON public.receipts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('receipts.manage', 'finance.manage', 'admin.full')
        )
    );

-- Invoices 政策
CREATE POLICY "Users can view invoices if they have permission" ON public.invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('invoices.view', 'finance.view', 'admin.full')
        )
    );

CREATE POLICY "Users can manage invoices if they have permission" ON public.invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('invoices.manage', 'finance.manage', 'admin.full')
        )
    );

-- Invoice Items 政策 (跟隨 Invoices)
CREATE POLICY "Users can view invoice items if they can view invoices" ON public.invoice_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('invoices.view', 'finance.view', 'admin.full')
        )
    );

CREATE POLICY "Users can manage invoice items if they can manage invoices" ON public.invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('invoices.manage', 'finance.manage', 'admin.full')
        )
    );

-- Suppliers 政策
CREATE POLICY "Users can view suppliers if they have permission" ON public.suppliers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('suppliers.view', 'admin.full')
        )
    );

CREATE POLICY "Users can manage suppliers if they have permission" ON public.suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission IN ('suppliers.manage', 'admin.full')
        )
    );

-- =====================================
-- 觸發器：自動更新 modified_at 時間戳
-- =====================================

CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為每個表建立觸發器
CREATE TRIGGER update_customers_modified_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_groups_modified_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_orders_modified_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_receipts_modified_at
    BEFORE UPDATE ON public.receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_invoices_modified_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_suppliers_modified_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

-- =====================================
-- 視圖：簡化複雜查詢
-- =====================================

-- 訂單完整資訊視圖 (包含旅遊團資訊)
CREATE VIEW public.orders_with_group_info AS
SELECT
    o.*,
    g.group_name as full_group_name,
    g.departure_date,
    g.return_date,
    g.sales_person as group_sales_person,
    g.op_id as group_op_id,
    g.status as group_status
FROM public.orders o
LEFT JOIN public.groups g ON o.group_code = g.group_code;

-- 收款單完整資訊視圖 (包含訂單和旅遊團資訊)
CREATE VIEW public.receipts_with_full_info AS
SELECT
    r.*,
    o.group_code,
    o.contact_person,
    o.sales_person,
    g.group_name,
    g.departure_date,
    g.return_date
FROM public.receipts r
LEFT JOIN public.orders o ON r.order_number = o.order_number
LEFT JOIN public.groups g ON o.group_code = g.group_code;

-- 請款單完整資訊視圖 (包含項目明細)
CREATE VIEW public.invoices_with_items AS
SELECT
    i.*,
    g.group_name,
    g.departure_date,
    g.return_date,
    COALESCE(item_count.total_items, 0) as total_items,
    COALESCE(item_count.total_amount, 0) as calculated_amount
FROM public.invoices i
LEFT JOIN public.groups g ON i.group_code = g.group_code
LEFT JOIN (
    SELECT
        invoice_number,
        COUNT(*) as total_items,
        SUM(price * quantity) as total_amount
    FROM public.invoice_items
    GROUP BY invoice_number
) item_count ON i.invoice_number = item_count.invoice_number;

-- =====================================
-- 初始化基礎權限資料
-- =====================================

-- 插入管理員權限 (等待實際管理員 UUID)
-- INSERT INTO public.user_permissions (user_id, permission, granted_by) VALUES
-- ('admin-uuid-here', 'admin.full', 'admin-uuid-here');

-- =====================================
-- 完成
-- =====================================

-- 顯示完成訊息
DO $$
BEGIN
    RAISE NOTICE '✅ CornerERP 相容性資料庫表建立完成！';
    RAISE NOTICE '📊 建立了以下表格:';
    RAISE NOTICE '   • customers (客戶管理)';
    RAISE NOTICE '   • groups (旅遊團管理)';
    RAISE NOTICE '   • orders (訂單管理)';
    RAISE NOTICE '   • receipts (收款單管理)';
    RAISE NOTICE '   • invoices (請款單管理)';
    RAISE NOTICE '   • invoice_items (請款項目明細)';
    RAISE NOTICE '   • suppliers (供應商管理)';
    RAISE NOTICE '🔒 所有表格已啟用 Row Level Security';
    RAISE NOTICE '📈 已建立效能優化索引';
    RAISE NOTICE '🔄 已設定自動時間戳更新觸發器';
    RAISE NOTICE '👁️ 已建立便利查詢視圖';
    RAISE NOTICE '';
    RAISE NOTICE '📋 下一步：執行資料匯入測試';
END $$;