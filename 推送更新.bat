@echo off
setlocal
title Push Archive to GitHub
cd /d "%~dp0"
git config http.connectTimeout 10 >nul 2>&1
echo ================================================
echo   Pushing co-evolution-archive to GitHub ...
echo ================================================
git add -A
git commit -m "archive auto update" >nul 2>&1
rem --- 1st try: direct connection (fast) ---
git -c http.proxy= -c https.proxy= push origin main > push_log.txt 2>&1
if %errorlevel%==0 goto OK
echo   direct failed, trying proxy ...
git config http.proxy http://127.0.0.1:11119 >nul 2>&1
git config https.proxy http://127.0.0.1:11119 >nul 2>&1
git push origin main > push_log.txt 2>&1
if %errorlevel%==0 goto OK
echo [FAILED] details in push_log.txt:
type push_log.txt
echo.
echo   If you see "Authentication failed" or "could not read
echo   Username", it is a login issue - tell the assistant.
goto END
:OK
echo [SUCCESS] Pushed! Wait 1 min, then open:
echo   https://chen246389.github.io/co-evolution-archive/
:END
echo.
pause
