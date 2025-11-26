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
import { Camera, MapPin, Send, FileText, Loader2 } from 'lucide-react'; 
import 'leaflet/dist/leaflet.css';

// Importamos el servicio
import { createReport } from '../services/reportService'; 

// Componente Selector de Ubicación (sin cambios)
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
  const [photo, setPhoto] = useState(null); 
  const [photoFile, setPhotoFile] = useState(null); // Objeto File binario (IFormFile)
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const reportTypes = ['Bache', 'Alumbrado', 'Basura', 'Vandalismo', 'Otro'];
  
  // Configuraciones de región
  const candelariaCenter = [18.186356, -91.041947]; 
  const candelariaBounds = [
      [18.136, -91.091], 
      [18.236, -90.991]  
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); // Base64 para el preview
      };
      reader.readAsDataURL(file);
      
      setPhotoFile(file); // Almacenamiento del archivo binario
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Validación de formulario
    if (!description || !location) {
      toast({
        title: "Error de validación",
        description: "Por favor completa la descripción y selecciona una ubicación en el mapa.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
        // CORRECCIÓN CLAVE: Obtener el token y la ID directamente de la prop currentUser
        const storedToken = currentUser?.tokenJWT; 
        const ciudadanoId = currentUser?.idUser; 
        
        if (!storedToken) {
            // Este error saldrá si la propiedad tokenJWT está vacía en la prop
            throw new Error("Token de usuario no disponible. Asegúrate de que el objeto currentUser contenga tokenJWT.");
        }
        
        if (!ciudadanoId) {
            // Este error saldrá si la propiedad idUser está vacía en la prop
            throw new Error("ID de usuario no disponible. Asegúrate de que el objeto currentUser contenga idUser.");
        }

        // 1. CREACIÓN DEL PAYLOAD COMO FormData (OBLIGATORIO para IFormFile)
        const formData = new FormData();
        
        // Mapeo a los campos del DTO 'CrearReporteConArchivoDto'
        formData.append('CiudadanoId', ciudadanoId); // Usando la ID correcta
        formData.append('TipoIncidente', type);
        formData.append('DescripcionDetallada', description);
        formData.append('Latitud', location.lat);
        formData.append('Longitud', location.lng);
        
        // Adjuntar el archivo binario al campo esperado 'ArchivoFoto'
        if (photoFile) {
            formData.append('ArchivoFoto', photoFile, photoFile.name); 
        }
        
        // 2. LLAMADA A LA API: Pasando formData y el storedToken
        const response = await createReport(formData, storedToken); 
        
        // Manejo de éxito
        const pointsEarned = 10; 
        
        if (onPointsEarned) {
            onPointsEarned(pointsEarned);
        }

        toast({
          title: "¡Reporte enviado!",
          description: `Has ganado ${pointsEarned} puntos por tu reporte.`,
        });

        // 3. Resetear formulario y cerrar modal
        setDescription('');
        setType('Bache');
        setPhoto(null);
        setPhotoFile(null); 
        setLocation(null);
        setOpen(false);
        
        if (onReportSubmit) {
            onReportSubmit(); 
        }

    } catch (error) {
        console.error("Error al enviar el reporte:", error);
        toast({
            title: "Error al enviar",
            description: error.message || "Ocurrió un error al intentar enviar el reporte.",
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
            Completa el formulario para reportar un problema en tu ciudad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

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

          <div>
            <Label className="text-foreground mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4" />Ubicación (Toca el mapa)</Label>
            <div className="h-[200px] rounded-lg overflow-hidden border border-input relative">
              <MapContainer 
                center={candelariaCenter} 
                zoom={13} 
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
            {location && (<p className="text-xs text-green-400 mt-1">✓ Ubicación: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>)}
          </div>

          <div className="pt-2">
            <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white border-0"
                disabled={loading} 
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