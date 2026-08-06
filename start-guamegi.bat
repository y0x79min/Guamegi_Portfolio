@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "BACKEND_PORT=3000"
set "FRONTEND_PORT=8080"

if /i "%GUAMEGI_DRY_RUN%"=="1" (
    echo PROJECT_ROOT=%PROJECT_ROOT%
    echo BACKEND_DIR=%BACKEND_DIR%
    echo FRONTEND_DIR=%FRONTEND_DIR%
    exit /b 0
)

where node.exe >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or is not in PATH.
    echo Install Node.js LTS from https://nodejs.org and run this file again.
    pause
    exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm.cmd was not found. Check the Node.js installation.
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\node_modules\express" (
    echo [SETUP] Installing backend packages...
    pushd "%BACKEND_DIR%"
    call npm.cmd install
    if errorlevel 1 (
        popd
        echo [ERROR] Backend package installation failed.
        pause
        exit /b 1
    )
    popd
)

if not exist "%FRONTEND_DIR%\node_modules\http-proxy" (
    echo [SETUP] Installing frontend packages...
    pushd "%FRONTEND_DIR%"
    call npm.cmd install
    if errorlevel 1 (
        popd
        echo [ERROR] Frontend package installation failed.
        pause
        exit /b 1
    )
    popd
)

set "GUAMEGI_LOCAL_DEV=1"
set "GUAMEGI_BACKEND_PORT=%BACKEND_PORT%"
set "GUAMEGI_FRONTEND_ORIGIN=http://localhost:%FRONTEND_PORT%"
set "GUAMEGI_BACKEND_URL=http://localhost:%BACKEND_PORT%"
set "GUAMEGI_FRONTEND_PORT=%FRONTEND_PORT%"

echo [START] Backend: http://localhost:%BACKEND_PORT%
start "Guamegi Backend" /D "%BACKEND_DIR%" cmd.exe /k npm.cmd start

ping 127.0.0.1 -n 4 >nul

echo [START] Frontend: http://localhost:%FRONTEND_PORT%
start "Guamegi Frontend" /D "%PROJECT_ROOT%" cmd.exe /k node local-frontend-server.js

ping 127.0.0.1 -n 7 >nul
start "" "http://localhost:%FRONTEND_PORT%"

echo.
echo Guamegi is running. Press Ctrl+C in both server windows to stop it.
endlocal