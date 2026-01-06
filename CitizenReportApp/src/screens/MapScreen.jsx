// screens/MapScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// DATOS SIMULADOS COMPLETOS
const MOCK_REPORTS = [
  {
    id: 1,
    estado: 'EnValidacion',
    tipoIncidente: 'Bache',
    descripcionDetallada: 'Bache profundo de aproximadamente 30cm en esquina de Calle Principal y 5 de Mayo, muy peligroso para vehículos pequeños',
    latitud: 18.186356,
    longitud: -91.041947,
    urlFoto: 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?w=400',
    usuario: { 
      nombre: 'Juan Pérez', 
      fotoPerfil: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 
      puntos: 150 
    },
    fechaCreacion: '2024-01-15T10:30:00Z',
    colonia: 'Centro'
  },
  {
    id: 2,
    estado: 'Validado',
    tipoIncidente: 'Alumbrado',
    descripcionDetallada: 'Poste de luz #45 dañado en el parque central, no enciende desde hace 3 días',
    latitud: 18.190356,
    longitud: -91.045947,
    urlFoto: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    usuario: { 
      nombre: 'María García', 
      fotoPerfil: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100', 
      puntos: 230 
    },
    fechaCreacion: '2024-01-14T14:20:00Z',
    colonia: 'Parque Central'
  },
  {
    id: 3,
    estado: 'Resuelto',
    tipoIncidente: 'Basura',
    descripcionDetallada: 'Acumulación de basura en calle secundaria frente al mercado, mal olor y riesgo sanitario',
    latitud: 18.182356,
    longitud: -91.038947,
    urlFoto: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    usuario: { 
      nombre: 'Carlos López', 
      fotoPerfil: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 
      puntos: 180 
    },
    fechaCreacion: '2024-01-13T09:15:00Z',
    colonia: 'San Antonio'
  },
  {
    id: 4,
    estado: 'Rechazado',
    tipoIncidente: 'Vandalismo',
    descripcionDetallada: 'Grafiti en pared pública de edificio histórico del centro',
    latitud: 18.188356,
    longitud: -91.035947,
    urlFoto: 'https://images.unsplash.com/photo-1545062993-0c83447b96f8?w=400',
    usuario: { 
      nombre: 'Ana Martínez', 
      fotoPerfil: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 
      puntos: 95 
    },
    fechaCreacion: '2024-01-12T16:45:00Z',
    colonia: 'Zona Histórica'
  },
  {
    id: 5,
    estado: 'Validado',
    tipoIncidente: 'Bache',
    descripcionDetallada: 'Varios baches pequeños en avenida principal cerca de la escuela',
    latitud: 18.184356,
    longitud: -91.048947,
    urlFoto: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    usuario: { 
      nombre: 'Pedro Ramírez', 
      fotoPerfil: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 
      puntos: 210 
    },
    fechaCreacion: '2024-01-10T11:20:00Z',
    colonia: 'Las Flores'
  },
  {
    id: 6,
    estado: 'EnValidacion',
    tipoIncidente: 'Alumbrado',
    descripcionDetallada: 'Lámpara parpadeante en calle Reforma, causa molestias a vecinos',
    latitud: 18.192356,
    longitud: -91.042947,
    urlFoto: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400',
    usuario: { 
      nombre: 'Laura Sánchez', 
      fotoPerfil: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100', 
      puntos: 120 
    },
    fechaCreacion: '2024-01-16T08:45:00Z',
    colonia: 'Reforma'
  },
  {
    id: 7,
    estado: 'Validado',
    tipoIncidente: 'Basura',
    descripcionDetallada: 'Contenedor de basura desbordado en esquina concurrida',
    latitud: 18.180356,
    longitud: -91.044947,
    urlFoto: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    usuario: { 
      nombre: 'Roberto Jiménez', 
      fotoPerfil: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', 
      puntos: 175 
    },
    fechaCreacion: '2024-01-11T13:30:00Z',
    colonia: 'El Sol'
  },
  {
    id: 8,
    estado: 'Resuelto',
    tipoIncidente: 'Bache',
    descripcionDetallada: 'Bache reparado recientemente en avenida Juárez',
    latitud: 18.185356,
    longitud: -91.035947,
    urlFoto: 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?w=400',
    usuario: { 
      nombre: 'Carmen Ruiz', 
      fotoPerfil: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100', 
      puntos: 195 
    },
    fechaCreacion: '2024-01-05T09:15:00Z',
    colonia: 'Juárez'
  }
];

const MapScreen = () => {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filteredReports, setFilteredReports] = useState(MOCK_REPORTS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAllReports, setShowAllReports] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Configuración del mapa
  const CANDELARIA_CENTER = {
    latitude: 18.186356,
    longitude: -91.041947,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterReports();
  }, [statusFilter, typeFilter]);

  const filterReports = () => {
    let filtered = [...reports];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.estado === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.tipoIncidente === typeFilter);
    }
    
    setFilteredReports(filtered);
  };

  // --- FUNCIONES PARA MARCADORES MEJORADAS ---

  const getMarkerColor = (status) => {
    switch (status) {
      case 'EnValidacion':
        return '#F59E0B'; // Amarillo vibrante
      case 'Validado':
        return '#3B82F6'; // Azul
      case 'Resuelto':
        return '#10B981'; // Verde
      case 'Rechazado':
        return '#EF4444'; // Rojo
      default:
        return '#6B7280'; // Gris
    }
  };

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'Bache':
        return { name: 'road', size: 10 };
      case 'Alumbrado':
        return { name: 'lightbulb-outline', size: 10 };
      case 'Basura':
        return { name: 'trash-can-outline', size: 10 };
      case 'Vandalismo':
        return { name: 'spray', size: 10 };
      default:
        return { name: 'alert-circle-outline', size: 10 };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EnValidacion':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'Validado':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'Resuelto':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'Rechazado':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EnValidacion': return 'En Validación';
      case 'Validado': return 'Validado';
      case 'Resuelto': return 'Resuelto';
      case 'Rechazado': return 'Rechazado';
      default: return status;
    }
  };

  const getReportTypes = () => {
    const types = [...new Set(reports.map(r => r.tipoIncidente))];
    return types.sort();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'hace unos minutos';
    if (diffHours < 24) return `hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays}d`;
    
    return formatDate(dateString);
  };

  const handleMapReady = () => {
    setLoading(false);
  };

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(CANDELARIA_CENTER, 1000);
    }
  };

  const handleMarkerPress = (report) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: report.latitud,
        longitude: report.longitud,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
      
      // Mostrar información del marcador
      setTimeout(() => {
        Alert.alert(
          report.tipoIncidente,
          `${report.descripcionDetallada}\n\n📍 ${report.colonia}\n👤 ${report.usuario.nombre}\n📅 ${formatDate(report.fechaCreacion)}`,
          [{ text: 'OK' }]
        );
      }, 600);
    }
  };

  const visibleReports = showAllReports ? reports : reports.slice(0, 3);
  const hasMoreReports = reports.length > 3;

  const stats = {
    total: reports.length,
    enValidacion: reports.filter(r => r.estado === 'EnValidacion').length,
    validados: reports.filter(r => r.estado === 'Validado').length,
    resueltos: reports.filter(r => r.estado === 'Resuelto').length,
    rechazados: reports.filter(r => r.estado === 'Rechazado').length,
  };

  // Componente para renderizar cada marcador
  const CustomMarker = ({ report }) => {
    const markerColor = getMarkerColor(report.estado);
    const icon = getMarkerIcon(report.tipoIncidente);
    
    return (
      <Marker
        coordinate={{
          latitude: report.latitud,
          longitude: report.longitud,
        }}
        title={report.tipoIncidente}
        description={report.descripcionDetallada}
        onPress={() => handleMarkerPress(report)}
      >
        {/* Contenedor principal del marcador */}
        <View style={tw`items-center justify-center`}>
          {/* Círculo principal del marcador - tamaño reducido */}
          <View style={[
            tw`w-9 h-9 rounded-full items-center justify-center`,
            { 
              backgroundColor: markerColor,
              borderWidth: 2,
              borderColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 3,
            }
          ]}>
            {/* Ícono más pequeño y perfectamente centrado */}
            <Icon 
              name={icon.name} 
              size={10} 
              color="white" 
              style={tw`text-center`}
            />
          </View>
        </View>
      </Marker>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      
      <Animated.View style={[tw`flex-1`, { opacity: fadeAnim }]}>
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={tw`px-4 pt-6 pb-4 bg-white border-b border-gray-200`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View>
                <Text style={tw`text-2xl font-bold text-gray-900`}>Mapa de Reportes</Text>
                <Text style={tw`text-gray-500 mt-1`}>Visualiza los problemas reportados en tu ciudad</Text>
              </View>
              <TouchableOpacity 
                style={tw`w-10 h-10 bg-teal-100 rounded-full items-center justify-center shadow-sm`}
                onPress={handleCenterMap}
              >
                <Icon name="crosshairs-gps" size={20} color="#14b8a6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtros */}
          <View style={tw`px-4 py-4 bg-white border-b border-gray-200`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Icon name="filter-variant" size={20} color="#14b8a6" />
              <Text style={tw`text-lg font-semibold text-gray-800 ml-2`}>Filtros</Text>
            </View>
            
            {/* Filtro por Estado */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm text-gray-500 mb-2`}>Estado</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={tw`flex-row`}
                contentContainerStyle={tw`pb-1`}
              >
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    statusFilter === 'all' ? 'bg-teal-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setStatusFilter('all')}
                >
                  <Text style={tw`text-sm font-medium ${
                    statusFilter === 'all' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Todos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    statusFilter === 'EnValidacion' ? 'bg-yellow-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setStatusFilter('EnValidacion')}
                >
                  <Text style={tw`text-sm font-medium ${
                    statusFilter === 'EnValidacion' ? 'text-white' : 'text-gray-700'
                  }`}>
                    En Validación
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    statusFilter === 'Validado' ? 'bg-blue-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setStatusFilter('Validado')}
                >
                  <Text style={tw`text-sm font-medium ${
                    statusFilter === 'Validado' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Validado
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    statusFilter === 'Resuelto' ? 'bg-green-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setStatusFilter('Resuelto')}
                >
                  <Text style={tw`text-sm font-medium ${
                    statusFilter === 'Resuelto' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Resuelto
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Filtro por Tipo */}
            <View>
              <Text style={tw`text-sm text-gray-500 mb-2`}>Tipo de Problema</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={tw`flex-row`}
                contentContainerStyle={tw`pb-1`}
              >
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    typeFilter === 'all' ? 'bg-teal-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setTypeFilter('all')}
                >
                  <Text style={tw`text-sm font-medium ${
                    typeFilter === 'all' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Todos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    typeFilter === 'Alumbrado' ? 'bg-blue-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setTypeFilter('Alumbrado')}
                >
                  <Text style={tw`text-sm font-medium ${
                    typeFilter === 'Alumbrado' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Alumbrado
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    typeFilter === 'Bache' ? 'bg-orange-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setTypeFilter('Bache')}
                >
                  <Text style={tw`text-sm font-medium ${
                    typeFilter === 'Bache' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Bache
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    typeFilter === 'Basura' ? 'bg-green-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setTypeFilter('Basura')}
                >
                  <Text style={tw`text-sm font-medium ${
                    typeFilter === 'Basura' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Basura
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-4 py-2 rounded-full mr-2 ${
                    typeFilter === 'Vandalismo' ? 'bg-purple-500' : 'bg-gray-100 border border-gray-300'
                  }`}
                  onPress={() => setTypeFilter('Vandalismo')}
                >
                  <Text style={tw`text-sm font-medium ${
                    typeFilter === 'Vandalismo' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Vandalismo
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          {/* Contador de reportes filtrados */}
          <View style={tw`px-4 pt-4 pb-2`}>
            <Text style={tw`text-sm text-gray-600`}>
              <Text style={tw`font-semibold text-teal-600`}>{filteredReports.length}</Text> de {reports.length} reportes
              {statusFilter !== 'all' && ` (filtrado por ${getStatusText(statusFilter)})`}
              {typeFilter !== 'all' && ` (${typeFilter})`}
            </Text>
          </View>

          {/* Mapa con OpenStreetMap */}
          <View style={tw`mx-4 my-3 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm`}>
            <View style={tw`h-80 relative`}>
              {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                  <View style={tw`w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin`} />
                  <Text style={tw`text-gray-500 mt-2`}>Cargando mapa...</Text>
                </View>
              ) : (
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_DEFAULT}
                  style={tw`flex-1`}
                  initialRegion={CANDELARIA_CENTER}
                  onMapReady={handleMapReady}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  rotateEnabled={false}
                  minZoomLevel={12}
                  maxZoomLevel={18}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  showsCompass={true}
                  showsScale={true}
                >
                  {/* Tile de OpenStreetMap - GRATIS y OPEN SOURCE */}
                  <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                  />
                  
                  {/* Marcadores PULIDOS - usando componente CustomMarker */}
                  {filteredReports.map((report) => (
                    <CustomMarker key={report.id} report={report} />
                  ))}
                </MapView>
              )}
              
              {/* Atribución de OpenStreetMap */}
              <View style={tw`absolute bottom-2 left-2 bg-white/95 px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm`}>
                <Text style={tw`text-xs text-gray-700 font-medium`}>
                  © OpenStreetMap contributors
                </Text>
              </View>
              
              {/* Botón de leyenda */}
              <TouchableOpacity 
                style={tw`absolute top-2 right-2 bg-white/95 px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm flex-row items-center`}
                onPress={() => {
                  Alert.alert(
                    'Leyenda de Marcadores',
                    '🟡 En Validación\n🔵 Validado\n🟢 Resuelto\n🔴 Rechazado\n\n🛣️ Bache\n💡 Alumbrado\n🗑️ Basura\n🎨 Vandalismo',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Icon name="information-outline" size={14} color="#6B7280" />
                <Text style={tw`text-xs text-gray-700 ml-1 font-medium`}>Leyenda</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Estadísticas */}
          <View style={tw`px-4 mb-4`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Resumen</Text>
            <View style={tw`flex-row justify-between`}>
              {/* Total Reportes */}
              <View style={tw`flex-1 bg-white rounded-xl p-4 border border-gray-200 mr-2 shadow-sm items-center`}>
                <Text style={tw`text-3xl font-bold text-gray-900`}>{stats.total}</Text>
                <Text style={tw`text-sm text-gray-500 mt-1`}>Reportes</Text>
              </View>
              
              {/* En Validación */}
              <View style={tw`flex-1 bg-yellow-50 rounded-xl p-4 border border-yellow-200 mr-2 shadow-sm items-center`}>
                <Text style={tw`text-3xl font-bold text-yellow-700`}>{stats.enValidacion}</Text>
                <Text style={tw`text-sm text-yellow-600 mt-1`}>En Validación</Text>
              </View>
              
              {/* Validados */}
              <View style={tw`flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm items-center`}>
                <Text style={tw`text-3xl font-bold text-blue-700`}>{stats.validados}</Text>
                <Text style={tw`text-sm text-blue-600 mt-1`}>Validados</Text>
              </View>
            </View>
          </View>

          {/* Lista de Reportes */}
          <View style={tw`mx-4 mb-8 bg-white rounded-xl border border-gray-200 shadow-sm`}>
            <View style={tw`p-4 border-b border-gray-200`}>
              <View style={tw`flex-row justify-between items-center`}>
                <View>
                  <Text style={tw`text-xl font-bold text-gray-900`}>Reportes Recientes</Text>
                  <Text style={tw`text-sm text-gray-500 mt-1`}>
                    {reports.length} reportes en total
                  </Text>
                </View>
                {hasMoreReports && (
                  <TouchableOpacity 
                    style={tw`flex-row items-center bg-teal-50 px-3 py-1.5 rounded-full`}
                    onPress={() => setShowAllReports(!showAllReports)}
                  >
                    <Icon name={showAllReports ? "chevron-up" : "chevron-down"} size={14} color="#14b8a6" />
                    <Text style={tw`text-teal-700 font-medium ml-1 text-xs`}>
                      {showAllReports ? 'Ver menos' : 'Ver todos'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {reports.length === 0 ? (
              <View style={tw`p-8 items-center`}>
                <Icon name="map-marker-off" size={40} color="#d1d5db" />
                <Text style={tw`text-gray-500 mt-4 text-lg`}>No hay reportes disponibles</Text>
                <Text style={tw`text-sm text-gray-400 mt-2 text-center`}>
                  Sé el primero en crear un reporte tocando el botón +
                </Text>
              </View>
            ) : (
              <>
                {/* Contenedor con altura limitada cuando se muestran todos */}
                {showAllReports ? (
                  <View style={{ maxHeight: 500 }}>
                    <ScrollView 
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                    >
                      {visibleReports.map((report) => {
                        const colors = getStatusColor(report.estado);
                        const markerColor = getMarkerColor(report.estado);
                        
                        return (
                          <TouchableOpacity
                            key={report.id}
                            style={tw`p-3 border-b border-gray-100 active:bg-gray-50`}
                            onPress={() => handleMarkerPress(report)}
                            activeOpacity={0.7}
                          >
                            <View style={tw`flex-row`}>
                              {/* Indicador de color más pequeño */}
                              <View style={tw`mr-3 justify-center`}>
                                <View style={[
                                  tw`w-8 h-8 rounded-full items-center justify-center`,
                                  { backgroundColor: markerColor }
                                ]}>
                                  <Icon 
                                    name={getMarkerIcon(report.tipoIncidente).name} 
                                    size={10} 
                                    color="white" 
                                  />
                                </View>
                              </View>
                              
                              {/* Contenido */}
                              <View style={tw`flex-1`}>
                                <View style={tw`flex-row justify-between items-start mb-1`}>
                                  <View style={tw`flex-1`}>
                                    <Text style={tw`font-bold text-gray-900 text-sm`}>
                                      {report.tipoIncidente}
                                    </Text>
                                    <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                                      📍 {report.colonia || 'Sin colonia especificada'}
                                    </Text>
                                  </View>
                                  <View style={tw`items-end ml-2`}>
                                    <View style={tw`${colors.bg} ${colors.border} px-2 py-1 rounded-full border`}>
                                      <Text style={tw`text-xs font-medium ${colors.text}`}>
                                        {getStatusText(report.estado)}
                                      </Text>
                                    </View>
                                    <Text style={tw`text-xs text-gray-400 mt-0.5`}>
                                      {getTimeAgo(report.fechaCreacion)}
                                    </Text>
                                  </View>
                                </View>
                                
                                <Text style={tw`text-gray-600 text-xs mb-2`} numberOfLines={2}>
                                  {report.descripcionDetallada}
                                </Text>
                                
                                {/* Información del usuario - MÁS COMPACTA */}
                                <View style={tw`flex-row items-center justify-between`}>
                                  <View style={tw`flex-row items-center`}>
                                    {report.usuario?.fotoPerfil ? (
                                      <Image
                                        source={{ uri: report.usuario.fotoPerfil }}
                                        style={tw`w-4 h-4 rounded-full mr-1`}
                                      />
                                    ) : (
                                      <View style={tw`w-4 h-4 bg-teal-100 rounded-full items-center justify-center mr-1`}>
                                        <Icon name="account" size={10} color="#14b8a6" />
                                      </View>
                                    )}
                                    <Text style={tw`text-gray-500 text-xs`}>
                                      {report.usuario?.nombre || "Usuario"}
                                    </Text>
                                  </View>
                                  <View style={tw`flex-row items-center`}>
                                    <Icon name="star" size={10} color="#F59E0B" />
                                    <Text style={tw`text-xs text-gray-500 ml-0.5`}>
                                      {report.usuario?.puntos || 0} pts
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : (
                  // Sin scroll cuando no se muestran todos
                  <View>
                    {visibleReports.map((report) => {
                      const colors = getStatusColor(report.estado);
                      const markerColor = getMarkerColor(report.estado);
                      
                      return (
                        <TouchableOpacity
                          key={report.id}
                          style={tw`p-3 border-b border-gray-100 active:bg-gray-50`}
                          onPress={() => handleMarkerPress(report)}
                          activeOpacity={0.7}
                        >
                          <View style={tw`flex-row`}>
                            {/* Indicador de color más pequeño */}
                            <View style={tw`mr-3 justify-center`}>
                              <View style={[
                                tw`w-8 h-8 rounded-full items-center justify-center`,
                                { backgroundColor: markerColor }
                              ]}>
                                <Icon 
                                  name={getMarkerIcon(report.tipoIncidente).name} 
                                  size={10} 
                                  color="white" 
                                />
                              </View>
                            </View>
                            
                            {/* Contenido */}
                            <View style={tw`flex-1`}>
                              <View style={tw`flex-row justify-between items-start mb-1`}>
                                <View style={tw`flex-1`}>
                                  <Text style={tw`font-bold text-gray-900 text-sm`}>
                                    {report.tipoIncidente}
                                  </Text>
                                  <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                                    📍 {report.colonia || 'Sin colonia especificada'}
                                  </Text>
                                </View>
                                <View style={tw`items-end ml-2`}>
                                  <View style={tw`${colors.bg} ${colors.border} px-2 py-1 rounded-full border`}>
                                    <Text style={tw`text-xs font-medium ${colors.text}`}>
                                      {getStatusText(report.estado)}
                                    </Text>
                                  </View>
                                  <Text style={tw`text-xs text-gray-400 mt-0.5`}>
                                    {getTimeAgo(report.fechaCreacion)}
                                  </Text>
                                </View>
                              </View>
                              
                              <Text style={tw`text-gray-600 text-xs mb-2`} numberOfLines={2}>
                                {report.descripcionDetallada}
                              </Text>
                              
                              {/* Información del usuario - MÁS COMPACTA */}
                              <View style={tw`flex-row items-center justify-between`}>
                                <View style={tw`flex-row items-center`}>
                                  {report.usuario?.fotoPerfil ? (
                                    <Image
                                      source={{ uri: report.usuario.fotoPerfil }}
                                      style={tw`w-4 h-4 rounded-full mr-1`}
                                    />
                                  ) : (
                                    <View style={tw`w-4 h-4 bg-teal-100 rounded-full items-center justify-center mr-1`}>
                                      <Icon name="account" size={10} color="#14b8a6" />
                                    </View>
                                  )}
                                  <Text style={tw`text-gray-500 text-xs`}>
                                    {report.usuario?.nombre || "Usuario"}
                                  </Text>
                                </View>
                                <View style={tw`flex-row items-center`}>
                                  <Icon name="star" size={10} color="#F59E0B" />
                                  <Text style={tw`text-xs text-gray-500 ml-0.5`}>
                                    {report.usuario?.puntos || 0} pts
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                
                {/* Botón para mostrar más/menos - Solo si hay más de 3 reportes */}
                {hasMoreReports && !showAllReports && (
                  <TouchableOpacity
                    onPress={() => setShowAllReports(true)}
                    style={tw`py-3 items-center`}
                    activeOpacity={0.7}
                  >
                    <View style={tw`flex-row items-center`}>
                      <Icon name="chevron-down" size={16} color="#14b8a6" />
                      <Text style={tw`text-teal-700 font-medium ml-1 text-sm`}>
                        Ver todos los reportes ({reports.length})
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default MapScreen;