import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Camera, MapPin, Send } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const LocationSelector = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return selectedLocation ? <Marker position={selectedLocation} /> : null;
};

const ReportForm = ({ currentUser, onReportSubmit, onPointsEarned }) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Bache');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const reportTypes = ['Bache', 'Alumbrado', 'Basura', 'Vandalismo', 'Otro'];
  
  // Candelaria, Campeche, Mexico region settings
  const candelariaCenter = [18.1833, -90.75];
  const candelariaBounds = [
      [17.5, -91.5], // Southwest
      [18.7, -90.0]  // Northeast
  ];


  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description || !location) {
      toast({
        title: "Error",
        description: "Por favor completa la descripción y selecciona una ubicación en el mapa",
        variant: "destructive"
      });
      return;
    }

    const newReport = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      type,
      description,
      photo,
      location: {
        lat: location.lat,
        lng: location.lng
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push(newReport);
    localStorage.setItem('reports', JSON.stringify(reports));

    // Update user stats
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].reportsCount = (users[userIndex].reportsCount || 0) + 1;
      localStorage.setItem('users', JSON.stringify(users));
    }

    const pointsEarned = 10;
    onPointsEarned(pointsEarned);

    toast({
      title: "¡Reporte enviado!",
      description: `Has ganado ${pointsEarned} puntos por tu reporte`,
    });

    // Reset form
    setDescription('');
    setType('Bache');
    setPhoto(null);
    setLocation(null);
    
    onReportSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-sky-500 rounded-xl flex items-center justify-center">
            <Send className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Crear Reporte</h2>
            <p className="text-slate-400 text-sm">Ayuda a mejorar tu ciudad</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-white mb-2 block">Tipo de Reporte</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {reportTypes.map(t => (
                <Button key={t} type="button" variant={type === t ? 'default' : 'outline'} onClick={() => setType(t)} className="w-full">{t}</Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white mb-2 block">Descripción</Label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all min-h-[120px]" placeholder="Describe el problema en detalle..." />
          </div>

          <div>
            <Label className="text-white mb-2 block">Foto (Opcional)</Label>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {photo ? 'Cambiar Foto' : 'Subir Foto'}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            {photo && (<div className="mt-4"><img src={photo} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-lg" /></div>)}
          </div>

          <div>
            <Label className="text-white mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4" />Ubicación (Haz clic en el mapa)</Label>
            <div className="h-[400px] rounded-lg overflow-hidden border border-slate-600">
              <MapContainer center={candelariaCenter} zoom={10} style={{ height: '100%', width: '100%' }} maxBounds={candelariaBounds} minZoom={9}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector onLocationSelect={setLocation} selectedLocation={location} />
              </MapContainer>
            </div>
            {location && (<p className="text-sm text-green-400 mt-2">✓ Ubicación seleccionada: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>)}
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Send className="w-4 h-4 mr-2" />
            Enviar Reporte (+10 puntos)
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default ReportForm;