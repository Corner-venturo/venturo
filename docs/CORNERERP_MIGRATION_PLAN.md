# cornerERP 核心業務功能移植計畫

> 日期：2025-09-16
> 狀態：📋 規劃階段
> 目標：將 cornerERP 強大的業務功能完整移植到 VenturoERP 2.0

## 🎯 移植目標

將以下 5 個核心業務模組從 cornerERP 移植到新的 VenturoERP 2.0 系統：

1. **旅遊團管理** (Groups Management)
2. **訂單管理** (Orders Management)
3. **請款單** (Invoices)
4. **收款單** (Receipts)
5. **顧客管理** (Customers Management)

**重要**：不處理刷卡 API 問題，專注於核心業務邏輯。

## 📊 現有功能分析

### 1. 旅遊團管理 (Groups)

#### 核心功能
- ✅ **完整的旅遊團 CRUD 操作**
- ✅ **團號、團名、出發/回程日期管理**
- ✅ **旅客數量與 ID 關聯**
- ✅ **業務員、OP 員指派**
- ✅ **獎金比例設定 (分公司、業務、OP)**
- ✅ **團狀態管理** (進行中/已結團/特殊團)
- ✅ **旅客資料匯入功能**
- ✅ **與行事曆整合**

#### 資料結構
```typescript
interface Group {
  groupCode: string        // 團號 (主鍵)
  groupName: string        // 團名
  departureDate: Date      // 出發日
  returnDate: Date         // 回程日期
  customerCount: number    // 旅客數量
  travellerIds: string[]   // 旅客ID陣列
  salesPerson?: string     // 業務員
  opId?: string           // OP員
  status: number          // 團狀態
  branchBonus: number     // 分公司獎金比例
  saleBonus?: number      // 業務獎金比例
  opBonus?: number        // OP獎金比例
  profitTax?: number      // 營收稅額
}
```

### 2. 訂單管理 (Orders)

#### 核心功能
- ✅ **訂單編號自動生成**
- ✅ **與旅遊團關聯 (groupCode)**
- ✅ **聯絡人資訊管理**
- ✅ **訂單類型分類**
- ✅ **業務員指派**
- ✅ **選擇列表功能** (for-select API)
- ✅ **按團號分組查詢**
- ✅ **進階搜索功能**

#### 資料結構
```typescript
interface Order {
  orderNumber: string      // 訂單編號 (主鍵)
  groupCode: string       // 關聯團號
  groupName?: string      // 團名 (關聯顯示)
  contactPerson: string   // 聯絡人
  contactPhone: string    // 聯絡電話
  orderType: string       // 訂單類型
  salesPerson: string     // 業務員
  opId?: string          // OP員
}
```

### 3. 請款單 (Invoices)

#### 核心功能
- ✅ **請款單號管理**
- ✅ **與訂單/旅遊團關聯**
- ✅ **請款項目明細管理 (InvoiceItem)**
- ✅ **供應商關聯**
- ✅ **多狀態流程** (待確認/已確認/已出帳)
- ✅ **金額計算**
- ✅ **批次操作**

#### 資料結構
```typescript
interface Invoice {
  invoiceNumber: string    // 請款單號 (主鍵)
  groupCode: string       // 關聯團號
  orderNumber?: string    // 關聯訂單編號
  invoiceDate: Date       // 請款日期
  status: number          // 0:待確認 1:已確認 2:已出帳
  invoiceItems?: InvoiceItem[]  // 請款項目
  amount?: number         // 總金額
}

interface InvoiceItem {
  invoiceNumber: string   // 關聯請款單
  invoiceType: number     // 請款類型
  payFor: string         // 付款供應商代號
  supplierName?: string  // 供應商名稱
  price: number          // 價格
  quantity: number       // 數量
  note?: string          // 備註
}
```

### 4. 收款單 (Receipts)

#### 核心功能
- ✅ **收款單號管理**
- ✅ **LinkPay 整合** (不處理刷卡 API)
- ✅ **批次建立功能**
- ✅ **按訂單分組**
- ✅ **可展開行顯示詳細資料**
- ✅ **多種查詢模式**

#### 資料結構
```typescript
interface Receipt {
  receiptNumber: string    // 收款單號 (主鍵)
  orderNumber?: string    // 關聯訂單
  groupCode: string       // 關聯團號
  amount: number          // 收款金額
  receiptDate: Date       // 收款日期
  paymentMethod: string   // 付款方式
  status: number          // 收款狀態
}
```

### 5. 顧客管理 (Customers)

#### 核心功能
- ✅ **完整客戶資料管理**
- ✅ **護照資訊管理**
- ✅ **生日提醒** (已整合到行事曆)
- ✅ **聯絡資訊**
- ✅ **與旅遊團關聯**
- ✅ **批次匯入功能**

#### 資料結構
```typescript
interface Customer {
  id: string                    // 客戶ID (主鍵)
  name: string                 // 姓名
  birthday?: string            // 生日
  passportRomanization?: string // 護照羅馬拼音
  passportNumber?: string      // 護照號碼
  passportValidTo?: string     // 護照有效期
  email?: string              // 電子郵件
  phone?: string              // 電話
  note?: string               // 備註
}
```

## 🏗️ 技術架構分析

### cornerERP 使用的技術棧
- **BaseAPI 架構** - 統一的 API 抽象層
- **RTK Query** - 狀態管理與資料獲取
- **Material-UI** - UI 組件庫
- **Supabase** - 資料庫與認證

### VenturoERP 2.0 目標架構
- **統一 API 層** - 遵循現有的 CalendarAPI 模式
- **Zustand** - 輕量狀態管理
- **Catalyst UI** - 統一 UI 組件庫
- **Supabase** - 保持一致的資料庫

## 📋 移植策略

### Phase 1: 基礎架構準備 (1-2 週)
1. **資料庫 Schema 設計**
   - 設計符合 VenturoERP 2.0 規範的資料表結構
   - 建立關聯性 (Groups ↔ Orders ↔ Invoices/Receipts)
   - 設定 RLS 政策

2. **API 層統一**
   - 建立統一的 API 架構模式
   - 適配 Zustand 狀態管理
   - 定義標準的錯誤處理

### Phase 2: 核心模組移植 (4-6 週)

#### 🥇 優先順序 1: 顧客管理 + 旅遊團管理
**原因**: 這兩個是基礎資料，其他模組都會依賴它們

1. **顾客管理** (1.5 週)
   - 移植客戶 CRUD 操作
   - 整合護照資訊管理
   - 建立與行事曆的生日整合

2. **旅遊團管理** (1.5 週)
   - 移植團體 CRUD 操作
   - 建立與行事曆的整合
   - 實作旅客關聯功能

#### 🥈 優先順序 2: 訂單管理
**時程**: 1.5 週
**原因**: 訂單是請款單和收款單的基礎

- 建立訂單與旅遊團的關聯
- 實作聯絡人資訊管理
- 整合業務員指派功能

#### 🥉 優先順序 3: 財務模組 (請款單 + 收款單)
**時程**: 2 週
**原因**: 複雜的財務邏輯，需要仔細處理

1. **請款單** (1 週)
   - 實作請款項目明細
   - 建立供應商關聯
   - 狀態流程管理

2. **收款單** (1 週)
   - 收款流程管理
   - 批次操作功能
   - 簡化的付款方式 (不含刷卡 API)

### Phase 3: 整合與優化 (2-3 週)

1. **模組間整合**
   - 確保資料一致性
   - 建立完整的業務流程
   - 跨模組資料查詢優化

2. **UI/UX 統一**
   - 符合 VenturoERP 2.0 設計規範
   - 版面對齊規範
   - 響應式設計

3. **測試與驗證**
   - 功能測試
   - 效能測試
   - 資料完整性驗證

## 🎨 設計規範適配

### 必須遵守的 VenturoERP 2.0 規範
- ❌ **絕對禁用**: Emoji、`alert()`、`confirm()`、`prompt()`
- ✅ **使用**: SVG 圖示、Dialog 元件、Toast 通知
- ✅ **版面對齊**: 15px 邊距、統一標題位置、功能按鈕右對齊
- ✅ **雙模式支援**: 根據業務性質，部分功能僅在工作模式顯示

### UI 元件對應表
| cornerERP 元件 | VenturoERP 2.0 元件 |
|----------------|-------------------|
| Material-UI Button | Catalyst Button |
| Material-UI Table | Catalyst Table |
| Material-UI Dialog | Catalyst Dialog |
| Material-UI TextField | Catalyst Input |
| Material-UI Select | Catalyst Select |

## 📊 預期成果

### 功能完整性
- ✅ 保留 100% 的核心業務功能
- ✅ 優化使用者體驗
- ✅ 統一的設計語言
- ✅ 更好的效能表現

### 技術債務清理
- ✅ 統一的程式碼風格
- ✅ 更清晰的架構組織
- ✅ 更好的維護性
- ✅ 符合最新的開發規範

## 🚧 注意事項與限制

### 不移植的功能
1. **刷卡 API 相關功能** - 按要求排除
2. **舊版 UI 組件** - 全部替換為 Catalyst UI
3. **過時的狀態管理** - 改用 Zustand

### 需要特別注意的
1. **資料遷移計畫** - 需要制定現有資料的遷移策略
2. **權限系統整合** - 確保與 VenturoERP 2.0 權限系統一致
3. **API 向後相容** - 考慮是否需要支援舊 API

## 📅 時程規劃

```
Week 1-2:  基礎架構準備
Week 3-4:  顧客管理 + 旅遊團管理
Week 5-6:  訂單管理
Week 7-8:  請款單功能
Week 9-10: 收款單功能
Week 11-12: 整合測試與優化
```

**總計**: 約 3 個月的開發時程

## ✅ 成功指標

- [ ] 所有 5 個核心模組功能完整移植
- [ ] 100% 符合 VenturoERP 2.0 設計規範
- [ ] 通過完整的功能測試
- [ ] 效能表現優於原系統
- [ ] 程式碼品質達到專案標準
- [ ] 完整的文件與使用手冊

---

**這個移植計畫將確保 cornerERP 的強大業務功能能夠完美融入新的 VenturoERP 2.0 系統架構中！**