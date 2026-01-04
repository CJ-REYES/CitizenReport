import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantallas de autenticación
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';

// Navegación principal
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Esperar 2 segundos para mostrar el splash
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('currentUser');
        
        if (token && userData) {
          setUserToken(token);
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mostrar splash mientras carga
  if (isLoading) {
    return <SplashScreen />;
  }

  // Función para actualizar usuario después del login
  const handleLoginSuccess = async (userData) => {
    setUserToken('authenticated');
    setCurrentUser(userData);
    await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // Función para logout
  const handleLogout = async () => {
    setUserToken(null);
    setCurrentUser(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('currentUser');
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={userToken ? "Main" : "Auth"}
        screenOptions={{
          headerShown: false,
        }}
      >
        {!userToken ? (
          <Stack.Screen name="Auth">
            {props => <AuthScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {props => (
              <AppNavigator 
                {...props} 
                currentUser={currentUser} 
                onLogout={handleLogout} 
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}