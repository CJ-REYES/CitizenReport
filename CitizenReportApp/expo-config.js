// expo-config.js - Configuración para resolver problemas de Android SDK
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para encontrar ADB
function findAdb() {
  try {
    // Intentar encontrar adb en varias ubicaciones comunes
    const possiblePaths = [
      process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb.exe') : null,
      process.env.ANDROID_SDK_ROOT ? path.join(process.env.ANDROID_SDK_ROOT, 'platform-tools', 'adb.exe') : null,
      'C:\\Program Files (x86)\\platform-tools\\adb.exe',
      'C:\\android-sdk\\platform-tools\\adb.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe'
    ].filter(Boolean);

    for (const adbPath of possiblePaths) {
      if (fs.existsSync(adbPath)) {
        console.log(`✓ ADB encontrado en: ${adbPath}`);
        return adbPath;
      }
    }
    
    throw new Error('ADB no encontrado. Verifica la instalación de platform-tools.');
  } catch (error) {
    console.error('✗ Error buscando ADB:', error.message);
    return null;
  }
}

// Configurar variables de entorno para Expo
function setupExpoEnvironment() {
  const adbPath = findAdb();
  
  if (adbPath) {
    // Establecer variables para la sesión actual
    process.env.ADB = adbPath;
    process.env.ADB_PATH = adbPath;
    
    // Crear estructura de carpetas que Expo espera
    const androidHome = path.dirname(path.dirname(adbPath));
    process.env.ANDROID_HOME = androidHome;
    process.env.ANDROID_SDK_ROOT = androidHome;
    
    console.log(`✓ Configurado ANDROID_HOME: ${androidHome}`);
    console.log(`✓ ADB configurado: ${adbPath}`);
    
    return true;
  }
  
  return false;
}

module.exports = { findAdb, setupExpoEnvironment };

// Ejecutar si se llama directamente
if (require.main === module) {
  setupExpoEnvironment();
}