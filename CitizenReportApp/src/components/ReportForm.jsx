// src/components/ReportForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  SafeAreaView, Alert, Modal, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

// COMPONENTE DEL MAPA CON WEBVIEW
const OSMMapView = ({ darkMode, initialLocation, onLocationSelect }) => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);
  
  // HTML con Leaflet - EXACTAMENTE igual que tu versión web
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Mapa Candelaria</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; font-family: sans-serif; }
        #map { width: 100%; height: 100%; }
        .leaflet-control-attribution { display: none !important; }
        .custom-marker {
          background: #EF4444;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        let map;
        let marker;
        
        // CENTRO DE CANDELARIA
        const candelariaCenter = [18.186356, -91.041947];
        // LÍMITES DE CANDELARIA (IGUAL QUE TU WEB)
        const candelariaBounds = [[18.136, -91.091], [18.236, -90.991]];
        
        function initMap() {
          map = L.map('map', {
            center: candelariaCenter,
            zoom: 15,
            minZoom: 12,
            maxZoom: 18,
            maxBounds: candelariaBounds,
            maxBoundsViscosity: 1.0
          });
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
          }).addTo(map);
          
          // Crear marcador personalizado
          marker = L.marker(candelariaCenter, {
            draggable: true,
            icon: L.divIcon({
              className: 'custom-marker',
              html: '<div class="custom-marker"></div>',
              iconSize: [24, 24]
            })
          }).addTo(map);
          
          // Evento al mover el marcador
          marker.on('dragend', function(e) {
            const lat = e.target.getLatLng().lat;
            const lng = e.target.getLatLng().lng;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'location',
              lat: lat,
              lng: lng
            }));
          });
          
          // Evento al hacer clic en el mapa
          map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            marker.setLatLng([lat, lng]);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'location',
              lat: lat,
              lng: lng
            }));
          });
          
          // Notificar que el mapa está listo
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready'
          }));
        }
        
        // Función para mover el marcador desde React Native
        window.moveMarker = function(lat, lng) {
          if (marker && map) {
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], 15);
          }
        };
        
        // Inicializar cuando se cargue
        document.addEventListener('DOMContentLoaded', initMap);
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location' && onLocationSelect) {
        onLocationSelect(data.lat, data.lng);
      } else if (data.type === 'ready') {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  // Inyectar JavaScript para mover el marcador cuando cambia la ubicación
  useEffect(() => {
    if (webViewRef.current && initialLocation) {
      const { latitude, longitude } = initialLocation;
      webViewRef.current.injectJavaScript(`
        window.moveMarker(${latitude}, ${longitude});
        true;
      `);
    }
  }, [initialLocation]);

  return (
    <View style={tw`flex-1`}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={tw`flex-1`}
        onLoad={() => setLoading(false)}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[tw`absolute inset-0 items-center justify-center`, 
            darkMode ? tw`bg-gray-900` : tw`bg-white`
          ]}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={tw`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Cargando mapa...
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={[tw`absolute inset-0 items-center justify-center z-10`, 
          darkMode ? tw`bg-gray-900` : tw`bg-white`
        ]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={tw`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Cargando mapa...
          </Text>
        </View>
      )}
    </View>
  );
};

// COMPONENTE PRINCIPAL ReportForm
const ReportForm = ({ darkMode, isVisible, onClose, onSubmit, userData, initialType }) => {
  // Estado inicial
  const initialState = {
    tipoIncidente: 'Bache',
    descripcion: '',
    ubicacion: 'Selecciona una ubicación en el mapa...',
    latitud: 18.186356, 
    longitud: -91.041947,
    foto: null,
  };

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [mapKey, setMapKey] = useState(0); // Para forzar re-render

  const incidentTypes = [
    { id: 'Bache', label: 'Bache', icon: 'road', color: '#F97316' },
    { id: 'Alumbrado', label: 'Alumbrado', icon: 'lightbulb-outline', color: '#F59E0B' },
    { id: 'Basura', label: 'Basura', icon: 'trash-can-outline', color: '#10B981' },
    { id: 'Vandalismo', label: 'Vandalismo', icon: 'spray', color: '#8B5CF6' },
    { id: 'Fuga', label: 'Fuga', icon: 'water-outline', color: '#0EA5E9' },
    { id: 'Otro', label: 'Otro', icon: 'alert-octagon', color: '#EF4444' },
  ];

  // EFECTO DE LIMPIEZA AL ABRIR/CERRAR
  useEffect(() => {
    if (isVisible) {
      setStep(1);
      setFormData({
        ...initialState,
        tipoIncidente: initialType || 'Bache'
      });
      setMapKey(prev => prev + 1); // Forzar re-render del mapa
      obtenerUbicacionActual();
    }
  }, [isVisible, initialType]);

  const obtenerUbicacionActual = async () => {
    setLocationLoading(true);
    try {
      // Solicitar permisos
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu ubicación para ubicar el reporte',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      // Obtener ubicación
      let location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000
      });
      
      const { latitude, longitude } = location.coords;
      
      // Verificar límites de Candelaria
      if (latitude < 18.136 || latitude > 18.236 || longitude < -91.091 || longitude > -90.991) {
        Alert.alert(
          'Ubicación fuera de Candelaria',
          'Tu ubicación actual está fuera del municipio. Por favor, selecciona una ubicación dentro de Candelaria en el mapa.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }
      
      // Actualizar estado
      setFormData(prev => ({ 
        ...prev, 
        latitud: latitude, 
        longitud: longitude 
      }));
      
      actualizarDireccion(latitude, longitude);
      
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert(
        'Error',
        'No se pudo obtener tu ubicación. Verifica que el GPS esté activado o selecciona manualmente en el mapa.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const actualizarDireccion = async (lat, lng) => {
    try {
      let response = await Location.reverseGeocodeAsync({ 
        latitude: lat, 
        longitude: lng 
      });
      
      if (response && response[0]) {
        const { street, name, city, region } = response[0];
        const direccion = `${street || name || 'Calle'}, ${city || region || 'Candelaria, Campeche'}`;
        
        setFormData(prev => ({ 
          ...prev, 
          ubicacion: direccion.trim() 
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          ubicacion: `${lat.toFixed(5)}, ${lng.toFixed(5)}` 
        }));
      }
    } catch (error) {
      setFormData(prev => ({ 
        ...prev, 
        ubicacion: `${lat.toFixed(5)}, ${lng.toFixed(5)}` 
      }));
    }
  };

  const tomarFoto = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la cámara para tomar fotos',
          [{ text: 'OK' }]
        );
        return;
      }

      // Tomar foto
      let result = await ImagePicker.launchCameraAsync({ 
        allowsEditing: true, 
        quality: 0.8,
        aspect: [4, 3],
        base64: false,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setFormData(prev => ({ 
          ...prev, 
          foto: result.assets[0].uri 
        }));
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    }
  };

  const handleFinalSubmit = async () => {
    // Validaciones
    if (!formData.descripcion.trim()) {
      Alert.alert(
        'Descripción requerida',
        'Por favor, describe el problema encontrado',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!formData.foto) {
      Alert.alert(
        'Foto requerida',
        'Por favor, toma una foto del incidente',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      Alert.alert(
        '¡Éxito!',
        'Reporte enviado correctamente. Gracias por contribuir.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error enviando reporte:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar el reporte. Verifica tu conexión e intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = (latitude, longitude) => {
    setFormData(prev => ({
      ...prev,
      latitud: latitude,
      longitud: longitude
    }));
    actualizarDireccion(latitude, longitude);
  };

  const PasoPrincipal = () => (
    <View style={tw`p-4`}>
      {/* 1. CATEGORÍA */}
      <Text style={tw`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Tipo de problema:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
        {incidentTypes.map(t => (
          <TouchableOpacity 
            key={t.id} 
            onPress={() => setFormData({...formData, tipoIncidente: t.id})} 
            style={[tw`p-3 rounded-xl mr-2 items-center w-20`, { 
              backgroundColor: formData.tipoIncidente === t.id ? t.color : (darkMode ? '#374151' : '#F3F4F6') 
            }]}
          >
            <Icon 
              name={t.icon} 
              size={20} 
              color={formData.tipoIncidente === t.id ? 'white' : '#9CA3AF'} 
            />
            <Text style={tw`text-[10px] mt-1 text-center ${
              formData.tipoIncidente === t.id ? 'text-white font-bold' : 'text-gray-500'
            }`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 2. MAPA */}
      <Text style={tw`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Ubicación (toca el mapa para seleccionar):
      </Text>
      <View style={tw`h-48 rounded-2xl overflow-hidden mb-3 border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <OSMMapView
          key={mapKey}
          darkMode={darkMode}
          initialLocation={{ latitude: formData.latitud, longitude: formData.longitud }}
          onLocationSelect={handleMapLocationSelect}
        />
        
        {/* Botón para ubicación actual */}
        <TouchableOpacity 
          onPress={obtenerUbicacionActual} 
          style={tw`absolute bottom-2 right-2 p-2 rounded-full bg-white shadow-lg border border-gray-200`}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <Icon name="crosshairs-gps" size={22} color="#10B981" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Dirección actual */}
      <View style={tw`mb-4 p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="map-marker" size={16} color="#EF4444" style={tw`mr-2`} />
          <Text style={tw`text-xs flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formData.ubicacion}
          </Text>
        </View>
      </View>

      {/* 3. DESCRIPCIÓN Y FOTO */}
      <View style={tw`mb-2`}>
        <Text style={tw`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Descripción del problema:
        </Text>
        <TextInput
          style={[tw`p-3 rounded-xl border min-h-[100px]`, 
            darkMode ? tw`bg-gray-800 border-gray-700 text-white` : tw`bg-gray-50 border-gray-200 text-gray-800`
          ]}
          placeholder="Describe el problema con detalle..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={formData.descripcion}
          onChangeText={(text) => setFormData({...formData, descripcion: text})}
          maxLength={500}
        />
        <Text style={tw`text-right text-xs text-gray-500 mt-1`}>
          {formData.descripcion.length}/500 caracteres
        </Text>
      </View>

      <View>
        <Text style={tw`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Foto del problema (requerido):
        </Text>
        <TouchableOpacity 
          onPress={tomarFoto} 
          style={[tw`w-full h-32 rounded-xl border-2 items-center justify-center`, 
            darkMode ? tw`border-gray-700 bg-gray-800` : tw`border-gray-300 bg-gray-50`,
            formData.foto ? tw`border-solid` : tw`border-dashed`
          ]}
        >
          {formData.foto ? (
            <View style={tw`w-full h-full relative`}>
              <Image 
                source={{ uri: formData.foto }} 
                style={tw`w-full h-full rounded-xl`} 
                resizeMode="cover"
              />
              <View style={tw`absolute bottom-2 right-2 p-1 rounded-full bg-black/50`}>
                <Icon name="camera-plus" size={16} color="white" />
              </View>
            </View>
          ) : (
            <View style={tw`items-center`}>
              <Icon name="camera-plus" size={40} color="#9CA3AF" />
              <Text style={tw`text-gray-500 mt-2 text-center`}>Toca para tomar foto</Text>
              <Text style={tw`text-xs text-gray-400 mt-1`}>La foto es obligatoria</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const PasoConfirmacion = () => (
    <View style={tw`items-center py-10 px-6`}>
      <Icon name="check-circle" size={80} color="#10B981" />
      <Text style={tw`text-xl font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        ¿Enviar reporte?
      </Text>
      <Text style={tw`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 text-center`}>
        Revisa la información antes de enviar
      </Text>
      
      <View style={[tw`w-full mt-6 p-4 rounded-xl`, 
        darkMode ? tw`bg-gray-800 border border-gray-700` : tw`bg-gray-100 border border-gray-200`
      ]}>
        {/* Tipo de incidente */}
        <View style={tw`flex-row items-center mb-3`}>
          <View style={[tw`w-3 h-3 rounded-full mr-2`, 
            { backgroundColor: incidentTypes.find(t => t.id === formData.tipoIncidente)?.color }
          ]} />
          <Text style={tw`font-bold text-teal-500`}>
            {formData.tipoIncidente}
          </Text>
        </View>
        
        {/* Descripción */}
        <Text style={tw`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-1 mb-3`}>
          {formData.descripcion || '(Sin descripción)'}
        </Text>
        
        {/* Ubicación */}
        <View style={tw`flex-row items-start mb-3`}>
          <Icon name="map-marker" size={14} color="#EF4444" style={tw`mr-2 mt-0.5`} />
          <Text style={tw`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-1`}>
            {formData.ubicacion}
          </Text>
        </View>
        
        {/* Foto */}
        {formData.foto && (
          <View style={tw`mt-3`}>
            <Text style={tw`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
              Foto adjunta:
            </Text>
            <Image 
              source={{ uri: formData.foto }} 
              style={tw`w-20 h-20 rounded-lg`} 
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal 
      visible={isVisible} 
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
      transparent={false}
    >
      <SafeAreaView style={tw`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* HEADER */}
        <View style={tw`flex-row items-center justify-between p-4 border-b ${
          darkMode ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <TouchableOpacity 
            onPress={onClose}
            style={tw`p-1`}
          >
            <Icon name="close" size={26} color={darkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {step === 1 ? 'NUEVO REPORTE' : 'CONFIRMAR'}
          </Text>
          <View style={tw`w-10`} />
        </View>

        {/* CONTENIDO */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex-1`}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView 
            style={tw`flex-1`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-4`}
          >
            {step === 1 ? <PasoPrincipal /> : <PasoConfirmacion />}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* BOTÓN DE ACCIÓN */}
        <View style={tw`p-4 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-100'}`}>
          <TouchableOpacity
            onPress={() => {
              if (step === 1) {
                // Validar antes de avanzar
                if (!formData.descripcion.trim()) {
                  Alert.alert(
                    "Falta descripción",
                    "Por favor, describe el problema encontrado.",
                    [{ text: 'OK' }]
                  );
                  return;
                }
                if (!formData.foto) {
                  Alert.alert(
                    "Falta foto",
                    "Por favor, toma una foto del problema.",
                    [{ text: 'OK' }]
                  );
                  return;
                }
                setStep(2);
              } else {
                // Enviar reporte
                handleFinalSubmit();
              }
            }}
            disabled={loading}
            style={[
              tw`py-4 rounded-2xl items-center justify-center shadow-lg`,
              loading ? tw`bg-teal-400` : tw`bg-teal-500`,
              { 
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4 
              }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={tw`text-white font-bold text-lg`}>
                {step === 1 ? 'REVISAR REPORTE →' : 'ENVIAR REPORTE'}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Botón para regresar en paso 2 */}
          {step === 2 && (
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={tw`mt-3 py-3 rounded-2xl items-center border border-teal-500`}
            >
              <Text style={tw`text-teal-500 font-bold`}>← VOLVER A EDITAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ReportForm;