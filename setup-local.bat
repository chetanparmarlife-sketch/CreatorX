@echo off
REM CreatorX Local Development Setup Script (Windows)
REM This script sets up the local development environment

echo ========================================
echo CreatorX Local Development Setup
echo ========================================
echo.

REM Check Node.js version
echo Checking Node.js version...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found
    echo Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Check npm
echo Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION%

REM Check Docker (optional)
echo Checking Docker...
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Docker not found (optional for backend)
    set DOCKER_AVAILABLE=false
) else (
    docker info >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Docker is running
        set DOCKER_AVAILABLE=true
    ) else (
        echo [WARN] Docker installed but not running
        set DOCKER_AVAILABLE=false
    )
)

REM Install dependencies
echo.
echo Installing dependencies...
if exist "node_modules" (
    echo [SKIP] node_modules exists, skipping npm install
    echo Run 'npm install' manually if needed
) else (
    call npm install
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Dependencies installed
    ) else (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
)

REM Create .env.local
echo.
if exist ".env.local" (
    echo .env.local already exists
    set /p OVERWRITE="Overwrite? (y/n): "
    if /i "%OVERWRITE%"=="y" (
        set CREATE_ENV=true
    ) else (
        set CREATE_ENV=false
    )
) else (
    set CREATE_ENV=true
)

if "%CREATE_ENV%"=="true" (
    if exist ".env.example" (
        copy /Y .env.example .env.local >nul
        echo [OK] Created .env.local from .env.example
    ) else (
        (
            echo # CreatorX Local Development Environment
            echo EXPO_PUBLIC_ENV=dev
            echo EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
            echo EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
            echo EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
            echo EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        ) > .env.local
        echo [OK] Created .env.local
    )
    echo [WARN] Please edit .env.local with your Supabase credentials
)

REM Check backend connectivity
if "%DOCKER_AVAILABLE%"=="true" (
    echo.
    echo Checking backend services...
    curl -s -f http://localhost:8080/actuator/health >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Backend is running on http://localhost:8080
    ) else (
        echo [WARN] Backend not running
        echo Start backend with: cd backend ^&^& docker-compose up -d
        echo Or run: npm run start:backend
    )
)

REM Summary
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env.local with your Supabase credentials
echo 2. Start backend: npm run start:backend
echo 3. Start app: npm run dev:local
echo.
echo For physical device testing:
echo - Ensure device is on same WiFi
echo - Replace localhost with your computer's IP in .env.local
echo   Example: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api/v1
echo.
echo See LOCAL_DEVELOPMENT.md for detailed instructions



