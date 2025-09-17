'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Input } from '@/components/catalyst/input'
import { Textarea } from '@/components/catalyst/textarea'
import { Select } from '@/components/catalyst/select'
import { Fieldset, Field, Label } from '@/components/catalyst/fieldset'
import { Divider } from '@/components/catalyst/divider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { useOrderStore } from '@/stores/orderStore'
import { useCustomerStore } from '@/stores/customerStore'
import { OrderFormData, OrderItem, OrderStatus, PaymentStatus, PaymentMethod } from '@/types/order'
import { formatCurrency, generateId } from '@/lib/utils'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function NewOrderPage() {
  const router = useRouter()
  const { createOrder, isLoading } = useOrderStore()
  const { customers, fetchCustomers } = useCustomerStore()

  const [formData, setFormData] = useState<OrderFormData>({
    order_number: '',
    customer_id: '',
    customer_name: '',
    order_date: new Date().toISOString().split('T')[0],
    departure_date: '',
    return_date: '',
    total_amount: 0,
    discount_amount: 0,
    tax_amount: 0,
    final_amount: 0,
    paid_amount: 0,
    remaining_amount: 0,
    status: 'draft' as OrderStatus,
    payment_status: 'unpaid' as PaymentStatus,
    payment_method: undefined,
    payment_due_date: '',
    adult_count: 1,
    child_count: 0,
    infant_count: 0,
    total_participants: 1,
    special_requirements: '',
    notes: '',
    internal_notes: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    emergency_contact: '',
    emergency_phone: '',
    sales_person: '',
    commission_rate: 0,
    commission_amount: 0,
    source: '',
    referrer: '',
    cancellation_reason: '',
    cancellation_date: '',
    cancellation_fee: 0,
    refund_amount: 0,
    is_active: true,
    items: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    const totalParticipants = formData.adult_count + formData.child_count + formData.infant_count
    setFormData(prev => ({ ...prev, total_participants: totalParticipants }))
  }, [formData.adult_count, formData.child_count, formData.infant_count])

  useEffect(() => {
    calculateTotals()
  }, [formData.items, formData.discount_amount, formData.tax_amount])

  const calculateTotals = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0)
    const finalAmount = itemsTotal - formData.discount_amount + formData.tax_amount
    const remainingAmount = Math.max(0, finalAmount - formData.paid_amount)

    setFormData(prev => ({
      ...prev,
      total_amount: itemsTotal,
      final_amount: finalAmount,
      remaining_amount: remainingAmount
    }))
  }

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      customer_name: customer?.company_name || customer?.full_name || '',
      contact_person: customer?.contact_person || '',
      contact_phone: customer?.phone || '',
      contact_email: customer?.email || ''
    }))
  }

  const addOrderItem = () => {
    const newItem: Omit<OrderItem, 'id' | 'order_id'> = {
      travel_group_id: '',
      item_type: 'tour',
      item_name: '',
      item_description: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      subtotal: 0,
      notes: ''
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }

    // 重新計算小計
    if (field === 'quantity' || field === 'unit_price' || field === 'discount_amount') {
      const item = newItems[index]
      const subtotal = (item.quantity * item.unit_price) - (item.discount_amount || 0)
      newItems[index].subtotal = Math.max(0, subtotal)
    }

    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const removeOrderItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) {
      newErrors.customer_id = '請選擇客戶'
    }
    if (!formData.order_date) {
      newErrors.order_date = '請選擇訂單日期'
    }
    if (formData.items.length === 0) {
      newErrors.items = '請至少新增一個訂單項目'
    }

    formData.items.forEach((item, index) => {
      if (!item.item_name) {
        newErrors[`items.${index}.item_name`] = '請填寫項目名稱'
      }
      if (item.quantity <= 0) {
        newErrors[`items.${index}.quantity`] = '數量必須大於0'
      }
      if (item.unit_price < 0) {
        newErrors[`items.${index}.unit_price`] = '單價不能為負數'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const success = await createOrder(formData)
    if (success) {
      router.push('/orders')
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button color="zinc" outline onClick={() => router.back()}>
            <ArrowLeftIcon />
            返回
          </Button>
          <div>
            <Heading>新增訂單</Heading>
            <Text>建立新的訂單資料</Text>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要表單區域 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 基本資訊 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <Heading level={2} className="mb-6">基本資訊</Heading>

              <Fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field>
                    <Label>客戶 *</Label>
                    <Select
                      value={formData.customer_id}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      invalid={!!errors.customer_id}
                    >
                      <option value="">請選擇客戶</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.company_name || customer.full_name}
                        </option>
                      ))}
                    </Select>
                    {errors.customer_id && (
                      <Text className="text-red-600 text-sm mt-1">{errors.customer_id}</Text>
                    )}
                  </Field>

                  <Field>
                    <Label>訂單日期 *</Label>
                    <Input
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => handleInputChange('order_date', e.target.value)}
                      invalid={!!errors.order_date}
                    />
                    {errors.order_date && (
                      <Text className="text-red-600 text-sm mt-1">{errors.order_date}</Text>
                    )}
                  </Field>

                  <Field>
                    <Label>出發日期</Label>
                    <Input
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) => handleInputChange('departure_date', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>回程日期</Label>
                    <Input
                      type="date"
                      value={formData.return_date}
                      onChange={(e) => handleInputChange('return_date', e.target.value)}
                    />
                  </Field>
                </div>
              </Fieldset>
            </div>

            {/* 聯絡資訊 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <Heading level={2} className="mb-6">聯絡資訊</Heading>

              <Fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field>
                    <Label>聯絡人</Label>
                    <Input
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>聯絡電話</Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>聯絡信箱</Label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>緊急聯絡人</Label>
                    <Input
                      value={formData.emergency_contact}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>緊急聯絡電話</Label>
                    <Input
                      value={formData.emergency_phone}
                      onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                    />
                  </Field>
                </div>
              </Fieldset>
            </div>

            {/* 參與人數 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <Heading level={2} className="mb-6">參與人數</Heading>

              <Fieldset>
                <div className="grid grid-cols-3 gap-6">
                  <Field>
                    <Label>成人人數</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.adult_count}
                      onChange={(e) => handleInputChange('adult_count', parseInt(e.target.value) || 0)}
                    />
                  </Field>

                  <Field>
                    <Label>兒童人數</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.child_count}
                      onChange={(e) => handleInputChange('child_count', parseInt(e.target.value) || 0)}
                    />
                  </Field>

                  <Field>
                    <Label>嬰兒人數</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.infant_count}
                      onChange={(e) => handleInputChange('infant_count', parseInt(e.target.value) || 0)}
                    />
                  </Field>
                </div>

                <Text className="text-sm text-gray-600 mt-2">
                  總參與人數：{formData.total_participants} 人
                </Text>
              </Fieldset>
            </div>

            {/* 訂單項目 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <Heading level={2}>訂單項目</Heading>
                <Button type="button" onClick={addOrderItem}>
                  <PlusIcon />
                  新增項目
                </Button>
              </div>

              {errors.items && (
                <Text className="text-red-600 text-sm mb-4">{errors.items}</Text>
              )}

              {formData.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>項目名稱 *</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead className="text-right">數量 *</TableHead>
                      <TableHead className="text-right">單價 *</TableHead>
                      <TableHead className="text-right">折扣</TableHead>
                      <TableHead className="text-right">小計</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.item_name}
                            onChange={(e) => updateOrderItem(index, 'item_name', e.target.value)}
                            invalid={!!errors[`items.${index}.item_name`]}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.item_type}
                            onChange={(e) => updateOrderItem(index, 'item_type', e.target.value)}
                          >
                            <option value="tour">行程</option>
                            <option value="service">服務</option>
                            <option value="product">商品</option>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            invalid={!!errors[`items.${index}.quantity`]}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            invalid={!!errors[`items.${index}.unit_price`]}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount_amount || 0}
                            onChange={(e) => updateOrderItem(index, 'discount_amount', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            color="red"
                            outline
                            onClick={() => removeOrderItem(index)}
                          >
                            <TrashIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Text className="text-gray-500">尚無訂單項目，請點擊「新增項目」按鈕新增</Text>
                </div>
              )}
            </div>

            {/* 備註資訊 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <Heading level={2} className="mb-6">備註資訊</Heading>

              <Fieldset>
                <div className="space-y-6">
                  <Field>
                    <Label>特殊需求</Label>
                    <Textarea
                      rows={3}
                      value={formData.special_requirements}
                      onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>客戶備註</Label>
                    <Textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>內部備註</Label>
                    <Textarea
                      rows={3}
                      value={formData.internal_notes}
                      onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                    />
                  </Field>
                </div>
              </Fieldset>
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 狀態設定 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <Heading level={3} className="mb-4">狀態設定</Heading>

              <Fieldset>
                <div className="space-y-4">
                  <Field>
                    <Label>訂單狀態</Label>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="draft">草稿</option>
                      <option value="pending">待確認</option>
                      <option value="confirmed">已確認</option>
                    </Select>
                  </Field>

                  <Field>
                    <Label>付款狀態</Label>
                    <Select
                      value={formData.payment_status}
                      onChange={(e) => handleInputChange('payment_status', e.target.value)}
                    >
                      <option value="unpaid">未付款</option>
                      <option value="partial">部分付款</option>
                      <option value="paid">已付款</option>
                    </Select>
                  </Field>

                  <Field>
                    <Label>付款方式</Label>
                    <Select
                      value={formData.payment_method || ''}
                      onChange={(e) => handleInputChange('payment_method', e.target.value || undefined)}
                    >
                      <option value="">請選擇</option>
                      <option value="cash">現金</option>
                      <option value="transfer">銀行轉帳</option>
                      <option value="credit_card">信用卡</option>
                      <option value="check">支票</option>
                      <option value="other">其他</option>
                    </Select>
                  </Field>

                  <Field>
                    <Label>付款到期日</Label>
                    <Input
                      type="date"
                      value={formData.payment_due_date}
                      onChange={(e) => handleInputChange('payment_due_date', e.target.value)}
                    />
                  </Field>
                </div>
              </Fieldset>
            </div>

            {/* 金額設定 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <Heading level={3} className="mb-4">金額設定</Heading>

              <Fieldset>
                <div className="space-y-4">
                  <Field>
                    <Label>折扣金額</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_amount}
                      onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                    />
                  </Field>

                  <Field>
                    <Label>稅額</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.tax_amount}
                      onChange={(e) => handleInputChange('tax_amount', parseFloat(e.target.value) || 0)}
                    />
                  </Field>

                  <Field>
                    <Label>已付金額</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.paid_amount}
                      onChange={(e) => handleInputChange('paid_amount', parseFloat(e.target.value) || 0)}
                    />
                  </Field>
                </div>
              </Fieldset>

              <Divider className="my-4" />

              {/* 金額摘要 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>項目小計</span>
                  <span>{formatCurrency(formData.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>折扣金額</span>
                  <span className="text-red-600">-{formatCurrency(formData.discount_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>稅額</span>
                  <span>{formatCurrency(formData.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>總金額</span>
                  <span>{formatCurrency(formData.final_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>已付金額</span>
                  <span className="text-green-600">{formatCurrency(formData.paid_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>剩餘金額</span>
                  <span className={formData.remaining_amount > 0 ? 'text-orange-600' : 'text-gray-500'}>
                    {formatCurrency(formData.remaining_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* 業務資訊 */}
            <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
              <Heading level={3} className="mb-4">業務資訊</Heading>

              <Fieldset>
                <div className="space-y-4">
                  <Field>
                    <Label>業務人員</Label>
                    <Input
                      value={formData.sales_person}
                      onChange={(e) => handleInputChange('sales_person', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>客戶來源</Label>
                    <Input
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>介紹人</Label>
                    <Input
                      value={formData.referrer}
                      onChange={(e) => handleInputChange('referrer', e.target.value)}
                    />
                  </Field>
                </div>
              </Fieldset>
            </div>
          </div>
        </div>

        {/* 表單按鈕 */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" color="zinc" outline onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '建立中...' : '建立訂單'}
          </Button>
        </div>
      </form>
    </div>
  )
}