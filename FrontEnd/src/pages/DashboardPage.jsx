import React, { useState, useEffect } from 'react'; 
import { motion } from 'framer-motion'; 
import StatsWidgets from '@/components/StatsWidgets'; 
import UserProfile from '@/components/UserProfile'; 
import { getReportsToValidate, validateReport } from '@/services/reportService';
import { useToast } from '@/components/ui/use-toast';
import { ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle } from 'lucide-react';

const DashboardPage = ({ currentUser }) => { 
    const [reportsToValidate, setReportsToValidate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState({});
    const { toast } = useToast();

    useEffect(() => {
        loadReportsToValidate();
        
        // Configurar intervalo para actualización automática cada 30 segundos
        const intervalId = setInterval(() => {
            loadReportsToValidate();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [currentUser]);

    const loadReportsToValidate = async () => {
        try {
            setLoading(true);
            const userId = currentUser.idUser || currentUser.id;
            const reports = await getReportsToValidate(userId);
            setReportsToValidate(reports);
        } catch (error) {
            console.error('Error cargando reportes por validar:', error);
            if (reportsToValidate.length === 0) {
                toast({
                    title: "Error",
                    description: error.message || "No se pudieron cargar los reportes por validar",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = async (reportId, esPositiva) => {
        try {
            setValidating(prev => ({ ...prev, [reportId]: true }));
            
            const validationData = {
                ReporteId: reportId,
                CiudadanoId: currentUser.idUser || currentUser.id,
                EsPositiva: esPositiva
            };

            const result = await validateReport(validationData);

            // Mostrar mensaje de éxito
            toast({
                title: "Validación exitosa",
                description: `Has ${esPositiva ? 'validado' : 'rechazado'} el reporte. +${result.puntosOtorgados || 5} puntos`,
            });

            // Recargar la lista de reportes por validar
            await loadReportsToValidate();
            
        } catch (error) {
            console.error('Error validando reporte:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo validar el reporte",
                variant: "destructive"
            });
        } finally {
            setValidating(prev => ({ ...prev, [reportId]: false }));
        }
    };

    // Helper para las clases de estado
    const getStatusClasses = (status) => {
        switch (status) {
            case 'pending':
            case 'EnValidacion':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-500/30';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-500/30';
            case 'completed':
            case 'Validado':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-500/30';
            case 'Rechazado':
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-500/30';
            default:
                return 'bg-muted text-muted-foreground border border-border';
        }
    };

    // Mapear estados para mostrar en español
    const getStatusText = (status) => {
        const statusTextMap = {
            'pending': 'Pendiente',
            'in-progress': 'En Progreso',
            'completed': 'Completado',
            'EnValidacion': 'En Validación',
            'Validado': 'Validado',
            'Rechazado': 'Rechazado'
        };
        return statusTextMap[status] || status;
    };

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return ( 
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-6" 
        > 
            <div className="mb-4"> 
                <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1> 
                <p className="text-muted-foreground">Resumen de la actividad de la ciudad y tu progreso</p> 
            </div> 
            
            {/* Widgets de Estadísticas */}
            <StatsWidgets /> 
            
            {/* 1. MI PROGRESO (Recuadro como Card) */}
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Mi Progreso</h2> 
                <UserProfile currentUser={currentUser} /> 
            </div>

            {/* 2. REPORTES POR VALIDAR (Recuadro como Card) */}
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-foreground">Reportes por Validar</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Actualización automática</span>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-muted-foreground">Cargando reportes por validar...</span>
                    </div>
                ) : reportsToValidate.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <p className="text-muted-foreground">No hay reportes pendientes por validar</p>
                        <p className="text-sm text-muted-foreground mt-1">¡Buen trabajo! Has validado todos los reportes disponibles.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reportsToValidate.map(report => (
                            <div 
                                key={report.id} 
                                className="p-4 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Imagen del reporte */}
                                    {report.urlFoto && (
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={report.urlFoto} 
                                                alt="Reporte" 
                                                className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Información del reporte */}
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                            <div>
                                                <p className="font-semibold text-foreground text-lg">{report.tipoIncidente}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{report.descripcionDetallada}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusClasses(report.estado)}`}>
                                                    {getStatusText(report.estado)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Información del usuario que reportó */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            {report.usuario?.fotoPerfil ? (
                                                <img 
                                                    src={report.usuario.fotoPerfil} 
                                                    alt="Usuario" 
                                                    className="w-6 h-6 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                                                    <span className="text-xs">👤</span>
                                                </div>
                                            )}
                                            <span>Reportado por {report.usuario?.nombre || "Usuario"}</span>
                                            <span>•</span>
                                            <span>{formatDate(report.fechaCreacion)}</span>
                                        </div>

                                        {/* Botones de validación */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Necesita 10 validaciones</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleValidation(report.id, true)}
                                                    disabled={validating[report.id]}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {validating[report.id] ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <ThumbsUp className="w-4 h-4" />
                                                    )}
                                                    Validar
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleValidation(report.id, false)}
                                                    disabled={validating[report.id]}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {validating[report.id] ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <ThumbsDown className="w-4 h-4" />
                                                    )}
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div> 
    ); 
}; 

export default DashboardPage;