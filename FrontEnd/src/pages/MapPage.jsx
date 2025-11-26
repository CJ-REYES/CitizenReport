import React, { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import ReportModal from '@/components/ReportModal';
import { Button } from '@/components/ui/button';
import { FileText, List, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllReports } from '@/services/reportService';
import { useToast } from '@/components/ui/use-toast';

const MapPage = ({ currentUser, onPointsEarned }) => {
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [allReports, setAllReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllReports, setShowAllReports] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadAllReports();
    }, [lastUpdate]);

    const loadAllReports = async () => {
        try {
            setLoading(true);
            const reports = await getAllReports();
            setAllReports(reports);
        } catch (error) {
            console.error('Error cargando reportes:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudieron cargar los reportes",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReportSubmit = () => {
        // Update timestamp to trigger map refresh
        setLastUpdate(Date.now());
    };

    const toggleShowAllReports = () => {
        setShowAllReports(!showAllReports);
    };

    // Helper para las clases de estado
    const getStatusClasses = (status) => {
        switch (status) {
            case 'EnValidacion':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-500/30';
            case 'Validado':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-500/30';
            case 'Rechazado':
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-500/30';
            case 'Resuelto':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-500/30';
            default:
                return 'bg-muted text-muted-foreground border border-border';
        }
    };

    // Mapear estados para mostrar en español
    const getStatusText = (status) => {
        const statusTextMap = {
            'EnValidacion': 'En Validación',
            'Validado': 'Validado',
            'Rechazado': 'Rechazado',
            'Resuelto': 'Resuelto'
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

    // Determinar qué reportes mostrar
    const visibleReports = showAllReports ? allReports : allReports.slice(0, 3);
    const hasMoreReports = allReports.length > 3;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mapa de Reportes</h1>
                    <p className="text-muted-foreground">Visualiza los problemas reportados en tu ciudad</p>
                </div>
                <ReportModal 
                    currentUser={currentUser} 
                    onReportSubmit={handleReportSubmit}
                    onPointsEarned={onPointsEarned}
                    trigger={
                        <Button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0">
                            <FileText className="w-4 h-4" />
                            Nuevo Reporte
                        </Button>
                    }
                />
            </div>

            {/* Mapa */}
            <MapView currentUser={currentUser} lastUpdate={lastUpdate} />

            {/* Lista de Todos los Reportes */}
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-foreground">Todos los Reportes</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <List className="w-4 h-4" />
                        <span>{allReports.length} reportes en total</span>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-muted-foreground">Cargando reportes...</span>
                    </div>
                ) : allReports.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No hay reportes disponibles</p>
                        <p className="text-sm text-muted-foreground mt-1">Sé el primero en crear un reporte</p>
                    </div>
                ) : (
                    <>
                        {/* Contenedor de reportes con scroll limitado */}
                        <div className={`space-y-4 ${showAllReports ? 'max-h-[600px] overflow-y-auto' : ''}`}>
                            {visibleReports.map(report => (
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

                                            {/* Ubicación y puntos */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <span>📍</span>
                                                        <span>Lat: {report.latitud.toFixed(4)}, Lng: {report.longitud.toFixed(4)}</span>
                                                    </div>
                                                    {report.usuario?.puntos && (
                                                        <div className="flex items-center gap-1">
                                                            <span>⭐</span>
                                                            <span>{report.usuario.puntos} puntos</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* ID del reporte */}
                                                <div className="text-xs text-muted-foreground">
                                                    ID: {report.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botón para mostrar más/menos reportes */}
                        {hasMoreReports && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={toggleShowAllReports}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
                                >
                                    {showAllReports ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            Mostrar menos
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Ver todos los reportes ({allReports.length})
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MapPage;