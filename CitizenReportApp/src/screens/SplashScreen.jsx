import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[tw`flex-1 bg-[#2E7D32] items-center justify-center`, { width, height }]}>
      <Animated.View
        style={[
          tw`items-center`,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        {/* Logo */}
        <View style={tw`w-32 h-32 bg-white rounded-3xl items-center justify-center mb-6 shadow-lg`}>
          <Icon name="city" size={60} color="#2E7D32" />
        </View>
        
        {/* Título */}
        <Text style={tw`text-4xl font-bold text-white mb-4`}>
          CiudadApp
        </Text>
        
        {/* Subtítulo */}
        <Text style={tw`text-lg text-green-100 mb-2`}>
          Reporta y mejora tu ciudad
        </Text>
        
        {/* Indicador de carga */}
        <View style={tw`mt-8 flex-row`}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                tw`w-3 h-3 bg-white rounded-full mx-1`,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -10, 0],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Versión */}
      <Text style={tw`absolute bottom-10 text-green-200 text-sm`}>
        v1.0.0
      </Text>
    </View>
  );
};

export default SplashScreen;