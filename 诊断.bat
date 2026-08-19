@echo off
setlocal
title Network Diagnostic for git push
cd /d "%~dp0"
echo === git push ???? === > diag.txt
echo [1] ?? git ????: >> diag.txt
git config --get http.proxy >> diag.txt 2>&1
echo --- >> diag.txt
echo [2] ????(???) - ????: >> diag.txt
git config http.connectTimeout 8 >> diag.txt 2>&1
git -c http.proxy= -c https.proxy= ls-remote origin HEAD >> diag.txt 2>&1
echo --- >> diag.txt
echo [3] ?????(127.0.0.1:11119): >> diag.txt
git -c http.proxy=http://127.0.0.1:11119 -c https.proxy=http://127.0.0.1:11119 ls-remote origin HEAD >> diag.txt 2>&1
echo --- >> diag.txt
echo [4] curl ??? HTTPS ? github.com(??????): >> diag.txt
curl.exe -sS -m 10 -x http://127.0.0.1:11119 -o NUL -w "HTTP %{http_code} %{time_total}s" https://github.com >> diag.txt 2>&1
echo --- >> diag.txt
echo [5] ?? DNS ?? github.com: >> diag.txt
nslookup github.com >> diag.txt 2>&1
echo === ????, ?????? diag.txt === >> diag.txt
echo.
echo ??????? diag.txt ????????
echo.
pause
