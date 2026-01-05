import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserProfile = ({ currentUser }) => {
  const [userStats, setUserStats] = useState({
    points: 34,
    rank: 'Ciudadano Novato',
    reportsCount: 5,
    rankingPosition: 2,
    nextRank: 'Ciudadano Activo',
    nextRankPoints: 100,
  });

  const progress = (userStats.points / userStats.nextRankPoints) * 100;

  // Datos de ejemplo para Top 3
  const topUsers = [
    { name: 'Ana García', points: 245, rank: 'Ciudadano Héroe' },
    { name: 'Carlos López', points: 189, rank: 'Ciudadano Ejemplar' },
    { name: 'María Torres', points: 167, rank: 'Ciudadano Vigía' },
  ];

  // Reportes de ejemplo
  const userReports = [
    { id: 1, type: 'Bache', description: 'Bache grande en avenida principal', status: 'Validado', date: '2024-01-15' },
    { id: 2, type: 'Alumbrado', description: 'Poste de luz descompuesto', status: 'En Proceso', date: '2024-01-14' },
    { id: 3, type: 'Basura', description: 'Acumulación de basura', status: 'Resuelto', date: '2024-01-12' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Validado': return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'En Proceso': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'Resuelto': return { bg: 'bg-blue-100', text: 'text-blue-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  return (
    <View style={tw`space-y-6`}>
      {/* Profile Header */}
      <View style={tw`bg-gray-50 rounded-xl p-4 border border-gray-200`}>
        <View style={tw`flex-row items-center gap-4`}>
          <View style={tw`w-16 h-16 bg-yellow-100 rounded-full items-center justify-center`}>
            <Text style={tw`text-3xl`}>👤</Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold text-gray-900 mb-1`}>
              {currentUser?.nombre || currentUser?.username || 'Usuario'}
            </Text>
            <View style={tw`flex-row items-center gap-2 mb-3`}>
              <Icon name="trophy" size={18} color="#F59E0B" />
              <Text style={tw`text-base text-yellow-500 font-semibold`}>{userStats.rank}</Text>
            </View>
            
            <View style={tw`space-y-2`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-xs text-gray-500`}>
                  Progreso: {userStats.nextRank}
                </Text>
                <Text style={tw`text-xs text-gray-500`}>
                  {userStats.points} / {userStats.nextRankPoints} pts
                </Text>
              </View>
              <View style={tw`w-full bg-gray-200 rounded-full h-2 overflow-hidden`}>
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
        <View style={tw`flex-row flex-wrap justify-between`}>
          {/* Puntos */}
          <View style={tw`w-[48%] bg-white rounded-xl p-3 mb-3 border border-gray-100`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="trophy" size={16} color="#3B82F6" />
              <Text style={tw`text-xs text-gray-500`}>Puntos</Text>
            </View>
            <Text style={tw`text-lg font-bold text-gray-900`}>{userStats.points}</Text>
          </View>

          {/* Reportes */}
          <View style={tw`w-[48%] bg-white rounded-xl p-3 mb-3 border border-gray-100`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="map-marker" size={16} color="#10B981" />
              <Text style={tw`text-xs text-gray-500`}>Reportes</Text>
            </View>
            <Text style={tw`text-lg font-bold text-gray-900`}>{userStats.reportsCount}</Text>
          </View>

          {/* Ranking */}
          <View style={tw`w-[48%] bg-white rounded-xl p-3 border border-gray-100`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="account-group" size={16} color="#8B5CF6" />
              <Text style={tw`text-xs text-gray-500`}>Ranking</Text>
            </View>
            <Text style={tw`text-lg font-bold text-gray-900`}>
              #{userStats.rankingPosition}
            </Text>
          </View>

          {/* Rango */}
          <View style={tw`w-[48%] bg-white rounded-xl p-3 border border-gray-100`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Icon name="star" size={16} color="#F59E0B" />
              <Text style={tw`text-xs text-gray-500`}>Rango</Text>
            </View>
            <Text style={tw`text-sm font-bold text-gray-900`} numberOfLines={1}>
              {userStats.rank}
            </Text>
          </View>
        </View>
      </View>

      {/* Top 3 Usuarios */}
      <View style={tw`bg-gray-50 rounded-xl p-4 border border-gray-200`}>
        <Text style={tw`text-lg font-bold text-gray-900 mb-3 flex-row items-center gap-2`}>
          <Icon name="trophy" size={20} color="#F59E0B" />
          Top 3 Ciudadanos
        </Text>
        <View style={tw`space-y-3`}>
          {topUsers.map((user, index) => (
            <View 
              key={index}
              style={[
                tw`p-3 rounded-lg border`,
                index === 0 ? tw`bg-yellow-500/10 border-yellow-500/30` :
                index === 1 ? tw`bg-gray-400/10 border-gray-400/30` :
                tw`bg-amber-700/10 border-amber-700/30`
              ]}
            >
              <View style={tw`flex-row items-center gap-3 mb-1`}>
                <View style={[
                  tw`w-8 h-8 rounded-full items-center justify-center`,
                  index === 0 ? tw`bg-yellow-400` :
                  index === 1 ? tw`bg-gray-400` :
                  tw`bg-amber-600`
                ]}>
                  <Text style={tw`text-base`}>👤</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`font-semibold text-gray-900`} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={tw`text-xs text-gray-500`}>
                    {user.points} puntos
                  </Text>
                </View>
              </View>
              <Text style={tw`text-xs text-gray-500`}>
                {user.rank}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Mis Reportes Recientes */}
      <View style={tw`bg-gray-50 rounded-xl p-4 border border-gray-200`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={tw`text-lg font-bold text-gray-900`}>Mis Reportes Recientes</Text>
          <View style={tw`flex-row items-center gap-2`}>
            <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
            <Text style={tw`text-xs text-gray-500`}>Actualizados</Text>
          </View>
        </View>
        
        <View style={tw`space-y-3`}>
          {userReports.map((report) => {
            const statusColors = getStatusColor(report.status);
            return (
              <View key={report.id} style={tw`bg-white rounded-lg p-3 flex-row items-start gap-3 border border-gray-200`}>
                <View style={tw`w-10 h-10 bg-gray-100 rounded-lg items-center justify-center`}>
                  <Icon 
                    name={report.type === 'Bache' ? 'road' : 
                          report.type === 'Alumbrado' ? 'lightbulb-outline' : 
                          'trash-can-outline'} 
                    size={18} 
                    color="#6B7280" 
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`font-semibold text-gray-900`}>{report.type}</Text>
                  <Text style={tw`text-xs text-gray-500`} numberOfLines={2}>
                    {report.description}
                  </Text>
                  <Text style={tw`text-xs text-gray-400 mt-1`}>
                    {new Date(report.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={[tw`px-2 py-1 rounded-full`, statusColors.bg]}>
                  <Text style={[tw`text-xs`, statusColors.text]}>
                    {report.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={tw`flex-row justify-center mt-3`}>
          <Text style={tw`text-sm text-[#2E7D32] font-medium`}>Ver todos los reportes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserProfile;