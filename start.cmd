@echo off
rem One click: builds the demo and serves it at http://127.0.0.1:5405/, then opens it in the browser.
rem It cannot be opened by double-clicking index.html: everything loads as ES modules, which a file:// page is not
rem allowed to import, so the page would sit at "Mixing paint" for ever.
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing what the build needs...
  call npm.cmd install --no-audit --no-fund || goto :failed
)

echo Building...
call npm.cmd run build || goto :failed

rem The server gets its own window: close that window to stop it.
start "oil-paint server" /min cmd /c "node tools\serve.mjs dist 5405"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5405/"
echo The game is at http://127.0.0.1:5405/ - keep the "oil-paint server" window open while you play.
timeout /t 6 /nobreak >nul
exit /b 0

:failed
echo.
echo Something failed above: the last lines say what.
pause
exit /b 1
