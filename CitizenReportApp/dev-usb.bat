@echo off
chcp 65001
title CitizenReport - Modo USB

:: Configurar rutas
set ADB_PATH=C:\Program Files (x86)\platform-tools\adb.exe
set ANDROID_HOME=C:\Program Files (x86)

echo ===========================================
echo    Desarrollo con USB - Dispositivo Físico
echo ===========================================

echo.
echo Paso 1: Conecta tu dispositivo Android via USB
echo Paso 2: Asegúrate de tener activada la Depuración USB
echo.

echo Verificando dispositivos...
"%ADB_PATH%" devices

echo.
echo Configurando redirección de puertos...
"%ADB_PATH%" reverse tcp:8081 tcp:8081
"%ADB_PATH%" reverse tcp:19000 tcp:19000
"%ADB_PATH%" reverse tcp:19001 tcp:19001
"%ADB_PATH%" reverse tcp:19002 tcp:19002

echo.
echo Iniciando servidor Expo...
echo Nota: No uses --android flag, usa Expo Go en tu dispositivo
echo.

npx expo start --dev --lan --port 8081

pause