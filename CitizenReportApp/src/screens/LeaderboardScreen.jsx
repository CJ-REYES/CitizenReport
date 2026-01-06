// LeaderboardPage.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import tw from 'twrnc';
import { 
  Trophy, 
  Crown, 
  Award, 
  Star, 
  TrendingUp, 
  Gamepad2,
  Clock
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LeaderboardPage = ({ darkMode }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('principal');
  
  // Datos simulados - Ranking Principal
  const mainRankingData = [
    { 
      id: 1, 
      nombre: 'PENDERTUGA1234', 
      email: 'pender@gmail.com',
      rango: 'Ciudadano', 
      puntos: 1250, 
      rankIcon: '👑',
      isCurrentUser: false,
      position: 1
    },
    { 
      id: 2, 
      nombre: 'Tu Nombre', 
      email: 'tú@email.com',
      rango: 'Ciudadano', 
      puntos: 980, 
      rankIcon: '👤',
      isCurrentUser: true,
      position: 2
    },
    { 
      id: 3, 
      nombre: 'astrepeto', 
      email: 'astrepeto@gmail.com',
      rango: 'Novato', 
      puntos: 850, 
      rankIcon: '⭐',
      isCurrentUser: false,
      position: 3
    },
    { 
      id: 4, 
      nombre: 'patrode1219', 
      email: 'patrode1219@gmail.com',
      rango: 'Novato', 
      puntos: 720, 
      rankIcon: '🚀',
      isCurrentUser: false,
      position: 4
    },
    { 
      id: 5, 
      nombre: 'Ciudadano5', 
      email: 'user5@email.com',
      rango: 'Experto', 
      puntos: 650, 
      rankIcon: '🏆',
      isCurrentUser: false,
      position: 5
    },
    { 
      id: 6, 
      nombre: 'Ciudadano6', 
      email: 'user6@email.com',
      rango: 'Ciudadano', 
      puntos: 540, 
      rankIcon: '⚡',
      isCurrentUser: false,
      position: 6
    },
  ];

  // Datos simulados - Ranking Minijuego
  const minigameRankingData = [
    { 
      id: 1, 
      nombre: 'PENDERTUGA1234', 
      email: 'pender@gmail.com',
      rango: 'Minijuego', 
      puntos: 9999, 
      rankIcon: '🎮',
      isCurrentUser: false,
      position: 1
    },
    { 
      id: 2, 
      nombre: 'Tu Nombre', 
      email: 'tú@email.com',
      rango: 'Minijuego', 
      puntos: 8500, 
      rankIcon: '🎮',
      isCurrentUser: true,
      position: 2
    },
    { 
      id: 3, 
      nombre: 'Jugador3', 
      email: 'jugador3@email.com',
      rango: 'Minijuego', 
      puntos: 7200, 
      rankIcon: '🎮',
      isCurrentUser: false,
      position: 3
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy size={24} color="#FBBF24" />;
      case 2:
        return <Crown size={24} color="#9CA3AF" />;
      case 3:
        return <Award size={24} color="#D97706" />;
      default:
        return (
          <View style={tw`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} items-center justify-center`}>
            <Text style={tw`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>#{position}</Text>
          </View>
        );
    }
  };

  // Header del FlatList
  const renderHeader = () => (
    <View style={tw`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Título principal */}
      <View style={tw`p-6 pb-5`}>
        <View style={tw`flex-row items-center justify-center mb-3`}>
          <Trophy size={28} color="#FBBF24" />
          <Text style={tw`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} ml-3`}>
            Ranking de Ciudadanos
          </Text>
        </View>
        
        <Text style={tw`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4 px-4`}>
          Los ciudadanos más activos y comprometidos con mejorar nuestra comunidad
        </Text>
        
        {/* Tu posición */}
        <View style={tw`${darkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-100 border-blue-200'} border rounded-full px-5 py-2 flex-row items-center justify-center self-center`}>
          <TrendingUp size={16} color="#3B82F6" />
          <Text style={tw`${darkMode ? 'text-blue-400' : 'text-blue-600'} font-bold ml-2 text-sm`}>
            Tu posición: <Text style={tw`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>#2</Text>
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={tw`flex-row mx-4 mb-5`}>
        <TouchableOpacity
          style={tw.style(
            'flex-1 py-3 items-center border-b-2',
            activeTab === 'principal' 
              ? 'border-blue-500' 
              : darkMode ? 'border-gray-700' : 'border-gray-200'
          )}
          onPress={() => setActiveTab('principal')}
        >
          <Text style={tw.style(
            'font-bold text-base',
            activeTab === 'principal' 
              ? 'text-blue-600' 
              : darkMode ? 'text-gray-400' : 'text-gray-500'
          )}>
            Principal
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={tw.style(
            'flex-1 py-3 items-center border-b-2',
            activeTab === 'minijuego' 
              ? 'border-indigo-500' 
              : darkMode ? 'border-gray-700' : 'border-gray-200'
          )}
          onPress={() => setActiveTab('minijuego')}
        >
          <Text style={tw.style(
            'font-bold text-base',
            activeTab === 'minijuego' 
              ? 'text-indigo-600' 
              : darkMode ? 'text-gray-400' : 'text-gray-500'
          )}>
            Minijuego
          </Text>
        </TouchableOpacity>
      </View>

      {/* Título del ranking activo */}
      <View style={tw`flex-row items-center justify-between px-4 mb-2`}>
        <View style={tw`flex-row items-center`}>
          {activeTab === 'principal' ? (
            <Trophy size={20} color="#FBBF24" />
          ) : (
            <Gamepad2 size={20} color="#4F46E5" />
          )}
          <Text style={tw`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>
            {activeTab === 'principal' ? 'Ranking Principal' : 'Ranking Minijuego'}
          </Text>
        </View>
        <Text style={tw`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          {activeTab === 'principal' ? `Top ${mainRankingData.length}` : `Top ${minigameRankingData.length}`}
        </Text>
      </View>

      {/* Podio solo para ranking principal */}
      {activeTab === 'principal' && renderPodium()}

      {/* Instrucciones para minijuego */}
      {activeTab === 'minijuego' && (
        <View style={tw`mx-4 p-4 ${darkMode ? 'bg-indigo-900 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} rounded-xl mb-4 border`}>
          <Text style={tw`${darkMode ? 'text-indigo-200' : 'text-indigo-800'} font-bold mb-1`}>
            ¡Juega al minijuego para aparecer aquí!
          </Text>
          <Text style={tw`${darkMode ? 'text-indigo-300' : 'text-indigo-600'} text-xs`}>
            Compite con otros ciudadanos y gana puntos especiales
          </Text>
        </View>
      )}

      {/* Título de lista */}
      <Text style={tw`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium px-4 mb-2`}>
        Lista completa:
      </Text>
    </View>
  );

  const renderPodium = () => {
    const top3 = mainRankingData.slice(0, 3);
    
    return (
      <View style={tw`px-4 mb-6`}>
        <Text style={tw`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-8 text-center`}>
          Podio del Top 3
        </Text>
        <View style={tw`flex-row justify-center items-end`}>
          {/* Segundo lugar */}
          <View style={tw`flex-1 items-center`}>
            <View style={tw`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} items-center justify-center mb-2`}>
              <Text style={tw`text-2xl`}>🥈</Text>
            </View>
            <Text style={tw`font-bold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`} numberOfLines={1}>
              {top3[1]?.nombre || '-'}
            </Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Star size={12} color="#F59E0B" />
              <Text style={tw`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs ml-1`}>{top3[1]?.puntos || '0'}</Text>
            </View>
          </View>

          {/* Primer lugar */}
          <View style={tw`flex-1 items-center -mt-6`}>
            <View style={tw`w-20 h-20 rounded-full ${darkMode ? 'bg-yellow-900' : 'bg-amber-100'} items-center justify-center mb-3 border-4 ${darkMode ? 'border-yellow-700' : 'border-amber-300'}`}>
              <Text style={tw`text-3xl`}>👑</Text>
            </View>
            <Text style={tw`font-bold text-center ${darkMode ? 'text-yellow-300' : 'text-amber-800'} text-base`} numberOfLines={1}>
              {top3[0]?.nombre || '-'}
            </Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Star size={14} color="#F59E0B" />
              <Text style={tw`font-bold ${darkMode ? 'text-yellow-300' : 'text-amber-800'} text-sm ml-1`}>{top3[0]?.puntos || '0'}</Text>
            </View>
          </View>

          {/* Tercer lugar */}
          <View style={tw`flex-1 items-center`}>
            <View style={tw`w-16 h-16 rounded-full ${darkMode ? 'bg-yellow-900' : 'bg-amber-100'} items-center justify-center mb-2`}>
              <Text style={tw`text-2xl`}>🥉</Text>
            </View>
            <Text style={tw`font-bold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`} numberOfLines={1}>
              {top3[2]?.nombre || '-'}
            </Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Star size={12} color="#F59E0B" />
              <Text style={tw`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs ml-1`}>{top3[2]?.puntos || '0'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderUserItem = ({ item, index }) => {
    const position = index + 1;

    return (
      <TouchableOpacity
        style={tw.style(
          `flex-row items-center p-4 mx-4 my-1 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`,
          item.isCurrentUser && (darkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-200')
        )}
      >
        {/* Posición */}
        <View style={tw`w-10 items-center`}>
          {getRankIcon(position)}
        </View>

        {/* Avatar y nombre */}
        <View style={tw`flex-1 flex-row items-center`}>
          <View style={tw`ml-3`}>
            <View style={tw`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} items-center justify-center`}>
              <Text style={tw`text-lg`}>{item.rankIcon || '👤'}</Text>
            </View>
          </View>

          <View style={tw`ml-3 flex-1`}>
            <View style={tw`flex-row items-center`}>
              <Text style={tw.style(
                `font-bold text-base flex-1 ${darkMode ? 'text-white' : 'text-gray-800'}`,
                item.isCurrentUser && (darkMode ? 'text-blue-300' : 'text-blue-600')
              )} numberOfLines={1}>
                {item.nombre}
              </Text>
              {item.isCurrentUser && (
                <View style={tw`bg-blue-500 px-2 py-1 rounded-full ml-2`}>
                  <Text style={tw`text-white text-xs font-bold`}>Tú</Text>
                </View>
              )}
            </View>
            <Text style={tw`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>

        {/* Puntos */}
        <View style={tw`items-end`}>
          <View style={tw`flex-row items-center`}>
            <Star size={14} color="#F59E0B" />
            <Text style={tw`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} text-base ml-1`}>
              {item.puntos}
            </Text>
          </View>
          <Text style={tw`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>puntos</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => (
    <View style={tw`items-center p-4 mt-2`}>
      <View style={tw`flex-row items-center mb-1`}>
        <Clock size={12} color={darkMode ? "#9CA3AF" : "#6B7280"} />
        <Text style={tw`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs ml-1`}>
          Actualizado cada 30 segundos
        </Text>
      </View>
      <Text style={tw`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>
        Mostrando {activeTab === 'principal' ? mainRankingData.length : minigameRankingData.length} ciudadanos activos
      </Text>
    </View>
  );

  // Seleccionar datos según la pestaña activa
  const currentData = activeTab === 'principal' ? mainRankingData : minigameRankingData;

  return (
    <SafeAreaView style={tw`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={darkMode ? '#1F2937' : '#FFFFFF'} 
      />
      
      <FlatList
        data={currentData}
        renderItem={renderUserItem}
        keyExtractor={(item) => `${activeTab}-${item.id}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        contentContainerStyle={tw`pb-4`}
      />
    </SafeAreaView>
  );
};

export default LeaderboardPage;