import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Filter, MapPin, CheckCircle, Clock, Wrench } from 'lucide-react';
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

  // Coordenadas de Candelaria, Campeche: 18.186356, -91.041947
  const candelariaCenter = [18.186356, -91.041947]; 
  
  // LÍMITES ESTRICTOS: Restricción del movimiento a un área pequeña alrededor del centro.
  // Esto hace que el mapa rebote inmediatamente si se intenta arrastrar fuera de esta zona.
  const candelariaBounds = [
      [18.136, -91.091], // Suroeste (Latitud y Longitud mínima)
      [18.236, -90.991]  // Noreste (Latitud y Longitud máxima)
  ];

  useEffect(() => {
    const storedReports = JSON.parse(localStorage.getItem('reports') || '[]');
    setReports(storedReports);
    setFilteredReports(storedReports);
  }, [lastUpdate]);

  useEffect(() => {
    let filtered = reports;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    
    setFilteredReports(filtered);
  }, [statusFilter, typeFilter, reports]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-sky-500" />;
      case 'repaired':
        return <Wrench className="w-4 h-4 text-emerald-500" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'reviewed':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'repaired':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const reportTypes = ['Bache', 'Alumbrado', 'Basura', 'Vandalismo', 'Otro'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-white">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Estado</label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>Todos</Button>
              <Button size="sm" variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setStatusFilter('pending')}>Pendiente</Button>
              <Button size="sm" variant={statusFilter === 'reviewed' ? 'default' : 'outline'} onClick={() => setStatusFilter('reviewed')}>Revisado</Button>
              <Button size="sm" variant={statusFilter === 'repaired' ? 'default' : 'outline'} onClick={() => setStatusFilter('repaired')}>Reparado</Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Tipo</label>
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
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700">
        <div className="h-[600px] relative z-0">
          <MapContainer
            center={candelariaCenter}
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            maxBounds={candelariaBounds}
            // maxBoundsViscosity en 1.0 hace que el mapa rebote fuertemente en los límites
            maxBoundsViscosity={1.0} 
            dragging={true} 
            scrollWheelZoom={true}
            doubleClickZoom={true} 
            minZoom={12} // Permite alejarse un poco, pero no demasiado
            maxZoom={18} // Permite acercarse para ver calles
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map(report => (
              <Marker
                key={report.id}
                position={[report.location.lat, report.location.lng]}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    {report.photo && (<img src={report.photo} alt="Reporte" className="w-full h-32 object-cover rounded-lg mb-2" />)}
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border mb-2 ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span className="capitalize">{report.status}</span>
                    </div>
                    {report.title && <p className="font-bold text-base mb-1">{report.title}</p>}
                    <p className="font-semibold text-sm mb-1">{report.type}</p>
                    <p className="text-xs text-slate-600 mb-2">{report.description}</p>
                    <p className="text-xs text-slate-500">Por: {report.username}</p>
                    <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Reportes</p>
          <p className="text-2xl font-bold text-white">{reports.length}</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-400">{reports.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-sky-500/10 backdrop-blur-sm rounded-xl p-4 border border-sky-500/30">
          <p className="text-sky-300 text-sm">Revisados</p>
          <p className="text-2xl font-bold text-sky-400">{reports.filter(r => r.status === 'reviewed').length}</p>
        </div>
        <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
          <p className="text-emerald-300 text-sm">Reparados</p>
          <p className="text-2xl font-bold text-emerald-400">{reports.filter(r => r.status === 'repaired').length}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MapView;