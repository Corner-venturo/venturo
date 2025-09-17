// 查詢 Supabase 所有資料的腳本
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 環境變數');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getAllTables() {
  try {
    // 手動定義已知的表格（根據 Venturo-ERP 的資料庫結構）
    const knownTables = [
      'profiles', 'todos', 'time_blocks', 'financial_records',
      'calendar_events', 'quotes', 'groups', 'orders',
      'receipts', 'contracts', 'invoices', 'projects',
      'customers', 'suppliers', 'users', 'esims'
    ];

    console.log('📊 Supabase 資料庫概覽\n' + '='.repeat(50));
    console.log(`🔗 數據庫 URL: ${supabaseUrl}`);
    console.log(`📅 查詢時間: ${new Date().toLocaleString('zh-TW')}\n`);

    for (const tableName of knownTables) {

      // 跳過系統表格
      if (tableName.startsWith('auth.') || tableName.startsWith('storage.')) {
        continue;
      }

      console.log(`\n📋 表格: ${tableName}`);
      console.log('-'.repeat(30));

      try {
        // 獲取表格資料
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(5);

        if (error) {
          console.log(`⚠️  無法讀取資料: ${error.message}`);
          continue;
        }

        console.log(`📈 總筆數: ${count || 0}`);

        if (data && data.length > 0) {
          console.log(`🔍 欄位: ${Object.keys(data[0]).join(', ')}`);
          console.log(`💾 前5筆資料預覽:`);
          data.forEach((row, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
          });
        } else {
          console.log(`📝 空表格 - 無資料`);
        }

      } catch (tableError) {
        console.log(`❌ 查詢 ${tableName} 時發生錯誤:`, tableError.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ 資料庫查詢完成');

  } catch (error) {
    console.error('❌ 查詢資料庫時發生錯誤:', error);
  }
}

// 執行查詢
getAllTables();