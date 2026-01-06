// src/navigation/AppNavigator.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Pantallas
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import ArcadeScreen from '../screens/ArcadeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Componente Formulario
import ReportForm from '../components/ReportForm';

const Tab = createBottomTabNavigator();

const AppNavigator = ({ currentUser, onLogout, darkMode, toggleDarkMode }) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const PRIMARY_COLOR = '#10B981';
  const INACTIVE_COLOR = '#9CA3AF';

  const handleReportTypeSelect = (category) => {
    setSelectedCategory(category.id);
    setShowTypeModal(false);
    setShowFormModal(true);
  };

  const reportCategories = [
    { id: 'Bache', icon: 'road', label: 'Bache', color: '#F97316' },
    { id: 'Alumbrado', icon: 'lightbulb-outline', label: 'Alumbrado', color: '#F59E0B' },
    { id: 'Basura', icon: 'trash-can-outline', label: 'Basura', color: '#10B981' },
    { id: 'Vandalismo', icon: 'spray', label: 'Vandalismo', color: '#8B5CF6' },
    { id: 'Fuga', icon: 'water-outline', label: 'Fuga', color: '#0EA5E9' },
    { id: 'Otro', icon: 'alert-octagon', label: 'Otro', color: '#EF4444' },
  ];

  return (
    <View style={tw`flex-1`}>
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
          headerShown: false,
        }}
      >
        <Tab.Screen name="Dashboard" options={{ title: 'Inicio', tabBarIcon: ({ color }) => <Icon name="view-dashboard" size={26} color={color} /> }}>
          {(props) => <DashboardScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        
        <Tab.Screen name="Mapa" options={{ tabBarIcon: ({ color }) => <Icon name="map" size={26} color={color} /> }}>
          {(props) => <MapScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        
        {/* PESTAÑA ARCADE RESTAURADA */}
        <Tab.Screen name="Arcade" options={{ tabBarIcon: ({ color }) => <Icon name="gamepad-variant" size={26} color={color} /> }}>
          {(props) => <ArcadeScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        
        <Tab.Screen name="Ranking" options={{ tabBarIcon: ({ color }) => <Icon name="trophy" size={26} color={color} /> }}>
          {(props) => <LeaderboardScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        
        <Tab.Screen name="Perfil" options={{ tabBarIcon: ({ color }) => <Icon name="account" size={26} color={color} /> }}>
          {(props) => <ProfileScreen {...props} currentUser={currentUser} onLogout={onLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Botón Flotante */}
      <TouchableOpacity
        onPress={() => setShowTypeModal(true)}
        style={[tw`absolute items-center justify-center rounded-full shadow-lg`, { backgroundColor: '#10B981', bottom: 85, right: 20, width: 60, height: 60, zIndex: 999 }]}
      >
        <Icon name="plus" size={32} color="white" />
      </TouchableOpacity>

      {/* Modal de Selección Rápida */}
      <Modal visible={showTypeModal} transparent animationType="fade" onRequestClose={() => setShowTypeModal(false)}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <TouchableOpacity style={tw`flex-1`} onPress={() => setShowTypeModal(false)} />
          <View style={[tw`rounded-t-3xl p-6`, darkMode ? tw`bg-gray-800` : tw`bg-white`]}>
            <Text style={tw`text-xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>¿Qué quieres reportar?</Text>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {reportCategories.map((item, index) => (
                <TouchableOpacity key={index} style={[tw`items-center mb-6`, { width: '30%' }]} onPress={() => handleReportTypeSelect(item)}>
                  <View style={[tw`w-14 h-14 rounded-2xl items-center justify-center mb-2`, { backgroundColor: `${item.color}20` }]}>
                    <Icon name={item.icon} size={28} color={item.color} />
                  </View>
                  <Text style={tw`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <ReportForm 
        darkMode={darkMode}
        isVisible={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={(data) => { setShowFormModal(false); }}
        userData={currentUser}
        initialType={selectedCategory}
      />
    </View>
  );
};

export default AppNavigator;