# VenturoERP 2.0 - 開發原則與架構規範

> 最後更新：2025-01-21
> 這是我們的開發聖經，必須嚴格遵守

## 🚨 核心原則 - 絕對不可違反

### 1. 先思考，後行動
- **永遠不要急著修復** - 先分析問題根源
- **不要見樹不見林** - 考慮整體架構影響
- **測試優先** - 修改前先確認現況是否正常

### 2. 資料流必須清晰
```
使用者操作 → 元件 → Hook/Action → API 層 → Supabase → 資料庫
                ↑                      ↓
            狀態管理 ← 資料返回 ← 錯誤處理
```

### 3. 錯誤的做法（絕對禁止）
❌ 元件直接呼叫 Supabase
❌ 沒有錯誤處理就上線
❌ 重複的程式碼
❌ 沒測試就說「修好了」
❌ 用「暫時」的解決方案
❌ **不遵守版面對齊規範**
❌ **使用 Emoji 圖示**
❌ **使用 alert() 彈窗**

### 4. 正確的做法（必須遵守）
✅ 統一的 API 層
✅ 完整的錯誤處理
✅ 重用元件和邏輯
✅ 測試後才說完成
✅ 一次就做對
✅ **嚴格遵守版面對齊規範**
✅ **使用 SVG 或文字圖示**
✅ **使用 Toast 或 Dialog 提示**

## 🎨 UI/UX 設計規範

### 絕對禁止
1. **不使用 Emoji** - 所有圖示必須用 SVG 或文字
2. **不使用 alert()** - 改用 Toast 通知或 Dialog 元件
3. **不使用 confirm()** - 改用確認 Dialog
4. **不使用 prompt()** - 改用表單 Dialog

### 必須遵守
1. **使用 Catalyst UI 元件庫** - 統一視覺風格
2. **遵守對齊規範** - 參考 LAYOUT_ALIGNMENT_GUIDE.md
3. **響應式設計** - 支援手機、平板、桌面
4. **深色模式支援** - 所有元件都要考慮

### 替代方案
```typescript
// ❌ 錯誤：使用 alert
alert('儲存成功！')

// ✅ 正確：使用 Toast
toast.success('儲存成功！')

// ❌ 錯誤：使用 Emoji
<button>💾 儲存</button>

// ✅ 正確：使用 SVG
<button><SaveIcon /> 儲存</button>

// ❌ 錯誤：使用 confirm
if (confirm('確定刪除？')) { ... }

// ✅ 正確：使用 Dialog
<ConfirmDialog 
  title="確定刪除？"
  onConfirm={handleDelete}
/>
```

## 📐 版面對齊規範（重要！）

### 統一對齊原則
**所有頁面必須遵守 LAYOUT_ALIGNMENT_GUIDE.md 的規範**

#### 快速參考
```tsx
// 標準頁面結構
<div className="h-full">
  {/* 標題區域 - 有內距 */}
  <div className="mx-auto max-w-6xl px-8 py-8">
    {/* 標題內容 */}
  </div>
  
  {/* 內容容器 */}
  <div className="mx-auto max-w-6xl">
    {/* 分頁/篩選 - 滿版無內距 */}
    <div className="border-b">{/* ... */}</div>
    
    {/* 實際內容 - 有內距 */}
    <div className="px-8 py-6">{/* ... */}</div>
  </div>
</div>
```

**違反對齊規範的 PR 不得合併！**

## 📁 專案結構規範

```
src/
├── app/                    # 頁面路由
│   ├── (auth)/            # 認證相關頁面
│   ├── (app)/             # 主應用程式
│   └── api/               # API 路由
│
├── components/            # 元件
│   ├── catalyst/         # Catalyst UI 元件
│   ├── features/         # 功能元件
│   └── layouts/          # 版面元件
│
├── lib/                   # 核心邏輯
│   ├── api/              # API 層（必須）
│   │   ├── todos.ts
│   │   ├── projects.ts
│   │   └── users.ts
│   ├── hooks/            # 自訂 Hooks
│   ├── utils/            # 工具函數
│   └── supabase/         # Supabase 設定
│
├── stores/               # 狀態管理（Zustand）
│   ├── authStore.ts
│   ├── todoStore.ts
│   └── uiStore.ts
│
└── types/                # TypeScript 型別定義
    ├── database.ts       # 資料庫型別
    ├── api.ts           # API 型別
    └── ui.ts            # UI 型別
```

## 🏗️ 開發流程

### 新功能開發 SOP
1. **規劃階段**
   - 定義需求和範圍
   - 設計資料結構
   - 規劃 API 介面
   - 考慮錯誤情況
   - **確認版面對齊設計**
   - **確認不使用禁止元素**

2. **實作階段**
   ```typescript
   // 1. 先定義型別
   interface Feature {
     id: string
     // ...
   }
   
   // 2. 建立 API 層
   class FeatureAPI {
     async get() { /* 錯誤處理 */ }
     async create() { /* 錯誤處理 */ }
     async update() { /* 錯誤處理 */ }
     async delete() { /* 錯誤處理 */ }
   }
   
   // 3. 建立 Hook
   function useFeature() {
     // 狀態管理
     // 錯誤處理
     // Loading 狀態
   }
   
   // 4. 最後才是元件（遵守對齊規範）
   function FeatureComponent() {
     const { data, loading, error } = useFeature()
     // UI 邏輯 - 必須遵守 LAYOUT_ALIGNMENT_GUIDE
     // 不使用 Emoji、alert()
   }
   ```

3. **測試階段**
   - 正常流程測試
   - 錯誤情況測試
   - 邊界條件測試
   - 效能測試
   - **版面對齊檢查**
   - **UI 規範檢查**

## 🛡️ 錯誤處理規範

### 永遠要處理的錯誤
1. **網路錯誤** - 斷線、超時
2. **權限錯誤** - 未登入、無權限
3. **資料錯誤** - 格式錯誤、驗證失敗
4. **伺服器錯誤** - 500、503

### 錯誤處理模式
```typescript
// ❌ 錯誤做法
const { data, error } = await supabase.from('todos').select()
if (error) {
  alert('發生錯誤')  // 不要用 alert
  console.error(error)
}

// ✅ 正確做法
try {
  const { data, error } = await supabase.from('todos').select()
  if (error) throw error
  return { success: true, data }
} catch (error) {
  // 記錄錯誤
  console.error('Failed to fetch todos:', error)
  
  // 通知使用者（不用 alert）
  toast.error('無法載入待辦事項')
  
  // 返回安全預設值
  return { success: false, data: [] }
}
```

## 🔄 狀態管理規範

### 使用 Zustand（不是 useState 到處亂放）
```typescript
// stores/todoStore.ts
interface TodoStore {
  todos: Todo[]
  loading: boolean
  error: Error | null
  
  // Actions
  fetchTodos: () => Promise<void>
  addTodo: (todo: CreateTodoDTO) => Promise<void>
  updateTodo: (id: string, updates: UpdateTodoDTO) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
}

// 元件中使用
function TodoList() {
  const { todos, loading, fetchTodos } = useTodoStore()
  
  useEffect(() => {
    fetchTodos()
  }, [])
  
  // 簡潔清晰
}
```

## 🚀 效能規範

### 必須遵守的效能原則
1. **懶載入** - 只載入需要的資料
2. **快取** - 避免重複請求
3. **分頁** - 大量資料必須分頁
4. **防抖** - 搜尋、自動儲存要防抖
5. **優化渲染** - 使用 memo、useCallback

## 📝 程式碼品質規範

### 命名規範
- **檔案名**: kebab-case (todo-list.tsx)
- **元件名**: PascalCase (TodoList)
- **函數名**: camelCase (fetchTodos)
- **常數**: UPPER_SNAKE_CASE (MAX_RETRIES)

### 註解規範
```typescript
/**
 * 取得使用者的待辦事項
 * @param userId - 使用者 ID
 * @param filters - 篩選條件
 * @returns 待辦事項列表
 * @throws {AuthError} 未登入或無權限
 * @throws {NetworkError} 網路錯誤
 */
async function fetchUserTodos(userId: string, filters?: TodoFilters): Promise<Todo[]> {
  // 實作...
}
```

## ⚠️ 常見錯誤與解決方案

### 1. RLS 錯誤
**錯誤**: infinite recursion
**原因**: 政策互相引用
**解決**: 簡化政策，避免巢狀查詢

### 2. Prefetch 問題
**錯誤**: 不該載入的頁面呼叫 API
**原因**: Next.js 預載入機制
**解決**: 
- 設定 `prefetch={false}`
- 檢查 pathname 再載入
- 使用動態載入

### 3. 狀態不同步
**錯誤**: UI 和資料庫不一致
**原因**: 沒有統一狀態管理
**解決**: 使用 Zustand 統一管理

### 4. 版面不對齊
**錯誤**: 分頁、標題、內容沒有對齊
**原因**: 沒有遵守對齊規範
**解決**: 嚴格遵守 LAYOUT_ALIGNMENT_GUIDE.md

### 5. 使用禁止元素
**錯誤**: 使用 Emoji 或 alert()
**原因**: 沒有遵守 UI 規範
**解決**: 改用 SVG 和 Toast/Dialog

## 🎯 開發檢查清單

每次開發新功能前，問自己：
- [ ] 資料結構設計好了嗎？
- [ ] API 層規劃好了嗎？
- [ ] 錯誤處理考慮了嗎？
- [ ] 效能影響評估了嗎？
- [ ] 有重複的程式碼嗎？
- [ ] 測試計畫擬定了嗎？
- [ ] **版面對齊規範確認了嗎？**
- [ ] **沒有使用 Emoji 吧？**
- [ ] **沒有使用 alert() 吧？**

每次提交程式碼前，確認：
- [ ] 沒有 console.log
- [ ] 沒有註解掉的程式碼
- [ ] 有適當的錯誤處理
- [ ] 有 Loading 狀態
- [ ] 型別定義完整
- [ ] 命名清晰一致
- [ ] **版面對齊正確**
- [ ] **沒有 Emoji**
- [ ] **沒有 alert()**

## 📚 必讀文件

1. **PROJECT_CONCEPT_MERGED.md** - 專案概念與規劃
2. **LAYOUT_ALIGNMENT_GUIDE.md** - 版面對齊規範（重要！）
3. **ISSUES_TRACKING.md** - 問題追蹤與解決方案
4. **DEPLOYMENT_CHECKLIST.md** - 部署檢查清單
5. **AI_PROJECT_BRIEFING.md** - AI 協作指令

## 💪 記住

> "寫程式不是在救火，是在建造摩天大樓。
> 地基不穩，樓越高越危險。"

**永遠記住**：
1. 架構優先
2. 品質優先
3. 可維護性優先
4. **對齊一致性優先**
5. **使用者體驗優先**

**永遠不要**：
1. 快速修復（Quick Fix）
2. 暫時解決（Temporary Solution）
3. 之後再改（TODO: Fix Later）
4. **忽視版面對齊**
5. **使用 Emoji 或 alert()**

---

此文件是開發準則，任何違反都會導致技術債務。
請時時回顧，確保遵守。

**最後更新**：2025-01-21
- 新增版面對齊規範
- 新增 UI/UX 設計規範（禁用 Emoji 和 alert）
- 新增 AI 協作文件參考
