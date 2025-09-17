-- 創建收款單資料表
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  group_code VARCHAR(50),
  group_name VARCHAR(255),
  receipt_date DATE NOT NULL,
  receipt_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  receipt_type INTEGER NOT NULL DEFAULT 0,
  receipt_account VARCHAR(100),
  status INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_order_number ON receipts(order_number);
CREATE INDEX IF NOT EXISTS idx_receipts_group_code ON receipts(group_code);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);

-- 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 啟用 RLS (Row Level Security)
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 政策
CREATE POLICY "Users can view all receipts" ON receipts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert receipts" ON receipts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update receipts" ON receipts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete receipts" ON receipts
    FOR DELETE USING (true);

-- 插入測試數據
INSERT INTO receipts (
  receipt_number,
  order_number,
  group_code,
  group_name,
  receipt_date,
  receipt_amount,
  receipt_type,
  receipt_account,
  status,
  note
) VALUES
('RC202501001', 'ORD202501001', 'GP202501001', '東京自由行5日遊', '2025-01-15', 50000.00, 1, '中國信託銀行', 0, '第一期款項'),
('RC202501002', 'ORD202501002', 'GP202501002', '韓國首爾購物團', '2025-01-16', 35000.00, 0, NULL, 0, '現金收款'),
('RC202501003', 'ORD202501003', 'GP202501001', '東京自由行5日遊', '2025-01-17', 25000.00, 2, '信用卡', 1, '第二期款項'),
('RC202501004', 'ORD202501004', 'GP202501003', '台灣環島8日遊', '2025-01-18', 40000.00, 1, '玉山銀行', 0, '團體訂金'),
('RC202501005', 'ORD202501005', 'GP202501002', '韓國首爾購物團', '2025-01-19', 28000.00, 0, NULL, 1, '尾款結清');