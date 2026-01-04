// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

// Configuración personalizada para evitar errores de Android SDK
const config = getDefaultConfig(__dirname, {
  // Deshabilitar la validación del SDK de Android
  isCSSEnabled: true,
});

// Eliminar cualquier validación de Android SDK
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    // Mock para módulos relacionados con Android SDK
    'android-tools': {},
  },
};

// Configurar source maps
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: false,
    },
  },
};

module.exports = config;