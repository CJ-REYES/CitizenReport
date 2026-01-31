import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Award, Medal, Crown, Star, Users, TrendingUp, 
  GamepadIcon, Zap, Target, BarChart3, Sparkles, Flame,
  Calendar, RefreshCw, ChevronRight, Filter, Search,
  TrendingDown, Shield, UserCircle, Globe
} from 'lucide-react';
import { getRanking, getTopUsers } from '@/services/userService';
import { getMinigameRanking } from '@/services/minigameService';
import { useToast } from '@/components/ui/use-toast';

// Hook para manejar los datos del ranking (USADO SOLO POR COMPONENTES ESPECÍFICOS)
const useRankingData = () => {
  const { toast } = useToast();
  const [rankingState, setRankingState] = useState({
    users: [],
    topUsers: [],
    minigameRanking: [],
    minigameTopUsers: [],
    loading: true,
    currentUserRank: null,
  });

  const loadRankingData = useCallback(async () => {
    try {
      setRankingState(prev => ({ ...prev, loading: true }));
      const [rankingData, topUsersData, minigameData] = await Promise.all([
        getRanking(),
        getTopUsers(),
        getMinigameRanking()
      ]);

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const currentUserId = currentUser.idUser || currentUser.id;
      let userRank = null;

      if (currentUserId) {
        const rankIndex = rankingData.findIndex(user => user.id === currentUserId);
        if (rankIndex !== -1) {
          userRank = rankIndex + 1;
        }
      }

      setRankingState({
        users: rankingData.slice(0, 10),
        topUsers: topUsersData,
        minigameRanking: minigameData,
        minigameTopUsers: minigameData.slice(0, 10),
        loading: false,
        currentUserRank: userRank,
      });
    } catch (error) {
      console.error('Error loading ranking data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el ranking de usuarios",
        variant: "destructive"
      });
      setRankingState(prev => ({ ...prev, loading: false }));
    }
  }, [toast]);

  // Este efecto solo se ejecuta cuando este hook es usado
  useEffect(() => {
    let intervalId;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalId);
      } else {
        loadRankingData();
        intervalId = setInterval(loadRankingData, 30000);
      }
    };

    loadRankingData();

    if (!document.hidden) {
      intervalId = setInterval(loadRankingData, 30000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadRankingData]);

  return { rankingState, loadRankingData };
};

// Componente: PodiumCard (ESTÁTICO - no se actualiza)
const PodiumCard = ({ user, position, delay, order }) => {
  return (
    <motion.div 
      key={`podium-${position}-${user.id}`}
      initial={{ y: position === 1 ? -30 : 30, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl p-8 border-2 text-center ${order} ${
        position === 1 
          ? 'bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800 shadow-2xl shadow-yellow-500/20 transform scale-105 z-10'
          : position === 2
          ? 'bg-gradient-to-b from-gray-50 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 border-gray-200 dark:border-gray-800 shadow-lg'
          : 'bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 shadow-lg'
      }`}
    >
      {position === 1 && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <Crown className="w-4 h-4" />
            TOP 1
          </div>
        </div>
      )}
      
      <div className="flex justify-center mb-6">
        {position === 1 && <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />}
        {position === 2 && <Crown className="w-12 h-12 text-gray-400" />}
        {position === 3 && <Award className="w-12 h-12 text-amber-600" />}
      </div>
      
      <div className="relative mb-6">
        <div className={`mx-auto rounded-full flex items-center justify-center text-3xl ${
          position === 1 ? 'w-32 h-32 text-4xl ring-4 ring-yellow-200 dark:ring-yellow-800' : 
          position === 2 ? 'w-28 h-28 ring-4 ring-gray-200 dark:ring-gray-800' : 
          'w-28 h-28 ring-4 ring-amber-200 dark:ring-amber-800'
        } ${
          user.rankColor && user.rankColor.includes('from-') 
            ? `bg-gradient-to-br ${user.rankColor}`
            : position === 1 
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500' 
            : position === 2
            ? 'bg-gradient-to-br from-gray-300 to-slate-400'
            : 'bg-gradient-to-br from-amber-400 to-orange-500'
        }`}>
          {user.rankIcon || (position === 1 ? '👑' : position === 2 ? '🥈' : '🥉')}
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-full px-3 py-1 shadow-md">
          <span className="text-xs font-bold text-foreground">#{position}</span>
        </div>
      </div>
      
      <h3 className={`font-bold text-foreground mb-2 ${
        position === 1 ? 'text-2xl' : 'text-xl'
      }`}>
        {user.nombre}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{user.rango}</p>
      
      <div className={`flex items-center justify-center gap-2 ${
        position === 1 ? 'text-yellow-500' : 
        position === 2 ? 'text-gray-500' : 
        'text-amber-500'
      }`}>
        <Star className={position === 1 ? "w-6 h-6" : "w-5 h-5"} fill="currentColor" />
        <span className={`font-bold ${
          position === 1 ? 'text-3xl' : 'text-2xl'
        }`}>
          {user.puntos.toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">puntos totales</p>
    </motion.div>
  );
};

// Componente: PodiumSection (USA SUS PROPIOS DATOS Y SE ACTUALIZA SOLO)
const PodiumSection = () => {
  const { rankingState } = useRankingData();
  const { topUsers } = rankingState;

  if (topUsers.length < 3) return null;

  const podiumUsers = [
    { user: topUsers[1], position: 2, delay: 0.1, order: 'order-2 md:order-1' },
    { user: topUsers[0], position: 1, delay: 0, order: 'order-1 md:order-2' },
    { user: topUsers[2], position: 3, delay: 0.2, order: 'order-3' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {podiumUsers.map((podiumUser) => (
        <PodiumCard key={`podium-${podiumUser.position}`} {...podiumUser} />
      ))}
    </div>
  );
};

// Componente: StatsCard (ESTÁTICO)
const StatsCard = React.memo(({ icon: Icon, value, label, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card border border-border rounded-xl p-4 text-center"
  >
    <div className={`w-12 h-12 ${color}/10 rounded-full flex items-center justify-center mx-auto mb-3`}>
      <Icon className={`w-6 h-6 text-${color}`} />
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </motion.div>
));

// Componente: StatsSection (USA SUS PROPIOS DATOS Y SE ACTUALIZA SOLO)
const StatsSection = () => {
  const { rankingState } = useRankingData();
  const { users } = rankingState;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatsCard
            icon={Users}
            value={`${users.length}+`}
            label="Ciudadanos Activos"
            color="blue-500"
            delay={0.1}
          />
          <StatsCard
            icon={Flame}
            value={users.reduce((sum, user) => sum + user.puntos, 0).toLocaleString()}
            label="Puntos Totales"
            color="amber-500"
            delay={0.2}
          />
          <StatsCard
            icon={TrendingUp}
            value="30s"
            label="Actualización"
            color="green-500"
            delay={0.3}
          />
          <StatsCard
            icon={Globe}
            value="2"
            label="Rankings"
            color="purple-500"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};

// Componente: RankingRow (ESTÁTICO)
const RankingRow = React.memo(({ user, position, type = 'general' }) => {
  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400 animate-pulse" />;
      case 2:
        return <Crown className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Award className="w-7 h-7 text-amber-600" />;
      default:
        if (position <= 10) {
          return <span className="font-bold text-lg text-primary">#{position}</span>;
        }
        return <span className="font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentUserId = currentUser.idUser || currentUser.id;
  const isCurrentUser = type === 'minigame' 
    ? (user.userId === currentUserId || user.id === currentUserId)
    : user.id === currentUserId;

  return (
    <motion.tr 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: position * 0.05 }}
      className={`border-b border-border last:border-0 ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-primary/10 to-transparent' 
          : 'hover:bg-muted/30'
      } ${position <= 3 ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20' : ''}`}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          {getRankIcon(position)}
          {position <= 3 && (
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse"></div>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
            type === 'general' && user.rankColor && user.rankColor.includes('from-') 
              ? `bg-gradient-to-br ${user.rankColor}`
              : type === 'minigame'
              ? 'bg-gradient-to-br from-blue-400 to-purple-500'
              : 'bg-gradient-to-br from-primary/20 to-secondary/20'
          }`}>
            {type === 'minigame' && user.fotoPerfil ? (
              <img 
                src={user.fotoPerfil} 
                alt={user.userName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              type === 'minigame' ? '🎮' : (user.rankIcon || '👤')
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${
                isCurrentUser ? (type === 'minigame' ? 'text-blue-500' : 'text-primary') : 'text-foreground'
              }`}>
                {type === 'minigame' ? (user.userName || user.nombre) : user.nombre}
              </p>
              {isCurrentUser && (
                <span className={`px-2 py-1 ${type === 'minigame' ? 'bg-blue-500 text-white' : 'bg-primary text-primary-foreground'} text-xs rounded-full`}>
                  Tú
                </span>
              )}
              {position === 1 && type === 'general' && (
                <Sparkles className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {type === 'minigame' ? 'Minijuego' : user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        {type === 'general' ? (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              user.rankColor && user.rankColor.includes('from-') 
                ? `bg-gradient-to-br ${user.rankColor}`
                : 'bg-gradient-to-br from-primary/20 to-secondary/20'
            }`}>
              {user.rankIcon || '👤'}
            </div>
            <span className="text-sm font-medium text-foreground">{user.rango}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
            <GamepadIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Arcade</span>
          </div>
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
          <span className={`font-bold ${
            isCurrentUser ? (type === 'minigame' ? 'text-blue-500' : 'text-primary') : 'text-foreground'
          }`}>
            {type === 'minigame' 
              ? (user.highScore || user.maxScore || user.puntos)
              : user.puntos.toLocaleString()
            }
          </span>
          {type === 'general' && position < 3 && (
            <TrendingUp className="w-4 h-4 text-green-500" />
          )}
        </div>
      </td>
    </motion.tr>
  );
});

// Componente: RankingTable (USA SUS PROPIOS DATOS Y SE ACTUALIZA SOLO)
const RankingTable = React.memo(({ 
  title, 
  description, 
  icon, 
  type = 'general',
  emptyIcon: EmptyIcon,
  emptyMessage,
  color = 'primary'
}) => {
  const { rankingState } = useRankingData();
  const data = type === 'general' ? rankingState.users : rankingState.minigameTopUsers;

  return (
    <motion.div 
      initial={{ opacity: 0, x: type === 'general' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
    >
      <div className={`p-6 ${type === 'general' ? 'bg-gradient-to-r from-primary/10 to-secondary/10' : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'} border-b border-border`}>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          {icon}
          {title}
          <span className={`text-sm font-normal ${type === 'general' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'} px-3 py-1 rounded-full`}>
            Top {Math.min(data.length, 10)}
          </span>
        </h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left p-4 text-muted-foreground font-medium">Posición</th>
              <th className="text-left p-4 text-muted-foreground font-medium">
                {type === 'general' ? 'Ciudadano' : 'Jugador'}
              </th>
              <th className="text-left p-4 text-muted-foreground font-medium">
                {type === 'general' ? 'Rango' : 'Tipo'}
              </th>
              <th className="text-left p-4 text-muted-foreground font-medium">
                {type === 'general' ? 'Puntos' : 'Puntuación'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center">
                  <EmptyIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.slice(0, 10).map((user, index) => (
                <RankingRow
                  key={type === 'general' ? `user-${user.id}-${index}` : `minigame-${user.userId || user.id || index}`}
                  user={user}
                  position={index + 1}
                  type={type}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
});

// Componente: HeroSection (USA SUS PROPIOS DATOS Y SE ACTUALIZA SOLO)
const HeroSection = () => {
  const { rankingState } = useRankingData();
  const { currentUserRank } = rankingState;

  return (
    <section className="pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Ranking en Tiempo Real</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Tabla de Líderes
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Los ciudadanos más activos y comprometidos con mejorar nuestra comunidad
          </p>
          
          {currentUserRank && (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-full px-6 py-3 shadow-lg"
            >
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-foreground font-semibold">
                Tu posición: <span className="text-primary">#{currentUserRank}</span>
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// Componente principal SIN lógica de actualización
const LeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    
    // NOTA: El componente principal NO usa useRankingData
    // Los componentes individuales manejan sus propias actualizaciones

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            <HeroSection />
            
            <StatsSection />
            
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Los Más Destacados</h2>
                        <p className="text-muted-foreground">Los 3 ciudadanos con mayor puntuación este mes</p>
                    </div>
                    <PodiumSection />
                </div>
            </section>

            {/* Tabs Section */}
            <section className="py-8 bg-muted/30">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <button
                      className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                        activeTab === 'general' 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'bg-card border border-border hover:bg-muted'
                      }`}
                      onClick={() => setActiveTab('general')}
                    >
                      <Trophy className="w-5 h-5 inline mr-2" />
                      Ranking General
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                        activeTab === 'minigame' 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'bg-card border border-border hover:bg-muted'
                      }`}
                      onClick={() => setActiveTab('minigame')}
                    >
                      <GamepadIcon className="w-5 h-5 inline mr-2" />
                      Minijuegos
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4" />
                    <span>Actualizado cada 30 segundos</span>
                  </div>
                </div>
              </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RankingTable
                        title="Ranking Principal"
                        description="Ciudadanos más activos del sistema"
                        icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                        type="general"
                        emptyIcon={Users}
                        emptyMessage="No hay usuarios en el ranking"
                        color="primary"
                    />
                    
                    <RankingTable
                        title="Ranking de Minijuegos"
                        description="Mejores puntuaciones en juegos"
                        icon={<GamepadIcon className="w-6 h-6 text-blue-500" />}
                        type="minigame"
                        emptyIcon={GamepadIcon}
                        emptyMessage="No hay puntuaciones del minijuego"
                        color="blue"
                    />
                </div>
            </div>

            {/* Sección de ayuda (estática - no se actualiza) */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-2xl p-8 text-center"
                    >
                        <h3 className="text-2xl font-bold text-foreground mb-4">¿Cómo subir en el ranking?</h3>
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-card border border-border rounded-xl p-6">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Target className="w-6 h-6 text-green-500" />
                            </div>
                            <h4 className="font-bold text-foreground mb-2">Crea Reportes</h4>
                            <p className="text-sm text-muted-foreground">Gana puntos por cada reporte de problemas urbanos</p>
                          </div>
                          <div className="bg-card border border-border rounded-xl p-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Shield className="w-6 h-6 text-blue-500" />
                            </div>
                            <h4 className="font-bold text-foreground mb-2">Valida Reportes</h4>
                            <p className="text-sm text-muted-foreground">Verifica reportes de otros ciudadanos para ganar puntos</p>
                          </div>
                          <div className="bg-card border border-border rounded-xl p-6">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <GamepadIcon className="w-6 h-6 text-purple-500" />
                            </div>
                            <h4 className="font-bold text-foreground mb-2">Juega Minijuegos</h4>
                            <p className="text-sm text-muted-foreground">Participa en juegos para ganar puntos adicionales</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          {/* Este botón ya no hace nada ya que los componentes se actualizan automáticamente */}
                          <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg opacity-50 cursor-not-allowed">
                            <RefreshCw className="w-5 h-5" />
                            Actualización automática activada
                          </div>
                          <button className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                            Ver Estadísticas Completas
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LeaderboardPage;