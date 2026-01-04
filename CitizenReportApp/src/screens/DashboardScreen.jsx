import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componentes adaptados
import StatsWidgets from '../components/StatsWidgets';
import UserProfile from '../components/UserProfile';
import ReportsToValidate from '../components/ReportsToValidate';

const DashboardScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadUserData();
    updateGreeting();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('¡Buenos días!');
    } else if (hour < 19) {
      setGreeting('¡Buenas tardes!');
    } else {
      setGreeting('¡Buenas noches!');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    updateGreeting();
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('currentUser');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }
      ]
    );
  };

  const formatLastUpdate = (date) => {
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header superior */}
      <View style={tw`bg-white px-6 pt-12 pb-4 shadow-sm`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View>
            <Text style={tw`text-2xl font-bold text-gray-900`}>{greeting}</Text>
            <Text style={tw`text-gray-500`}>
              {currentUser?.nombre || currentUser?.username || 'Usuario'}
            </Text>
          </View>
          
          {/* Botones de header */}
          <View style={tw`flex-row items-center gap-3`}>
            {/* Botón de notificaciones */}
            <TouchableOpacity 
              style={tw`w-10 h-10 bg-gray-100 rounded-full items-center justify-center`}
              onPress={() => Alert.alert('Notificaciones', 'Funcionalidad en desarrollo')}
            >
              <Icon name="bell-outline" size={22} color="#4B5563" />
            </TouchableOpacity>
            
            {/* Botón de logout */}
            <TouchableOpacity 
              style={tw`w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-200`}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info de actualización */}
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-sm text-gray-500`}>
            Actualizado: {formatLastUpdate(lastUpdate)}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            style={tw`flex-row items-center gap-2`}
          >
            <Icon 
              name="refresh" 
              size={16} 
              color={refreshing ? '#9CA3AF' : '#2E7D32'} 
              style={refreshing ? tw`rotate-180` : null}
            />
            <Text style={tw`text-sm ${refreshing ? 'text-gray-400' : 'text-[#2E7D32]'}`}>
              Actualizar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView 
        style={tw`flex-1 px-6 pt-6`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
          Panel de Control
        </Text>
        <Text style={tw`text-gray-500 mb-6`}>
          Resumen de la actividad de la ciudad y tu progreso
        </Text>

        {/* Widgets de Estadísticas */}
        <StatsWidgets />

        {/* Sección: Mi Progreso */}
        <View style={tw`bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6`}>
          <Text style={tw`text-xl font-bold text-gray-900 mb-4`}>Mi Progreso</Text>
          <UserProfile currentUser={currentUser} />
        </View>

        {/* Sección: Reportes por Validar */}
        <View style={tw`bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-20`}>
          <ReportsToValidate currentUser={currentUser} />
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;