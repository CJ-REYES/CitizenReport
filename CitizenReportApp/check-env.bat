@echo off
echo ===========================================
echo    Verificando configuración de Android
echo ===========================================

echo.
echo 1. Variables de entorno:
echo    ANDROID_HOME: %ANDROID_HOME%
echo    ANDROID_SDK_ROOT: %ANDROID_SDK_ROOT%

echo.
echo 2. Versión de ADB:
adb --version

echo.
echo 3. Dispositivos conectados:
adb devices

echo.
echo 4. Path de ADB:
where adb

echo.
echo 5. Variables PATH relacionadas:
echo %PATH% | findstr /i /c:"platform-tools"

pause