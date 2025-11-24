
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, MapPin, Send, FileText } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Location Selector Component for Map
const LocationSelector = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return selectedLocation ? <Marker position={selectedLocation} /> : null;
};

const ReportModal = ({ currentUser, onReportSubmit, onPointsEarned, trigger }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Bache');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const reportTypes = ['Bache', 'Alumbrado', 'Basura', 'Vandalismo', 'Otro'];
  
  // Candelaria, Campeche, Mexico region settings
  const candelariaCenter = [18.1833, -90.75];

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

    if (!title || !description || !location) {
      toast({
        title: "Error de validación",
        description: "Por favor completa el título, descripción y selecciona una ubicación.",
        variant: "destructive"
      });
      return;
    }

    const newReport = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      title,
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
    if (onPointsEarned) {
        onPointsEarned(pointsEarned);
    }

    toast({
      title: "¡Reporte enviado!",
      description: `Has ganado ${pointsEarned} puntos por tu reporte`,
    });

    // Reset form and close modal
    setTitle('');
    setDescription('');
    setType('Bache');
    setPhoto(null);
    setLocation(null);
    setOpen(false);
    
    if (onReportSubmit) {
        onReportSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Nuevo Reporte
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
             <FileText className="w-6 h-6 text-teal-400" />
             Nuevo Reporte
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para reportar un problema en tu ciudad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <Label htmlFor="title" className="text-white mb-2 block">Título del Reporte</Label>
                <input 
                    id="title"
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ej: Bache en calle principal"
                />
            </div>
            <div>
                <Label className="text-white mb-2 block">Categoría</Label>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white mb-2 block">Descripción</Label>
            <textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[80px]" 
                placeholder="Describe el problema en detalle..." 
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Foto (Opcional)</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700">
                <Camera className="w-4 h-4" />
                {photo ? 'Cambiar' : 'Subir'}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              {photo && (
                  <div className="relative h-12 w-12 rounded overflow-hidden border border-slate-600">
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4" />Ubicación (Toca el mapa)</Label>
            <div className="h-[200px] rounded-lg overflow-hidden border border-slate-600 relative">
              <MapContainer center={candelariaCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector onLocationSelect={setLocation} selectedLocation={location} />
              </MapContainer>
              {!location && <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20 text-white text-xs font-semibold drop-shadow-md">Selecciona una ubicación</div>}
            </div>
            {location && (<p className="text-xs text-green-400 mt-1">✓ Ubicación: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>)}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white border-0">
                <Send className="w-4 h-4 mr-2" />
                Enviar Reporte (+10 ptos)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
