// DashboardScreen.jsx (solo la sección del header modificada)
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componentes
import StatsWidgets from '../components/StatsWidgets';
import UserProgress from '../components/UserProgress';
import TopUsers from '../components/TopUsers';
import UserRecentReports from '../components/UserRecentReports';
import ReportsToValidate from '../components/ReportsToValidate';

const DashboardScreen = ({ navigation, darkMode }) => {
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

  const formatLastUpdate = (date) => {
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <View style={tw`flex-1 items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Text style={tw`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={darkMode ? '#1F2937' : '#F9FAFB'} 
        translucent={false}
      />
      
      {/* Contenido principal con ScrollView */}
      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`pb-32`}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header dentro del ScrollView */}
        <View style={tw`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-6 pb-4 shadow-sm mb-2`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{greeting}</Text>
              <Text style={tw`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`} numberOfLines={1}>
                {currentUser?.nombre || currentUser?.username || 'Usuario'}
              </Text>
            </View>
            
            <View style={tw`w-20`}></View>
          </View>

          {/* Info de actualización */}
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Actualizado: {formatLastUpdate(lastUpdate)}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              disabled={refreshing}
              style={tw`flex-row items-center gap-1`}
            >
              <Icon 
                name="refresh" 
                size={16} 
                color={refreshing ? '#9CA3AF' : '#2E7D32'} 
              />
              <Text style={tw`text-sm ${refreshing ? 'text-gray-400' : 'text-[#2E7D32]'}`}>
                Actualizar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

       {/* Sección: Estadísticas */}
        <View style={tw`px-4 mb-6`}>
          <StatsWidgets darkMode={darkMode} />
        </View>

        {/* Sección: Mi Progreso */}
        <View style={tw`px-4 mb-6`}>
          <UserProgress currentUser={currentUser} darkMode={darkMode} />
        </View>

        {/* Sección: Top 3 Ciudadanos */}
        <View style={tw`px-4 mb-6`}>
          <TopUsers darkMode={darkMode} />
        </View>

        {/* Sección: Mis Reportes Recientes */}
        <View style={tw`px-4 mb-6`}>
          <UserRecentReports darkMode={darkMode} />
        </View>

        {/* Sección: Reportes por Validar */}
        <View style={tw`px-4 mb-6`}>
          <ReportsToValidate currentUser={currentUser} darkMode={darkMode} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;