@echo off
chcp 65001 >nul
title 一键推送档案馆更新
cd /d "%~dp0"
echo ================================================
echo   正在推送 co-evolution-archive 到 GitHub ...
echo ================================================
git add -A
git commit -m "archive auto update" >nul 2>&1
git push origin main
echo ================================================
if %errorlevel%==0 (
  echo.
  echo [成功] 推送完成！约 1 分钟后打开网页查看：
  echo   https://chen246389.github.io/co-evolution-archive/
) else (
  echo.
  echo [失败] 推送未成功，请检查网络或 GitHub 登录状态。
  echo   - 如果弹出 GitHub 登录窗口，按提示登录即可
  echo   - 如果提示输入用户名密码，用户名填你的 GitHub 账号，
  echo     密码填"个人访问令牌"（见说明）
)
echo.
pause
