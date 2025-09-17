-- =====================================
-- VenturoERP 2.0 核心業務模組資料庫架構
-- 從 cornerERP 移植的 5 個核心業務模組
-- =====================================

-- =====================================
-- 1. 顧客管理 (Customers)
-- =====================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    birthday DATE,
    passport_romanization TEXT, -- 護照羅馬拼音
    passport_number TEXT,       -- 護照號碼
    passport_valid_to DATE,     -- 護照有效期
    email TEXT,
    phone TEXT,
    note TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 顧客索引
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON public.customers(birthday);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- =====================================
-- 2. 旅遊團管理 (Groups)
-- =====================================

CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_code TEXT UNIQUE NOT NULL,    -- 團號
    group_name TEXT NOT NULL,           -- 團名
    departure_date DATE NOT NULL,       -- 出發日
    return_date DATE NOT NULL,          -- 回程日期
    customer_count INTEGER DEFAULT 0,   -- 旅客數量
    traveller_ids UUID[] DEFAULT '{}',  -- 旅客ID陣列
    sales_person TEXT,                  -- 業務員
    op_id UUID REFERENCES auth.users(id), -- OP員
    op_name TEXT,                       -- OP員顯示名稱
    status INTEGER DEFAULT 0,           -- 團狀態 0:進行中 1:已結團 9:特殊團
    branch_bonus DECIMAL(5,2) DEFAULT 0, -- 分公司獎金比例
    sales_bonus DECIMAL(5,2) DEFAULT 0,  -- 業務獎金比例
    op_bonus DECIMAL(5,2) DEFAULT 0,     -- OP獎金比例
    profit_tax DECIMAL(10,2) DEFAULT 0,  -- 營收稅額
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 旅遊團索引
CREATE INDEX IF NOT EXISTS idx_groups_code ON public.groups(group_code);
CREATE INDEX IF NOT EXISTS idx_groups_departure_date ON public.groups(departure_date);
CREATE INDEX IF NOT EXISTS idx_groups_return_date ON public.groups(return_date);
CREATE INDEX IF NOT EXISTS idx_groups_status ON public.groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_sales_person ON public.groups(sales_person);

-- =====================================
-- 3. 旅遊團與顧客關聯表
-- =====================================

CREATE TABLE IF NOT EXISTS public.group_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(group_id, customer_id)
);

-- 關聯表索引
CREATE INDEX IF NOT EXISTS idx_group_customers_group ON public.group_customers(group_id);
CREATE INDEX IF NOT EXISTS idx_group_customers_customer ON public.group_customers(customer_id);

-- =====================================
-- 4. 訂單管理 (Orders)
-- =====================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,  -- 訂單編號
    group_id UUID REFERENCES public.groups(id), -- 關聯旅遊團
    group_code TEXT,                    -- 團號 (冗余字段便於查詢)
    group_name TEXT,                    -- 團名 (冗余字段)
    contact_person TEXT NOT NULL,       -- 聯絡人
    contact_phone TEXT NOT NULL,        -- 聯絡電話
    order_type TEXT NOT NULL,           -- 訂單類型
    sales_person TEXT,                  -- 業務員
    op_id UUID REFERENCES auth.users(id), -- OP員
    order_date DATE DEFAULT CURRENT_DATE, -- 訂單日期
    total_amount DECIMAL(10,2) DEFAULT 0, -- 訂單總額
    status INTEGER DEFAULT 0,           -- 訂單狀態
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 訂單索引
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_group_id ON public.orders(group_id);
CREATE INDEX IF NOT EXISTS idx_orders_group_code ON public.orders(group_code);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_sales_person ON public.orders(sales_person);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);

-- =====================================
-- 5. 供應商管理 (Suppliers)
-- =====================================

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code TEXT UNIQUE NOT NULL, -- 供應商代號
    supplier_name TEXT NOT NULL,        -- 供應商名稱
    contact_person TEXT,                -- 聯絡人
    contact_phone TEXT,                 -- 聯絡電話
    contact_email TEXT,                 -- 聯絡郵箱
    address TEXT,                       -- 地址
    tax_number TEXT,                    -- 統一編號
    payment_terms TEXT,                 -- 付款條件
    note TEXT,                          -- 備註
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 供應商索引
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON public.suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(supplier_name);

-- =====================================
-- 6. 請款單 (Invoices)
-- =====================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL, -- 請款單號
    group_id UUID REFERENCES public.groups(id), -- 關聯旅遊團
    group_code TEXT,                     -- 團號
    group_name TEXT,                     -- 團名
    order_id UUID REFERENCES public.orders(id), -- 關聯訂單
    order_number TEXT,                   -- 訂單編號
    invoice_date DATE NOT NULL,          -- 請款日期
    status INTEGER DEFAULT 0,            -- 0:待確認 1:已確認 2:已出帳
    total_amount DECIMAL(10,2) DEFAULT 0, -- 總金額
    note TEXT,                           -- 備註
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 請款單索引
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_group_id ON public.invoices(group_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);

-- =====================================
-- 7. 請款項目明細 (Invoice Items)
-- =====================================

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    invoice_number TEXT,                 -- 請款單號 (冗余)
    invoice_type INTEGER NOT NULL,       -- 請款類型
    supplier_id UUID REFERENCES public.suppliers(id), -- 供應商
    supplier_code TEXT,                  -- 供應商代號
    supplier_name TEXT,                  -- 供應商名稱
    price DECIMAL(10,2) NOT NULL,        -- 價格
    quantity INTEGER DEFAULT 1,          -- 數量
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (price * quantity) STORED, -- 小計
    note TEXT,                           -- 備註
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 請款項目索引
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_supplier ON public.invoice_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_type ON public.invoice_items(invoice_type);

-- =====================================
-- 8. 收款單 (Receipts)
-- =====================================

CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT UNIQUE NOT NULL, -- 收款單號
    order_id UUID REFERENCES public.orders(id), -- 關聯訂單
    order_number TEXT,                   -- 訂單編號
    group_id UUID REFERENCES public.groups(id), -- 關聯旅遊團
    group_code TEXT,                     -- 團號
    group_name TEXT,                     -- 團名
    amount DECIMAL(10,2) NOT NULL,       -- 收款金額
    receipt_date DATE NOT NULL,          -- 收款日期
    payment_method TEXT NOT NULL,        -- 付款方式
    reference_number TEXT,               -- 參考號碼
    status INTEGER DEFAULT 0,            -- 收款狀態 0:待確認 1:已確認
    note TEXT,                           -- 備註
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 收款單索引
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_order_id ON public.receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_group_id ON public.receipts(group_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON public.receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_method ON public.receipts(payment_method);

-- =====================================
-- RLS (Row Level Security) 政策
-- =====================================

-- 顧客表 RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Users can insert customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update customers" ON public.customers FOR UPDATE USING (auth.uid() = updated_by OR auth.uid() = created_by);
CREATE POLICY "Users can delete customers" ON public.customers FOR DELETE USING (auth.uid() = created_by);

-- 旅遊團表 RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Users can insert groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update groups" ON public.groups FOR UPDATE USING (auth.uid() = updated_by OR auth.uid() = created_by);
CREATE POLICY "Users can delete groups" ON public.groups FOR DELETE USING (auth.uid() = created_by);

-- 關聯表 RLS
ALTER TABLE public.group_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage group_customers" ON public.group_customers FOR ALL USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- 訂單表 RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update orders" ON public.orders FOR UPDATE USING (auth.uid() = updated_by OR auth.uid() = created_by);
CREATE POLICY "Users can delete orders" ON public.orders FOR DELETE USING (auth.uid() = created_by);

-- 供應商表 RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Users can insert suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = updated_by OR auth.uid() = created_by);
CREATE POLICY "Users can delete suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = created_by);

-- 請款單表 RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Users can insert invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update invoices" ON public.invoices FOR UPDATE USING (auth.uid() = updated_by OR auth.uid() = created_by);
CREATE POLICY "Users can delete invoices" ON public.invoices FOR DELETE USING (auth.uid() = created_by);

-- 請款項目 RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage invoice_items" ON public.invoice_items FOR ALL USING (auth.uid() IS NOT NULL);

-- 收款單表 RLS
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view receipts" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Users can insert receipts" ON public.receipts FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update receipts" ON public.receipts FOR UPDATE USING (auth.uid() = updated_by OR auth.uid() = created_by);
CREATE POLICY "Users can delete receipts" ON public.receipts FOR DELETE USING (auth.uid() = created_by);

-- =====================================
-- 觸發器：自動更新 updated_at
-- =====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為所有表添加更新觸發器
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- 視圖：業務查詢優化
-- =====================================

-- 完整訂單視圖 (包含關聯資料)
CREATE OR REPLACE VIEW public.orders_with_details AS
SELECT
    o.*,
    g.group_name,
    g.departure_date,
    g.return_date,
    g.customer_count,
    (SELECT COUNT(*) FROM public.invoices WHERE order_id = o.id) as invoice_count,
    (SELECT COUNT(*) FROM public.receipts WHERE order_id = o.id) as receipt_count
FROM public.orders o
LEFT JOIN public.groups g ON o.group_id = g.id;

-- 完整請款單視圖
CREATE OR REPLACE VIEW public.invoices_with_details AS
SELECT
    i.*,
    g.group_name,
    g.departure_date,
    o.contact_person,
    o.contact_phone,
    (SELECT COUNT(*) FROM public.invoice_items WHERE invoice_id = i.id) as item_count,
    (SELECT COALESCE(SUM(subtotal), 0) FROM public.invoice_items WHERE invoice_id = i.id) as calculated_total
FROM public.invoices i
LEFT JOIN public.groups g ON i.group_id = g.id
LEFT JOIN public.orders o ON i.order_id = o.id;

-- 完整收款單視圖
CREATE OR REPLACE VIEW public.receipts_with_details AS
SELECT
    r.*,
    g.group_name,
    g.departure_date,
    o.contact_person,
    o.contact_phone,
    o.total_amount as order_total
FROM public.receipts r
LEFT JOIN public.groups g ON r.group_id = g.id
LEFT JOIN public.orders o ON r.order_id = o.id;