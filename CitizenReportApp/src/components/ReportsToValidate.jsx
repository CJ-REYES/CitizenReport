import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ReportsToValidate = ({ currentUser }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState({});

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos de ejemplo
      setReports([
        {
          id: 1,
          tipoIncidente: 'Bache grande',
          descripcionDetallada: 'Bache de aproximadamente 50cm de diámetro en avenida principal',
          estado: 'EnValidacion',
          fechaCreacion: '2024-01-15T10:30:00',
          urlFoto: null,
          usuario: { nombre: 'Juan Pérez' }
        },
        {
          id: 2,
          tipoIncidente: 'Poste de luz caído',
          descripcionDetallada: 'Poste de luz inclinado peligrosamente',
          estado: 'EnValidacion',
          fechaCreacion: '2024-01-14T14:20:00',
          urlFoto: null,
          usuario: { nombre: 'María López' }
        }
      ]);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (reportId, esPositiva) => {
    try {
      setValidating(prev => ({ ...prev, [reportId]: true }));
      
      // Simular validación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remover reporte validado
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      // Mostrar mensaje de éxito
      alert(`¡Has ${esPositiva ? 'validado' : 'rechazado'} el reporte! +5 puntos`);
      
    } catch (error) {
      console.error('Error validando reporte:', error);
      alert('Error al validar el reporte');
    } finally {
      setValidating(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EnValidacion': return 'En Validación';
      case 'Validado': return 'Validado';
      case 'Rechazado': return 'Rechazado';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EnValidacion': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500/30' };
      case 'Validado': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500/30' };
      case 'Rechazado': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500/30' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500/30' };
    }
  };

  if (loading) {
    return (
      <View>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-xl font-bold text-gray-900`}>Reportes por Validar</Text>
          <View style={tw`flex-row items-center gap-2`}>
            <View style={tw`w-2 h-2 bg-green-500 rounded-full animate-pulse`} />
            <Text style={tw`text-sm text-gray-500`}>Actualización automática</Text>
          </View>
        </View>
        
        <View style={tw`items-center py-8`}>
          <View style={tw`w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin`} />
          <Text style={tw`text-gray-500 mt-2`}>Cargando reportes por validar...</Text>
        </View>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-xl font-bold text-gray-900`}>Reportes por Validar</Text>
          <View style={tw`flex-row items-center gap-2`}>
            <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
            <Text style={tw`text-sm text-gray-500`}>Actualizado</Text>
          </View>
        </View>
        
        <View style={tw`items-center py-8`}>
          <Icon name="check-circle" size={48} color="#10B981" />
          <Text style={tw`text-gray-500 mt-4`}>No hay reportes pendientes por validar</Text>
          <Text style={tw`text-sm text-gray-400 mt-1 text-center`}>
            ¡Buen trabajo! Has validado todos los reportes disponibles.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-xl font-bold text-gray-900`}>Reportes por Validar</Text>
        <View style={tw`flex-row items-center gap-2`}>
          <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
          <Text style={tw`text-sm text-gray-500`}>Actualización automática</Text>
        </View>
      </View>
      
      <View style={tw`space-y-4`}>
        {reports.map((report) => {
          const statusColors = getStatusColor(report.estado);
          
          return (
            <View 
              key={report.id} 
              style={tw`bg-white border border-gray-200 rounded-lg p-4`}
            >
              {/* Información del reporte */}
              <View style={tw`mb-3`}>
                <View style={tw`flex-row justify-between items-start mb-2`}>
                  <Text style={tw`font-semibold text-gray-900 text-lg`}>
                    {report.tipoIncidente}
                  </Text>
                  <View style={[tw`px-3 py-1 rounded-full`, statusColors.bg]}>
                    <Text style={[tw`text-xs font-medium`, statusColors.text]}>
                      {getStatusText(report.estado)}
                    </Text>
                  </View>
                </View>
                
                <Text style={tw`text-sm text-gray-600`}>
                  {report.descripcionDetallada}
                </Text>
              </View>

              {/* Información del usuario */}
              <View style={tw`flex-row items-center gap-2 mb-4`}>
                <View style={tw`w-6 h-6 bg-blue-100 rounded-full items-center justify-center`}>
                  <Icon name="account" size={14} color="#3B82F6" />
                </View>
                <Text style={tw`text-sm text-gray-500`}>
                  Reportado por {report.usuario?.nombre || "Usuario"}
                </Text>
                <Text style={tw`text-gray-400`}>•</Text>
                <Text style={tw`text-sm text-gray-500`}>
                  {formatDate(report.fechaCreacion)}
                </Text>
              </View>

              {/* Botones de validación */}
              <View style={tw`flex-row justify-between items-center pt-3 border-t border-gray-200`}>
                <View style={tw`flex-row items-center gap-1`}>
                  <Icon name="clock-outline" size={16} color="#6B7280" />
                  <Text style={tw`text-sm text-gray-500`}>Necesita 10 validaciones</Text>
                </View>
                
                <View style={tw`flex-row gap-2`}>
                  <TouchableOpacity
                    onPress={() => handleValidation(report.id, true)}
                    disabled={validating[report.id]}
                    style={tw`flex-row items-center gap-2 px-4 py-2 bg-green-500 rounded-lg`}
                  >
                    {validating[report.id] ? (
                      <View style={tw`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin`} />
                    ) : (
                      <Icon name="thumb-up" size={16} color="white" />
                    )}
                    <Text style={tw`text-white font-medium`}>Validar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleValidation(report.id, false)}
                    disabled={validating[report.id]}
                    style={tw`flex-row items-center gap-2 px-4 py-2 bg-red-500 rounded-lg`}
                  >
                    {validating[report.id] ? (
                      <View style={tw`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin`} />
                    ) : (
                      <Icon name="thumb-down" size={16} color="white" />
                    )}
                    <Text style={tw`text-white font-medium`}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ReportsToValidate;