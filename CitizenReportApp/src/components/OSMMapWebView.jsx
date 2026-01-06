// src/components/OSMMapWebView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Platform 
} from 'react-native';
import { WebView } from 'react-native-webview';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const OSM_MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .leaflet-control-container { display: none; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        let map;
        let marker;
        
        // Configuración de Candelaria, Campeche
        const candelariaCenter = [18.186356, -91.041947];
        const candelariaBounds = [[18.136, -91.091], [18.236, -90.991]];
        
        function initMap(initialLat, initialLng) {
            map = L.map('map', {
                center: [initialLat, initialLng],
                zoom: 15,
                minZoom: 12,
                maxZoom: 18,
                maxBounds: candelariaBounds,
                maxBoundsViscosity: 1.0,
                zoomControl: false,
                attributionControl: false
            });
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
            }).addTo(map);
            
            // Marcador inicial
            marker = L.marker([initialLat, initialLng], {
                draggable: true,
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20]
                })
            }).addTo(map);
            
            // Evento al mover el marcador
            marker.on('dragend', function(e) {
                const lat = e.target.getLatLng().lat;
                const lng = e.target.getLatLng().lng;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'LOCATION_SELECTED',
                    latitude: lat,
                    longitude: lng
                }));
            });
            
            // Evento al hacer clic en el mapa
            map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                // Verificar límites de Candelaria
                if (lat < 18.136 || lat > 18.236 || lng < -91.091 || lng > -90.991) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'OUT_OF_BOUNDS',
                        message: 'Ubicación fuera de Candelaria'
                    }));
                    return;
                }
                
                marker.setLatLng([lat, lng]);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'LOCATION_SELECTED',
                    latitude: lat,
                    longitude: lng
                }));
            });
        }
        
        function moveMarker(lat, lng) {
            if (marker) {
                marker.setLatLng([lat, lng]);
                map.setView([lat, lng], 15);
            }
        }
        
        function centerMap(lat, lng) {
            if (map) {
                map.setView([lat, lng], 15);
                marker.setLatLng([lat, lng]);
            }
        }
        
        // Inicializar cuando se cargue
        document.addEventListener('DOMContentLoaded', function() {
            // Valores iniciales por defecto
            const urlParams = new URLSearchParams(window.location.search);
            const lat = parseFloat(urlParams.get('lat')) || 18.186356;
            const lng = parseFloat(urlParams.get('lng')) || -91.041947;
            initMap(lat, lng);
        });
    </script>
</body>
</html>
`;

const OSMMapWebView = ({ 
  darkMode, 
  initialLocation, 
  onLocationSelect, 
  onCenterCurrentLocation 
}) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);

  const getHtmlWithLocation = () => {
    const lat = initialLocation?.latitude || 18.186356;
    const lng = initialLocation?.longitude || -91.041947;
    return `data:text/html;charset=utf-8,${encodeURIComponent(OSM_MAP_HTML.replace(
      'initMap(lat, lng)',
      `initMap(${lat}, ${lng})`
    ))}`;
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'LOCATION_SELECTED':
          if (onLocationSelect) {
            onLocationSelect(data.latitude, data.longitude);
          }
          break;
        case 'OUT_OF_BOUNDS':
          Alert.alert('Ubicación fuera de límites', data.message);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const moveMarker = (lat, lng) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        moveMarker(${lat}, ${lng});
        true;
      `);
    }
  };

  const centerToCurrentLocation = async () => {
    if (onCenterCurrentLocation) {
      await onCenterCurrentLocation();
    } else {
      try {
        setLocationLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ubicación');
          return;
        }

        let location = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced 
        });
        
        const { latitude, longitude } = location.coords;
        
        // Verificar límites de Candelaria
        if (latitude < 18.136 || latitude > 18.236 || longitude < -91.091 || longitude > -90.991) {
          Alert.alert(
            'Ubicación fuera de Candelaria',
            'Tu ubicación actual está fuera del municipio de Candelaria. Por favor, acércate al área o selecciona manualmente en el mapa.'
          );
          setLocationLoading(false);
          return;
        }
        
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            centerMap(${latitude}, ${longitude});
            true;
          `);
        }
        
        if (onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
        
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
      } finally {
        setLocationLoading(false);
      }
    }
  };

  useEffect(() => {
    if (initialLocation && webViewRef.current) {
      setTimeout(() => {
        moveMarker(initialLocation.latitude, initialLocation.longitude);
      }, 500);
    }
  }, [initialLocation]);

  return (
    <View style={tw`flex-1`}>
      <WebView
        ref={webViewRef}
        source={{ html: getHtmlWithLocation() }}
        style={tw`flex-1`}
        onLoad={() => setLoading(false)}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[tw`absolute inset-0 items-center justify-center`, darkMode ? tw`bg-gray-900` : tw`bg-white`]}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={tw`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando mapa...</Text>
          </View>
        )}
        scalesPageToFit={Platform.OS === 'android' ? false : true}
      />

      {loading && (
        <View style={[tw`absolute inset-0 items-center justify-center`, darkMode ? tw`bg-gray-900/90` : tw`bg-white/90`]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={tw`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando mapa OpenStreetMap...</Text>
        </View>
      )}

      <TouchableOpacity 
        onPress={centerToCurrentLocation}
        style={tw`absolute bottom-3 right-3 p-2.5 rounded-full bg-white shadow-lg border border-gray-200`}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color="#10B981" />
        ) : (
          <Icon name="crosshairs-gps" size={22} color="#10B981" />
        )}
      </TouchableOpacity>

      <View style={tw`absolute top-3 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-full ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}`}>
        <Text style={tw`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          👆 Toca el mapa para seleccionar ubicación
        </Text>
      </View>
    </View>
  );
};

export default OSMMapWebView;