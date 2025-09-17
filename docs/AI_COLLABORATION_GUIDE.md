# Claude 協作指南 - VenturoERP 2.0 開發

> 給 Claude Code 的完整專案背景與協作指引
> 日期：2025-09-16
> 專案狀態：原型開發階段

## 🎯 專案總覽

### 專案目標
將 **cornerERP 的 5 個核心業務模組**完整移植到 **VenturoERP 2.0**，使用 Mock 資料進行原型開發，為未來的無縫切換做準備。

### 關鍵業務模組
1. **顧客管理** (Customers) - 基礎資料，其他模組依賴
2. **旅遊團管理** (Groups) - 核心業務邏輯
3. **訂單管理** (Orders) - 業務流程
4. **財務管理** (Invoices & Receipts) - 請款單 + 收款單
5. **供應商管理** (Suppliers) - 支援模組

## 🏗️ 技術架構決策

### 已確定的架構選擇
- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **UI 庫**: Catalyst UI (必須使用，已整合)
- **狀態管理**: Zustand (已實作 globalStore)
- **資料層**: Supabase + Mock 資料雙軌並行
- **權限系統**: 階層式權限 (admin > accountant > user)

### 開發模式決策
- **原型優先**: 使用 Mock 資料先建立完整功能原型
- **無縫切換**: 設計架構讓未來能一鍵切換到實際資料庫
- **完整驗證**: 透過原型驗證所有架構和設計決策

## 🚫 絕對禁止的項目 (VenturoERP 2.0 規範)

### UI/UX 禁用項目
- ❌ **絕對不使用 Emoji** (任何地方都不可以)
- ❌ **絕對不使用 `alert()`、`confirm()`、`prompt()`**
- ❌ **不使用任何瀏覽器原生彈窗**

### 必須使用的替代方案
- ✅ **使用 SVG 圖示** 替代 Emoji
- ✅ **使用 Catalyst Dialog** 替代 alert/confirm
- ✅ **使用 Toast 通知** 替代簡單提示

### 版面對齊嚴格規範
```tsx
// 標準頁面結構 - 必須遵守
<div className="h-full">
  {/* 標題區域 - 有內距 */}
  <div className="mx-auto max-w-6xl px-8 py-8">
    <div className="flex items-center justify-between">
      <div>
        <h1>標題 (左對齊)</h1>
        <p>描述文字</p>
      </div>
      <div>
        {/* 功能按鈕 (右對齊) */}
        <Button>新增</Button>
      </div>
    </div>
  </div>

  {/* 內容容器 */}
  <div className="mx-auto max-w-6xl">
    <div className="px-8 py-6">
      {/* 實際內容 */}
    </div>
  </div>
</div>
```

## 🔧 已建立的核心架構

### 1. 權限系統 (`/src/hooks/usePermissions.ts`)
- **完整的業務權限定義** - 涵蓋所有 5 個業務模組
- **階層式權限檢查** - 對應 cornerERP 的 admin/accountant/user
- **角色映射** - VenturoERP 角色 ↔ cornerERP 權限等級

### 2. 統一 API 架構 (`/src/lib/api/BaseBusinessAPI.ts`)
- **BaseBusinessAPI 基礎類別** - 提供標準 CRUD 操作
- **自動錯誤處理** - 統一的錯誤回應格式
- **權限整合** - 自動處理認證和權限檢查
- **關聯查詢** - 支援複雜的業務關聯

### 3. Mock 資料管理 (`/src/lib/mock/MockDataManager.ts`)
- **完整的 Mock 系統** - 支援所有 CRUD 操作
- **網路延遲模擬** - 模擬真實的網路環境
- **錯誤率模擬** - 測試錯誤處理邏輯
- **無縫切換** - 一行代碼切換 Mock/實際資料

### 4. 資料庫架構 (`/database/business_modules_schema.sql`)
- **完整的業務表結構** - 8 個主表 + 關聯表
- **RLS 政策** - 完整的資料安全控制
- **索引優化** - 查詢效能優化
- **業務視圖** - 複雜查詢的預建視圖

## 🎯 當前開發任務

### 立即目標：建立顧客管理原型
我們選擇**顧客管理**作為第一個原型，因為：
1. **基礎依賴** - 其他模組都會引用顧客資料
2. **相對簡單** - 較少的業務邏輯複雜性
3. **完整功能** - 涵蓋 CRUD + 批次操作 + 權限控制

### 需要完成的元件
1. **資料型別定義** - Customer interface
2. **API 層實作** - CustomerAPI 繼承 BaseBusinessAPI
3. **Mock 資料** - 完整的測試資料集
4. **Zustand Store** - 狀態管理
5. **UI 元件**:
   - 顧客列表頁 (`/customers`)
   - 顧客新增/編輯表單
   - 顧客詳細頁面 (`/customers/[id]`)
   - 批次操作功能

## 📝 開發規範提醒

### 程式碼品質要求
- **TypeScript 嚴格模式** - 100% 型別覆蓋
- **無 console.log** - 使用適當的日誌機制
- **統一命名** - camelCase for 變數, PascalCase for 元件
- **完整註解** - 關鍵業務邏輯必須註解

### 檔案組織規範
```
src/
├── types/
│   └── customer.ts          # Customer 相關型別
├── lib/
│   ├── api/
│   │   └── customer.ts      # CustomerAPI 實作
│   └── mock/
│       └── customerData.ts  # Mock 測試資料
├── stores/
│   └── customerStore.ts     # Zustand 狀態管理
└── app/(app)/
    └── customers/
        ├── page.tsx         # 列表頁
        ├── [id]/
        │   └── page.tsx     # 詳細頁
        └── components/      # 模組專用元件
```

## 🚀 成功指標

### 原型完成標準
- [ ] 完整的 CRUD 操作
- [ ] 權限控制正確運作
- [ ] 符合所有 UI/UX 規範
- [ ] Mock 資料無縫運作
- [ ] 響應式設計完整
- [ ] 零 TypeScript 錯誤
- [ ] 零 ESLint 警告

### 架構驗證目標
- [ ] API 層架構可重用於其他模組
- [ ] 權限系統涵蓋所有業務場景
- [ ] Mock 系統支援複雜測試情境
- [ ] UI 元件模式可快速複製到其他模組

## ⚡ 開發效率提升策略

### 使用已建立的架構
- **不要重新發明輪子** - 使用 BaseBusinessAPI
- **複用權限邏輯** - 使用 usePermissions hook
- **統一錯誤處理** - 遵循 APIResponse 格式
- **標準頁面結構** - 遵循版面對齊規範

### 優先順序策略
1. **先建立資料層** - 型別 + API + Mock 資料
2. **再建立狀態管理** - Zustand store
3. **最後建立 UI** - 頁面 + 元件

## 🤝 協作期待

### Claude 的責任
- **嚴格遵循所有規範** - 特別是禁用項目
- **使用既有架構** - 不要創造新的模式
- **保持程式碼品質** - TypeScript + 最佳實踐
- **考慮未來擴展** - 設計要能支援其他 4 個模組

### 我會提供的支援
- **明確的需求** - 具體的功能要求
- **及時的回饋** - 對實作方向的確認
- **業務邏輯指導** - cornerERP 的業務規則解釋

## 📚 重要參考文件

1. **`CORNERERP_MIGRATION_PLAN.md`** - 移植總體規劃
2. **`IMPLEMENTATION_ROADMAP.md`** - 詳細實作路線圖
3. **`CALENDAR_IMPLEMENTATION.md`** - 行事曆實作範例
4. **`DEVELOPMENT_PRINCIPLES.md`** - 開發規範 (禁用項目)
5. **`LAYOUT_ALIGNMENT_GUIDE.md`** - 版面對齊規範

---

## 🎯 總結：現在開始顧客管理原型開發

**目標**: 建立第一個完整的業務模組原型，驗證整個架構的可行性
**策略**: 使用 Mock 資料，遵循所有規範，為未來 4 個模組建立標準模式
**成功標準**: 功能完整、架構優雅、未來可無縫切換到實際資料庫

準備好開始了嗎？讓我們從顧客管理的資料型別定義開始！