import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TopUsers = () => {
  // Datos de ejemplo para Top 3
  const topUsers = [
    { name: 'Ana García', points: 245, rank: 'Ciudadano Héroe' },
    { name: 'Carlos López', points: 189, rank: 'Ciudadano Ejemplar' },
    { name: 'María Torres', points: 167, rank: 'Ciudadano Vigía' },
  ];

  return (
    <View style={tw`bg-white rounded-xl p-5 border border-gray-200 shadow-sm`}>
      <View style={tw`flex-row items-center gap-3 mb-5`}>
        <View style={tw`w-10 h-10 bg-yellow-100 rounded-full items-center justify-center`}>
          <Icon name="trophy" size={22} color="#F59E0B" />
        </View>
        <View>
          <Text style={tw`text-xl font-bold text-gray-900`}>Top 3 Ciudadanos</Text>
          <Text style={tw`text-sm text-gray-500`}>Los ciudadanos más activos</Text>
        </View>
      </View>
      
      <View style={tw`space-y-4`}>
        {topUsers.map((user, index) => (
          <View 
            key={index}
            style={[
              tw`p-4 rounded-xl border`,
              index === 0 ? tw`bg-yellow-50 border-yellow-200` :
              index === 1 ? tw`bg-gray-50 border-gray-200` :
              tw`bg-amber-50 border-amber-200`
            ]}
          >
            <View style={tw`flex-row items-center gap-4 mb-2`}>
              <View style={[
                tw`w-12 h-12 rounded-full items-center justify-center`,
                index === 0 ? tw`bg-yellow-500` :
                index === 1 ? tw`bg-gray-500` :
                tw`bg-amber-600`
              ]}>
                <Text style={tw`text-white text-lg font-bold`}>{index + 1}</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-bold text-gray-900 text-lg`} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  {user.points} puntos
                </Text>
              </View>
              <View style={[
                tw`px-3 py-1 rounded-full`,
                index === 0 ? tw`bg-yellow-100` :
                index === 1 ? tw`bg-gray-100` :
                tw`bg-amber-100`
              ]}>
                <Text style={[
                  tw`text-xs font-medium`,
                  index === 0 ? tw`text-yellow-800` :
                  index === 1 ? tw`text-gray-800` :
                  tw`text-amber-800`
                ]}>
                  {user.rank}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TopUsers;