import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const AdminScreen = () => {
  return (
    <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
      <Text style={tw`text-2xl font-bold text-gray-900`}>Panel de Administración</Text>
      <Text style={tw`text-gray-500 mt-2`}>Pantalla en desarrollo</Text>
    </View>
  );
};

export default AdminScreen;