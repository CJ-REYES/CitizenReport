import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, BarChart, Clock, CheckCircle, AlertTriangle, Construction, TrafficCone, RefreshCw } from 'lucide-react';
import { getColoniaMasAlumbrado, getColoniaMasBaches, getColoniaMasDanos } from '../services/reportService';

const StatsWidgets = () => {
    const [stats, setStats] = useState({
        coloniaAlumbrado: { nombre: 'Cargando...', total: 0 },
        coloniaBaches: { nombre: 'Cargando...', total: 0 },
        coloniaDanos: { nombre: 'Cargando...', total: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            setRefreshing(true);
            
            // Realizar las tres llamadas en paralelo
            const [alumbradoData, bachesData, danosData] = await Promise.all([
                getColoniaMasAlumbrado(),
                getColoniaMasBaches(),
                getColoniaMasDanos()
            ]);

            console.log('Datos recibidos:', { alumbradoData, bachesData, danosData });

            setStats({
                coloniaAlumbrado: {
                    nombre: alumbradoData.coloniaMasAlumbrado || 'Sin reportes',
                    total: alumbradoData.totalReportesAlumbrado || 0
                },
                coloniaBaches: {
                    nombre: bachesData.coloniaMasBaches || 'Sin reportes',
                    total: bachesData.totalReportesBaches || 0
                },
                coloniaDanos: {
                    nombre: danosData.coloniaMasDanos || 'Sin reportes',
                    total: danosData.totalReportes || 0
                }
            });
            
            setLastUpdate(new Date());
        } catch (err) {
            console.error('Error fetching stats:', err);
            // En caso de error, mantener los datos anteriores pero marcar error
            setStats(prev => ({
                coloniaAlumbrado: { ...prev.coloniaAlumbrado, nombre: 'Error al cargar' },
                coloniaBaches: { ...prev.coloniaBaches, nombre: 'Error al cargar' },
                coloniaDanos: { ...prev.coloniaDanos, nombre: 'Error al cargar' }
            }));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Efecto para cargar inicialmente y establecer el intervalo
    useEffect(() => {
        // Cargar datos inmediatamente
        fetchStats();

        // Establecer intervalo para actualizar cada 30 segundos
        const intervalId = setInterval(fetchStats, 30000); // 30 segundos

        // Limpiar intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);

    // Función para formatear la hora de última actualización
    const formatLastUpdate = (date) => {
        return date.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) {
        return (
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-md">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                            <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                        </div>
                    </div>
                ))}
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header con información de actualización */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between items-center px-2"
            >
                <div className="text-sm text-muted-foreground">
                    Actualizado: {formatLastUpdate(lastUpdate)}
                </div>
                <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Actualizando...' : 'Actualizar ahora'}
                </button>
            </motion.div>

            {/* Widgets */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* TARJETA 1: Colonia con más fallas en alumbrado público */}
                <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }} 
                    className="bg-card rounded-xl p-6 border border-border shadow-md text-center relative"
                >
                    {refreshing && (
                        <div className="absolute top-2 right-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    )}
                    
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 justify-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Colonia con más Fallas en Alumbrado
                    </h3>

                    <div className="mb-4">
                        <p className="text-4xl font-extrabold text-yellow-500">
                            {stats.coloniaAlumbrado.total}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            reportes de alumbrado
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className={`text-lg font-semibold ${
                            stats.coloniaAlumbrado.nombre === 'Sin reportes' || stats.coloniaAlumbrado.nombre === 'Error al cargar'
                                ? 'text-gray-500'
                                : stats.coloniaAlumbrado.nombre === 'Colonia no especificada'
                                ? 'text-orange-600'
                                : 'text-yellow-700'
                        }`}>
                            {stats.coloniaAlumbrado.nombre === 'Colonia no especificada' 
                                ? 'Reportes sin colonia asignada' 
                                : stats.coloniaAlumbrado.nombre}
                        </p>
                    </div>
                </motion.div>

                {/* TARJETA 2: Colonia con más baches */}
                <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }} 
                    className="bg-card rounded-xl p-6 border border-border shadow-md text-center relative"
                >
                    {refreshing && (
                        <div className="absolute top-2 right-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    )}
                    
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 justify-center">
                        <Construction className="w-5 h-5 text-orange-500" />
                        Colonia con más Baches
                    </h3>

                    <div className="mb-4">
                        <p className="text-4xl font-extrabold text-orange-500">
                            {stats.coloniaBaches.total}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            reportes de baches
                        </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className={`text-lg font-semibold ${
                            stats.coloniaBaches.nombre === 'Sin reportes' || stats.coloniaBaches.nombre === 'Error al cargar'
                                ? 'text-gray-500'
                                : stats.coloniaBaches.nombre === 'Colonia no especificada'
                                ? 'text-orange-600'
                                : 'text-orange-700'
                        }`}>
                            {stats.coloniaBaches.nombre === 'Colonia no especificada' 
                                ? 'Reportes sin colonia asignada' 
                                : stats.coloniaBaches.nombre}
                        </p>
                    </div>
                </motion.div>

                {/* TARJETA 3: Colonia con más daños (reportes en general) */}
                <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }} 
                    className="bg-card rounded-xl p-6 border border-border shadow-md text-center relative"
                >
                    {refreshing && (
                        <div className="absolute top-2 right-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    )}
                    
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 justify-center">
                        <TrafficCone className="w-5 h-5 text-red-500" />
                        Colonia con más Daños
                    </h3>

                    <div className="mb-4">
                        <p className="text-4xl font-extrabold text-red-500">
                            {stats.coloniaDanos.total}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            reportes totales
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className={`text-lg font-semibold ${
                            stats.coloniaDanos.nombre === 'Sin reportes' || stats.coloniaDanos.nombre === 'Error al cargar'
                                ? 'text-gray-500'
                                : stats.coloniaDanos.nombre === 'Colonia no especificada'
                                ? 'text-orange-600'
                                : 'text-red-700'
                        }`}>
                            {stats.coloniaDanos.nombre === 'Colonia no especificada' 
                                ? 'Reportes sin colonia asignada' 
                                : stats.coloniaDanos.nombre}
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Indicador de actualización automática */}
            <div className="text-xs text-center text-muted-foreground">
                Los datos se actualizan automáticamente cada 30 segundos
            </div>
        </div>
    );
};

export default StatsWidgets;