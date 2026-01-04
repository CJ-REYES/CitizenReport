import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
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
const Stack = createStackNavigator();

// Componente para el botón flotante
const FloatingButton = ({ onPress }) => (
  <TouchableOpacity
    style={tw`absolute top-[-25px] w-14 h-14 bg-[#2E7D32] rounded-full items-center justify-center shadow-lg border-2 border-white`}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name="plus" size={28} color="white" />
  </TouchableOpacity>
);

// Pantallas de navegación
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
  </Stack.Navigator>
);

const MapStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MapMain" component={MapScreen} />
  </Stack.Navigator>
);

const ArcadeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ArcadeMain" component={ArcadeScreen} />
  </Stack.Navigator>
);

const LeaderboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LeaderboardMain" component={LeaderboardScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminMain" component={AdminScreen} />
  </Stack.Navigator>
);

// Componente personalizado para la barra de pestañas
const CustomTabBar = ({ state, descriptors, navigation, currentUser, onCreateReport }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'view-dashboard-outline', focusedIcon: 'view-dashboard' },
    { key: 'map', label: 'Mapa', icon: 'map-outline', focusedIcon: 'map' },
    { key: 'arcade', label: 'Arcade', icon: 'gamepad-variant-outline', focusedIcon: 'gamepad-variant' },
    { key: 'leaderboard', label: 'Ranking', icon: 'trophy-outline', focusedIcon: 'trophy' },
    { key: 'profile', label: 'Perfil', icon: 'account-outline', focusedIcon: 'account' },
  ];

  // Agregar Admin si el usuario es admin
  if (currentUser?.role === 'admin') {
    menuItems.push({ 
      key: 'admin', 
      label: 'Admin', 
      icon: 'shield-check-outline', 
      focusedIcon: 'shield-check' 
    });
  }

  return (
    <>
      <View style={tw`bg-white border-t border-gray-200 h-16 flex-row relative`}>
        {menuItems.map((item, index) => {
          // Encontrar la ruta correspondiente
          const route = state.routes.find(r => r.name.toLowerCase().includes(item.key));
          if (!route) return null;

          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Si es el índice 2 (tercera posición), mostrar botón flotante
          if (index === 2) {
            return (
              <View key={item.key} style={tw`flex-1 items-center justify-center relative`}>
                <FloatingButton onPress={() => setShowReportModal(true)} />
                <Text style={tw`text-xs text-gray-500 mt-6`}>{item.label}</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={item.key}
              onPress={onPress}
              style={tw`flex-1 items-center justify-center`}
              activeOpacity={0.7}
            >
              <Icon 
                name={isFocused ? item.focusedIcon : item.icon} 
                size={24} 
                color={isFocused ? '#2E7D32' : '#9CA3AF'} 
              />
              <Text style={[
                tw`text-xs mt-1`,
                isFocused ? tw`text-[#2E7D32] font-medium` : tw`text-gray-500`
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal para crear reporte */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReportModal}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-white rounded-t-3xl p-6`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-xl font-bold text-gray-900`}>Crear Reporte</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={tw`space-y-4`}>
              {[
                { icon: 'road', label: 'Bache', color: '#F97316' },
                { icon: 'lightbulb-outline', label: 'Alumbrado', color: '#F59E0B' },
                { icon: 'trash-can-outline', label: 'Basura', color: '#10B981' },
                { icon: 'water-outline', label: 'Fuga de Agua', color: '#0EA5E9' },
                { icon: 'alert-octagon', label: 'Otro Problema', color: '#EF4444' },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={tw`flex-row items-center p-4 bg-gray-50 rounded-lg`}
                  onPress={() => {
                    setShowReportModal(false);
                    Alert.alert('Crear Reporte', `Crear reporte de ${item.label}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-4`, { backgroundColor: `${item.color}20` }]}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={tw`text-lg font-medium text-gray-800`}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Navegador principal con tabs
const AppNavigator = ({ currentUser, onLogout }) => {
  return (
    <Tab.Navigator
      tabBar={props => (
        <CustomTabBar 
          {...props} 
          currentUser={currentUser} 
          onCreateReport={() => {}} 
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Arcade" component={ArcadeStack} />
      <Tab.Screen name="Leaderboard" component={LeaderboardStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      {currentUser?.role === 'admin' && (
        <Tab.Screen name="Admin" component={AdminStack} />
      )}
    </Tab.Navigator>
  );
};

export default AppNavigator;