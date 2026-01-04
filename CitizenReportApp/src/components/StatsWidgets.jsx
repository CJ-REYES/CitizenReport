import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StatsWidgets = () => {
  const [stats, setStats] = useState({
    coloniaAlumbrado: { nombre: 'Cargando...', total: 0 },
    coloniaBaches: { nombre: 'Cargando...', total: 0 },
    coloniaDanos: { nombre: 'Cargando...', total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      // Simular datos de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        coloniaAlumbrado: { nombre: 'Centro Histórico', total: 24 },
        coloniaBaches: { nombre: 'Las Águilas', total: 18 },
        coloniaDanos: { nombre: 'Jardines del Valle', total: 42 }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, colonia, color, icon }) => (
    <View style={tw`bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm`}>
      <View style={tw`flex-row items-center gap-2 mb-3`}>
        <Icon name={icon} size={20} color={color} />
        <Text style={tw`text-sm font-bold text-gray-900 flex-1`}>{title}</Text>
      </View>

      <Text style={[tw`text-3xl font-extrabold mb-2`, { color }]}>
        {value}
      </Text>
      <Text style={tw`text-xs text-gray-500 mb-2`}>
        reportes {title.toLowerCase().includes('alumbrado') ? 'de alumbrado' : 
                 title.toLowerCase().includes('baches') ? 'de baches' : 'totales'}
      </Text>

      <View style={[tw`rounded-lg p-3`, { backgroundColor: `${color}20` }]}>
        <Text style={[tw`text-sm font-semibold`, { color }]}>
          {colonia === 'Sin reportes' ? 'Sin reportes' : colonia}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={tw`mb-6`}>
      {/* Widgets en grid */}
      <View style={tw`flex-row flex-wrap justify-between`}>
        <View style={tw`w-[48%]`}>
          <StatCard 
            title="Colonia con más Fallas en Alumbrado"
            value={stats.coloniaAlumbrado.total}
            colonia={stats.coloniaAlumbrado.nombre}
            color="#F59E0B"
            icon="lightbulb-outline"
          />
        </View>
        
        <View style={tw`w-[48%]`}>
          <StatCard 
            title="Colonia con más Baches"
            value={stats.coloniaBaches.total}
            colonia={stats.coloniaBaches.nombre}
            color="#F97316"
            icon="road"
          />
        </View>
      </View>

      <StatCard 
        title="Colonia con más Daños"
        value={stats.coloniaDanos.total}
        colonia={stats.coloniaDanos.nombre}
        color="#EF4444"
        icon="alert-octagon"
      />

      {/* Indicador de actualización automática */}
      <Text style={tw`text-xs text-center text-gray-400 mt-4`}>
        Los datos se actualizan automáticamente cada 30 segundos
      </Text>
    </View>
  );
};

export default StatsWidgets;