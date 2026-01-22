import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Camera, 
  MapPin, 
  Send, 
  FileText, 
  Loader2, 
  MapPinned,
  X,
  Upload,
  Image as ImageIcon,
  Compass
} from 'lucide-react'; 
import 'leaflet/dist/leaflet.css';
import { createReport } from '../services/reportService'; 
import { findColoniaByLocation } from '../utils/geoUtils'; 

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
  const [colonia, setColonia] = useState('');
  const [isDetectingColonia, setIsDetectingColonia] = useState(false);
  const [photo, setPhoto] = useState(null); 
  const [photoFile, setPhotoFile] = useState(null); 
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'Bache', label: 'Bache', emoji: '🚧', color: 'text-orange-500' },
    { value: 'Alumbrado', label: 'Alumbrado', emoji: '💡', color: 'text-yellow-500' },
    { value: 'Basura', label: 'Basura', emoji: '🗑️', color: 'text-red-500' },
    { value: 'Vandalismo', label: 'Vandalismo', emoji: '🎨', color: 'text-purple-500' },
    { value: 'Otro', label: 'Otro', emoji: '🔧', color: 'text-gray-500' }
  ];

  const candelariaCenter = [18.186356, -91.041947]; 
  const candelariaBounds = [
    [18.136, -91.091], 
    [18.236, -90.991]  
  ];

  useEffect(() => {
    const detectColonia = () => {
      if (!location) return;
      setIsDetectingColonia(true);
      setColonia('');
      
      try {
        const detectedName = findColoniaByLocation(location);
        setColonia(detectedName || '');
      } catch (error) {
        console.error("Error detectando colonia:", error);
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
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La imagen no debe exceder 5MB",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); 
      };
      reader.readAsDataURL(file);
      setPhotoFile(file); 
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!description || !location || !colonia.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      // Obtener token directamente del localStorage
      const storedToken = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      // Obtener usuario del localStorage o de props
      let usuarioData = null;
      try {
        usuarioData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        usuarioData = currentUser || {};
      }
      
      const ciudadanoId = usuarioData?.idUser || usuarioData?.id || currentUser?.idUser || currentUser?.id;
      
      console.log('Debug - Token encontrado:', !!storedToken);
      console.log('Debug - CiudadanoId:', ciudadanoId);
      console.log('Debug - Usuario data:', usuarioData);
      
      if (!storedToken || !ciudadanoId) {
        throw new Error("No se encontró información de sesión. Por favor, vuelve a iniciar sesión.");
      }

      const formData = new FormData();
      
      // Asegurarnos de que los datos sean strings
      formData.append('CiudadanoId', ciudadanoId.toString());
      formData.append('TipoIncidente', type);
      formData.append('Colonia', colonia);
      formData.append('DescripcionDetallada', description);
      formData.append('Latitud', location.lat.toString());
      formData.append('Longitud', location.lng.toString());
      
      if (photoFile) {
        formData.append('ArchivoFoto', photoFile);
      }
      
      console.log('Enviando reporte...');
      console.log('Tipo Incidente:', type);
      console.log('Colonia:', colonia);
      console.log('Coordenadas:', location.lat, location.lng);
      
      // Enviar sin token en el parámetro, que el servicio lo busque
      await createReport(formData);
      
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
      setStep(1);
      setOpen(false);
      
      if (onReportSubmit) onReportSubmit();

    } catch (error) {
      console.error("Error completo al enviar reporte:", error);
      
      let errorMessage = "Ocurrió un error al enviar el reporte.";
      if (error.message.includes("No se encontró información de sesión") || 
          error.message.includes("Error de sesión") ||
          error.message.includes("token")) {
        errorMessage = "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.";
      } else if (error.message.includes("No se pudo conectar")) {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
      } else {
        errorMessage = error.message || "Ocurrió un error inesperado.";
      }
      
      toast({
        title: "Error al enviar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white border-0 shadow-lg">
            <FileText className="w-4 h-4" />
            Nuevo Reporte
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="sticky top-0 z-50 bg-background border-b border-border p-6">
            <DialogHeader className="text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-sky-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      Nuevo Reporte
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Reporta un problema en tu comunidad
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Progress Steps */}
                  <div className="hidden md:flex items-center gap-2">
                    {[1, 2, 3].map((stepNum) => (
                      <React.Fragment key={stepNum}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step === stepNum 
                            ? 'bg-primary text-white' 
                            : step > stepNum 
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {stepNum}
                        </div>
                        {stepNum < 3 && (
                          <div className={`w-8 h-1 ${
                            step > stepNum ? 'bg-emerald-500' : 'bg-muted'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Tipo de Reporte */}
                    <div>
                      <Label className="text-foreground mb-3 block text-lg font-medium">
                        ¿Qué tipo de problema es?
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {reportTypes.map((reportType) => (
                          <motion.button
                            key={reportType.value}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setType(reportType.value)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                              type === reportType.value
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className={`text-2xl mb-2 ${reportType.color}`}>
                              {reportType.emoji}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {reportType.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <Label className="text-foreground mb-3 block text-lg font-medium">
                        Describe el problema
                      </Label>
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full px-4 py-3 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[120px]" 
                        placeholder="Ejemplo: Hay un bache profundo en la esquina de la calle, cerca de la tienda..." 
                      />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-border">
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!description.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Continuar
                        <Compass className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Mapa */}
                    <div>
                      <Label className="text-foreground mb-3 block text-lg font-medium flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Selecciona la ubicación exacta
                      </Label>
                      <div className="h-[300px] rounded-xl overflow-hidden border border-input relative">
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
                        {!location && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 text-foreground text-sm font-medium">
                            Haz clic en el mapa para seleccionar la ubicación
                          </div>
                        )}
                      </div>
                      {location && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-emerald-500 mt-2 flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Coordenadas: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </motion.p>
                      )}
                    </div>

                    {/* Colonia */}
                    <div>
                      <Label className="text-foreground mb-3 block text-lg font-medium flex items-center gap-2">
                        <MapPinned className="w-5 h-5" />
                        Colonia / Barrio
                      </Label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={colonia}
                          onChange={(e) => setColonia(e.target.value)}
                          placeholder={
                            location 
                              ? (isDetectingColonia ? "Detectando colonia..." : "Escribe la colonia o barrio")
                              : "Selecciona primero una ubicación en el mapa"
                          }
                          className="w-full px-4 py-3 bg-muted border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                          disabled={isDetectingColonia || !location}
                        />
                        {isDetectingColonia && (
                          <div className="absolute right-4 top-3">
                            <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        La colonia se detectará automáticamente si está dentro de los límites definidos
                      </p>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        Atrás
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!location || !colonia.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Continuar
                        <Compass className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Foto */}
                    <div>
                      <Label className="text-foreground mb-3 block text-lg font-medium flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Añade una foto (Opcional)
                      </Label>
                      <div className="space-y-4">
                        {photo ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                          >
                            <img 
                              src={photo} 
                              alt="Preview" 
                              className="w-full max-w-md h-48 object-cover rounded-xl border border-border mx-auto"
                            />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-input rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          >
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-foreground font-medium">Sube una foto</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Arrastra o haz clic para seleccionar una imagen
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Máximo 5MB • Formatos: JPG, PNG, GIF
                            </p>
                          </motion.div>
                        )}
                        <input 
                          ref={fileInputRef} 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="hidden" 
                        />
                      </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-muted/50 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-foreground mb-4">Resumen del Reporte</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium text-foreground">{type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ubicación:</span>
                          <span className="font-medium text-foreground">{colonia}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Puntos a ganar:</span>
                          <span className="font-medium text-emerald-500">+10 puntos</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        Atrás
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Reporte
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Las fotos ayudan a entender mejor el problema</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span>Ganas 10 puntos por cada reporte válido</span>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;