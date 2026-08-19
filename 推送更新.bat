@echo off
setlocal
title Push Archive to GitHub
cd /d "%~dp0"
echo ================================================
echo   Pushing co-evolution-archive to GitHub ...
echo ================================================
git config http.proxy http://127.0.0.1:11119
git config https.proxy http://127.0.0.1:11119
git add -A
git commit -m "archive auto update" >nul 2>&1
git push origin main > push_log.txt 2>&1
set PUSHCODE=%errorlevel%
type push_log.txt
echo ================================================
if %PUSHCODE%==0 (
  echo.
  echo  [SUCCESS] Pushed! Wait 1 min, then open:
  echo    https://chen246389.github.io/co-evolution-archive/
  echo.
) else (
  echo.
  echo  [FAILED] See push_log.txt for details.
  echo    Send push_log.txt content to the assistant.
  echo.
)
pause
