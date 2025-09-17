#!/bin/bash

echo "🔧 完成 SSH 設定"
echo "================"
echo ""

# 測試 SSH 連接
echo "📡 測試 SSH 連接到 GitHub..."
ssh -T git@github.com 2>&1

if [ $? -eq 1 ]; then
    echo "✅ SSH 連接成功！"
else
    echo "⚠️  SSH 可能還沒設定好，繼續嘗試..."
fi

echo ""
echo "🔄 切換專案到 SSH remote..."
cd /Users/williamchien/Desktop/Venturo/venturoerp-tailwind

# 檢查目前的 remote
echo "目前的 remote 設定："
git remote -v

# 移除舊的 remote
git remote remove origin 2>/dev/null

# 添加 SSH remote
git remote add origin git@github.com:Corner-venturo/venturo.git

echo ""
echo "✅ 已切換到 SSH remote"
echo "新的 remote 設定："
git remote -v

echo ""
echo "📤 測試推送..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 完美！SSH 設定成功！"
    echo ""
    echo "以後您可以直接使用以下命令而不需要輸入密碼："
    echo "  git push"
    echo "  git pull"
    echo "  git fetch"
    echo ""
    echo "🔒 安全提醒："
    echo "請到 https://github.com/settings/tokens 刪除剛才使用的 Personal Access Token"
else
    echo ""
    echo "❌ 推送失敗，請確認："
    echo "1. SSH Key 已添加到 GitHub"
    echo "2. 您有該 repository 的權限"
fi
