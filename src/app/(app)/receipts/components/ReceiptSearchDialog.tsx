'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { Button } from '@/components/catalyst/button'
import { Field, Label } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { RECEIPT_STATUS, RECEIPT_STATUS_NAMES } from '@/constants/receiptStatus'
import { RECEIPT_TYPE_NAMES } from '@/constants/receiptTypes'
import { ReceiptQueryParams } from '@/types/receipt'
import { format } from 'date-fns'

interface ReceiptSearchDialogProps {
  open: boolean
  onClose: () => void
  onSearch: (params: ReceiptQueryParams) => void
  initialParams: ReceiptQueryParams
}

export default function ReceiptSearchDialog({
  open,
  onClose,
  onSearch,
  initialParams
}: ReceiptSearchDialogProps) {
  const [params, setParams] = useState<ReceiptQueryParams>(initialParams)

  useEffect(() => {
    if (open) {
      setParams(initialParams)
    }
  }, [open, initialParams])

  const handleInputChange = (field: keyof ReceiptQueryParams, value: any) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions)
    const values = selectedOptions.map(option => Number(option.value))
    handleInputChange('status', values)
  }

  const handleReceiptTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions)
    const values = selectedOptions.map(option => Number(option.value))
    handleInputChange('receiptType', values.length > 0 ? values[0] : undefined)
  }

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    if (value) {
      handleInputChange(field, format(new Date(value), 'yyyy-MM-dd'))
    } else {
      handleInputChange(field, undefined)
    }
  }

  const handleSubmit = () => {
    onSearch(params)
    onClose()
  }

  const handleReset = () => {
    const defaultParams: ReceiptQueryParams = {
      status: [RECEIPT_STATUS.PENDING],
      limit: 200
    }
    setParams(defaultParams)
    onSearch(defaultParams)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} size="3xl">
      <DialogTitle>詳細搜尋收款單</DialogTitle>

      <DialogBody>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 收款單號 */}
          <Field>
            <Label>收款單號</Label>
            <Input
              type="text"
              value={params.receiptNumber || ''}
              onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
              placeholder="請輸入收款單號"
            />
          </Field>

          {/* 訂單編號 */}
          <Field>
            <Label>訂單編號</Label>
            <Input
              type="text"
              value={params.orderNumber || ''}
              onChange={(e) => handleInputChange('orderNumber', e.target.value)}
              placeholder="請輸入訂單編號"
            />
          </Field>

          {/* 團號 */}
          <Field>
            <Label>團號</Label>
            <Input
              type="text"
              value={params.groupCode || ''}
              onChange={(e) => handleInputChange('groupCode', e.target.value)}
              placeholder="請輸入團號"
            />
          </Field>

          {/* 收款日期 (起) */}
          <Field>
            <Label>收款日期 (起)</Label>
            <Input
              type="date"
              value={params.dateFrom ? format(new Date(params.dateFrom), 'yyyy-MM-dd') : ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
            />
          </Field>

          {/* 收款日期 (迄) */}
          <Field>
            <Label>收款日期 (迄)</Label>
            <Input
              type="date"
              value={params.dateTo ? format(new Date(params.dateTo), 'yyyy-MM-dd') : ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
            />
          </Field>

          {/* 狀態 */}
          <Field>
            <Label>狀態</Label>
            <Select
              multiple
              value={params.status?.map(String) || []}
              onChange={handleStatusChange}
            >
              {Object.entries(RECEIPT_STATUS_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>

          {/* 收款方式 */}
          <Field>
            <Label>收款方式</Label>
            <Select
              value={params.receiptType?.toString() || ''}
              onChange={handleReceiptTypeChange}
            >
              <option value="">全部</option>
              {Object.entries(RECEIPT_TYPE_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>

          {/* 顯示數量上限 */}
          <Field className="sm:col-span-2">
            <Label>顯示數量上限</Label>
            <Input
              type="number"
              value={params.limit || 200}
              onChange={(e) => handleInputChange('limit', Number(e.target.value))}
              min="1"
              max="1000"
              className="max-w-xs"
            />
          </Field>
        </div>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={handleReset}>
          重設
        </Button>
        <Button plain onClick={onClose}>
          取消
        </Button>
        <Button color="indigo" onClick={handleSubmit}>
          搜尋
        </Button>
      </DialogActions>
    </Dialog>
  )
}