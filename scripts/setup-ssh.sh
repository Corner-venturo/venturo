#!/bin/bash

echo "🔑 設定 GitHub SSH"
echo "=================="
echo ""

# 檢查是否已有 SSH key
if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo "✅ 找到現有的 SSH Key"
    echo ""
    echo "📋 您的 SSH 公鑰是："
    echo "------------------------"
    cat ~/.ssh/id_ed25519.pub
    echo "------------------------"
else
    echo "🔨 建立新的 SSH Key..."
    read -p "請輸入您的 GitHub Email: " email
    ssh-keygen -t ed25519 -C "$email" -f ~/.ssh/id_ed25519 -N ""
    
    echo ""
    echo "✅ SSH Key 建立成功！"
    echo ""
    echo "📋 您的 SSH 公鑰是："
    echo "------------------------"
    cat ~/.ssh/id_ed25519.pub
    echo "------------------------"
fi

echo ""
echo "📝 請按照以下步驟操作："
echo "1. 複製上面的 SSH 公鑰（從 ssh-ed25519 開始的整行）"
echo "2. 打開 https://github.com/settings/ssh/new"
echo "3. Title 輸入: VenturoERP Mac"
echo "4. Key 貼上剛剛複製的公鑰"
echo "5. 點擊 Add SSH key"
echo ""
read -p "完成後按 Enter 繼續..."

# 測試 SSH 連接
echo ""
echo "🧪 測試 SSH 連接..."
ssh -T git@github.com

echo ""
echo "🔄 切換到 SSH remote..."
cd /Users/williamchien/Desktop/Venturo/venturoerp-tailwind
git remote remove origin
git remote add origin git@github.com:Corner-venturo/venturo.git

echo ""
echo "📤 使用 SSH 推送..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo "🎉 以後可以直接使用 git push 而不需要輸入密碼"
else
    echo ""
    echo "❌ 推送失敗，請確認 SSH Key 已正確添加到 GitHub"
fi
