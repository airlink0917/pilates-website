@echo off
echo ====================================
echo GitHubへのプッシュを開始します
echo ====================================
echo.
echo GitHubの認証が必要になる場合があります。
echo 認証画面が表示されたら、GitHubアカウントでログインしてください。
echo.
echo 準備ができたらEnterキーを押してください...
pause > nul

cd /d "%~dp0"
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo プッシュが成功しました！
    echo GitHubリポジトリ: https://github.com/airlink0917/pilates-website
    echo ====================================
) else (
    echo.
    echo ====================================
    echo エラーが発生しました。
    echo 以下の手順を試してください：
    echo.
    echo 1. https://github.com/settings/tokens でトークンを作成
    echo 2. 'repo' 権限にチェック
    echo 3. トークンをコピー
    echo 4. 以下のコマンドを実行:
    echo    git push https://YOUR_TOKEN@github.com/airlink0917/pilates-website.git main
    echo ====================================
)
pause