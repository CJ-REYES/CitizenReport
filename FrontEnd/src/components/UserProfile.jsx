import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, MapPin, ChevronDown, ChevronUp, TrendingUp, Users, Zap, Target, Crown } from 'lucide-react';
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

            const userPosition = rankingData.findIndex(user => 
                user.id === (currentUser.idUser || currentUser.id)
            );
            if (userPosition !== -1) {
                setUserRankPosition(userPosition + 1);
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

    const mapStatus = (estado) => {
        const statusMap = {
            'EnValidacion': 'pending',
            'Validado': 'reviewed',
            'Resuelto': 'resolved',
            'Rechazado': 'rejected'
        };
        return statusMap[estado] || estado;
    };

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

    const getNextRankThreshold = (currentPoints) => {
        if (currentPoints >= 1050) return { threshold: 1050, nextRank: 'Máximo' };
        if (currentPoints >= 650) return { threshold: 1050, nextRank: 'Ciudadano Héroe' };
        if (currentPoints >= 250) return { threshold: 650, nextRank: 'Ciudadano Ejemplar' };
        if (currentPoints >= 100) return { threshold: 250, nextRank: 'Ciudadano Vigía' };
        return { threshold: 100, nextRank: 'Ciudadano Activo' };
    };

    const userId = currentUser.idUser || currentUser.id;
    const userPoints = userStats.puntos || userStats.points || 0;
    
    const rankInfo = userStats.rango ? {
        rank: userStats.rango,
        color: userStats.rankColor || 'bg-gradient-to-br from-gray-500 to-gray-700',
        icon: userStats.rankIcon || '🌱'
    } : {
        rank: userStats.rango || 'Ciudadano Novato',
        color: 'bg-gradient-to-br from-gray-500 to-gray-700',
        icon: '🌱'
    };

    const { threshold: nextRankPoints, nextRank } = getNextRankThreshold(userPoints);
    const progress = userPoints >= 1050 ? 100 : (userPoints / nextRankPoints) * 100;

    const visibleReports = showAllReports ? userReports : userReports.slice(0, 3);
    const hasMoreReports = userReports.length > 3;

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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Profile Header */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="relative"
                    >
                        <div className={`w-32 h-32 rounded-2xl ${rankInfo.color} flex items-center justify-center text-5xl shadow-2xl`}>
                            {rankInfo.icon}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                    </motion.div>
                    
                    <div className="flex-1 text-center lg:text-left">
                        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center lg:justify-start gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Mi Progreso
                        </h1>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {userStats.nombreUser || userStats.nombre || userStats.username}
                        </h2>
                        
                        <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                            <Award className="w-6 h-6 text-yellow-400" />
                            <span className="text-xl text-yellow-400 font-bold">{rankInfo.rank}</span>
                        </div>
                        
                        {userRankPosition && (
                            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground justify-center lg:justify-start">
                                <TrendingUp className="w-4 h-4" />
                                <span>Posición #{userRankPosition} en el ranking global</span>
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Próximo rango: <span className="font-semibold text-foreground">{nextRank}</span></span>
                                <span className="font-bold text-foreground">{userPoints} / {nextRankPoints} pts</span>
                            </div>
                            <div className="relative">
                                <div className="w-full bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-full h-4 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(progress, 100)}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full ${
                                            rankInfo.rank === 'Ciudadano Héroe' ? 'bg-gradient-to-r from-cyan-500 to-teal-600' :
                                            rankInfo.rank === 'Ciudadano Ejemplar' ? 'bg-gradient-to-r from-sky-500 to-blue-600' :
                                            rankInfo.rank === 'Ciudadano Vigía' ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                                            rankInfo.rank === 'Ciudadano Activo' ? 'bg-gradient-to-r from-violet-500 to-purple-600' :
                                            'bg-gradient-to-r from-yellow-500 to-amber-600'
                                        }`}
                                    />
                                </div>
                                <div className="absolute -top-6 right-0 text-xs font-bold text-primary">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* User Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Trophy, label: 'Puntos', value: userPoints, color: 'from-sky-400 to-blue-500', bg: 'bg-gradient-to-br from-sky-500/10 to-blue-600/10' },
                    { icon: MapPin, label: 'Reportes', value: userReports.length, color: 'from-emerald-400 to-green-500', bg: 'bg-gradient-to-br from-emerald-500/10 to-green-600/10' },
                    { icon: Users, label: 'Ranking', value: userRankPosition ? `#${userRankPosition}` : '-', color: 'from-violet-400 to-purple-500', bg: 'bg-gradient-to-br from-violet-500/10 to-purple-600/10' },
                    { icon: Target, label: 'Rango', value: rankInfo.rank, color: 'from-amber-400 to-orange-500', bg: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10', truncate: true }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={`${stat.bg} backdrop-blur-sm rounded-xl p-5 border border-border/50`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className={`text-2xl md:text-3xl font-bold text-foreground ${stat.truncate ? 'truncate' : ''}`} title={stat.value}>
                            {stat.value}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Top 3 Usuarios */}
            {topUsers.length > 0 && (
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        Top 3 Ciudadanos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topUsers.slice(0, 3).map((user, index) => (
                            <motion.div
                                key={user.id}
                                whileHover={{ scale: 1.02, y: -3 }}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-5 rounded-xl border ${
                                    index === 0 ? 'bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/30 shadow-lg' :
                                    index === 1 ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30' :
                                    'bg-gradient-to-br from-amber-700/10 to-amber-800/10 border-amber-700/30'
                                } relative`}
                            >
                                {index === 0 && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Crown className="w-8 h-8 text-yellow-400" />
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                        'bg-gradient-to-br from-amber-600 to-amber-700'
                                    }`}>
                                        {user.rankIcon || '👤'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-foreground truncate">
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
                                <div className={`mt-3 text-xs font-bold px-2 py-1 rounded-full w-fit ${
                                    index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                                    index === 1 ? 'bg-gray-500/20 text-gray-300' :
                                    'bg-amber-700/20 text-amber-300'
                                }`}>
                                    #{index + 1} en ranking
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent Reports */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Mis Reportes Recientes</h3>
                        <p className="text-sm text-muted-foreground mt-1">Historial de tus contribuciones</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span>Actualizado en tiempo real</span>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-muted-foreground">Cargando reportes...</p>
                    </div>
                ) : userReports.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No has creado reportes aún</p>
                        <p className="text-sm text-muted-foreground mt-1">¡Comienza a contribuir hoy mismo!</p>
                    </div>
                ) : (
                    <>
                        <div className={`space-y-3 ${showAllReports ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
                            <AnimatePresence>
                                {visibleReports.map((report, index) => (
                                    <motion.div
                                        key={report.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 5 }}
                                        className="bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/80 hover:to-muted/60 transition-all rounded-xl p-4 border border-border"
                                    >
                                        <div className="flex items-start gap-4">
                                            {report.photo && (
                                                <div className="flex-shrink-0">
                                                    <img 
                                                        src={report.photo} 
                                                        alt="Report"
                                                        className="w-20 h-20 object-cover rounded-lg border border-border"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-bold text-foreground truncate">{report.type}</p>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        report.status === 'pending' || report.status === 'EnValidacion' 
                                                            ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border border-yellow-500/30' :
                                                        report.status === 'reviewed' || report.status === 'Validado' 
                                                            ? 'bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-300 border border-sky-500/30' :
                                                        report.status === 'rejected' || report.status === 'Rechazado' 
                                                            ? 'bg-gradient-to-r from-red-500/20 to-pink-600/20 text-red-300 border border-red-500/30' :
                                                        'bg-gradient-to-r from-emerald-500/20 to-green-600/20 text-emerald-300 border border-emerald-500/30'
                                                    }`}>
                                                        {getStatusText(report.status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                    {report.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(report.createdAt).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {hasMoreReports && (
                            <div className="flex justify-center mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleShowAllReports}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-lg hover:from-primary/20 hover:to-secondary/20 transition-all border border-primary/20"
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
                                </motion.button>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default UserProfile;