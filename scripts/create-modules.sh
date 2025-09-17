#!/bin/bash

# 建立所有模組目錄和頁面的腳本

BASE_DIR="src/app/(app)"

# 工作模式專屬模組
modules=(
  "receipts:收款單"
  "invoices:請款單"
  "cashflow:出納單"
  "suppliers:供應商"
  "simcards:網卡管理"
  "employees:員工管理"
  "quotations:報價單"
  "itinerary:行程設計"
  "tours:旅遊團"
  "contracts:合約"
  "confirmations:確認單"
  "costs:成本資料"
)

# 管理功能
admin_modules=(
  "users:用戶管理"
  "permissions:權限設定"
  "settings:系統設定"
)

# 建立工作模式模組
for module in "${modules[@]}"; do
  IFS=':' read -r name title <<< "$module"
  dir="$BASE_DIR/$name"
  
  echo "建立 $name - $title"
  mkdir -p "$dir"
  
  cat > "$dir/page.tsx" << EOF
import ComingSoonPage from '@/components/ComingSoon'

export default function Page() {
  return <ComingSoonPage title="$title" />
}
EOF
done

# 建立管理功能模組
mkdir -p "$BASE_DIR/admin"
for module in "${admin_modules[@]}"; do
  IFS=':' read -r name title <<< "$module"
  dir="$BASE_DIR/admin/$name"
  
  echo "建立 admin/$name - $title"
  mkdir -p "$dir"
  
  cat > "$dir/page.tsx" << EOF
import ComingSoonPage from '@/components/ComingSoon'

export default function Page() {
  return <ComingSoonPage title="$title" />
}
EOF
done

echo "所有模組頁面建立完成！"