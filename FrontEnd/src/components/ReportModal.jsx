import React, { useState, useRef, useEffect } from 'react';
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
import { Camera, MapPin, Send, FileText, Loader2, MapPinned } from 'lucide-react'; 
import 'leaflet/dist/leaflet.css';

// Importamos el servicio
import { createReport } from '../services/reportService'; 

// 🎯 NUEVA IMPORTACIÓN DE LA FUNCIÓN DE GEOCERCA
import { findColoniaByLocation } from '../utils/geoUtils'; 


// Componente Selector de Ubicación
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
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Bache');
  // Nuevo estado para Colonia
  const [colonia, setColonia] = useState('');
  const [isDetectingColonia, setIsDetectingColonia] = useState(false);
  
  const [photo, setPhoto] = useState(null); 
  const [photoFile, setPhotoFile] = useState(null); 
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const reportTypes = ['Bache', 'Alumbrado', 'Basura', 'Vandalismo', 'Otro'];
  
  // Configuraciones de región (Candelaria)
  const candelariaCenter = [18.186356, -91.041947]; 
  const candelariaBounds = [
      [18.136, -91.091], 
      [18.236, -90.991]  
  ];

  // --- EFECTO: DETECTAR COLONIA AL CAMBIAR UBICACIÓN (Lógica con Geocerca) ---
  useEffect(() => {
    const detectColonia = () => {
        if (!location) return;

        setIsDetectingColonia(true);
        // Limpiamos el valor mientras detecta
        setColonia(''); 
        
        try {
            // Usamos la función de geocerca local: findColoniaByLocation(location)
            const detectedName = findColoniaByLocation(location);

            // Solo se establece la colonia si se detecta un nombre. Si es null, queda vacío ('').
            setColonia(detectedName || '');

        } catch (error) {
            console.error("Error detectando colonia con geocerca:", error);
            setColonia('');
        } finally {
            setIsDetectingColonia(false);
        }
    };

    detectColonia();
  }, [location]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); 
      };
      reader.readAsDataURL(file);
      setPhotoFile(file); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Validación: Se asegura que el campo de colonia NO esté vacío
    if (!description || !location || !colonia.trim()) {
      toast({
        title: "Datos incompletos/inválidos",
        description: "Asegúrate de tener ubicación, descripción y haber escrito la colonia.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
        const storedToken = currentUser?.tokenJWT; 
        const ciudadanoId = currentUser?.idUser; 
        
        if (!storedToken || !ciudadanoId) {
            throw new Error("Error de sesión. Por favor, vuelve a iniciar sesión.");
        }

        // --- PREPARACIÓN DE DATOS (FormData para el backend) ---
        const formData = new FormData();
        
        formData.append('CiudadanoId', ciudadanoId);
        formData.append('TipoIncidente', type);
        formData.append('Colonia', colonia); // <--- Dato de Colonia
        formData.append('DescripcionDetallada', description);
        formData.append('Latitud', location.lat);
        formData.append('Longitud', location.lng);
        
        if (photoFile) {
            formData.append('ArchivoFoto', photoFile, photoFile.name); 
        }
        
        // Llamada al servicio
        await createReport(formData, storedToken); 
        
        const pointsEarned = 10; 
        if (onPointsEarned) onPointsEarned(pointsEarned);

        toast({
          title: "¡Reporte enviado!",
          description: `Ubicación: ${colonia}. Has ganado ${pointsEarned} puntos.`,
        });

        // Reset
        setDescription('');
        setType('Bache');
        setColonia('');
        setPhoto(null);
        setPhotoFile(null); 
        setLocation(null);
        setOpen(false);
        
        if (onReportSubmit) onReportSubmit(); 

    } catch (error) {
        console.error("Error:", error);
        toast({
            title: "Error al enviar",
            description: error.message || "Ocurrió un error.",
            variant: "destructive"
        });
    } finally {
        setLoading(false); 
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-foreground">
             <FileText className="w-6 h-6 text-teal-400" />
             Nuevo Reporte
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completa el formulario. La colonia se intentará detectar automáticamente al elegir la ubicación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TIPO DE REPORTE */}
            <div>
                <Label className="text-foreground mb-2 block">Categoría</Label>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-muted border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* COLONIA DETECTADA */}
            <div>
                <Label className="text-foreground mb-2 block flex items-center gap-2">
                    <MapPinned className="w-4 h-4" /> 
                    Colonia / Barrio
                </Label>
                <div className="relative">
                    <input 
                        type="text"
                        value={colonia}
                        onChange={(e) => setColonia(e.target.value)}
                        placeholder={location && !isDetectingColonia && !colonia.trim()
                            ? "Colonia no detectada automáticamente. Escribe aquí." 
                            : (location ? "Detectando..." : "Selecciona ubicación primero")
                        }
                        className="w-full px-3 py-2 bg-muted border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                        disabled={isDetectingColonia} 
                    />
                    {isDetectingColonia && (
                        <div className="absolute right-3 top-2">
                            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Se detectará automáticamente si el punto cae dentro de los límites definidos. Si no, escríbela.
                </p>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <Label htmlFor="description" className="text-foreground mb-2 block">Descripción</Label>
            <textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full px-3 py-2 bg-muted border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[80px]" 
                placeholder="Describe el problema en detalle..." 
            />
          </div>

          {/* MAPA */}
          <div>
            <Label className="text-foreground mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4" />Ubicación (Toca el mapa)</Label>
            <div className="h-[200px] rounded-lg overflow-hidden border border-input relative">
              <MapContainer 
                center={candelariaCenter} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                maxBounds={candelariaBounds} 
                maxBoundsViscosity={1.0} 
                minZoom={12} 
                maxZoom={18} 
              >
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector onLocationSelect={setLocation} selectedLocation={location} />
              </MapContainer>
              {!location && <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20 text-foreground text-xs font-semibold drop-shadow-md">Selecciona una ubicación</div>}
            </div>
            {location && (<p className="text-xs text-green-400 mt-1">✓ Coordenadas: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>)}
          </div>

          {/* FOTO */}
          <div>
            <Label className="text-foreground mb-2 block">Foto (Opcional)</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {photo ? 'Cambiar' : 'Subir'}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              {photo && (
                  <div className="relative h-12 w-12 rounded overflow-hidden border border-input">
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
              )}
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="pt-2">
            <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white border-0"
                disabled={loading || isDetectingColonia} 
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Reporte (+10 ptos)
                    </>
                )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;