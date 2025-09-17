-- 診斷資料庫效能問題
-- 執行日期：2025-01-21

-- =====================================
-- 1. 檢查資料表大小
-- =====================================
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================
-- 2. 檢查索引狀態
-- =====================================
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) AS index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;

-- =====================================
-- 3. 檢查慢查詢
-- =====================================
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_%'
ORDER BY mean_time DESC
LIMIT 10;

-- =====================================
-- 4. 檢查 RLS 政策數量
-- =====================================
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

-- =====================================
-- 5. 檢查活動連線
-- =====================================
SELECT 
    COUNT(*) as connection_count,
    state
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;

-- =====================================
-- 6. 檢查資料庫設定
-- =====================================
SELECT 
    name,
    setting,
    unit
FROM pg_settings
WHERE name IN (
    'shared_buffers',
    'effective_cache_size',
    'work_mem',
    'maintenance_work_mem',
    'max_connections'
);

-- =====================================
-- 7. 清理和優化
-- =====================================

-- 清理死元組
VACUUM ANALYZE public.profiles;
VACUUM ANALYZE public.todos;
VACUUM ANALYZE public.user_permissions;

-- 重建索引（如果需要）
-- REINDEX TABLE public.profiles;
-- REINDEX TABLE public.todos;
-- REINDEX TABLE public.user_permissions;

-- =====================================
-- 8. 檢查 todos 表的資料
-- =====================================
SELECT 
    COUNT(*) as total_todos,
    COUNT(DISTINCT user_id) as unique_users,
    mode,
    status
FROM public.todos
GROUP BY mode, status
ORDER BY mode, status;

-- 檢查異常的 due_date
SELECT 
    id,
    title,
    due_date,
    LENGTH(due_date::text) as date_length
FROM public.todos
WHERE due_date IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
