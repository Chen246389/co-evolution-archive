@echo off
chcp 65001 >nul
title 一键推送档案馆更新
cd /d "%~dp0"

echo ================================================
echo   正在推送 co-evolution-archive 到 GitHub ...
echo ================================================

rem ---- 自动走本地代理（magicspeed 127.0.0.1:11119）----
git config http.proxy http://127.0.0.1:11119
git config https.proxy http://127.0.0.1:11119

rem ---- 提交本地改动（有改动才提交，没改动自动跳过）----
git add -A
git commit -m "archive auto update" >nul 2>&1

rem ---- 推送（日志同时写入 push_log.txt，方便排查）----
git push origin main > push_log.txt 2>&1
set PUSHCODE=%errorlevel%
type push_log.txt

echo ================================================
if %PUSHCODE%==0 (
  echo.
  echo  [成功] 推送完成！约 1 分钟后打开网页查看：
  echo    https://chen246389.github.io/co-evolution-archive/
  echo.
) else (
  echo.
  echo  [失败] 推送未成功。已把报错保存到 push_log.txt
  echo    - 请把 push_log.txt 的内容发给助手排查
  echo    - 或双击打开 push_log.txt 查看详细报错
  echo.
)
pause
