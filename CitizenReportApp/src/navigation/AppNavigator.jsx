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

// Componente para el botón flotante
const FloatingButton = ({ onPress }) => (
  <TouchableOpacity
    style={tw`absolute -top-7 w-14 h-14 bg-[#2E7D32] rounded-full items-center justify-center shadow-lg border-4 border-white`}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name="plus" size={28} color="white" />
  </TouchableOpacity>
);

// Pantallas simples (para pruebas)
const MapScreenComp = () => (
  <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
    <Text style={tw`text-xl font-bold text-gray-900`}>Mapa</Text>
    <Text style={tw`text-gray-500`}>En desarrollo</Text>
  </View>
);

const ArcadeScreenComp = () => (
  <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
    <Text style={tw`text-xl font-bold text-gray-900`}>Arcade</Text>
    <Text style={tw`text-gray-500`}>En desarrollo</Text>
  </View>
);

const LeaderboardScreenComp = () => (
  <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
    <Text style={tw`text-xl font-bold text-gray-900`}>Ranking</Text>
    <Text style={tw`text-gray-500`}>En desarrollo</Text>
  </View>
);

const ProfileScreenComp = () => (
  <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
    <Text style={tw`text-xl font-bold text-gray-900`}>Perfil</Text>
    <Text style={tw`text-gray-500`}>En desarrollo</Text>
  </View>
);

const AdminScreenComp = () => (
  <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
    <Text style={tw`text-xl font-bold text-gray-900`}>Admin</Text>
    <Text style={tw`text-gray-500`}>En desarrollo</Text>
  </View>
);

const AppNavigator = ({ currentUser, onLogout }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const tabBarOptions = {
    activeTintColor: '#2E7D32',
    inactiveTintColor: '#9CA3AF',
    style: {
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      height: 60,
    },
    labelStyle: {
      fontSize: 11,
      marginBottom: 4,
    },
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            } else if (route.name === 'Mapa') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Arcade') {
              iconName = focused ? 'gamepad-variant' : 'gamepad-variant-outline';
            } else if (route.name === 'Ranking') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            } else if (route.name === 'Perfil') {
              iconName = focused ? 'account' : 'account-outline';
            } else if (route.name === 'Admin') {
              iconName = focused ? 'shield-check' : 'shield-check-outline';
            }

            // Si es la tercera pestaña (Arcade), mostrar botón flotante
            if (route.name === 'Arcade') {
              return (
                <View style={tw`items-center justify-center`}>
                  <FloatingButton onPress={() => setShowReportModal(true)} />
                  <Icon name={iconName} size={size} color={color} style={tw`mt-7`} />
                </View>
              );
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          ...tabBarOptions,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Dashboard' }}
        />
        <Tab.Screen 
          name="Mapa" 
          component={MapScreenComp} 
          options={{ title: 'Mapa' }}
        />
        <Tab.Screen 
          name="Arcade" 
          component={ArcadeScreenComp} 
          options={{ title: 'Reportar' }}
        />
        <Tab.Screen 
          name="Ranking" 
          component={LeaderboardScreenComp} 
          options={{ title: 'Ranking' }}
        />
        <Tab.Screen 
          name="Perfil" 
          component={ProfileScreenComp} 
          options={{ title: 'Perfil' }}
        />
        {currentUser?.role === 'admin' && (
          <Tab.Screen 
            name="Admin" 
            component={AdminScreenComp} 
            options={{ title: 'Admin' }}
          />
        )}
      </Tab.Navigator>

      {/* Modal para crear reporte */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReportModal}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={[tw`bg-white rounded-t-3xl p-6`, { maxHeight: height * 0.6 }]}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-xl font-bold text-gray-900`}>Crear Reporte</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={tw`space-y-3`}>
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

export default AppNavigator;