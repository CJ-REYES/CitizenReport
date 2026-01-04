@echo off
chcp 65001
echo ===========================================
echo    CitizenReport - Con ADB Configurado
echo ===========================================

:: Configurar ADB manualmente
set ADB="C:\Program Files (x86)\platform-tools\adb.exe"
set ADB_PATH="C:\Program Files (x86)\platform-tools\adb.exe"
set ANDROID_HOME="C:\Program Files (x86)"
set ANDROID_SDK_ROOT="C:\Program Files (x86)"

echo.
echo Configuración ADB:
echo   ADB: %ADB%
echo   ANDROID_HOME: %ANDROID_HOME%

echo.
echo 1. Verificando conexión USB...
%ADB% devices

echo.
echo 2. Iniciando Expo sin validar Android SDK...
npx expo start --no-device --lan

pause