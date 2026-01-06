import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TopUsers = ({ darkMode }) => {
  // Datos de ejemplo para Top 3
  const topUsers = [
    { name: 'Ana García', points: 245, rank: 'Ciudadano Héroe' },
    { name: 'Carlos López', points: 189, rank: 'Ciudadano Ejemplar' },
    { name: 'María Torres', points: 167, rank: 'Ciudadano Vigía' },
  ];

  return (
    <View style={tw`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
      <View style={tw`flex-row items-center gap-3 mb-6`}>
        <View style={tw`w-10 h-10 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-full items-center justify-center`}>
          <Icon name="trophy" size={22} color={darkMode ? "#FBBF24" : "#F59E0B"} />
        </View>
        <View>
          <Text style={tw`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top 3 Ciudadanos</Text>
          <Text style={tw`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Los ciudadanos más activos</Text>
        </View>
      </View>
      
      <View style={tw`gap-1`}>
        {topUsers.map((user, index) => (
          <View 
            key={index}
            style={[
              tw`p-4 rounded-xl border`,
              index === 0 ? tw`${darkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}` :
              index === 1 ? tw`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}` :
              tw`${darkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'}`
            ]}
          >
            <View style={tw`flex-row items-center gap-4`}>
              <View style={[
                tw`w-12 h-12 rounded-full items-center justify-center`,
                index === 0 ? tw`bg-yellow-500` :
                index === 1 ? tw`bg-gray-500` :
                tw`bg-amber-600`
              ]}>
                <Text style={tw`text-white text-lg font-bold`}>{index + 1}</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} text-lg mb-1`} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={tw`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  {user.points} puntos
                </Text>
                <View style={[
                  tw`px-3 py-1.5 rounded-full self-start`,
                  index === 0 ? tw`${darkMode ? 'bg-yellow-800' : 'bg-yellow-100'}` :
                  index === 1 ? tw`${darkMode ? 'bg-gray-600' : 'bg-gray-100'}` :
                  tw`${darkMode ? 'bg-amber-800' : 'bg-amber-100'}`
                ]}>
                  <Text style={[
                    tw`text-xs font-medium`,
                    index === 0 ? tw`${darkMode ? 'text-yellow-200' : 'text-yellow-800'}` :
                    index === 1 ? tw`${darkMode ? 'text-gray-300' : 'text-gray-800'}` :
                    tw`${darkMode ? 'text-amber-200' : 'text-amber-800'}`
                  ]}>
                    {user.rank}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TopUsers;