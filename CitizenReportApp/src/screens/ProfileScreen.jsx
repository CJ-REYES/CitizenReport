// ProfileScreen.jsx - COMPLETO CORREGIDO con tema oscuro
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar tus componentes existentes
import UserProgress from '../components/UserProgress';
import TopUsers from '../components/TopUsers';
import UserRecentReports from '../components/UserRecentReports';

const ProfileScreen = ({ currentUser, onLogout, darkMode, toggleDarkMode }) => {
  // Estado para configuración
  const [notifications, setNotifications] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [language, setLanguage] = useState('es');
  const [userData, setUserData] = useState({
    nombre: 'Usuario',
    username: 'Usuario',
    email: 'usuario@ejemplo.com'
  });

  // Inicializar datos del usuario
  useEffect(() => {
    if (currentUser) {
      setUserData({
        nombre: currentUser.nombre || currentUser.username || 'Usuario',
        username: currentUser.username || currentUser.nombre || 'Usuario',
        email: currentUser.email || 'usuario@ejemplo.com'
      });
    }
  }, [currentUser]);

  // Cargar configuraciones guardadas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem('notifications');
        const savedLanguage = await AsyncStorage.getItem('language');
        
        if (savedNotifications !== null) {
          setNotifications(JSON.parse(savedNotifications));
        }
        
        if (savedLanguage !== null) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Guardar notificaciones
  const saveNotifications = async (value) => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications', JSON.stringify(value));
  };

  // Guardar idioma
  const saveLanguage = async (value) => {
    setLanguage(value);
    await AsyncStorage.setItem('language', value);
  };

  // Función para cambiar imagen de perfil
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo cambiar la foto de perfil');
    }
  };

  // Función para abrir modal de edición
  const openEditModal = (field, value) => {
    setEditField(field);
    setEditValue(value);
    setShowEditModal(true);
  };

  // Función para guardar cambios
  const saveChanges = () => {
    if (editField === 'nombre') {
      setUserData({ ...userData, nombre: editValue, username: editValue });
    } else if (editField === 'email') {
      setUserData({ ...userData, email: editValue });
    }
    setShowEditModal(false);
    Alert.alert('Éxito', 'Cambios guardados correctamente');
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive', 
          onPress: onLogout 
        }
      ]
    );
  };

  // Modal para seleccionar idioma
  const LanguageModal = ({ visible, onClose }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-center items-center bg-black/50 p-4`}>
        <View style={tw`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-sm`}>
          <Text style={tw`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Seleccionar Idioma</Text>
          
          {['es', 'en'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={tw`flex-row items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              onPress={() => {
                saveLanguage(lang);
                onClose();
              }}
            >
              <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {lang === 'es' ? 'Español' : 'English'}
              </Text>
              {language === lang && (
                <Icon name="check" size={20} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            onPress={onClose}
            style={tw`mt-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} self-end`}
          >
            <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Componente de Configuración
  const SettingsSection = () => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    return (
      <>
        <View style={tw`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-3 mb-6`}>
            <View style={tw`w-10 h-10 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full items-center justify-center`}>
              <Icon name="cog" size={22} color={darkMode ? "#A78BFA" : "#8B5CF6"} />
            </View>
            <View>
              <Text style={tw`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Configuración</Text>
              <Text style={tw`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Personaliza tu cuenta</Text>
            </View>
          </View>

          {/* Cambiar foto de perfil */}
          <TouchableOpacity
            onPress={pickImage}
            style={tw`flex-row items-center py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} items-center justify-center mr-3`}>
              <Icon name="camera" size={20} color={darkMode ? "#93C5FD" : "#3B82F6"} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>Cambiar foto de perfil</Text>
              <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Sube una nueva foto</Text>
            </View>
            <Icon name="chevron-right" size={20} color={darkMode ? "#9CA3AF" : "#9CA3AF"} />
          </TouchableOpacity>

          {/* Cambiar nombre */}
          <TouchableOpacity
            onPress={() => openEditModal('nombre', userData.nombre)}
            style={tw`flex-row items-center py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} items-center justify-center mr-3`}>
              <Icon name="account-edit" size={20} color={darkMode ? "#6EE7B7" : "#10B981"} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>Nombre</Text>
              <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{userData.nombre}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={darkMode ? "#9CA3AF" : "#9CA3AF"} />
          </TouchableOpacity>

          {/* Cambiar email */}
          <TouchableOpacity
            onPress={() => openEditModal('email', userData.email)}
            style={tw`flex-row items-center py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} items-center justify-center mr-3`}>
              <Icon name="email" size={20} color={darkMode ? "#C4B5FD" : "#8B5CF6"} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>Correo electrónico</Text>
              <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{userData.email}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={darkMode ? "#9CA3AF" : "#9CA3AF"} />
          </TouchableOpacity>

          {/* Notificaciones */}
          <View style={tw`flex-row items-center justify-between py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-yellow-900' : 'bg-orange-100'} items-center justify-center mr-3`}>
                <Icon name="bell" size={20} color={darkMode ? "#FDE68A" : "#F59E0B"} />
              </View>
              <View>
                <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>Notificaciones</Text>
                <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Recibir notificaciones push</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={saveNotifications}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Modo oscuro */}
          <View style={tw`flex-row items-center justify-between py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} items-center justify-center mr-3`}>
                {darkMode ? (
                  <Icon name="weather-night" size={20} color="#FFFFFF" />
                ) : (
                  <Icon name="weather-sunny" size={20} color="#FBBF24" />
                )}
              </View>
              <View>
                <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>Modo oscuro</Text>
                <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Cambiar tema de la aplicación</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Idioma */}
          <TouchableOpacity 
            style={tw`flex-row items-center py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} items-center justify-center mr-3`}>
              <Icon name="translate" size={20} color={darkMode ? "#93C5FD" : "#3B82F6"} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>Idioma</Text>
              <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {language === 'es' ? 'Español' : 'English'}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={darkMode ? "#9CA3AF" : "#9CA3AF"} />
          </TouchableOpacity>

          {/* Privacidad y seguridad */}
          <TouchableOpacity style={tw`flex-row items-center py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-red-900' : 'bg-red-100'} items-center justify-center mr-3`}>
              <Icon name="shield-account" size={20} color={darkMode ? "#FCA5A5" : "#EF4444"} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>Privacidad y seguridad</Text>
              <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Gestiona tus datos</Text>
            </View>
            <Icon name="chevron-right" size={20} color={darkMode ? "#9CA3AF" : "#9CA3AF"} />
          </TouchableOpacity>

          {/* Cerrar sesión */}
          <TouchableOpacity
            onPress={handleLogout}
            style={tw`flex-row items-center py-4`}
          >
            <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-red-900' : 'bg-red-100'} items-center justify-center mr-3`}>
              <Icon name="logout" size={20} color={darkMode ? "#FCA5A5" : "#EF4444"} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-red-600 font-medium`}>Cerrar sesión</Text>
              <Text style={tw`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Salir de tu cuenta</Text>
            </View>
          </TouchableOpacity>
        </View>

        <LanguageModal 
          visible={showLanguageModal} 
          onClose={() => setShowLanguageModal(false)} 
        />
      </>
    );
  };

  // Modal para editar campos
  const EditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={tw`flex-1 justify-center items-center bg-black/50 p-4`}>
        <View style={tw`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-sm`}>
          <Text style={tw`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
            Editar {editField === 'nombre' ? 'Nombre' : 'Correo'}
          </Text>
          
          <TextInput
            style={tw`border ${darkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800'} rounded-lg p-3 mb-4`}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={`Ingresa tu ${editField === 'nombre' ? 'nombre' : 'correo'}`}
            placeholderTextColor={darkMode ? "#9CA3AF" : "#6B7280"}
            autoCapitalize={editField === 'nombre' ? 'words' : 'none'}
            keyboardType={editField === 'email' ? 'email-address' : 'default'}
          />
          
          <View style={tw`flex-row justify-end gap-3`}>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={tw`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
            >
              <Text style={tw`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveChanges}
              style={tw`px-4 py-2 rounded-lg bg-blue-500`}
            >
              <Text style={tw`text-white font-medium`}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={tw`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={darkMode ? '#1F2937' : '#F9FAFB'} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-8`}
        >
          {/* Header */}
          <View style={tw`p-6`}>
            <Text style={tw`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>Mi Perfil</Text>
            <Text style={tw`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gestiona tu cuenta y revisa tus logros</Text>
          </View>

          {/* Componente de progreso del usuario */}
          <View style={tw`px-4 mb-6`}>
            <UserProgress currentUser={userData} darkMode={darkMode} />
          </View>

          {/* Componente de Top 3 */}
          <View style={tw`px-4 mb-6`}>
            <TopUsers darkMode={darkMode} />
          </View>

          {/* Componente de reportes recientes */}
          <View style={tw`px-4 mb-6`}>
            <UserRecentReports darkMode={darkMode} />
          </View>

          {/* Sección de configuración */}
          <View style={tw`px-4`}>
            <SettingsSection />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de edición */}
      <EditModal />
    </SafeAreaView>
  );
};

export default ProfileScreen;