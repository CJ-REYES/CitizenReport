import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserRecentReports = () => {
  // Reportes de ejemplo
  const userReports = [
    { id: 1, type: 'Bache', description: 'Bache grande en avenida principal', status: 'Validado', date: '2024-01-15' },
    { id: 2, type: 'Alumbrado', description: 'Poste de luz descompuesto', status: 'En Proceso', date: '2024-01-14' },
    { id: 3, type: 'Basura', description: 'Acumulación de basura', status: 'Resuelto', date: '2024-01-12' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Validado': return { bg: 'bg-green-100', text: 'text-green-700', icon: 'check-circle' };
      case 'En Proceso': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'clock-outline' };
      case 'Resuelto': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'check-all' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'alert-circle-outline' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Bache': return { icon: 'road', color: '#F97316' };
      case 'Alumbrado': return { icon: 'lightbulb-outline', color: '#F59E0B' };
      case 'Basura': return { icon: 'trash-can-outline', color: '#10B981' };
      default: return { icon: 'alert-circle-outline', color: '#6B7280' };
    }
  };

  return (
    // CAMBIO 1: Si quieres más espacio en el borde general, cambia p-6 a p-8 aquí
    <View style={tw`bg-white rounded-xl p-6 border border-gray-200 shadow-sm`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <View style={tw`flex-row items-center gap-3`}>
          <View style={tw`w-10 h-10 bg-green-100 rounded-full items-center justify-center`}>
            <Icon name="clipboard-list" size={22} color="#2E7D32" />
          </View>
          <View>
            <Text style={tw`text-xl font-bold text-gray-900`}>Mis Reportes Recientes</Text>
            <Text style={tw`text-sm text-gray-500`}>Últimas contribuciones</Text>
          </View>
        </View>
        <View style={tw`flex-row items-center gap-2`}>
          <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
         
        </View>
      </View>
      
      {/* CAMBIO 2: Cambié 'space-y-5' por 'gap-6' para separar más los recuadros entre sí */}
      <View style={tw`gap-1`}>
        {userReports.map((report) => {
          const statusColors = getStatusColor(report.status);
          const typeIcon = getTypeIcon(report.type);
          
          return (
            /* CAMBIO 3: Aumenté el padding interno de la tarjeta de 'p-4' a 'p-6' */
            <View key={report.id} style={tw`bg-gray-50 rounded-xl p-6 border border-gray-200`}>
              <View style={tw`flex-row items-start gap-4`}>
                <View style={[tw`w-12 h-12 rounded-xl items-center justify-center`, { backgroundColor: `${typeIcon.color}20` }]}>
                  <Icon name={typeIcon.icon} size={22} color={typeIcon.color} />
                </View>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row justify-between items-start mb-3`}>
                    <Text style={tw`font-bold text-gray-900 text-base`}>{report.type}</Text>
                    <View style={[tw`px-3 py-1.5 rounded-full flex-row items-center gap-1.5`, statusColors.bg]}>
                      <Icon name={statusColors.icon} size={14} color={statusColors.text.replace('text-', '#')} />
                      <Text style={[tw`text-xs font-medium`, statusColors.text]}>
                        {report.status}
                      </Text>
                    </View>
                  </View>
                  <View style={tw`mb-3`}>
                    <Text style={tw`text-sm text-gray-600`} numberOfLines={2}>
                      {report.description}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center gap-1.5`}>
                    <Icon name="calendar" size={14} color="#9CA3AF" />
                    <Text style={tw`text-xs text-gray-500`}>
                      {new Date(report.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity 
        style={tw`flex-row items-center justify-center gap-2 mt-8 py-3 border-t border-gray-200`}
        onPress={() => console.log('Ver todos los reportes')}
      >
        <Text style={tw`text-base font-medium text-[#2E7D32]`}>Ver todos los reportes</Text>
        <Icon name="arrow-right" size={18} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );
};

export default UserRecentReports;