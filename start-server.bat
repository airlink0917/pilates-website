@echo off
echo ピラティスウェブサイトサーバーを起動しています...
echo.
echo サーバーが起動したら、以下のアドレスでアクセスできます：
echo.
echo PCから: http://localhost:8000
echo.
echo モバイルから同じWi-Fiネットワーク上で:
echo http://[あなたのPCのIPアドレス]:8000
echo.
echo IPアドレスを確認するには、別のコマンドプロンプトで ipconfig を実行してください
echo.
echo サーバーを停止するには Ctrl+C を押してください
echo.
cd /d "%~dp0"
python -m http.server 8000