import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadUserData();
    updateGreeting();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const email = await AsyncStorage.getItem('userEmail');
      
      if (name) {
        setUserName(name);
      } else if (email) {
        // Extraer nombre del email
        const nameFromEmail = email.split('@')[0];
        setUserName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
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
            navigation.replace('Auth');
          }
        }
      ]
    );
  };

  const features = [
    { icon: '📋', title: 'Nuevo Reporte', color: '#2E7D32' },
    { icon: '📍', title: 'Reportes Cercanos', color: '#0288D1' },
    { icon: '📊', title: 'Estadísticas', color: '#7B1FA2' },
    { icon: '👤', title: 'Mi Perfil', color: '#F57C00' },
    { icon: '⚙️', title: 'Configuración', color: '#546E7A' },
    { icon: '❓', title: 'Ayuda', color: '#D32F2F' },
  ];

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-white px-6 pt-12 pb-6 shadow-sm`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View>
            <Text style={tw`text-2xl font-bold text-gray-900`}>{greeting}</Text>
            <Text style={tw`text-gray-500`}>
              {userName ? `Hola, ${userName}` : 'Bienvenido a CiudadApp'}
            </Text>
          </View>
          
          {/* Botón de logout */}
          <TouchableOpacity 
            style={tw`px-4 py-2 bg-gray-100 rounded-full`}
            onPress={handleLogout}
          >
            <Text style={tw`text-gray-700 font-medium`}>Salir</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tarjeta de bienvenida */}
        <View style={tw`bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] rounded-2xl p-5`}>
          <Text style={tw`text-white text-lg font-semibold mb-2`}>
            CiudadApp - Reportes Ciudadanos
          </Text>
          <Text style={tw`text-green-100 mb-4`}>
            Reporta problemas, sigue soluciones y mejora tu ciudad
          </Text>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-white text-3xl font-bold`}>0</Text>
            <Text style={tw`text-green-200`}>Reportes activos hoy</Text>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView style={tw`flex-1 px-6 pt-6`}>
        <Text style={tw`text-xl font-bold text-gray-900 mb-6`}>
          ¿Qué deseas hacer hoy?
        </Text>

        {/* Grid de funcionalidades */}
        <View style={tw`flex-row flex-wrap justify-between`}>
          {features.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                tw`w-[48%] bg-white rounded-2xl p-5 mb-4 shadow-sm`,
                { borderLeftWidth: 4, borderLeftColor: item.color }
              ]}
              activeOpacity={0.8}
              onPress={() => Alert.alert(item.title, 'Función en desarrollo')}
            >
              <Text style={tw`text-3xl mb-3`}>{item.icon}</Text>
              <Text style={tw`font-semibold text-gray-800`}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

      {/* Sección de información */}
<View style={tw`mt-4 mb-8`}>
  <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>
    ¿Cómo funciona?
  </Text>
  
  <View>
    {[
      '1. 📸 Toma una foto del problema',
      '2. 📍 Agrega la ubicación exacta',
      '3. 📝 Describe el incidente',
      '4. 📤 Envía tu reporte',
      '5. 🔍 Sigue el progreso en tiempo real'
    ].map((step, index) => (
      <View key={index} style={tw`bg-white rounded-xl p-4 mb-3 shadow-sm`}>
        <Text style={tw`text-gray-800`}>{step}</Text>
      </View>
    ))}
  </View>
</View>
      </ScrollView>

      {/* Botón flotante para nuevo reporte */}
      <TouchableOpacity
        style={tw`absolute bottom-6 right-6 bg-[#2E7D32] w-16 h-16 rounded-full items-center justify-center shadow-lg`}
        activeOpacity={0.9}
        onPress={() => Alert.alert('Nuevo Reporte', 'Función en desarrollo')}
      >
        <Text style={tw`text-3xl text-white`}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;