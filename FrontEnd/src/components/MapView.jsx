import React, { useState, useEffect, useRef } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { 
  Filter, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Wrench, 
  X, 
  ZoomIn,
  ZoomOut,
  Navigation,
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { getAllReports } from '@/services/reportService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50% 50% 50% 0;
        position: relative;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20]
  });
};

// Componente de controles del mapa
const MapControls = ({ mapRef }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([18.186356, -91.041947], 13);
    }
  };

  const toggleFullscreen = () => {
    const mapContainer = document.querySelector('.leaflet-container');
    if (!document.fullscreenElement) {
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Escuchar cambios en fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleZoomIn}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Acercar"
      >
        <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleZoomOut}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Alejar"
      >
        <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleRecenter}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Centrar mapa"
      >
        <Navigation className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleFullscreen}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </motion.button>
    </div>
  );
};

const MapView = ({ currentUser, lastUpdate }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const mapRef = useRef(null);

  const candelariaCenter = [18.186356, -91.041947];
  const candelariaBounds = [
    [18.136, -91.091],
    [18.236, -90.991]
  ];

  useEffect(() => {
    loadReports();
  }, [lastUpdate]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsData = await getAllReports();
      setReports(reportsData);
      setFilteredReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = reports;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.estado === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.tipoIncidente === typeFilter);
    }
    
    setFilteredReports(filtered);
  }, [statusFilter, typeFilter, reports]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'EnValidacion': return '#f59e0b';
      case 'Validado': return '#06b6d4';
      case 'Resuelto': return '#10b981';
      case 'Rechazado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EnValidacion': return <Clock className="w-4 h-4" />;
      case 'Validado': return <CheckCircle className="w-4 h-4" />;
      case 'Resuelto': return <Wrench className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'EnValidacion': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Validado': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Resuelto': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Rechazado': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const reportTypes = [...new Set(reports.map(r => r.tipoIncidente))];

  const FilterButton = ({ active, onClick, children, icon }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-primary text-white' 
          : 'bg-card text-foreground border border-border hover:bg-muted'
      }`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Map Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Mapa Interactivo</h2>
            <p className="text-sm text-muted-foreground">
              {filteredReports.length} reportes filtrados • Candelaria, Campeche
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-6 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtro por Estado
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton 
                      active={statusFilter === 'all'} 
                      onClick={() => setStatusFilter('all')}
                    >
                      Todos
                    </FilterButton>
                    <FilterButton 
                      active={statusFilter === 'EnValidacion'} 
                      onClick={() => setStatusFilter('EnValidacion')}
                      icon={<Clock className="w-4 h-4" />}
                    >
                      En Validación
                    </FilterButton>
                    <FilterButton 
                      active={statusFilter === 'Validado'} 
                      onClick={() => setStatusFilter('Validado')}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Validado
                    </FilterButton>
                    <FilterButton 
                      active={statusFilter === 'Resuelto'} 
                      onClick={() => setStatusFilter('Resuelto')}
                      icon={<Wrench className="w-4 h-4" />}
                    >
                      Resuelto
                    </FilterButton>
                    <FilterButton 
                      active={statusFilter === 'Rechazado'} 
                      onClick={() => setStatusFilter('Rechazado')}
                    >
                      Rechazado
                    </FilterButton>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Filtro por Tipo
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton 
                      active={typeFilter === 'all'} 
                      onClick={() => setTypeFilter('all')}
                    >
                      Todos
                    </FilterButton>
                    {reportTypes.map(type => (
                      <FilterButton 
                        key={type}
                        active={typeFilter === type} 
                        onClick={() => setTypeFilter(type)}
                      >
                        {type}
                      </FilterButton>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filters */}
              {(statusFilter !== 'all' || typeFilter !== 'all') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Filtros activos:</span>
                      {statusFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                          {statusFilter}
                          <button onClick={() => setStatusFilter('all')}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {typeFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-md">
                          {typeFilter}
                          <button onClick={() => setTypeFilter('all')}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setTypeFilter('all');
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Limpiar todos
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg relative">
        <div className="h-[600px] relative z-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <>
              {/* Map Controls Component */}
              <MapControls mapRef={mapRef} />

              {/* Legend */}
              <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
                <h4 className="text-sm font-medium text-foreground mb-2">Leyenda</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-muted-foreground">En Validación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                    <span className="text-xs text-muted-foreground">Validado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-muted-foreground">Resuelto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-muted-foreground">Rechazado</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <MapContainer
            center={candelariaCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            maxBounds={candelariaBounds}
            maxBoundsViscosity={1.0}
            minZoom={12}
            maxZoom={18}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map(report => (
              <Marker
                key={report.id}
                position={[report.latitud, report.longitud]}
                icon={createCustomIcon(getStatusColor(report.estado))}
              >
                <Popup>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-w-[250px] p-0"
                  >
                    {report.urlFoto && (
                      <div className="w-full h-40 overflow-hidden rounded-t-lg">
                        <img 
                          src={report.urlFoto} 
                          alt="Reporte" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(report.estado)}`}>
                          {getStatusIcon(report.estado)}
                          <span className="ml-1">{report.estado}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-1">
                        {report.tipoIncidente}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {report.descripcionDetallada}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {report.usuario?.nombre || "Usuario"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.usuario?.puntos || 0} puntos
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card border border-border rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-foreground">{reports.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card border border-yellow-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-yellow-500">
            {reports.filter(r => r.estado === 'EnValidacion').length}
          </p>
          <p className="text-sm text-muted-foreground">En Validación</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card border border-sky-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-sky-500">
            {reports.filter(r => r.estado === 'Validado').length}
          </p>
          <p className="text-sm text-muted-foreground">Validados</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card border border-emerald-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-emerald-500">
            {reports.filter(r => r.estado === 'Resuelto').length}
          </p>
          <p className="text-sm text-muted-foreground">Resueltos</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card border border-red-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-red-500">
            {reports.filter(r => r.estado === 'Rechazado').length}
          </p>
          <p className="text-sm text-muted-foreground">Rechazados</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MapView;