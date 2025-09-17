/**
 * CornerERP 資料匯入工具
 * 確保 100% 相容性的資料匯入機制
 */

import { createClient } from '@/lib/supabase/client'

// ===== CornerERP 原始資料型別定義 =====

interface CornerGroup {
  groupCode: string
  groupName: string
  departureDate: Date | string
  returnDate: Date | string
  customerCount?: number
  travellerIds: string[]
  salesPerson?: string
  opId?: string
  status: number
  branchBonus?: number
  saleBonus?: number
  opBonus?: number
  profitTax?: number
  createdAt: Date | string
  createdBy: string
  modifiedAt?: Date | string
  modifiedBy?: string
}

interface CornerOrder {
  orderNumber: string
  groupCode: string
  groupName?: string
  contactPerson: string
  contactPhone: string
  orderType: string
  salesPerson: string
  opId?: string
  totalAmount?: number
  paidAmount?: number
  remainingAmount?: number
  paymentStatus?: string
  createdAt: Date | string
  createdBy: string
  modifiedAt?: Date | string
  modifiedBy?: string
}

interface CornerReceipt {
  receiptNumber: string
  orderNumber: string
  receiptDate: Date | string
  receiptAmount: number
  actualAmount: number
  receiptType: string | null
  receiptAccount: string
  email: string
  payDateline: Date | string | null
  note: string
  status: number
  createdAt: Date | string
  createdBy: string
  modifiedAt?: Date | string
  modifiedBy?: string
}

interface CornerInvoice {
  invoiceNumber: string
  groupCode: string
  orderNumber?: string
  invoiceDate: Date | string
  status: number
  amount?: number
  createdAt: Date | string
  createdBy: string
  modifiedAt?: Date | string
  modifiedBy?: string
}

interface CornerCustomer {
  id: string
  name: string
  birthday?: string
  passportRomanization?: string
  passportNumber?: string
  passportValidTo?: string
  email?: string
  phone?: string
  note?: string
  createdAt: Date | string
  createdBy: string
  modifiedAt?: Date | string
  modifiedBy?: string
}

// ===== 匯入結果型別 =====

interface ImportResult {
  success: boolean
  totalRecords: number
  successCount: number
  errorCount: number
  errors: string[]
  duplicates: string[]
  log: string[]
}

interface ImportOptions {
  skipDuplicates?: boolean
  updateExisting?: boolean
  validateOnly?: boolean
  batchSize?: number
}

// ===== 主要匯入器類別 =====

export class CornerErpDataImporter {
  private supabase = createClient()

  /**
   * 匯入 CornerERP 完整資料集
   */
  async importCompleteDataset(
    data: {
      groups?: CornerGroup[]
      orders?: CornerOrder[]
      receipts?: CornerReceipt[]
      invoices?: CornerInvoice[]
      customers?: CornerCustomer[]
    },
    options: ImportOptions = {}
  ): Promise<{
    groups: ImportResult
    orders: ImportResult
    receipts: ImportResult
    invoices: ImportResult
    customers: ImportResult
    overall: {
      success: boolean
      totalRecords: number
      successCount: number
      errorCount: number
      duration: number
    }
  }> {
    const startTime = Date.now()

    console.log('🚀 開始 CornerERP 完整資料匯入...')

    // 按依賴順序匯入
    const results = {
      customers: { success: true, totalRecords: 0, successCount: 0, errorCount: 0, errors: [], duplicates: [], log: [] } as ImportResult,
      groups: { success: true, totalRecords: 0, successCount: 0, errorCount: 0, errors: [], duplicates: [], log: [] } as ImportResult,
      orders: { success: true, totalRecords: 0, successCount: 0, errorCount: 0, errors: [], duplicates: [], log: [] } as ImportResult,
      invoices: { success: true, totalRecords: 0, successCount: 0, errorCount: 0, errors: [], duplicates: [], log: [] } as ImportResult,
      receipts: { success: true, totalRecords: 0, successCount: 0, errorCount: 0, errors: [], duplicates: [], log: [] } as ImportResult
    }

    try {
      // 1. 匯入客戶資料 (基礎資料)
      if (data.customers && data.customers.length > 0) {
        console.log('📥 匯入客戶資料...')
        results.customers = await this.importCustomers(data.customers, options)
      }

      // 2. 匯入旅遊團 (依賴客戶)
      if (data.groups && data.groups.length > 0) {
        console.log('📥 匯入旅遊團資料...')
        results.groups = await this.importGroups(data.groups, options)
      }

      // 3. 匯入訂單 (依賴旅遊團)
      if (data.orders && data.orders.length > 0) {
        console.log('📥 匯入訂單資料...')
        results.orders = await this.importOrders(data.orders, options)
      }

      // 4. 匯入請款單 (依賴訂單)
      if (data.invoices && data.invoices.length > 0) {
        console.log('📥 匯入請款單資料...')
        results.invoices = await this.importInvoices(data.invoices, options)
      }

      // 5. 匯入收款單 (依賴訂單)
      if (data.receipts && data.receipts.length > 0) {
        console.log('📥 匯入收款單資料...')
        results.receipts = await this.importReceipts(data.receipts, options)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      const totalRecords = Object.values(results).reduce((sum, result) => sum + result.totalRecords, 0)
      const successCount = Object.values(results).reduce((sum, result) => sum + result.successCount, 0)
      const errorCount = Object.values(results).reduce((sum, result) => sum + result.errorCount, 0)

      console.log(`✅ CornerERP 資料匯入完成！總計 ${totalRecords} 筆，成功 ${successCount} 筆，失敗 ${errorCount} 筆，耗時 ${duration}ms`)

      return {
        ...results,
        overall: {
          success: errorCount === 0,
          totalRecords,
          successCount,
          errorCount,
          duration
        }
      }

    } catch (error) {
      console.error('❌ CornerERP 資料匯入失敗:', error)
      throw error
    }
  }

  /**
   * 匯入客戶資料
   */
  async importCustomers(customers: CornerCustomer[], options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: customers.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      duplicates: [],
      log: []
    }

    for (const customer of customers) {
      try {
        // 資料驗證
        if (!customer.id || !customer.name) {
          result.errors.push(`客戶資料不完整: ${JSON.stringify(customer)}`)
          result.errorCount++
          continue
        }

        // 檢查重複
        const { data: existing } = await this.supabase
          .from('customers')
          .select('id')
          .eq('id', customer.id)
          .single()

        if (existing) {
          if (options.skipDuplicates) {
            result.duplicates.push(customer.id)
            continue
          } else if (options.updateExisting) {
            // 更新現有記錄
            const { error } = await this.supabase
              .from('customers')
              .update(this.transformCustomerData(customer))
              .eq('id', customer.id)

            if (error) {
              result.errors.push(`更新客戶失敗 ${customer.id}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`更新客戶: ${customer.name} (${customer.id})`)
            }
          }
        } else {
          // 新增記錄
          if (!options.validateOnly) {
            const { error } = await this.supabase
              .from('customers')
              .insert(this.transformCustomerData(customer))

            if (error) {
              result.errors.push(`新增客戶失敗 ${customer.id}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`新增客戶: ${customer.name} (${customer.id})`)
            }
          } else {
            result.successCount++
            result.log.push(`驗證客戶: ${customer.name} (${customer.id})`)
          }
        }

      } catch (error) {
        result.errors.push(`處理客戶失敗 ${customer.id}: ${error}`)
        result.errorCount++
      }
    }

    result.success = result.errorCount === 0
    return result
  }

  /**
   * 匯入旅遊團資料
   */
  async importGroups(groups: CornerGroup[], options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: groups.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      duplicates: [],
      log: []
    }

    for (const group of groups) {
      try {
        // 資料驗證
        if (!group.groupCode || !group.groupName) {
          result.errors.push(`旅遊團資料不完整: ${JSON.stringify(group)}`)
          result.errorCount++
          continue
        }

        // 檢查重複
        const { data: existing } = await this.supabase
          .from('groups')
          .select('group_code')
          .eq('group_code', group.groupCode)
          .single()

        if (existing) {
          if (options.skipDuplicates) {
            result.duplicates.push(group.groupCode)
            continue
          } else if (options.updateExisting) {
            // 更新現有記錄
            const { error } = await this.supabase
              .from('groups')
              .update(this.transformGroupData(group))
              .eq('group_code', group.groupCode)

            if (error) {
              result.errors.push(`更新旅遊團失敗 ${group.groupCode}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`更新旅遊團: ${group.groupName} (${group.groupCode})`)
            }
          }
        } else {
          // 新增記錄
          if (!options.validateOnly) {
            const { error } = await this.supabase
              .from('groups')
              .insert(this.transformGroupData(group))

            if (error) {
              result.errors.push(`新增旅遊團失敗 ${group.groupCode}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`新增旅遊團: ${group.groupName} (${group.groupCode})`)
            }
          } else {
            result.successCount++
            result.log.push(`驗證旅遊團: ${group.groupName} (${group.groupCode})`)
          }
        }

      } catch (error) {
        result.errors.push(`處理旅遊團失敗 ${group.groupCode}: ${error}`)
        result.errorCount++
      }
    }

    result.success = result.errorCount === 0
    return result
  }

  /**
   * 匯入訂單資料
   */
  async importOrders(orders: CornerOrder[], options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: orders.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      duplicates: [],
      log: []
    }

    for (const order of orders) {
      try {
        // 資料驗證
        if (!order.orderNumber || !order.groupCode || !order.contactPerson) {
          result.errors.push(`訂單資料不完整: ${JSON.stringify(order)}`)
          result.errorCount++
          continue
        }

        // 檢查重複
        const { data: existing } = await this.supabase
          .from('orders')
          .select('order_number')
          .eq('order_number', order.orderNumber)
          .single()

        if (existing) {
          if (options.skipDuplicates) {
            result.duplicates.push(order.orderNumber)
            continue
          } else if (options.updateExisting) {
            // 更新現有記錄
            const { error } = await this.supabase
              .from('orders')
              .update(this.transformOrderData(order))
              .eq('order_number', order.orderNumber)

            if (error) {
              result.errors.push(`更新訂單失敗 ${order.orderNumber}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`更新訂單: ${order.contactPerson} (${order.orderNumber})`)
            }
          }
        } else {
          // 新增記錄
          if (!options.validateOnly) {
            const { error } = await this.supabase
              .from('orders')
              .insert(this.transformOrderData(order))

            if (error) {
              result.errors.push(`新增訂單失敗 ${order.orderNumber}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`新增訂單: ${order.contactPerson} (${order.orderNumber})`)
            }
          } else {
            result.successCount++
            result.log.push(`驗證訂單: ${order.contactPerson} (${order.orderNumber})`)
          }
        }

      } catch (error) {
        result.errors.push(`處理訂單失敗 ${order.orderNumber}: ${error}`)
        result.errorCount++
      }
    }

    result.success = result.errorCount === 0
    return result
  }

  /**
   * 匯入收款單資料
   */
  async importReceipts(receipts: CornerReceipt[], options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: receipts.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      duplicates: [],
      log: []
    }

    for (const receipt of receipts) {
      try {
        // 資料驗證
        if (!receipt.receiptNumber || !receipt.orderNumber || receipt.receiptAmount === undefined) {
          result.errors.push(`收款單資料不完整: ${JSON.stringify(receipt)}`)
          result.errorCount++
          continue
        }

        // 檢查重複
        const { data: existing } = await this.supabase
          .from('receipts')
          .select('receipt_number')
          .eq('receipt_number', receipt.receiptNumber)
          .single()

        if (existing) {
          if (options.skipDuplicates) {
            result.duplicates.push(receipt.receiptNumber)
            continue
          } else if (options.updateExisting) {
            // 更新現有記錄
            const { error } = await this.supabase
              .from('receipts')
              .update(this.transformReceiptData(receipt))
              .eq('receipt_number', receipt.receiptNumber)

            if (error) {
              result.errors.push(`更新收款單失敗 ${receipt.receiptNumber}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`更新收款單: ${receipt.receiptNumber} (${receipt.receiptAmount})`)
            }
          }
        } else {
          // 新增記錄
          if (!options.validateOnly) {
            const { error } = await this.supabase
              .from('receipts')
              .insert(this.transformReceiptData(receipt))

            if (error) {
              result.errors.push(`新增收款單失敗 ${receipt.receiptNumber}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`新增收款單: ${receipt.receiptNumber} (${receipt.receiptAmount})`)
            }
          } else {
            result.successCount++
            result.log.push(`驗證收款單: ${receipt.receiptNumber} (${receipt.receiptAmount})`)
          }
        }

      } catch (error) {
        result.errors.push(`處理收款單失敗 ${receipt.receiptNumber}: ${error}`)
        result.errorCount++
      }
    }

    result.success = result.errorCount === 0
    return result
  }

  /**
   * 匯入請款單資料
   */
  async importInvoices(invoices: CornerInvoice[], options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: invoices.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      duplicates: [],
      log: []
    }

    for (const invoice of invoices) {
      try {
        // 資料驗證
        if (!invoice.invoiceNumber || !invoice.groupCode) {
          result.errors.push(`請款單資料不完整: ${JSON.stringify(invoice)}`)
          result.errorCount++
          continue
        }

        // 檢查重複
        const { data: existing } = await this.supabase
          .from('invoices')
          .select('invoice_number')
          .eq('invoice_number', invoice.invoiceNumber)
          .single()

        if (existing) {
          if (options.skipDuplicates) {
            result.duplicates.push(invoice.invoiceNumber)
            continue
          } else if (options.updateExisting) {
            // 更新現有記錄
            const { error } = await this.supabase
              .from('invoices')
              .update(this.transformInvoiceData(invoice))
              .eq('invoice_number', invoice.invoiceNumber)

            if (error) {
              result.errors.push(`更新請款單失敗 ${invoice.invoiceNumber}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`更新請款單: ${invoice.invoiceNumber}`)
            }
          }
        } else {
          // 新增記錄
          if (!options.validateOnly) {
            const { error } = await this.supabase
              .from('invoices')
              .insert(this.transformInvoiceData(invoice))

            if (error) {
              result.errors.push(`新增請款單失敗 ${invoice.invoiceNumber}: ${error.message}`)
              result.errorCount++
            } else {
              result.successCount++
              result.log.push(`新增請款單: ${invoice.invoiceNumber}`)
            }
          } else {
            result.successCount++
            result.log.push(`驗證請款單: ${invoice.invoiceNumber}`)
          }
        }

      } catch (error) {
        result.errors.push(`處理請款單失敗 ${invoice.invoiceNumber}: ${error}`)
        result.errorCount++
      }
    }

    result.success = result.errorCount === 0
    return result
  }

  // ===== 資料轉換方法 (CornerERP → VenturoERP) =====

  private transformCustomerData(customer: CornerCustomer) {
    return {
      id: customer.id,
      name: customer.name,
      birthday: customer.birthday || null,
      passport_romanization: customer.passportRomanization || null,
      passport_number: customer.passportNumber || null,
      passport_valid_to: customer.passportValidTo || null,
      email: customer.email || null,
      phone: customer.phone || null,
      note: customer.note || null,
      created_at: new Date(customer.createdAt).toISOString(),
      created_by: customer.createdBy,
      modified_at: customer.modifiedAt ? new Date(customer.modifiedAt).toISOString() : null,
      modified_by: customer.modifiedBy || null
    }
  }

  private transformGroupData(group: CornerGroup) {
    return {
      group_code: group.groupCode,
      group_name: group.groupName,
      departure_date: new Date(group.departureDate).toISOString(),
      return_date: new Date(group.returnDate).toISOString(),
      customer_count: group.customerCount || 0,
      traveller_ids: group.travellerIds || [],
      sales_person: group.salesPerson || null,
      op_id: group.opId || null,
      status: group.status,
      branch_bonus: group.branchBonus || null,
      sale_bonus: group.saleBonus || null,
      op_bonus: group.opBonus || null,
      profit_tax: group.profitTax || null,
      created_at: new Date(group.createdAt).toISOString(),
      created_by: group.createdBy,
      modified_at: group.modifiedAt ? new Date(group.modifiedAt).toISOString() : null,
      modified_by: group.modifiedBy || null
    }
  }

  private transformOrderData(order: CornerOrder) {
    return {
      order_number: order.orderNumber,
      group_code: order.groupCode,
      group_name: order.groupName || null,
      contact_person: order.contactPerson,
      contact_phone: order.contactPhone,
      order_type: order.orderType,
      sales_person: order.salesPerson,
      op_id: order.opId || null,
      total_amount: order.totalAmount || null,
      paid_amount: order.paidAmount || null,
      remaining_amount: order.remainingAmount || null,
      payment_status: order.paymentStatus || null,
      created_at: new Date(order.createdAt).toISOString(),
      created_by: order.createdBy,
      modified_at: order.modifiedAt ? new Date(order.modifiedAt).toISOString() : null,
      modified_by: order.modifiedBy || null
    }
  }

  private transformReceiptData(receipt: CornerReceipt) {
    return {
      receipt_number: receipt.receiptNumber,
      order_number: receipt.orderNumber,
      receipt_date: new Date(receipt.receiptDate).toISOString(),
      receipt_amount: receipt.receiptAmount,
      actual_amount: receipt.actualAmount,
      receipt_type: receipt.receiptType,
      receipt_account: receipt.receiptAccount,
      email: receipt.email,
      pay_dateline: receipt.payDateline ? new Date(receipt.payDateline).toISOString() : null,
      note: receipt.note,
      status: receipt.status,
      created_at: new Date(receipt.createdAt).toISOString(),
      created_by: receipt.createdBy,
      modified_at: receipt.modifiedAt ? new Date(receipt.modifiedAt).toISOString() : null,
      modified_by: receipt.modifiedBy || null
    }
  }

  private transformInvoiceData(invoice: CornerInvoice) {
    return {
      invoice_number: invoice.invoiceNumber,
      group_code: invoice.groupCode,
      order_number: invoice.orderNumber || null,
      invoice_date: new Date(invoice.invoiceDate).toISOString(),
      status: invoice.status,
      amount: invoice.amount || null,
      created_at: new Date(invoice.createdAt).toISOString(),
      created_by: invoice.createdBy,
      modified_at: invoice.modifiedAt ? new Date(invoice.modifiedAt).toISOString() : null,
      modified_by: invoice.modifiedBy || null
    }
  }

  // ===== 工具方法 =====

  /**
   * 從 JSON 檔案匯入
   */
  async importFromJson(jsonData: string, options: ImportOptions = {}) {
    try {
      const data = JSON.parse(jsonData)
      return await this.importCompleteDataset(data, options)
    } catch (error) {
      throw new Error(`JSON 解析失敗: ${error}`)
    }
  }

  /**
   * 從 CSV 檔案匯入 (單一模組)
   */
  async importFromCsv(csvData: string, module: 'groups' | 'orders' | 'receipts' | 'invoices' | 'customers', options: ImportOptions = {}) {
    try {
      // 簡化的 CSV 解析 (實際專案中應使用專業的 CSV 解析庫)
      const lines = csvData.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const records = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = values[index]
        })
        return record
      })

      const data = { [module]: records }
      return await this.importCompleteDataset(data, options)
    } catch (error) {
      throw new Error(`CSV 解析失敗: ${error}`)
    }
  }

  /**
   * 資料驗證 (不實際匯入)
   */
  async validateData(data: any) {
    return await this.importCompleteDataset(data, { validateOnly: true })
  }

  /**
   * 取得匯入統計
   */
  async getImportStats() {
    const stats = await Promise.all([
      this.supabase.from('customers').select('*', { count: 'exact', head: true }),
      this.supabase.from('groups').select('*', { count: 'exact', head: true }),
      this.supabase.from('orders').select('*', { count: 'exact', head: true }),
      this.supabase.from('invoices').select('*', { count: 'exact', head: true }),
      this.supabase.from('receipts').select('*', { count: 'exact', head: true })
    ])

    return {
      customers: stats[0].count || 0,
      groups: stats[1].count || 0,
      orders: stats[2].count || 0,
      invoices: stats[3].count || 0,
      receipts: stats[4].count || 0,
      total: stats.reduce((sum, stat) => sum + (stat.count || 0), 0)
    }
  }
}

// ===== 導出實例 =====

export const cornerErpImporter = new CornerErpDataImporter()

// ===== 輔助函數 =====

export const formatImportResult = (result: ImportResult, moduleName: string): string => {
  const { totalRecords, successCount, errorCount, duplicates } = result

  let summary = `\n📊 ${moduleName} 匯入結果:\n`
  summary += `   總數: ${totalRecords} 筆\n`
  summary += `   成功: ${successCount} 筆\n`
  summary += `   失敗: ${errorCount} 筆\n`
  summary += `   重複: ${duplicates.length} 筆\n`

  if (result.errors.length > 0) {
    summary += `\n❌ 錯誤訊息:\n`
    result.errors.slice(0, 5).forEach(error => {
      summary += `   • ${error}\n`
    })
    if (result.errors.length > 5) {
      summary += `   ... 還有 ${result.errors.length - 5} 個錯誤\n`
    }
  }

  return summary
}

export const createImportReport = (results: any): string => {
  let report = `\n🎯 CornerERP 資料匯入報告\n`
  report += `================================\n`

  Object.entries(results).forEach(([module, result]) => {
    if (module !== 'overall' && result) {
      report += formatImportResult(result as ImportResult, module)
    }
  })

  if (results.overall) {
    const { totalRecords, successCount, errorCount, duration } = results.overall
    report += `\n📈 總體統計:\n`
    report += `   總處理: ${totalRecords} 筆\n`
    report += `   總成功: ${successCount} 筆\n`
    report += `   總失敗: ${errorCount} 筆\n`
    report += `   耗時: ${duration}ms (${(duration / 1000).toFixed(2)}秒)\n`
    report += `   成功率: ${((successCount / totalRecords) * 100).toFixed(1)}%\n`
  }

  report += `\n================================\n`
  return report
}