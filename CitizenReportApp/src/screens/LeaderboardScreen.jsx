import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const LeaderboardScreen = () => {
  return (
    <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
      <Text style={tw`text-2xl font-bold text-gray-900`}>Ranking Global</Text>
      <Text style={tw`text-gray-500 mt-2`}>Pantalla en desarrollo</Text>
    </View>
  );
};

export default LeaderboardScreen;