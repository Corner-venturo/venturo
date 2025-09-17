-- 箱型時間增強版資料表設計
-- 支援多種箱子類型

-- 刪除舊表
DROP TABLE IF EXISTS public.timeboxes CASCADE;

-- 新的箱型時間表
CREATE TABLE public.timeboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 基本資訊
    title TEXT NOT NULL,
    description TEXT,
    box_type TEXT NOT NULL CHECK (box_type IN (
        'general',      -- 一般箱
        'timer',        -- 計時箱
        'skincare',     -- 保養箱
        'workout',      -- 重訓箱
        'reminder'      -- 提醒箱
    )),
    
    -- 時間設定
    scheduled_date DATE,           -- 排程日期（可為空，表示重複）
    start_time TIME,                -- 開始時間
    duration_minutes INTEGER,       -- 持續分鐘
    
    -- 重複設定
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT CHECK (recurrence_pattern IN (
        'daily', 'weekly', 'weekdays', 'weekends', 'custom'
    )),
    recurrence_days INTEGER[],      -- [1,2,3,4,5] = 週一到五
    
    -- 狀態追蹤
    status TEXT DEFAULT 'planned' CHECK (status IN (
        'planned', 'in_progress', 'completed', 'skipped', 'paused'
    )),
    completion_rate INTEGER CHECK (completion_rate >= 0 AND completion_rate <= 100),
    
    -- 特定類型資料（JSON格式儲存）
    box_data JSONB DEFAULT '{}',
    /* 
    計時箱：{ "focus_type": "pomodoro", "break_time": 5 }
    保養箱：{ "products": [...], "steps": [...] }
    重訓箱：{ "exercises": [{"name": "", "weight": 0, "sets": 0, "reps": 0}] }
    提醒箱：{ "reminder_text": "", "next_occurrence": "" }
    */
    
    -- 執行記錄
    last_completed TIMESTAMPTZ,
    completion_history JSONB DEFAULT '[]', -- 歷史記錄陣列
    notes TEXT,
    
    -- 時間戳記
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 箱子模板表（可以儲存常用設定）
CREATE TABLE public.timebox_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    box_type TEXT NOT NULL,
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 週複盤記錄表
CREATE TABLE public.timebox_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- 統計資料
    total_planned INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    average_completion_rate INTEGER,
    
    -- 各類型統計
    stats_by_type JSONB DEFAULT '{}',
    
    -- 複盤內容
    achievements TEXT,      -- 本週成就
    improvements TEXT,      -- 需要改進
    next_week_goals TEXT,   -- 下週目標
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_timeboxes_user_date ON public.timeboxes(user_id, scheduled_date);
CREATE INDEX idx_timeboxes_type ON public.timeboxes(box_type);
CREATE INDEX idx_timeboxes_recurring ON public.timeboxes(is_recurring);

-- RLS 政策
ALTER TABLE public.timeboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timebox_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timebox_reviews ENABLE ROW LEVEL SECURITY;

-- 用戶只能管理自己的箱子
CREATE POLICY "Users own timeboxes" ON public.timeboxes
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users own templates" ON public.timebox_templates
    FOR ALL USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users own reviews" ON public.timebox_reviews
    FOR ALL USING (user_id = auth.uid());
