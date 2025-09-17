// 批次建立所有模組頁面
const modules = [
  { path: 'invoices', title: '請款單' },
  { path: 'cashflow', title: '出納單' },
  { path: 'suppliers', title: '供應商' },
  { path: 'simcards', title: '網卡管理' },
  { path: 'employees', title: '員工管理' },
  { path: 'quotations', title: '報價單' },
  { path: 'itinerary', title: '行程設計' },
  { path: 'tours', title: '旅遊團' },
  { path: 'contracts', title: '合約' },
  { path: 'confirmations', title: '確認單' },
  { path: 'costs', title: '成本資料' },
  { path: 'admin/users', title: '用戶管理' },
  { path: 'admin/permissions', title: '權限設定' },
  { path: 'admin/settings', title: '系統設定' }
];

// 執行建立
console.log('請在專案根目錄執行以下命令：\n');

modules.forEach(module => {
  console.log(`mkdir -p src/app/\\(app\\)/${module.path}`);
  console.log(`cat > src/app/\\(app\\)/${module.path}/page.tsx << 'EOF'
import ComingSoonPage from '@/components/ComingSoon'

export default function Page() {
  return <ComingSoonPage title="${module.title}" />
}
EOF
`);
});

export {}