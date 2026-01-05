import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const AuthScreen = ({ navigation, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // ============================
        // LÓGICA DE INICIO DE SESIÓN
        // ============================
        
        // Caso especial para demo admin
        if (email === 'admin@test.com' && password === 'admin') {
          const userData = {
            id: 1,
            nombre: 'Admin Demo',
            username: 'admin',
            email: 'admin@test.com',
            role: 'admin',
            puntos: 100,
            rango: 'Administrador',
            reportsCount: 15,
            rankingPosition: 1,
            fechaRegistro: new Date().toISOString()
          };

          // Guardar sesión
          await AsyncStorage.setItem('userToken', 'demo-token-admin-123');
          await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
          
          // Mostrar mensaje de éxito
          Alert.alert(
            '¡Bienvenido!', 
            'Inicio de sesión exitoso como Administrador',
            [{ text: 'OK', onPress: () => {
              if (onLoginSuccess) {
                onLoginSuccess(userData);
              }
            }}]
          );
          return;
        }

        // Verificar usuario normal
        const storedUser = await AsyncStorage.getItem(`user_${email}`);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.password === password) {
            // Crear token y guardar datos de usuario
            const token = `token-${Date.now()}`;
            const userForApp = {
              id: userData.id || Date.now(),
              nombre: userData.username,
              username: email.split('@')[0],
              email: email,
              role: 'user',
              puntos: userData.puntos || 0,
              rango: userData.rango || 'Ciudadano Novato',
              reportsCount: userData.reportsCount || 0,
              rankingPosition: userData.rankingPosition || 999,
              fechaRegistro: userData.createdAt || new Date().toISOString()
            };

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('currentUser', JSON.stringify(userForApp));
            
            Alert.alert(
              '¡Bienvenido de vuelta!', 
              'Inicio de sesión exitoso',
              [{ text: 'OK', onPress: () => {
                if (onLoginSuccess) {
                  onLoginSuccess(userForApp);
                }
              }}]
            );
          } else {
            Alert.alert('Error', 'Contraseña incorrecta');
            setIsLoading(false);
          }
        } else {
          Alert.alert('Error', 'Usuario no encontrado. Regístrate primero.');
          setIsLoading(false);
        }
      } else {
        // ============================
        // LÓGICA DE REGISTRO
        // ============================
        
        // Verificar si el usuario ya existe
        const existingUser = await AsyncStorage.getItem(`user_${email}`);
        if (existingUser) {
          Alert.alert('Error', 'Este email ya está registrado');
          setIsLoading(false);
        } else {
          // Crear nuevo usuario
          const userData = {
            id: Date.now(),
            username: username,
            email: email,
            password: password,
            puntos: 0,
            rango: 'Ciudadano Novato',
            reportsCount: 0,
            rankingPosition: 999,
            createdAt: new Date().toISOString(),
          };
          
          // Guardar usuario en AsyncStorage
          await AsyncStorage.setItem(`user_${email}`, JSON.stringify(userData));
          
          // Mostrar mensaje de éxito
          Alert.alert(
            '¡Registro exitoso!', 
            'Tu cuenta ha sido creada. Por favor, inicia sesión.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsLogin(true);
                  setUsername('');
                  setPassword('');
                  setEmail('');
                  setIsLoading(false);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Ocurrió un error. Por favor, intenta nuevamente.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@test.com');
    setPassword('admin');
  };

  const handleGuestLogin = async () => {
    Alert.alert(
      'Acceso como invitado',
      'Podrás explorar la aplicación pero algunas funciones estarán limitadas',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        { 
          text: 'Continuar', 
          onPress: async () => {
            const guestUser = {
              id: Date.now(),
              nombre: 'Invitado',
              username: 'invitado',
              email: 'guest@ciudadapp.com',
              role: 'guest',
              puntos: 0,
              rango: 'Invitado',
              reportsCount: 0,
              rankingPosition: 999,
              fechaRegistro: new Date().toISOString()
            };

            await AsyncStorage.setItem('userToken', 'guest-token');
            await AsyncStorage.setItem('currentUser', JSON.stringify(guestUser));
            
            if (onLoginSuccess) {
              onLoginSuccess(guestUser);
            }
          }
        }
      ]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Funcionalidad en desarrollo. Por ahora, contacta al administrador.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={tw`flex-1 bg-[#E8F5E9]`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#E8F5E9" 
        translucent={false}
      />
      
      <ScrollView 
        contentContainerStyle={tw`flex-grow`}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`flex-1 min-h-[${height}px] justify-center p-6`}>
          {/* Tarjeta blanca */}
          <View style={tw`w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 self-center`}>
            
            {/* Header con logo */}
            <View style={tw`items-center mb-8`}>
              <View style={tw`w-20 h-20 bg-[#2E7D32] rounded-2xl items-center justify-center mb-4 shadow-md`}>
                <Icon name="city" size={36} color="white" />
              </View>
              
              <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
                CiudadApp
              </Text>
              <Text style={tw`text-gray-600 text-center`}>
                Reporta y mejora tu ciudad
              </Text>
            </View>

            {/* Tabs (Iniciar Sesión / Registrarse) */}
            <View style={tw`flex-row gap-2 mb-6`}>
              {/* Tab Iniciar Sesión */}
              <TouchableOpacity
                style={[
                  tw`flex-1 py-3 rounded-lg border`,
                  isLogin 
                    ? tw`bg-[#2E7D32] border-[#2E7D32]`
                    : tw`border-[#2E7D32] bg-transparent`
                ]}
                onPress={() => setIsLogin(true)}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text 
                  style={[
                    tw`text-center font-medium text-base`,
                    isLogin ? tw`text-white` : tw`text-[#2E7D32]`
                  ]}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>

              {/* Tab Registrarse */}
              <TouchableOpacity
                style={[
                  tw`flex-1 py-3 rounded-lg border`,
                  !isLogin 
                    ? tw`bg-[#2E7D32] border-[#2E7D32]`
                    : tw`border-[#2E7D32] bg-transparent`
                ]}
                onPress={() => setIsLogin(false)}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text 
                  style={[
                    tw`text-center font-medium text-base`,
                    !isLogin ? tw`text-white` : tw`text-[#2E7D32]`
                  ]}
                >
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulario */}
            <View style={tw`mb-6`}>
              {/* Campo de Usuario (solo en registro) */}
              {!isLogin && (
                <View style={tw`mb-4`}>
                  <Text style={tw`text-gray-700 mb-2 font-medium`}>
                    Nombre de Usuario
                  </Text>
                  <View style={tw`flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4`}>
                    <Icon name="account-outline" size={20} color="#6B7280" style={tw`mr-3`} />
                    <TextInput
                      style={tw`flex-1 py-3 text-gray-900`}
                      placeholder="Tu nombre completo"
                      value={username}
                      onChangeText={setUsername}
                      placeholderTextColor="#9CA3AF"
                      editable={!isLoading}
                      selectTextOnFocus={!isLoading}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Campo de Email */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-700 mb-2 font-medium`}>
                  Correo Electrónico
                </Text>
                <View style={tw`flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4`}>
                  <Icon name="email-outline" size={20} color="#6B7280" style={tw`mr-3`} />
                  <TextInput
                    style={tw`flex-1 py-3 text-gray-900`}
                    placeholder="tu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                    selectTextOnFocus={!isLoading}
                  />
                </View>
              </View>

              {/* Campo de Contraseña */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-700 mb-2 font-medium`}>
                  Contraseña
                </Text>
                <View style={tw`flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4`}>
                  <Icon name="lock-outline" size={20} color="#6B7280" style={tw`mr-3`} />
                  <TextInput
                    style={tw`flex-1 py-3 text-gray-900`}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                    selectTextOnFocus={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={tw`text-xs text-gray-500 mt-2 ml-1`}>
                  Mínimo 6 caracteres
                </Text>
              </View>

              {/* Recordar contraseña (solo en login) */}
              {isLogin && (
                <TouchableOpacity 
                  style={tw`mb-6`}
                  onPress={handleForgotPassword}
                  disabled={isLoading}
                >
                  <Text style={tw`text-[#2E7D32] text-sm text-center`}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón de Enviar */}
              <TouchableOpacity
                style={[
                  tw`w-full py-4 rounded-lg flex-row items-center justify-center`,
                  isLoading ? tw`bg-[#1B5E20]` : tw`bg-[#2E7D32]`
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={tw`text-white font-semibold ml-3 text-base`}>
                      {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                    </Text>
                  </>
                ) : (
                  <Text style={tw`text-white text-center font-semibold text-lg`}>
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Demo Card */}
            <View style={tw`mb-4 p-4 bg-[#C8E6C9] border border-[#4CAF50] rounded-lg`}>
              <Text style={tw`text-sm text-[#1B5E20] text-center`}>
                💡 Demo: Usa admin@test.com / admin
              </Text>
            </View>

            {/* Botón para auto-rellenar demo */}
            <TouchableOpacity
              style={tw`mb-4`}
              onPress={handleDemoLogin}
              disabled={isLoading}
            >
              <Text style={tw`text-center text-[#2E7D32] text-sm font-medium`}>
                Usar credenciales de demo
              </Text>
            </TouchableOpacity>

            {/* Botón de acceso como invitado */}
            <TouchableOpacity
              style={tw`mb-6`}
              onPress={handleGuestLogin}
              disabled={isLoading}
            >
              <View style={tw`items-center`}>
                <Text style={tw`text-center text-[#2E7D32] font-medium text-base`}>
                  Continuar como invitado
                </Text>
                <Text style={tw`text-center text-gray-500 text-sm mt-1`}>
                  Funciones limitadas disponibles
                </Text>
              </View>
            </TouchableOpacity>

            {/* Términos y condiciones */}
            <View style={tw`px-2`}>
              <Text style={tw`text-center text-gray-400 text-xs leading-relaxed`}>
                Al continuar, aceptas nuestros{' '}
                <Text style={tw`text-[#2E7D32] font-medium`}>Términos de servicio</Text>{' '}
                y{' '}
                <Text style={tw`text-[#2E7D32] font-medium`}>Política de privacidad</Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={tw`mt-8`}>
            <Text style={tw`text-center text-gray-500 text-sm`}>
              v1.0.0 • CiudadApp © 2024
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;