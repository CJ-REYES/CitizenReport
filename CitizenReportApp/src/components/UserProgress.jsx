import React, { useState } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserProgress = ({ currentUser, darkMode }) => {
  const [userStats, setUserStats] = useState({
    points: 34,
    rank: 'Ciudadano Novato',
    reportsCount: 5,
    rankingPosition: 2,
    nextRank: 'Ciudadano Activo',
    nextRankPoints: 100,
  });

  const progress = (userStats.points / userStats.nextRankPoints) * 100;

  return (
    <View style={tw`space-y-4`}>
      {/* Profile Header */}
      <View style={tw`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl p-5 border mb-4`}>
        <View style={tw`flex-row items-center gap-4`}>
          <View style={tw`w-16 h-16 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-full items-center justify-center`}>
            <Icon name="account" size={28} color={darkMode ? "#FBBF24" : "#F59E0B"} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              {currentUser?.nombre || currentUser?.username || 'Usuario'}
            </Text>
            <View style={tw`flex-row items-center gap-2 mb-3`}>
              <Icon name="trophy" size={18} color="#F59E0B" />
              <Text style={tw`text-base ${darkMode ? 'text-yellow-300' : 'text-yellow-500'} font-semibold`}>{userStats.rank}</Text>
            </View>
            
            <View style={tw`space-y-2`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Progreso: {userStats.nextRank}
                </Text>
                <Text style={tw`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {userStats.points} / {userStats.nextRankPoints} pts
                </Text>
              </View>
              <View style={tw`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                <View 
                  style={[
                    tw`h-full bg-yellow-400`,
                    { width: `${Math.min(progress, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* User Stats Grid */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Mis Estadísticas</Text>
        <View style={tw`flex-row flex-wrap justify-between gap-3`}>
          {/* Puntos */}
          <View style={tw`w-[48%] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="trophy" size={18} color="#3B82F6" />
              <Text style={tw`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Puntos</Text>
            </View>
            <Text style={tw`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.points}</Text>
          </View>

          {/* Reportes */}
          <View style={tw`w-[48%] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="map-marker" size={18} color="#10B981" />
              <Text style={tw`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reportes</Text>
            </View>
            <Text style={tw`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.reportsCount}</Text>
          </View>

          {/* Ranking */}
          <View style={tw`w-[48%] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm mt-3`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="account-group" size={18} color="#8B5CF6" />
              <Text style={tw`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ranking</Text>
            </View>
            <Text style={tw`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              #{userStats.rankingPosition}
            </Text>
          </View>

          {/* Rango */}
          <View style={tw`w-[48%] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow-sm mt-3`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="star" size={18} color="#F59E0B" />
              <Text style={tw`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rango</Text>
            </View>
            <Text style={tw`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
              {userStats.rank}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserProgress;