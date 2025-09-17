import os

# 基礎路徑
base_path = "/Users/williamchien/Desktop/Venturo/venturoerp-tailwind/src/app/(app)"

# 所有需要建立的模組
modules = [
    ("cashflow", "出納單"),
    ("suppliers", "供應商"),
    ("simcards", "網卡管理"),
    ("employees", "員工管理"),
    ("quotations", "報價單"),
    ("itinerary", "行程設計"),
    ("tours", "旅遊團"),
    ("contracts", "合約"),
    ("confirmations", "確認單"),
    ("costs", "成本資料"),
    ("admin", None),  # 只建立目錄
    ("admin/users", "用戶管理"),
    ("admin/permissions", "權限設定"),
    ("admin/settings", "系統設定"),
]

# 頁面模板
page_template = """import ComingSoonPage from '@/components/ComingSoon'

export default function Page() {{
  return <ComingSoonPage title="{title}" />
}}"""

# 建立模組
for path, title in modules:
    full_path = os.path.join(base_path, path)
    
    # 建立目錄
    os.makedirs(full_path, exist_ok=True)
    print(f"建立目錄: {full_path}")
    
    # 如果有標題，建立頁面檔案
    if title:
        page_file = os.path.join(full_path, "page.tsx")
        with open(page_file, "w") as f:
            f.write(page_template.format(title=title))
        print(f"建立頁面: {page_file} - {title}")

print("\n所有模組建立完成！")