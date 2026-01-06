// src/components/MapSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Text,
  Platform 
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';

const MapSelector = ({ 
  darkMode, 
  initialLocation, 
  onLocationSelect, 
  onCenterCurrentLocation 
}) => {
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: initialLocation?.latitude || 18.186,
    longitude: initialLocation?.longitude || -91.041,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setMapRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [initialLocation]);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    setMapRegion(prev => ({
      ...prev,
      latitude,
      longitude,
    }));

    if (onLocationSelect) {
      onLocationSelect(latitude, longitude);
    }
  };

  const handleCenterCurrentLocation = async () => {
    if (onCenterCurrentLocation) {
      await onCenterCurrentLocation();
      return;
    }

    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ubicación');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced 
      });
      
      const { latitude, longitude } = location.coords;
      
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setMapRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      
      if (onLocationSelect) {
        onLocationSelect(latitude, longitude);
      }
      
    } catch (error) {
      console.error('Error centrando ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={tw`flex-1`}
        initialRegion={mapRegion}
        region={mapRegion}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
        minZoomLevel={12}
        maxZoomLevel={18}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor="#10B981"
        loadingBackgroundColor={darkMode ? '#1F2937' : '#F9FAFB'}
        onMapReady={() => {
          setMapReady(true);
        }}
        onPress={handleMapPress}
        {...(Platform.OS === 'android' ? { mapType: 'none' } : {})}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          minimumZ={10}
          flipY={false}
          tileSize={256}
          zIndex={-1}
        />
        
        <Marker
          coordinate={{
            latitude: mapRegion.latitude,
            longitude: mapRegion.longitude,
          }}
          pinColor="#EF4444"
        />
      </MapView>

      {!mapReady && (
        <View style={[tw`absolute inset-0 items-center justify-center`, darkMode ? tw`bg-gray-900/90` : tw`bg-white/90`]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={tw`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando mapa...</Text>
        </View>
      )}

      <TouchableOpacity 
        onPress={handleCenterCurrentLocation}
        style={tw`absolute bottom-3 right-3 p-2.5 rounded-full bg-white shadow-lg border border-gray-200`}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#10B981" />
        ) : (
          <Icon name="crosshairs-gps" size={22} color="#10B981" />
        )}
      </TouchableOpacity>

      <View style={tw`absolute bottom-3 left-3 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} px-2 py-1 rounded-lg`}>
        <Text style={tw`text-[9px] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          © OpenStreetMap
        </Text>
      </View>
    </View>
  );
};

export default MapSelector;