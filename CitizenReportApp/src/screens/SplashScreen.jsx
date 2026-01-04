import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import tw from 'twrnc';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // EL SPLASH NO DEBE NAVEGAR - eso lo maneja App.js
    // Solo mostrará la animación por 2 segundos
    const timer = setTimeout(() => {
      // No navegamos aquí - App.js maneja la navegación basada en initialRoute
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={tw`flex-1 bg-[#2E7D32] items-center justify-center`}>
      <Animated.View
        style={[
          tw`items-center`,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={tw`w-32 h-32 bg-white rounded-3xl items-center justify-center mb-6 shadow-lg`}>
          <Text style={tw`text-6xl`}>🏙️</Text>
        </View>
        
        {/* Nombre de la app */}
        <Text style={tw`text-4xl font-bold text-white mb-2`}>
          CiudadApp
        </Text>
        <Text style={tw`text-lg text-green-100`}>
          Reporta y mejora tu ciudad
        </Text>
      </Animated.View>

      {/* Versión */}
      <Text style={tw`absolute bottom-8 text-green-200 text-sm`}>
        v1.0.0
      </Text>
    </View>
  );
};

export default SplashScreen;