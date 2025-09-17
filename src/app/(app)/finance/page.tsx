import FinancialOverview from '@/components/finance/FinancialOverview'

export default function FinancePage() {
  // TODO: 從 Supabase 載入真實的財務資料
  const mockData = {
    id: 'demo-user',
    display_name: 'Demo User',
    total_cash: 50000,
    total_bank: 120000,
    total_investment: 80000,
    total_assets: 250000,
    monthly_budget: 30000,
    monthly_spent: 22500,
    monthly_income: 45000,
    monthly_expense: 22500
  }

  return (
    <div className="px-[15px] py-6">
      <FinancialOverview data={mockData} isLoading={false} />
    </div>
  )
}
