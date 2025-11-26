import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, MapPin, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';
import { getMyReports } from '@/services/reportService';
import { getUserById } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

const UserProfile = ({ currentUser }) => {
    const [userStats, setUserStats] = useState(currentUser);
    const [userReports, setUserReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllReports, setShowAllReports] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadUserDataAndReports();
        
        // Configurar intervalo para actualización automática cada 30 segundos
        const intervalId = setInterval(() => {
            loadUserDataAndReports();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [currentUser]);

    const loadUserDataAndReports = async () => {
        try {
            setLoading(true);
            
            const [userData, reports] = await Promise.all([
                loadUserData(),
                loadMyReports()
            ]);

            if (userData) {
                setUserStats(prev => ({ ...prev, ...userData }));
            }
            setUserReports(reports);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            if (userReports.length === 0) {
                toast({
                    title: "Error",
                    description: error.message || "No se pudieron cargar los datos",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadUserData = async () => {
        try {
            const userId = currentUser.idUser || currentUser.id;
            const userData = await getUserById(userId);
            return userData;
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            return null;
        }
    };

    const loadMyReports = async () => {
        try {
            const userId = currentUser.idUser || currentUser.id;
            const reports = await getMyReports(userId);
            
            const transformedReports = reports.map(report => ({
                id: report.id,
                type: report.tipoIncidente,
                description: report.descripcionDetallada,
                latitud: report.latitud,
                longitud: report.longitud,
                status: mapStatus(report.estado),
                createdAt: report.fechaCreacion,
                photo: report.urlFoto,
                userId: report.usuario?.id || userId
            }));

            return transformedReports;
        } catch (error) {
            console.error('Error cargando reportes:', error);
            return [];
        }
    };

    const toggleShowAllReports = () => {
        setShowAllReports(!showAllReports);
    };

    // Mapear estados del backend a los estados del frontend
    const mapStatus = (estado) => {
        const statusMap = {
            'EnValidacion': 'pending',
            'Validado': 'reviewed',
            'Resuelto': 'resolved',
            'Rechazado': 'rejected'
        };
        return statusMap[estado] || estado;
    };

    // Mapear estados para mostrar en español
    const getStatusText = (status) => {
        const statusTextMap = {
            'pending': 'En Validación',
            'reviewed': 'Revisado',
            'resolved': 'Resuelto',
            'rejected': 'Rechazado',
            'EnValidacion': 'En Validación',
            'Validado': 'Validado',
            'Resuelto': 'Resuelto',
            'Rechazado': 'Rechazado'
        };
        return statusTextMap[status] || status;
    };

    const getRankInfo = (points) => {
        if (points >= 500) return { rank: 'Ciudadano Héroe', color: 'from-cyan-400 to-teal-500', icon: '🏆' };
        if (points >= 300) return { rank: 'Ciudadano Ejemplar', color: 'from-sky-400 to-blue-500', icon: '⭐' };
        if (points >= 150) return { rank: 'Ciudadano Vigía', color: 'from-emerald-400 to-green-500', icon: '👁️' };
        if (points >= 50) return { rank: 'Ciudadano Activo', color: 'from-violet-400 to-purple-500', icon: '🎯' };
        return { rank: 'Ciudadano Novato', color: 'bg-muted text-muted-foreground', icon: '🌱' };
    };

    // Usar idUser para consistencia
    const userId = currentUser.idUser || currentUser.id;
    const userPoints = userStats.puntos || userStats.points || 0;
    const rankInfo = getRankInfo(userPoints);
    
    const nextRankPoints = userPoints >= 500 ? 500 :
                        userPoints >= 300 ? 500 :
                        userPoints >= 150 ? 300 :
                        userPoints >= 50 ? 150 : 50;
    const progress = (userPoints / nextRankPoints) * 100;

    // Determinar qué reportes mostrar
    const visibleReports = showAllReports ? userReports : userReports.slice(0, 3);
    const hasMoreReports = userReports.length > 3;

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-24 h-24 ${rankInfo.rank === 'Ciudadano Novato' ? rankInfo.color : `bg-gradient-to-br ${rankInfo.color}`} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
                        {rankInfo.icon}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Mi Progreso</h1>
                        <h2 className="text-3xl font-bold text-foreground mb-2">{userStats.nombreUser || userStats.nombre || userStats.username}</h2>
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <span className="text-xl text-yellow-400 font-semibold">{rankInfo.rank}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Progreso al siguiente rango</span>
                                <span>{userPoints} / {nextRankPoints} puntos</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-yellow-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-8 h-8 text-sky-400" />
                        <span className="text-muted-foreground">Puntos</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{userPoints}</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-8 h-8 text-emerald-400" />
                        <span className="text-muted-foreground">Reportes</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{userReports.length}</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <Gamepad2 className="w-8 h-8 text-violet-400" />
                        <span className="text-muted-foreground">Vidas</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{userStats.gameStats?.lives || 5}</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="w-8 h-8 text-amber-400" />
                        <span className="text-muted-foreground">High Score</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{userStats.gameStats?.highScore || 0}</p>
                </motion.div>
            </div>

            {/* Recent Reports */}
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-foreground">Mis Reportes Recientes</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Actualización automática</span>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-muted-foreground">Cargando datos...</span>
                    </div>
                ) : userReports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No has creado reportes aún</p>
                ) : (
                    <>
                        {/* Contenedor de reportes con scroll limitado */}
                        <div className={`space-y-3 ${showAllReports ? 'max-h-[400px] overflow-y-auto' : ''}`}>
                            {visibleReports.map(report => (
                                <div key={report.id} className="bg-muted/50 hover:bg-muted/80 transition-colors rounded-lg p-4 flex items-center gap-4 border border-border">
                                    {report.photo && (
                                        <img 
                                            src={report.photo} 
                                            alt="Report" 
                                            className="w-16 h-16 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">{report.type}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{report.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(report.createdAt).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs ${
                                        report.status === 'pending' || report.status === 'EnValidacion' ? 'bg-yellow-500/20 text-yellow-300' : 
                                        report.status === 'reviewed' || report.status === 'Validado' ? 'bg-sky-500/20 text-sky-300' : 
                                        report.status === 'rejected' || report.status === 'Rechazado' ? 'bg-red-500/20 text-red-300' :
                                        'bg-emerald-500/20 text-emerald-300'
                                    }`}>
                                        {getStatusText(report.status)}
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
                                            Ver todos los reportes ({userReports.length})
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

export default UserProfile;