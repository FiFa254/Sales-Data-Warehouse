@echo off
rem Double-click to run Sales Data Warehouse locally at http://localhost:3001
setlocal
cd /d "%~dp0"
title Sales Data Warehouse - http://localhost:3001
set PORT=3001

where node >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js is not installed. Download it from https://nodejs.org and run this file again.
    pause
    exit /b 1
)

rem Source tables, star schema and ETL log are stored in SQL Server (database SalesDW, see .env.example).
sc query MSSQLSERVER 2>nul | find "RUNNING" >nul
if errorlevel 1 (
    sc query "MSSQL$SQLEXPRESS" 2>nul | find "RUNNING" >nul
    if errorlevel 1 (
        echo [!] SQL Server is not running. Start the "SQL Server ^(MSSQLSERVER^)" service in services.msc,
        echo     or set MSSQL_CONNECTION_STRING in .env to another server.
        pause
        exit /b 1
    )
)

if not exist .env (
    copy .env.example .env >nul
    echo [!] Created .env - set GEMINI_API_KEY ^(for the AI guide^), save, and close Notepad.
    start /wait notepad .env
)

if not exist node_modules (
    echo Installing packages ^(first run only^)...
    call npm ci --no-audit --no-fund
    if errorlevel 1 goto :fail
)

echo Building...
call npm run build
if errorlevel 1 goto :fail

set NODE_ENV=production
start "" cmd /c "timeout /t 3 >nul & start http://localhost:%PORT%"
echo.
echo Sales Data Warehouse is running at http://localhost:%PORT%
echo Close this window to stop it.
echo.
node dist\server.cjs
goto :eof

:fail
echo.
echo [!] Something went wrong. Read the messages above.
pause
exit /b 1
