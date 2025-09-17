-- =====================================
-- 行事曆事件表
-- =====================================

-- 行事曆事件表
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT true,
    type TEXT NOT NULL DEFAULT 'event' CHECK (type IN ('event', 'reminder', 'meeting', 'personal')),
    mode TEXT NOT NULL DEFAULT 'life' CHECK (mode IN ('life', 'work')),
    color TEXT,
    location TEXT,
    attendees TEXT[], -- 參與者（工作模式用）
    recurrence_rule TEXT, -- 重複規則（如 RRULE）
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
    reminder_minutes INTEGER[], -- 提醒時間（分鐘前）
    is_private BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- 額外的元資料
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_mode ON public.calendar_events(mode);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(type);

-- 行事曆事件的 RLS 政策
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 用戶只能看到自己的行事曆事件
CREATE POLICY "Users can view own calendar events" ON public.calendar_events
    FOR SELECT USING (auth.uid() = user_id);

-- 用戶只能創建自己的行事曆事件
CREATE POLICY "Users can create own calendar events" ON public.calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用戶只能更新自己的行事曆事件
CREATE POLICY "Users can update own calendar events" ON public.calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

-- 用戶只能刪除自己的行事曆事件
CREATE POLICY "Users can delete own calendar events" ON public.calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- 更新時間戳觸發器
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_events_updated_at();