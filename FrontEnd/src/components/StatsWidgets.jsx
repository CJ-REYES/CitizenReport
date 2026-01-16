import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, BarChart, Clock, CheckCircle, AlertTriangle, Construction, TrafficCone, RefreshCw, TrendingUp } from 'lucide-react';
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
            
            const [alumbradoData, bachesData, danosData] = await Promise.all([
                getColoniaMasAlumbrado(),
                getColoniaMasBaches(),
                getColoniaMasDanos()
            ]);

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

    useEffect(() => {
        fetchStats();
        const intervalId = setInterval(fetchStats, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const formatLastUpdate = (date) => {
        return date.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const widgetVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg"
                    >
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-700/30 rounded w-3/4"></div>
                            <div className="h-10 bg-gray-700/30 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-700/30 rounded w-5/6"></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
         

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        key: 'alumbrado',
                        title: 'Alumbrado Público',
                        icon: AlertTriangle,
                        color: 'from-yellow-500/20 to-yellow-600/20',
                        borderColor: 'border-yellow-500/30',
                        textColor: 'text-yellow-400',
                        data: stats.coloniaAlumbrado
                    },
                    {
                        key: 'baches',
                        title: 'Baches en Calles',
                        icon: Construction,
                        color: 'from-orange-500/20 to-orange-600/20',
                        borderColor: 'border-orange-500/30',
                        textColor: 'text-orange-400',
                        data: stats.coloniaBaches
                    },
                    {
                        key: 'danos',
                        title: 'Daños Urbanos',
                        icon: TrafficCone,
                        color: 'from-red-500/20 to-red-600/20',
                        borderColor: 'border-red-500/30',
                        textColor: 'text-red-400',
                        data: stats.coloniaDanos
                    }
                ].map((widget, index) => (
                    <motion.div
                        key={widget.key}
                        custom={index}
                        variants={widgetVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ 
                            y: -5,
                            transition: { duration: 0.2 }
                        }}
                        className={`bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-6 border ${widget.borderColor} shadow-lg relative overflow-hidden`}
                    >
                        {/* Efecto de fondo sutil */}
                        <div className={`absolute -top-20 -right-20 w-40 h-40 ${widget.color} rounded-full blur-3xl opacity-30`}></div>
                        
                        {refreshing && (
                            <div className="absolute top-4 right-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <RefreshCw className="w-5 h-5 text-primary" />
                                </motion.div>
                            </div>
                        )}
                        
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-xl ${widget.color} border ${widget.borderColor}`}>
                                    <widget.icon className={`w-6 h-6 ${widget.textColor}`} />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{widget.title}</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className={`text-4xl md:text-5xl font-bold ${widget.textColor} mb-2`}>
                                        {widget.data.total}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        reportes registrados
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${widget.color} border ${widget.borderColor}`}>
                                    <p className="text-xs text-muted-foreground mb-1">Colonia con más reportes</p>
                                    <p className={`text-lg font-semibold ${widget.data.nombre === 'Sin reportes' || widget.data.nombre === 'Error al cargar' ? 'text-gray-400' : 'text-foreground'}`}>
                                        {widget.data.nombre === 'Colonia no especificada' 
                                            ? '📍 Sin ubicación específica' 
                                            : widget.data.nombre}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            
        </div>
    );
};

export default StatsWidgets;