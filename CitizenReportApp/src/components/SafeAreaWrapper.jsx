import React from 'react';
import { View, StatusBar, Platform, Dimensions } from 'react-native';
import tw from 'twrnc';

const { height, width } = Dimensions.get('window');

const SafeAreaWrapper = ({ children, style, darkMode }) => {
  // Valores seguros para diferentes dispositivos
  const getSafeAreaPadding = () => {
    if (Platform.OS === 'ios') {
      // iPhone X y posteriores
      if (height >= 812) {
        return { paddingTop: 44, paddingBottom: 34 };
      }
      // iPhone 8 y anteriores
      return { paddingTop: 20, paddingBottom: 0 };
    }
    // Android
    return { paddingTop: 25, paddingBottom: 0 };
  };

  const safeAreaPadding = getSafeAreaPadding();

  return (
    <View style={[{ flex: 1 }, style]}>
      <StatusBar 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={darkMode ? '#1F2937' : '#F9FAFB'} 
        translucent={false}
      />
      <View style={[
        tw`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`,
        { 
          paddingTop: safeAreaPadding.paddingTop,
          paddingBottom: safeAreaPadding.paddingBottom 
        }
      ]}>
        {children}
      </View>
    </View>
  );
};

export default SafeAreaWrapper;