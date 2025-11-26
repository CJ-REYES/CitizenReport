import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Crown, Star, Users, TrendingUp } from 'lucide-react';
import { getRanking, getTopUsers } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

const LeaderboardPage = () => {
    const [users, setUsers] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        loadRankingData();
        
        // Configurar actualización automática cada 30 segundos
        const intervalId = setInterval(() => {
            loadRankingData();
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const loadRankingData = async () => {
        try {
            setLoading(true);
            const [rankingData, topUsersData] = await Promise.all([
                getRanking(),
                getTopUsers()
            ]);

            setUsers(rankingData);
            setTopUsers(topUsersData);

            // Encontrar la posición del usuario actual
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const currentUserId = currentUser.idUser || currentUser.id;
            
            if (currentUserId) {
                const userRank = rankingData.findIndex(user => 
                    user.id === currentUserId
                );
                if (userRank !== -1) {
                    setCurrentUserRank(userRank + 1);
                }
            }
        } catch (error) {
            console.error('Error loading ranking data:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar el ranking de usuarios",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (position) => {
        switch (position) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 2:
                return <Crown className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Award className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="font-bold text-muted-foreground">#{position}</span>;
        }
    };

    const getRankBadge = (user) => {
        return (
            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    user.rankColor && user.rankColor.includes('from-') 
                        ? `bg-gradient-to-br ${user.rankColor}`
                        : 'bg-muted'
                }`}>
                    {user.rankIcon || '👤'}
                </div>
                <span className="text-sm text-muted-foreground">{user.rango}</span>
            </div>
        );
    };

    // CORRECCIÓN: Función para verificar si es el usuario actual
    const checkIfCurrentUser = (user) => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentUserId = currentUser.idUser || currentUser.id;
        return user.id === currentUserId;
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Ranking de Ciudadanos</h1>
                    <p className="text-muted-foreground">Cargando líderes comunitarios...</p>
                </div>
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-muted-foreground">Cargando ranking...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <h1 className="text-4xl font-bold text-foreground">Ranking de Ciudadanos</h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Los ciudadanos más activos y comprometidos con mejorar nuestra comunidad
                </p>
                
                {/* Current User Rank Info */}
                {currentUserRank && (
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-full px-6 py-3"
                    >
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="text-primary font-semibold">
                            Tu posición: <span className="text-foreground">#{currentUserRank}</span>
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Top 3 Podium */}
            {topUsers.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* 2nd Place */}
                    {topUsers[1] && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card/70 backdrop-blur-sm rounded-2xl p-6 border border-border text-center order-2 md:order-1"
                        >
                            <div className="flex justify-center mb-4">
                                <Crown className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
                                topUsers[1].rankColor && topUsers[1].rankColor.includes('from-') 
                                    ? `bg-gradient-to-br ${topUsers[1].rankColor}`
                                    : 'bg-muted'
                            }`}>
                                {topUsers[1].rankIcon || '👤'}
                            </div>
                            <h3 className="font-bold text-foreground text-lg mb-1">{topUsers[1].nombre}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{topUsers[1].rango}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-400">
                                <Star className="w-4 h-4" />
                                <span className="font-bold text-xl">{topUsers[1].puntos}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">puntos</p>
                        </motion.div>
                    )}

                    {/* 1st Place */}
                    {topUsers[0] && (
                        <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/30 text-center order-1 md:order-2 transform scale-105 shadow-xl"
                        >
                            <div className="flex justify-center mb-4">
                                <Trophy className="w-10 h-10 text-yellow-400" />
                            </div>
                            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${
                                topUsers[0].rankColor && topUsers[0].rankColor.includes('from-') 
                                    ? `bg-gradient-to-br ${topUsers[0].rankColor}`
                                    : 'bg-gradient-to-br from-yellow-400 to-amber-500'
                            }`}>
                                {topUsers[0].rankIcon || '👑'}
                            </div>
                            <h3 className="font-bold text-foreground text-xl mb-1">{topUsers[0].nombre}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{topUsers[0].rango}</p>
                            <div className="flex items-center justify-center gap-2 text-yellow-400">
                                <Star className="w-5 h-5" />
                                <span className="font-bold text-2xl">{topUsers[0].puntos}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">puntos totales</p>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {topUsers[2] && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card/70 backdrop-blur-sm rounded-2xl p-6 border border-border text-center order-3"
                        >
                            <div className="flex justify-center mb-4">
                                <Award className="w-8 h-8 text-amber-600" />
                            </div>
                            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
                                topUsers[2].rankColor && topUsers[2].rankColor.includes('from-') 
                                    ? `bg-gradient-to-br ${topUsers[2].rankColor}`
                                    : 'bg-muted'
                            }`}>
                                {topUsers[2].rankIcon || '👤'}
                            </div>
                            <h3 className="font-bold text-foreground text-lg mb-1">{topUsers[2].nombre}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{topUsers[2].rango}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-400">
                                <Star className="w-4 h-4" />
                                <span className="font-bold text-xl">{topUsers[2].puntos}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">puntos</p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Full Ranking Table */}
            <div className="bg-card/70 backdrop-blur-sm rounded-xl border border-border overflow-hidden shadow-lg">
                {/* Table Header */}
                <div className="p-6 bg-muted/50 border-b border-border grid grid-cols-12 gap-4 font-semibold text-muted-foreground">
                    <div className="col-span-1 text-center">Posición</div>
                    <div className="col-span-5">Ciudadano</div>
                    <div className="col-span-3">Rango</div>
                    <div className="col-span-3 text-right">Puntos</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-border">
                    {users.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">No hay usuarios en el ranking</p>
                            <p className="text-sm text-muted-foreground mt-2">Sé el primero en crear reportes y ganar puntos</p>
                        </div>
                    ) : (
                        users.map((user, index) => {
                            const position = index + 1;
                            // CORRECCIÓN: Usar la función correctamente definida
                            const isCurrentUser = checkIfCurrentUser(user);

                            return (
                                <motion.div 
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 grid grid-cols-12 gap-4 items-center transition-all ${
                                        isCurrentUser 
                                            ? 'bg-primary/10 border-l-4 border-l-primary' 
                                            : 'hover:bg-muted/30'
                                    } ${position <= 3 ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20' : ''}`}
                                >
                                    {/* Position */}
                                    <div className="col-span-1 flex justify-center">
                                        {getRankIcon(position)}
                                    </div>

                                    {/* User Info */}
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                                            user.rankColor && user.rankColor.includes('from-') 
                                                ? `bg-gradient-to-br ${user.rankColor}`
                                                : 'bg-muted'
                                        }`}>
                                            {user.rankIcon || '👤'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-semibold truncate ${
                                                    isCurrentUser ? 'text-primary' : 'text-foreground'
                                                }`}>
                                                    {user.nombre}
                                                </p>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                                                        Tú
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* Rank */}
                                    <div className="col-span-3">
                                        {getRankBadge(user)}
                                    </div>

                                    {/* Points */}
                                    <div className="col-span-3 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Star className="w-4 h-4 text-amber-400" />
                                            <span className={`font-bold text-lg ${
                                                isCurrentUser ? 'text-primary' : 'text-foreground'
                                            }`}>
                                                {user.puntos}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">puntos</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Stats Footer */}
            {users.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm text-muted-foreground"
                >
                    <p>Mostrando {users.length} ciudadanos activos • Actualizado cada 30 segundos</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default LeaderboardPage;