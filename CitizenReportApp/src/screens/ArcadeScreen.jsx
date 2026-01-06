// screens/ArcadeScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import tw from 'twrnc';
import {
  Heart,
  Trophy,
  Coins,
  Play,
  Zap,
  Gamepad2,
  Info,
  ChevronRight,
  Target,
} from 'lucide-react-native';
import AsteroidsGame from '../components/AsteroidsGame';

const { width } = Dimensions.get('window');
const MAX_LIVES = 5;

const ArcadeScreen = ({ darkMode, currentUser }) => {
  // Estado del usuario con persistencia de tus datos originales
  const [userStats, setUserStats] = useState({
    vidas: MAX_LIVES,
    monedas: currentUser?.monedas || 150,
    mejorScore: currentUser?.mejorScore || 1250,
  });

  const [gameState, setGameState] = useState('menu');

  // Lógica de fin de juego (Corregida para evitar el error de renderizado)
  const handleGameEnd = useCallback((results) => {
    setTimeout(() => {
      setUserStats(prev => ({
        ...prev,
        monedas: prev.monedas + results.monedasGanadas,
        mejorScore: Math.max(prev.mejorScore, results.score)
      }));
    }, 100);
  }, []);

  const handleExit = () => setGameState('menu');

  // Determinar colores dinámicamente basado en darkMode
  const getIconColor = (type) => {
    if (darkMode) {
      switch(type) {
        case 'heart': return '#ef4444';
        case 'coins': return '#f59e0b';
        case 'trophy': return '#3b82f6';
        case 'zap': return '#3b82f6';
        case 'target': return '#10b981';
        case 'info': return '#c4b5fd';
        default: return '#ffffff';
      }
    } else {
      switch(type) {
        case 'heart': return '#dc2626';
        case 'coins': return '#d97706';
        case 'trophy': return '#2563eb';
        case 'zap': return '#2563eb';
        case 'target': return '#059669';
        case 'info': return '#8b5cf6';
        default: return '#1e293b';
      }
    }
  };

  if (gameState === 'playing') {
    return (
      <AsteroidsGame 
        userStats={userStats} 
        onGameEnd={handleGameEnd} 
        onExit={handleExit}
        isDark={darkMode}
      />
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      <ScrollView contentContainerStyle={tw`pb-10`}>
        {/* HEADER */}
        <View style={tw`px-6 pt-6 mb-8`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-blue-500 font-bold tracking-widest text-xs uppercase`}>Gaming Hub</Text>
              <Text style={tw`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Arcade</Text>
            </View>
            <View style={tw`bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/50`}>
              <Gamepad2 color="white" size={28} />
            </View>
          </View>
        </View>

        {/* STATS */}
        <View style={tw`flex-row justify-between px-6 mb-8`}>
          <View style={tw`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 rounded-2xl items-center w-[30%] border`}>
            <Heart size={18} color={getIconColor('heart')} fill={getIconColor('heart')} />
            <Text style={tw`text-[10px] uppercase font-bold text-gray-500 mt-1`}>Vidas</Text>
            <Text style={tw`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.vidas}</Text>
          </View>
          
          <View style={tw`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 rounded-2xl items-center w-[30%] border`}>
            <Coins size={18} color={getIconColor('coins')} fill={getIconColor('coins')} />
            <Text style={tw`text-[10px] uppercase font-bold text-gray-500 mt-1`}>Monedas</Text>
            <Text style={tw`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.monedas}</Text>
          </View>
          
          <View style={tw`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 rounded-2xl items-center w-[30%] border`}>
            <Trophy size={18} color={getIconColor('trophy')} fill={getIconColor('trophy')} />
            <Text style={tw`text-[10px] uppercase font-bold text-gray-500 mt-1`}>Récord</Text>
            <Text style={tw`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.mejorScore}</Text>
          </View>
        </View>

        {/* JUEGO PRINCIPAL: ASTEROIDS */}
        <View style={tw`px-6 mb-8`}>
          <TouchableOpacity 
            onPress={() => setGameState('playing')}
            activeOpacity={0.8}
            style={tw`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl border shadow-xl overflow-hidden`}
          >
            <View style={tw`p-5`}>
              <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-3 rounded-2xl mr-4`}>
                  <Zap color={getIconColor('zap')} size={24} fill={getIconColor('zap')} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Asteroids Mobile</Text>
                  <Text style={tw`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acción espacial infinita</Text>
                </View>
                <ChevronRight color={darkMode ? "#9CA3AF" : "#6B7280"} size={20} />
              </View>

              <View style={tw`${darkMode ? 'bg-blue-700' : 'bg-blue-600'} flex-row items-center justify-center py-4 rounded-2xl`}>
                <Play size={20} color="white" fill="white" style={tw`mr-2`} />
                <Text style={tw`text-white font-black text-lg`}>JUGAR AHORA</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* SECCIÓN DE INFORMACIÓN */}
        <View style={tw`px-6`}>
          <View style={tw`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-3xl border`}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`${darkMode ? 'bg-green-900' : 'bg-green-100'} p-2 rounded-lg mr-3`}>
                <Target size={20} color={getIconColor('target')} />
              </View>
              <Text style={tw`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Objetivo de la Misión</Text>
            </View>
            <Text style={tw`text-sm leading-5 mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Destruye los asteroides para ganar puntos. Por cada 100 puntos recibirás 1 moneda para tu perfil de CiudadApp.
            </Text>

            <View style={tw`h-px w-full mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`${darkMode ? 'bg-purple-900' : 'bg-purple-100'} p-2 rounded-lg mr-3`}>
                <Info size={20} color={getIconColor('info')} />
              </View>
              <Text style={tw`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Controles</Text>
            </View>
            
            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} mr-3`} />
              <View>
                <Text style={tw`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Movimiento</Text>
                <Text style={tw`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Desliza para rotar y activar motores</Text>
              </View>
            </View>
            
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} mr-3`} />
              <View>
                <Text style={tw`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Disparo</Text>
                <Text style={tw`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Automático al mantener pulsado</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArcadeScreen;