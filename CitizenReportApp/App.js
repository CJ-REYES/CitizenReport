// App.js - Versión final corregida y funcional
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantallas y Navegación
// Asegúrate de que estas rutas coincidan exactamente con tu estructura de carpetas
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Efecto inicial para cargar sesión y preferencias
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Simular tiempo de carga para el Splash Screen
        const timer = new Promise(resolve => setTimeout(resolve, 2500));
        
        // 2. Recuperar datos de AsyncStorage simultáneamente
        const [token, userData, savedDarkMode] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('currentUser'),
          AsyncStorage.getItem('darkMode')
        ]);
        
        await timer; // Esperar a que termine el splash

        // 3. Configurar estado de autenticación
        if (token && userData) {
          setIsAuthenticated(true);
          setCurrentUser(JSON.parse(userData));
        }
        
        // 4. Configurar preferencia de tema
        if (savedDarkMode !== null) {
          setDarkMode(JSON.parse(savedDarkMode));
        }
      } catch (error) {
        console.error('Error al inicializar la App:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Manejador de inicio de sesión exitoso
  const handleLoginSuccess = async (userData, token) => {
    try {
      await AsyncStorage.setItem('userToken', token || 'dummy-token');
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Error guardando sesión:", e);
    }
  };

  // Manejador de cierre de sesión
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('currentUser');
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  // Manejador de cambio de tema
  const toggleDarkMode = async (value) => {
    try {
      setDarkMode(value);
      await AsyncStorage.setItem('darkMode', JSON.stringify(value));
    } catch (e) {
      console.error("Error guardando preferencia de tema:", e);
    }
  };

  // Renderizar Splash Screen mientras carga
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {/* StatusBar dinámico según el modo oscuro */}
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          // Animación suave de transición entre pantallas
          gestureEnabled: true,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {(props) => (
              <AuthScreen 
                {...props} 
                onLoginSuccess={(data) => handleLoginSuccess(data, data.token)} 
                isDark={darkMode}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {(props) => (
              <AppNavigator 
                {...props} 
                currentUser={currentUser}
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}