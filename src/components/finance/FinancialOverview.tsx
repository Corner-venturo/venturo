'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import type { FinancialOverview } from '@/types/finance'

interface FinancialOverviewProps {
  data?: FinancialOverview | null
  isLoading?: boolean
}

export default function FinancialOverview({ data, isLoading }: FinancialOverviewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-6 h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-6 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = data || {
    id: '',
    display_name: '',
    total_cash: 0,
    total_bank: 0,
    total_investment: 0,
    total_assets: 0,
    monthly_budget: 0,
    monthly_spent: 0,
    monthly_income: 0,
    monthly_expense: 0
  }

  const budgetUsagePercent = stats.monthly_budget > 0 
    ? (stats.monthly_spent / stats.monthly_budget) * 100 
    : 0

  const netIncome = stats.monthly_income - stats.monthly_expense
  const savingsRate = stats.monthly_income > 0 
    ? ((netIncome) / stats.monthly_income) * 100 
    : 0

  const getBudgetStatus = () => {
    if (budgetUsagePercent < 70) return { 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50', 
      message: '預算控制良好 💪', 
      icon: <TrendingUp className="w-4 h-4" />
    }
    if (budgetUsagePercent < 90) return { 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50', 
      message: '預算使用接近上限 ⚠️', 
      icon: <AlertCircle className="w-4 h-4" />
    }
    return { 
      color: 'text-red-600', 
      bgColor: 'bg-red-50', 
      message: '預算已超支 🚨', 
      icon: <TrendingDown className="w-4 h-4" />
    }
  }

  const budgetStatus = getBudgetStatus()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">財務總覽</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('zh-TW', { 
            year: 'numeric', 
            month: 'long' 
          })}
        </div>
      </div>

      {/* 資產卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 總資產 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總資產</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total_assets)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* 現金 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">現金資產</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total_cash)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* 投資 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">投資資產</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total_investment)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* 儲蓄率 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">儲蓄率</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercent(savingsRate)}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-full">
              <PiggyBank className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 本月概況 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 收支情況 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">本月收支</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">本月收入</span>
              <span className="text-lg font-semibold text-emerald-600">
                {formatCurrency(stats.monthly_income)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">本月支出</span>
              <span className="text-lg font-semibold text-red-600">
                {formatCurrency(stats.monthly_expense)}
              </span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">本月結餘</span>
                <span className={`text-lg font-bold ${
                  netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrency(netIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 預算使用情況 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">預算使用</h3>
          </div>
          
          <div className="space-y-4">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${budgetStatus.bgColor}`}>
              {budgetStatus.icon}
              <span className={`text-sm font-medium ${budgetStatus.color}`}>
                {budgetStatus.message}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">已使用</span>
                <span className="font-medium">
                  {formatCurrency(stats.monthly_spent)} / {formatCurrency(stats.monthly_budget)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetUsagePercent < 70 ? 'bg-emerald-500' :
                    budgetUsagePercent < 90 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>{formatPercent(budgetUsagePercent)}</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}