import React, { useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Filter, MapPin, CheckCircle, Clock, Wrench } from 'lucide-react';
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

const MapView = ({ currentUser, lastUpdate }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Coordenadas de Candelaria, Campeche: 18.186356, -91.041947
  const candelariaCenter = [18.186356, -91.041947]; 
  
  // LÍMITES ESTRICTOS: Restricción del movimiento a un área pequeña alrededor del centro.
  const candelariaBounds = [
      [18.136, -91.091], // Suroeste (Latitud y Longitud mínima)
      [18.236, -90.991]  // Noreste (Latitud y Longitud máxima)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EnValidacion':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Validado':
        return <CheckCircle className="w-4 h-4 text-sky-500" />;
      case 'Resuelto':
        return <Wrench className="w-4 h-4 text-emerald-500" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EnValidacion':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Validado':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Resuelto':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Rechazado':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Obtener tipos únicos de reportes
  const reportTypes = [...new Set(reports.map(r => r.tipoIncidente))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Filters */}
      <div className="bg-background backdrop-blur-sm rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Estado</label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>Todos</Button>
              <Button size="sm" variant={statusFilter === 'EnValidacion' ? 'default' : 'outline'} onClick={() => setStatusFilter('EnValidacion')}>En Validación</Button>
              <Button size="sm" variant={statusFilter === 'Validado' ? 'default' : 'outline'} onClick={() => setStatusFilter('Validado')}>Validado</Button>
              <Button size="sm" variant={statusFilter === 'Resuelto' ? 'default' : 'outline'} onClick={() => setStatusFilter('Resuelto')}>Resuelto</Button>
              <Button size="sm" variant={statusFilter === 'Rechazado' ? 'default' : 'outline'} onClick={() => setStatusFilter('Rechazado')}>Rechazado</Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Tipo</label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={typeFilter === 'all' ? 'default' : 'outline'} onClick={() => setTypeFilter('all')}>Todos</Button>
              {reportTypes.map(type => (
                <Button key={type} size="sm" variant={typeFilter === type ? 'default' : 'outline'} onClick={() => setTypeFilter(type)}>{type}</Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-background backdrop-blur-sm rounded-xl overflow-hidden border border-border">
        <div className="h-[600px] relative z-0">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-muted-foreground">Cargando mapa...</span>
            </div>
          ) : (
            <MapContainer
              center={candelariaCenter}
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              maxBounds={candelariaBounds}
              maxBoundsViscosity={1.0} 
              dragging={true} 
              scrollWheelZoom={true}
              doubleClickZoom={true} 
              minZoom={12}
              maxZoom={18}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredReports.map(report => (
                <Marker
                  key={report.id}
                  position={[report.latitud, report.longitud]}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      {report.urlFoto && (<img src={report.urlFoto} alt="Reporte" className="w-full h-32 object-cover rounded-lg mb-2" />)}
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border mb-2 ${getStatusColor(report.estado)}`}>
                        {getStatusIcon(report.estado)}
                        <span>{report.estado}</span>
                      </div>
                      <p className="font-semibold text-sm mb-1 text-foreground">{report.tipoIncidente}</p>
                      <p className="text-xs text-muted-foreground mb-2">{report.descripcionDetallada}</p>
                      <p className="text-xs text-muted-foreground">Por: {report.usuario?.nombre || "Usuario"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(report.fechaCreacion).toLocaleDateString()}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-background backdrop-blur-sm rounded-xl p-4 border border-border">
          <p className="text-muted-foreground text-sm">Total Reportes</p>
          <p className="text-2xl font-bold text-foreground">{reports.length}</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm">En Validación</p>
          <p className="text-2xl font-bold text-yellow-400">{reports.filter(r => r.estado === 'EnValidacion').length}</p>
        </div>
        <div className="bg-sky-500/10 backdrop-blur-sm rounded-xl p-4 border border-sky-500/30">
          <p className="text-sky-300 text-sm">Validados</p>
          <p className="text-2xl font-bold text-sky-400">{reports.filter(r => r.estado === 'Validado').length}</p>
        </div>
        <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
          <p className="text-emerald-300 text-sm">Resueltos</p>
          <p className="text-2xl font-bold text-emerald-400">{reports.filter(r => r.estado === 'Resuelto').length}</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
          <p className="text-red-300 text-sm">Rechazados</p>
          <p className="text-2xl font-bold text-red-400">{reports.filter(r => r.estado === 'Rechazado').length}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MapView;