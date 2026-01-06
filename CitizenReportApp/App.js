// App.js - MODIFICADO para pasar todas las props necesarias
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantallas
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkAuthAndTheme = async () => {
      try {
        // Esperar 2 segundos para mostrar el splash
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('currentUser');
        const savedDarkMode = await AsyncStorage.getItem('darkMode');
        
        if (token && userData) {
          setIsAuthenticated(true);
          setCurrentUser(JSON.parse(userData));
        }
        
        if (savedDarkMode) {
          setDarkMode(JSON.parse(savedDarkMode));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndTheme();
  }, []);

  const handleLoginSuccess = async (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    await AsyncStorage.setItem('darkMode', JSON.stringify(value));
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {(props) => (
              <AuthScreen 
                {...props} 
                onLoginSuccess={handleLoginSuccess} 
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