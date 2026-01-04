import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AuthScreen = ({ navigation, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si ya hay sesión activa al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('currentUser');
        
        if (token && userData) {
          // Ya está autenticado, ir al main
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();
  }, []);

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

    // Simular delay de red
    setTimeout(async () => {
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
              rankingPosition: 1
            };

            // Guardar sesión
            await AsyncStorage.setItem('userToken', 'demo-token-admin-123');
            await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Mostrar mensaje de éxito
            Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso como Administrador');
            
            // Llamar callback si existe
            if (onLoginSuccess) {
              onLoginSuccess(userData);
            }
            
            // Navegar al main
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
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
                rankingPosition: userData.rankingPosition || 999
              };

              await AsyncStorage.setItem('userToken', token);
              await AsyncStorage.setItem('currentUser', JSON.stringify(userForApp));
              
              Alert.alert('¡Bienvenido de vuelta!', 'Inicio de sesión exitoso');
              
              if (onLoginSuccess) {
                onLoginSuccess(userForApp);
              }
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            } else {
              Alert.alert('Error', 'Contraseña incorrecta');
            }
          } else {
            Alert.alert('Error', 'Usuario no encontrado. Regístrate primero.');
          }
        } else {
          // ============================
          // LÓGICA DE REGISTRO
          // ============================
          
          // Verificar si el usuario ya existe
          const existingUser = await AsyncStorage.getItem(`user_${email}`);
          if (existingUser) {
            Alert.alert('Error', 'Este email ya está registrado');
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
                  }
                }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        Alert.alert('Error', 'Ocurrió un error. Por favor, intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    }, 1500);
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
              rankingPosition: 999
            };

            await AsyncStorage.setItem('userToken', 'guest-token');
            await AsyncStorage.setItem('currentUser', JSON.stringify(guestUser));
            
            if (onLoginSuccess) {
              onLoginSuccess(guestUser);
            }
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={tw`flex-1`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={tw`flex-grow`}
        keyboardShouldPersistTaps="handled"
      >
        {/* Fondo verde claro como en la web */}
        <View style={tw`flex-1 bg-[#E8F5E9] items-center justify-center p-6`}>
          
          {/* Tarjeta blanca */}
          <View style={tw`w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8`}>
            
            {/* Header con logo */}
            <View style={tw`items-center mb-8`}>
              <View style={tw`w-16 h-16 bg-[#2E7D32] rounded-2xl items-center justify-center mb-4 shadow-md`}>
                <Icon name="city" size={32} color="white" />
              </View>
              
              <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
                CiudadApp
              </Text>
              <Text style={tw`text-gray-600`}>
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
                    tw`text-center font-medium`,
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
                    tw`text-center font-medium`,
                    !isLogin ? tw`text-white` : tw`text-[#2E7D32]`
                  ]}
                >
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulario */}
            <View>
              {/* Campo de Usuario (solo en registro) */}
              {!isLogin && (
                <View style={tw`mb-4`}>
                  <Text style={tw`text-gray-700 mb-2 font-medium`}>
                    Nombre de Usuario
                  </Text>
                  <TextInput
                    style={tw`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900`}
                    placeholder="Tu nombre completo"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                    selectTextOnFocus={!isLoading}
                  />
                </View>
              )}

              {/* Campo de Email */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-700 mb-2 font-medium`}>
                  Correo Electrónico
                </Text>
                <TextInput
                  style={tw`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900`}
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

              {/* Campo de Contraseña */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-700 mb-2 font-medium`}>
                  Contraseña
                </Text>
                <TextInput
                  style={tw`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900`}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                  editable={!isLoading}
                  selectTextOnFocus={!isLoading}
                />
                <Text style={tw`text-xs text-gray-500 mt-2`}>
                  Mínimo 6 caracteres
                </Text>
              </View>

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
                    <Text style={tw`text-white font-semibold ml-3`}>
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
            <View style={tw`mt-6 p-4 bg-[#C8E6C9] border border-[#4CAF50] rounded-lg`}>
              <Text style={tw`text-sm text-[#1B5E20] text-center`}>
                💡 Demo: Usa admin@test.com / admin
              </Text>
            </View>

            {/* Botón para auto-rellenar demo */}
            <TouchableOpacity
              style={tw`mt-4`}
              onPress={handleDemoLogin}
              disabled={isLoading}
            >
              <Text style={tw`text-center text-[#2E7D32] text-sm font-medium`}>
                Usar credenciales de demo
              </Text>
            </TouchableOpacity>

            {/* Botón de acceso como invitado */}
            <TouchableOpacity
              style={tw`mt-6`}
              onPress={handleGuestLogin}
              disabled={isLoading}
            >
              <Text style={tw`text-center text-[#2E7D32] font-medium`}>
                Continuar como invitado
              </Text>
              <Text style={tw`text-center text-gray-500 text-sm mt-1`}>
                Funciones limitadas disponibles
              </Text>
            </TouchableOpacity>

            {/* Términos y condiciones */}
            <View style={tw`mt-8 px-4`}>
              <Text style={tw`text-center text-gray-400 text-xs`}>
                Al continuar, aceptas nuestros{' '}
                <Text style={tw`text-blue-500`}>Términos de servicio</Text> y{' '}
                <Text style={tw`text-blue-500`}>Política de privacidad</Text>
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