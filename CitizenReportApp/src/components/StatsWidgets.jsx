import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StatsWidgets = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const stats = {
    coloniaAlumbrado: { nombre: 'Centro Histórico', total: 24 },
    coloniaBaches: { nombre: 'Las Águilas', total: 18 },
    coloniaDanos: { nombre: 'Jardines del Valle', total: 42 }
  };

  const StatCard = ({ title, value, colonia, color, icon }) => (
    <View style={tw`bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm`}>
      <View style={tw`flex-row items-center gap-3 mb-3`}>
        <View style={[tw`w-12 h-12 rounded-full items-center justify-center`, { backgroundColor: `${color}20` }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={tw`flex-1`}>
          <Text style={[tw`font-bold text-gray-900`, isSmallScreen ? tw`text-sm` : tw`text-base`]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={tw`text-xs text-gray-500 mt-1`}>
            {title.includes('Alumbrado') ? 'reportes de alumbrado' : 
             title.includes('Baches') ? 'reportes de baches' : 'reportes totales'}
          </Text>
        </View>
      </View>

      <View style={[tw`flex-row items-end justify-between`, isSmallScreen && tw`flex-col items-start gap-2`]}>
        <View>
          <Text style={[tw`font-extrabold`, { color }, isSmallScreen ? tw`text-3xl` : tw`text-4xl`]}>
            {value}
          </Text>
        </View>
        
        <View style={[tw`px-3 py-2 rounded-lg`, { backgroundColor: `${color}15` }]}>
          <Text style={[tw`font-semibold`, { color }, isSmallScreen ? tw`text-xs` : tw`text-sm`]} numberOfLines={1}>
            {colonia}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={tw`mb-4`}>
      <View style={tw`mb-4`}>
        <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
          Panel de Control
        </Text>
        <Text style={tw`text-gray-500`}>
          Resumen de la actividad de la ciudad y tu progreso
        </Text>
      </View>

      <StatCard 
        title="Colonia con más Fallas en Alumbrado"
        value={stats.coloniaAlumbrado.total}
        colonia={stats.coloniaAlumbrado.nombre}
        color="#F59E0B"
        icon="lightbulb-outline"
      />
      
      <StatCard 
        title="Colonia con más Baches"
        value={stats.coloniaBaches.total}
        colonia={stats.coloniaBaches.nombre}
        color="#F97316"
        icon="road"
      />

      <StatCard 
        title="Colonia con más Daños"
        value={stats.coloniaDanos.total}
        colonia={stats.coloniaDanos.nombre}
        color="#EF4444"
        icon="alert-octagon"
      />

      {/* Indicador de actualización automática */}
      <View style={tw`flex-row items-center justify-center gap-2 mt-3`}>
        <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
        <Text style={tw`text-xs text-gray-400`}>
          Los datos se actualizan automáticamente cada 30 segundos
        </Text>
      </View>
    </View>
  );
};

export default StatsWidgets;