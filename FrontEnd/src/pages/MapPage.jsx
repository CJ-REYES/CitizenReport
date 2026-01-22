import React, { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import ReportModal from '@/components/ReportModal';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  FileText, 
  List, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Filter, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Shield,
  Eye
} from 'lucide-react';
import { getAllReports } from '@/services/reportService';
import { useToast } from '@/components/ui/use-toast';
import AuthGuard from '@/components/AuthGuard';

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
        setLastUpdate(Date.now());
    };

    const toggleShowAllReports = () => {
        setShowAllReports(!showAllReports);
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case 'EnValidacion':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
            case 'Validado':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Rechazado':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            case 'Resuelto':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusText = (status) => {
        const statusTextMap = {
            'EnValidacion': 'En Validación',
            'Validado': 'Validado',
            'Rechazado': 'Rechazado',
            'Resuelto': 'Resuelto'
        };
        return statusTextMap[status] || status;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'EnValidacion': return <Clock className="w-3 h-3" />;
            case 'Validado': return <CheckCircle className="w-3 h-3" />;
            case 'Resuelto': return <Shield className="w-3 h-3" />;
            default: return <AlertTriangle className="w-3 h-3" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const visibleReports = showAllReports ? allReports : allReports.slice(0, 3);
    const hasMoreReports = allReports.length > 3;

    // Stats calculations
    const stats = {
        total: allReports.length,
        enValidacion: allReports.filter(r => r.estado === 'EnValidacion').length,
        validados: allReports.filter(r => r.estado === 'Validado').length,
        resueltos: allReports.filter(r => r.estado === 'Resuelto').length,
        rechazados: allReports.filter(r => r.estado === 'Rechazado').length
    };

    const isGuest = currentUser?.isGuest;

    // Botón de "Nuevo Reporte" condicional
    const NewReportButton = () => {
        if (isGuest) {
            return (
                <AuthGuard currentUser={currentUser} action="crear reportes">
                    <Button 
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Nuevo Reporte
                    </Button>
                </AuthGuard>
            );
        }
        
        return (
            <ReportModal 
                currentUser={currentUser} 
                onReportSubmit={handleReportSubmit}
                onPointsEarned={onPointsEarned}
                trigger={
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white border-0 shadow-lg">
                        <FileText className="w-4 h-4" />
                        Nuevo Reporte
                    </Button>
                }
            />
        );
    };

    // Botón de "Crear Primer Reporte" condicional (para cuando no hay reportes)
    const FirstReportButton = () => {
        if (isGuest) {
            return (
                <AuthGuard currentUser={currentUser} action="crear reportes">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Eye className="w-4 h-4 mr-2" />
                        Crear Reporte
                    </Button>
                </AuthGuard>
            );
        }
        
        return (
            <ReportModal 
                currentUser={currentUser} 
                onReportSubmit={handleReportSubmit}
                onPointsEarned={onPointsEarned}
                trigger={
                    <Button className="bg-primary hover:bg-primary/90">
                        <FileText className="w-4 h-4 mr-2" />
                        Crear Primer Reporte
                    </Button>
                }
            />
        );
    };

    return (
        <div className="space-y-6 relative z-10">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border border-border rounded-2xl p-6 relative z-20"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mapa de Reportes</h1>
                                <p className="text-muted-foreground">
                                    {isGuest 
                                        ? "Visualiza problemas reportados en Candelaria (modo invitado)" 
                                        : "Visualiza y reporta problemas en Candelaria"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <NewReportButton />
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
                {[
                    { value: stats.total, label: "Total Reportes", color: "text-primary" },
                    { value: stats.enValidacion, label: "En Validación", color: "text-yellow-500" },
                    { value: stats.validados, label: "Validados", color: "text-emerald-500" },
                    { value: stats.resueltos, label: "Resuelto", color: "text-blue-500" },
                    { value: stats.rechazados, label: "Rechazados", color: "text-red-500" }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className="bg-card border border-border rounded-xl p-4 text-center"
                    >
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Mapa */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative z-0"
            >
                <MapView currentUser={currentUser} lastUpdate={lastUpdate} />
            </motion.div>

            {/* Lista de Reportes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
            >
                <div className="p-6 border-b border-border">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <List className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Todos los Reportes</h2>
                                <p className="text-sm text-muted-foreground">
                                    {allReports.length} reportes en el sistema
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Mostrando {visibleReports.length} de {allReports.length}
                                </span>
                            </div>
                            {hasMoreReports && (
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={toggleShowAllReports}
                                    className="text-primary hover:text-primary/80"
                                >
                                    {showAllReports ? (
                                        <>
                                            <ChevronUp className="w-4 h-4 mr-2" />
                                            Mostrar menos
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4 mr-2" />
                                            Ver todos
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-muted-foreground">Cargando reportes...</span>
                    </div>
                ) : allReports.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-foreground font-medium text-lg mb-2">
                            {isGuest ? "No hay reportes disponibles" : "No hay reportes aún"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {isGuest 
                                ? "Explora otros reportes en el mapa" 
                                : "Sé el primero en crear un reporte para mejorar la ciudad"}
                        </p>
                        {!isGuest && <FirstReportButton />}
                    </motion.div>
                ) : (
                    <div className="p-4">
                        <div className={`space-y-3 ${showAllReports ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
                            {visibleReports.map((report, index) => (
                                <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ y: -2 }}
                                    className="p-4 bg-background border border-border rounded-xl hover:bg-muted/30 transition-all duration-300 hover:border-primary/30 cursor-pointer group"
                                >
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        {report.urlFoto && (
                                            <div className="flex-shrink-0">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border border-border"
                                                >
                                                    <img 
                                                        src={report.urlFoto} 
                                                        alt="Reporte" 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </motion.div>
                                            </div>
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${getStatusClasses(report.estado)}`}>
                                                            {getStatusIcon(report.estado)}
                                                            {getStatusText(report.estado)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(report.fechaCreacion)}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-foreground text-lg truncate">
                                                        {report.tipoIncidente}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {report.descripcionDetallada}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-2 py-1 rounded-md ${getStatusClasses(report.estado)}`}>
                                                        <span className="text-xs font-medium">{getStatusText(report.estado)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        {report.usuario?.fotoPerfil ? (
                                                            <motion.img 
                                                                whileHover={{ scale: 1.1 }}
                                                                src={report.usuario.fotoPerfil} 
                                                                alt="Usuario" 
                                                                className="w-6 h-6 rounded-full border border-border"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                                                                <Users className="w-3 h-3 text-primary" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-muted-foreground">
                                                            {report.usuario?.nombre || "Usuario"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>Lat: {report.latitud.toFixed(4)}</span>
                                                        <span>Lng: {report.longitud.toFixed(4)}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {report.usuario?.puntos && (
                                                        <motion.div
                                                            whileHover={{ scale: 1.1 }}
                                                            className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md"
                                                        >
                                                            <span>⭐</span>
                                                            <span className="text-sm font-medium">{report.usuario.puntos}</span>
                                                        </motion.div>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        ID: {report.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {hasMoreReports && (
                            <div className="flex justify-center mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleShowAllReports}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors"
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
                                </motion.button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MapPage;