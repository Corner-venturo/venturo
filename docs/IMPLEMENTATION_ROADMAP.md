# VenturoERP 2.0 實作路線圖

> 日期：2025-09-16
> 狀態：🚀 準備執行
> 預計完成：2025-12-16 (3個月)

## 🎯 總體目標

將 cornerERP 的 5 個核心業務模組完整移植到 VenturoERP 2.0，並遵守所有設計規範和架構要求。

## 📅 詳細時程規劃

### Phase 0: 準備階段 ✅ 已完成 (2025-09-16)
- [x] cornerERP 功能分析
- [x] 移植計畫制定
- [x] 資料庫架構設計
- [x] 行事曆功能完成 (作為範例)

### Phase 1: 基礎模組 (Week 1-4)

#### Week 1-2: 顧客管理模組 👥
**優先級**: 🔴 最高 (其他模組的基礎)

**Day 1-3: 資料層實作**
- [ ] 執行 `business_modules_schema.sql`
- [ ] 建立 Customer 型別定義
- [ ] 實作 CustomerAPI 類別
- [ ] 建立 Zustand store

**Day 4-7: UI 元件開發**
- [ ] 顧客列表頁面
- [ ] 顧客新增/編輯表單
- [ ] 顧客詳細頁面
- [ ] 護照資訊管理

**Day 8-10: 功能整合**
- [ ] 批次匯入功能
- [ ] 與行事曆生日整合
- [ ] 搜索與篩選功能
- [ ] 測試與驗證

#### Week 3-4: 旅遊團管理模組 🚌
**優先級**: 🔴 最高 (訂單系統的基礎)

**Day 11-14: 資料層實作**
- [ ] Group 型別定義
- [ ] GroupAPI 類別實作
- [ ] 旅客關聯管理
- [ ] Zustand store

**Day 15-21: UI 元件開發**
- [ ] 旅遊團列表頁面
- [ ] 旅遊團新增/編輯表單
- [ ] 旅遊團詳細頁面
- [ ] 旅客管理介面

**Day 22-28: 整合功能**
- [ ] 與行事曆整合
- [ ] 業務員/OP指派
- [ ] 獎金比例設定
- [ ] 團狀態管理

### Phase 2: 業務流程模組 (Week 5-8)

#### Week 5-6: 訂單管理模組 📋
**優先級**: 🟡 高 (財務模組基礎)

**Day 29-32: 核心功能**
- [ ] Order 型別與API
- [ ] 訂單列表與表單
- [ ] 與旅遊團關聯
- [ ] 聯絡人資訊管理

**Day 33-35: 進階功能**
- [ ] 訂單類型管理
- [ ] 業務員指派
- [ ] 選擇列表功能
- [ ] 按團號分組查詢

**Day 36-42: 整合測試**
- [ ] 跨模組資料一致性
- [ ] 搜索功能優化
- [ ] UI/UX 優化

#### Week 7-8: 供應商管理 🏢
**優先級**: 🟡 高 (請款單依賴)

**Day 43-49: 供應商管理**
- [ ] Supplier 型別與API
- [ ] 供應商CRUD操作
- [ ] 聯絡資訊管理
- [ ] 付款條件設定

### Phase 3: 財務模組 (Week 9-12)

#### Week 9-10: 請款單系統 💰
**優先級**: 🟠 中高 (複雜財務邏輯)

**Day 50-56: 請款單主體**
- [ ] Invoice 型別與API
- [ ] 請款單CRUD操作
- [ ] 多狀態流程管理
- [ ] 與訂單/旅遊團關聯

**Day 57-63: 請款項目明細**
- [ ] InvoiceItem 管理
- [ ] 供應商關聯
- [ ] 金額計算邏輯
- [ ] 批次操作

#### Week 11-12: 收款單系統 💳
**優先級**: 🟠 中高 (完整業務閉環)

**Day 64-70: 收款單功能**
- [ ] Receipt 型別與API
- [ ] 收款單CRUD操作
- [ ] 多種付款方式
- [ ] 批次建立功能

**Day 71-77: 整合功能**
- [ ] 按訂單分組
- [ ] 可展開行顯示
- [ ] 收款狀態管理
- [ ] 參考號碼管理

### Phase 4: 整合優化 (Week 13-16)

#### Week 13-14: 跨模組整合
**優先級**: 🟢 中 (系統穩定性)

**Day 78-84: 資料一致性**
- [ ] 跨模組資料同步
- [ ] 關聯性驗證
- [ ] 冗余資料更新
- [ ] 完整性檢查

**Day 85-91: 業務流程**
- [ ] 完整業務流程測試
- [ ] 工作流程優化
- [ ] 權限系統整合
- [ ] 效能優化

#### Week 15-16: 最終測試與文件
**優先級**: 🟢 中 (交付準備)

**Day 92-98: 綜合測試**
- [ ] 功能完整性測試
- [ ] 效能壓力測試
- [ ] 安全性測試
- [ ] 瀏覽器相容性測試

**Day 99-105: 文件與培訓**
- [ ] API 文件完善
- [ ] 用戶手冊撰寫
- [ ] 開發文件整理
- [ ] 部署指南

## 🏗️ 實作規範

### 每個模組必須遵循的標準

#### 1. 資料層 (Data Layer)
```typescript
// 型別定義
interface ModuleName {
  id: string
  // ... 其他欄位
  created_at: string
  updated_at: string
  created_by: string
}

// API 類別
class ModuleNameAPI {
  static async getAll(params?: QueryParams)
  static async getById(id: string)
  static async create(data: CreateData)
  static async update(id: string, data: UpdateData)
  static async delete(id: string)
}

// Zustand Store
interface ModuleNameStore {
  items: ModuleName[]
  loading: boolean
  error: string | null

  fetchItems: () => Promise<void>
  addItem: (item: CreateData) => Promise<void>
  updateItem: (id: string, data: UpdateData) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}
```

#### 2. 元件層 (Component Layer)
```typescript
// 頁面結構
function ModuleNamePage() {
  return (
    <div className="h-full">
      {/* 標題區域 - 有內距 */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        {/* 標題與功能按鈕 */}
      </div>

      {/* 內容容器 */}
      <div className="mx-auto max-w-6xl">
        <div className="px-8 py-6">
          {/* 實際內容 */}
        </div>
      </div>
    </div>
  )
}
```

#### 3. 設計規範檢查清單
- [ ] ❌ 不使用 Emoji
- [ ] ❌ 不使用 alert(), confirm(), prompt()
- [ ] ✅ 使用 SVG 圖示
- [ ] ✅ 使用 Dialog/Toast 元件
- [ ] ✅ 遵守 15px 邊距規範
- [ ] ✅ 標題左對齊，按鈕右對齊
- [ ] ✅ 響應式設計
- [ ] ✅ 深色模式支援

## 📊 里程碑與交付物

### Milestone 1: 基礎模組完成 (Week 4)
**交付物**:
- [x] 顧客管理完整功能
- [x] 旅遊團管理完整功能
- [x] 跨模組關聯測試通過
- [x] 符合所有設計規範

### Milestone 2: 業務流程完成 (Week 8)
**交付物**:
- [x] 訂單管理完整功能
- [x] 供應商管理完整功能
- [x] 業務流程測試通過
- [x] API 文件完善

### Milestone 3: 財務模組完成 (Week 12)
**交付物**:
- [x] 請款單系統完整功能
- [x] 收款單系統完整功能
- [x] 財務流程測試通過
- [x] 完整業務閉環測試

### Milestone 4: 系統整合完成 (Week 16)
**交付物**:
- [x] 所有模組整合測試通過
- [x] 效能與安全性測試通過
- [x] 文件與培訓材料完成
- [x] 生產環境部署準備

## 🔍 品質保證

### 代碼品質標準
- **TypeScript 嚴格模式** - 100% 型別覆蓋
- **ESLint 檢查** - 零警告政策
- **程式碼審查** - 所有 PR 必須審查
- **測試覆蓋** - 關鍵功能必須測試

### 效能指標
- **載入時間** - 初次載入 < 3 秒
- **操作響應** - 使用者操作 < 500ms
- **記憶體使用** - 穩定在合理範圍
- **並發處理** - 支援多用戶同時操作

### 安全標準
- **RLS 政策** - 100% 資料隔離
- **認證檢查** - 所有 API 端點
- **輸入驗證** - 防止 SQL 注入
- **權限控制** - 基於角色存取

## 🚧 風險管控

### 高風險項目
1. **資料遷移** - 現有資料如何遷移
   - **緩解**: 建立遷移工具和測試環境

2. **效能影響** - 複雜查詢可能影響效能
   - **緩解**: 資料庫索引優化，查詢優化

3. **功能相容** - 新舊系統功能差異
   - **緩解**: 詳細功能對比，逐一驗證

### 中風險項目
1. **UI/UX 適應** - 用戶習慣改變
   - **緩解**: 漸進式界面改進

2. **整合複雜度** - 模組間依賴關係
   - **緩解**: 清晰的介面定義

## 📈 成功指標

### 功能指標
- [ ] 100% 功能移植完成
- [ ] 0 個阻塞性 Bug
- [ ] 95% 以上功能測試通過

### 效能指標
- [ ] 載入速度提升 30%
- [ ] 操作響應提升 50%
- [ ] 記憶體使用減少 20%

### 品質指標
- [ ] 100% TypeScript 覆蓋
- [ ] 0 個 ESLint 警告
- [ ] 90% 以上代碼審查通過

---

**這個路線圖將確保 cornerERP 的強大功能能夠系統性、高品質地移植到 VenturoERP 2.0！**