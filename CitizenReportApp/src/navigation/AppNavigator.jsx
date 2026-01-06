// navigation/AppNavigator.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Pantallas
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import ArcadeScreen from '../screens/ArcadeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();
const { height } = Dimensions.get('window');

const AppNavigator = ({ currentUser, onLogout, darkMode, toggleDarkMode }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  // Colores
  const PRIMARY_COLOR = '#10B981'; // Verde CiudadApp
  const INACTIVE_COLOR = '#9CA3AF';

  const handleReportTypeSelect = (type) => {
    setShowReportModal(false);
    Alert.alert('Reporte', `Seleccionaste: ${type.label}`);
  };

  const reportCategories = [
    { icon: 'road', label: 'Bache', color: '#F97316', description: 'Reporta huecos en las calles' },
    { icon: 'lightbulb-outline', label: 'Alumbrado', color: '#F59E0B', description: 'Fallas de luz' },
    { icon: 'trash-can-outline', label: 'Basura', color: '#10B981', description: 'Acumulación de desechos' },
    { icon: 'spray', label: 'Vandalismo', color: '#8B5CF6', description: 'Daños públicos' },
    { icon: 'water-outline', label: 'Fuga', color: '#0EA5E9', description: 'Problemas de agua' },
    { icon: 'alert-octagon', label: 'Otro', color: '#EF4444', description: 'Otros problemas' },
  ];

  return (
    <View style={tw`flex-1`}>
      {/* 1. NAVEGADOR CON LAS 5 PESTAÑAS */}
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          tabBarStyle: {
            backgroundColor: darkMode ? '#1F2937' : 'white',
            borderTopWidth: 1,
            borderTopColor: darkMode ? '#374151' : '#E5E7EB',
            height: 65,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: -2,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" size={26} color={color} />,
            title: 'Inicio'
          }}
        >
          {(props) => <DashboardScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Mapa"
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="map" size={26} color={color} />,
          }}
        >
          {(props) => <MapScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Arcade" 
          component={ArcadeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="gamepad-variant" size={26} color={color} />,
          }}
        />
        
        <Tab.Screen 
          name="Ranking"
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="trophy" size={26} color={color} />,
          }}
        >
          {(props) => <LeaderboardScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Perfil"
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="account" size={26} color={color} />,
          }}
        >
          {(props) => (
            <ProfileScreen 
              {...props} 
              currentUser={currentUser}
              onLogout={onLogout}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {/* 2. BOTÓN FLOTANTE (FAB) */}
      <TouchableOpacity
        onPress={() => setShowReportModal(true)}
        activeOpacity={0.8}
        style={[
          tw`absolute items-center justify-center rounded-full shadow-lg`,
          {
            backgroundColor: '#10B981',
            bottom: 90,
            right: 20,
            width: 60,
            height: 60,
            elevation: 8,
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.5,
            zIndex: 999,
          }
        ]}
      >
        <Icon name="plus" size={32} color="white" />
      </TouchableOpacity>

      {/* 3. MODAL DE REPORTE */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReportModal}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={tw`flex-1 justify-end ${darkMode ? 'bg-black/80' : 'bg-black/60'}`}>
          <TouchableOpacity 
            style={tw`flex-1`} 
            onPress={() => setShowReportModal(false)} 
          />
          <View style={[tw`rounded-t-3xl p-6 shadow-2xl`, 
            darkMode ? tw`bg-gray-800` : tw`bg-white`
          ]}>
            <View style={tw`items-center mb-2`}>
              <View style={tw`w-16 h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`} />
            </View>
            
            <Text style={tw`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1 text-center`}>
              Crear Nuevo Reporte
            </Text>
            <Text style={tw`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6 text-center`}>
              Ayuda a mejorar tu ciudad reportando un problema
            </Text>

            <View style={tw`flex-row flex-wrap justify-between`}>
              {reportCategories.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[tw`items-center mb-6`, { width: '30%' }]}
                  onPress={() => handleReportTypeSelect(item)}
                >
                  <View 
                    style={[
                      tw`w-16 h-16 rounded-2xl items-center justify-center mb-2 shadow-sm`,
                      { backgroundColor: `${item.color}15` }
                    ]}
                  >
                    <Icon name={item.icon} size={30} color={item.color} />
                  </View>
                  <Text style={tw`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AppNavigator;