#!/bin/bash

echo "🔐 GitHub Token 推送腳本"
echo "========================="
echo ""
echo "請在下一步輸入您的 GitHub Personal Access Token"
echo "(token 格式類似: ghp_xxxxxxxxxxxx)"
echo ""
read -p "請貼上您的 GitHub Token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Token 不能為空"
    exit 1
fi

echo ""
echo "📤 開始推送到 GitHub..."

# 移除舊的 remote (如果存在)
git remote remove origin 2>/dev/null

# 使用 token 設定新的 remote
git remote add origin https://$TOKEN@github.com/Corner-venturo/venturo.git

# 推送
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo "🔗 請訪問: https://github.com/Corner-venturo/venturo"
    
    # 安全考量：移除包含 token 的 remote，改用 SSH 或每次輸入 token
    git remote remove origin
    git remote add origin https://github.com/Corner-venturo/venturo.git
    echo ""
    echo "📝 注意：為了安全，已經移除儲存的 token"
    echo "   下次推送時需要重新輸入 token"
else
    echo ""
    echo "❌ 推送失敗，請檢查 token 是否正確"
fi
