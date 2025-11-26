import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, MapPin, Gamepad2, ChevronDown, ChevronUp, TrendingUp, Users } from 'lucide-react';
import { getMyReports } from '@/services/reportService';
import { getUserById, getRanking, getTopUsers } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

const UserProfile = ({ currentUser }) => {
    const [userStats, setUserStats] = useState(currentUser);
    const [userReports, setUserReports] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [userRankPosition, setUserRankPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllReports, setShowAllReports] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadUserDataAndReports();
        loadRankingData();
        
        // Configurar intervalo para actualización automática cada 30 segundos
        const intervalId = setInterval(() => {
            loadUserDataAndReports();
            loadRankingData();
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

    const loadRankingData = async () => {
        try {
            const [rankingData, topUsersData] = await Promise.all([
                getRanking(),
                getTopUsers()
            ]);

            setRanking(rankingData);
            setTopUsers(topUsersData);

            // Encontrar la posición del usuario actual en el ranking
            const userPosition = rankingData.findIndex(user => 
                user.id === (currentUser.idUser || currentUser.id)
            );
            if (userPosition !== -1) {
                setUserRankPosition(userPosition + 1); // +1 porque el índice empieza en 0
            }
        } catch (error) {
            console.error('Error cargando datos de ranking:', error);
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

    // Calcular progreso al siguiente rango usando la misma lógica del backend
    const getNextRankThreshold = (currentPoints) => {
        if (currentPoints >= 1050) return { threshold: 1050, nextRank: 'Máximo' };
        if (currentPoints >= 650) return { threshold: 1050, nextRank: 'Ciudadano Héroe' };
        if (currentPoints >= 250) return { threshold: 650, nextRank: 'Ciudadano Ejemplar' };
        if (currentPoints >= 100) return { threshold: 250, nextRank: 'Ciudadano Vigía' };
        return { threshold: 100, nextRank: 'Ciudadano Activo' };
    };

    // Usar idUser para consistencia
    const userId = currentUser.idUser || currentUser.id;
    const userPoints = userStats.puntos || userStats.points || 0;
    
    // Usar la información de rango del backend si está disponible
    const rankInfo = userStats.rango ? {
        rank: userStats.rango,
        color: userStats.rankColor || 'bg-muted text-muted-foreground',
        icon: userStats.rankIcon || '🌱'
    } : {
        // Fallback a cálculo local si el backend no envía la info
        rank: userStats.rango || 'Ciudadano Novato',
        color: 'bg-muted text-muted-foreground',
        icon: '🌱'
    };

    const { threshold: nextRankPoints, nextRank } = getNextRankThreshold(userPoints);
    const progress = userPoints >= 1050 ? 100 : (userPoints / nextRankPoints) * 100;

    // Determinar qué reportes mostrar
    const visibleReports = showAllReports ? userReports : userReports.slice(0, 3);
    const hasMoreReports = userReports.length > 3;

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-24 h-24 ${rankInfo.color.includes('from-') ? `bg-gradient-to-br ${rankInfo.color}` : rankInfo.color} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
                        {rankInfo.icon}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Mi Progreso</h1>
                        <h2 className="text-3xl font-bold text-foreground mb-2">{userStats.nombreUser || userStats.nombre || userStats.username}</h2>
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <span className="text-xl text-yellow-400 font-semibold">{rankInfo.rank}</span>
                        </div>
                        
                        {/* Información de ranking global */}
                        {userRankPosition && (
                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                <span>Posición #{userRankPosition} en el ranking global</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Progreso al siguiente rango: {nextRank}</span>
                                <span>{userPoints} / {nextRankPoints} puntos</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${
                                        rankInfo.rank === 'Ciudadano Héroe' ? 'bg-gradient-to-r from-cyan-400 to-teal-500' :
                                        rankInfo.rank === 'Ciudadano Ejemplar' ? 'bg-gradient-to-r from-sky-400 to-blue-500' :
                                        rankInfo.rank === 'Ciudadano Vigía' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                        rankInfo.rank === 'Ciudadano Activo' ? 'bg-gradient-to-r from-violet-400 to-purple-500' :
                                        'bg-yellow-400'
                                    }`}
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
                        <Users className="w-8 h-8 text-violet-400" />
                        <span className="text-muted-foreground">Ranking</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                        {userRankPosition ? `#${userRankPosition}` : '-'}
                    </p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="w-8 h-8 text-amber-400" />
                        <span className="text-muted-foreground">Rango</span>
                    </div>
                    <p className="text-lg font-bold text-foreground truncate" title={rankInfo.rank}>
                        {rankInfo.rank}
                    </p>
                </motion.div>
            </div>

            {/* Top 3 Usuarios */}
            {topUsers.length > 0 && (
                <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        Top 3 Ciudadanos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topUsers.slice(0, 3).map((user, index) => (
                            <motion.div 
                                key={user.id}
                                whileHover={{ scale: 1.02 }}
                                className={`p-4 rounded-lg border ${
                                    index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                                    index === 1 ? 'bg-gray-400/10 border-gray-400/30' :
                                    index === 2 ? 'bg-amber-700/10 border-amber-700/30' :
                                    'bg-muted/50 border-border'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                        index === 0 ? 'bg-yellow-400' :
                                        index === 1 ? 'bg-gray-400' :
                                        'bg-amber-600'
                                    }`}>
                                        {user.rankIcon || '👤'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground truncate">
                                            {user.nombre}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.puntos} puntos
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {user.rango}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

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