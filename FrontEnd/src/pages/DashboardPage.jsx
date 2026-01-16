import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import StatsWidgets from '@/components/StatsWidgets'; 
import UserProfile from '@/components/UserProfile'; 
import { getReportsToValidate, validateReport } from '@/services/reportService';
import { useToast } from '@/components/ui/use-toast';
import { ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Filter, Search, AlertCircle } from 'lucide-react';

const DashboardPage = ({ currentUser }) => { 
    const [reportsToValidate, setReportsToValidate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        loadReportsToValidate();
        
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

            toast({
                title: esPositiva ? "✅ Validación exitosa" : "⚠️ Reporte rechazado",
                description: `Has ${esPositiva ? 'validado' : 'rechazado'} el reporte. +${result.puntosOtorgados || 5} puntos`,
            });

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

    const getStatusClasses = (status) => {
        switch (status) {
            case 'pending':
            case 'EnValidacion':
                return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-600 border border-yellow-500/30';
            case 'in-progress':
                return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-600 border border-blue-500/30';
            case 'completed':
            case 'Validado':
                return 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-600 border border-emerald-500/30';
            case 'Rechazado':
                return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-600 border border-red-500/30';
            default:
                return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-600 border border-gray-500/30';
        }
    };

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredReports = reportsToValidate.filter(report => {
        const matchesSearch = report.tipoIncidente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            report.descripcionDetallada?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'all' || report.estado === statusFilter;
        return matchesSearch && matchesFilter;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return ( 
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        > 
            {/* Header con animación */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            > 
                <h1 className="text-3xl md:text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Panel de Control
                </h1> 
              
            </motion.div>
            
            {/* StatsWidgets con animación escalonada */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <StatsWidgets />
            </motion.div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mi Progreso - Ocupa 2/3 en desktop */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2"
                >
                    <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Mi Progreso</h2>
                            <div className="flex items-center gap-2 text-sm text-primary">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                
                            </div>
                        </div>
                        <UserProfile currentUser={currentUser} />
                    </div>
                </motion.div>

                {/* Reportes por Validar - Ocupa 1/3 en desktop */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-1"
                >
                    <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-6 h-full">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Validaciones Pendientes</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Contribuye verificando reportes
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-ping"></div>
                                    <AlertCircle className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                            
                            {/* Filtros y búsqueda */}
                            <div className="space-y-4 mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar reportes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {['all', 'EnValidacion', 'Validado', 'Rechazado'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setStatusFilter(filter)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                                statusFilter === filter
                                                    ? 'bg-primary text-white'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                        >
                                            {filter === 'all' ? 'Todos' : getStatusText(filter)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lista de reportes */}
                            <div className="flex-1 overflow-hidden">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-muted-foreground">Buscando reportes por validar...</p>
                                    </div>
                                ) : filteredReports.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-75" />
                                        <p className="text-muted-foreground">No hay reportes pendientes</p>
                                        <p className="text-sm text-muted-foreground mt-1">¡Excelente trabajo!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                                        <AnimatePresence>
                                            {filteredReports.map(report => (
                                                <motion.div
                                                    key={report.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="bg-background/50 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
                                                >
                                                    <div className="space-y-3">
                                                        {/* Header del reporte */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-foreground line-clamp-1">
                                                                    {report.tipoIncidente}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                                    {report.descripcionDetallada}
                                                                </p>
                                                            </div>
                                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusClasses(report.estado)}`}>
                                                                {getStatusText(report.estado)}
                                                            </span>
                                                        </div>

                                                        {/* Información del usuario */}
                                                        <div className="flex items-center gap-2 text-sm">
                                                            {report.usuario?.fotoPerfil ? (
                                                                <img 
                                                                    src={report.usuario.fotoPerfil} 
                                                                    alt="Usuario"
                                                                    className="w-8 h-8 rounded-full border-2 border-border"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                                                                    <span className="text-xs">👤</span>
                                                                </div>
                                                            )}
                                                            <span className="text-muted-foreground">
                                                                {report.usuario?.nombre || "Usuario"}
                                                            </span>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(report.fechaCreacion)}
                                                            </span>
                                                        </div>

                                                        {/* Imagen del reporte */}
                                                        {report.urlFoto && (
                                                            <div className="relative overflow-hidden rounded-lg">
                                                                <img 
                                                                    src={report.urlFoto}
                                                                    alt="Reporte"
                                                                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                            </div>
                                                        )}

                                                        {/* Botones de validación */}
                                                        <div className="flex gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleValidation(report.id, true)}
                                                                disabled={validating[report.id]}
                                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                {validating[report.id] ? (
                                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <>
                                                                        <ThumbsUp className="w-4 h-4" />
                                                                        Validar
                                                                    </>
                                                                )}
                                                            </motion.button>

                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleValidation(report.id, false)}
                                                                disabled={validating[report.id]}
                                                                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                {validating[report.id] ? (
                                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <>
                                                                        <ThumbsDown className="w-4 h-4" />
                                                                        Rechazar
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Footer informativo */}
                            <div className="pt-4 mt-4 border-t border-border">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{filteredReports.length} reportes pendientes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                        <span>Gana puntos por validar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div> 
    ); 
}; 

export default DashboardPage;