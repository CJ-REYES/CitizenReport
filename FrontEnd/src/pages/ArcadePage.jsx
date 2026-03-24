import React, { useState, useEffect } from 'react';
import AsteroidsGame from '@/components/Asteroids';
import { Heart, Trophy, Coins, RefreshCw, Shield, LogIn, UserPlus, Gamepad2, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserStats } from '@/services/minigameService';
import AuthGuard from '@/components/AuthGuard';
import { logout } from '@/services/authService';
import { checkIfGuest } from '@/utils/authUtils';
import { Button } from '@/components/ui/button';

const ArcadePage = ({ currentUser, onPointsUpdate }) => {
  const MAX_LIVES = 5;
  
  // Estado para las estadísticas del usuario
  const [userStats, setUserStats] = useState({
    vidas: currentUser?.vidas ?? MAX_LIVES,
    monedas: currentUser?.monedas ?? 0,
    mejorScore: 0,
    isLoading: false
  });

  const isOnline = !!currentUser;
  const isGuest = checkIfGuest(currentUser);

  // Limpiar token de invitado
  const clearGuestToken = () => {
    if (isGuest) {
      logout();
      localStorage.removeItem('asteroidsOfflineStats');
      localStorage.removeItem('guestSession');
      return true;
    }
    return false;
  };

  const handleLoginRedirect = () => {
    clearGuestToken();
    window.location.href = '/login';
  };

  const handleRegisterRedirect = () => {
    clearGuestToken();
    window.location.href = '/register';
  };

  // Función para cargar estadísticas desde el backend
  const loadUserStats = async () => {
    if (!isOnline || !currentUser?.idUser || isGuest) return;
    
    setUserStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      const stats = await getUserStats(currentUser.idUser);
      setUserStats({
        vidas: stats.vidas,
        monedas: stats.monedas,
        mejorScore: stats.mejorScore || 0,
        isLoading: false
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      setUserStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    if (isOnline && !isGuest) {
      loadUserStats();
    } else {
      // En modo offline o invitado, cargar desde localStorage
      const savedStats = localStorage.getItem('asteroidsOfflineStats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setUserStats({
          vidas: stats.vidas || MAX_LIVES,
          monedas: stats.monedas || 0,
          mejorScore: stats.mejorScore || 0,
          isLoading: false
        });
      }
    }
  }, [currentUser, isOnline, isGuest]);

  // Widgets de Estadísticas del Usuario (mejorados visualmente)
  const StatsWidgets = () => (
    <div className="flex justify-center w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Widget de Vidas */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-blue-300 font-medium">Vidas Restantes</p>
                {userStats.isLoading ? (
                  <div className="flex items-center gap-2 mt-1">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-white text-sm">Cargando...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-white">{userStats.vidas}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-300">Máximo: {MAX_LIVES}</p>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <Heart 
                    key={i}
                    className={`h-4 w-4 ${i < userStats.vidas ? 'text-red-400 fill-red-400' : 'text-gray-500'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Widget de Mejor Score */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-purple-300 font-medium">Mejor Score</p>
                {userStats.isLoading ? (
                  <div className="flex items-center gap-2 mt-1">
                    <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                    <span className="text-white text-sm">Cargando...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-white">{userStats.mejorScore}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-300">Récord Personal</p>
              <p className="text-xs text-purple-300 mt-2">
                {userStats.mejorScore > 0 ? '🏆 Activo' : '🎯 Sin récord'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Widget de Monedas */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Coins className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-green-300 font-medium">Monedas Totales</p>
                {userStats.isLoading ? (
                  <div className="flex items-center gap-2 mt-1">
                    <RefreshCw className="h-4 w-4 animate-spin text-green-400" />
                    <span className="text-white text-sm">Cargando...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-white">{userStats.monedas}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-300">Modo</p>
              <p className="text-xs text-green-300 mt-2">
                {isGuest ? '👤 Invitado' : isOnline ? '🟢 Online' : '🟡 Offline'}
              </p>
              {isOnline && !isGuest && (
                <button 
                  onClick={loadUserStats}
                  className="text-xs text-green-400 hover:text-green-300 mt-2 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Actualizar
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Manejar actualización de estadísticas desde el juego
  const handleStatsUpdate = (newStats) => {
    if (isGuest) return; // Invitados no pueden actualizar estadísticas
    
    setUserStats(prev => {
      const updated = { ...prev, ...newStats };
      
      // Guardar en localStorage si está en modo offline
      if (!isOnline) {
        localStorage.setItem('asteroidsOfflineStats', JSON.stringify(updated));
      }
      
      return updated;
    });

    // Recargar estadísticas desde el backend después de un momento
    if (isOnline && !isGuest) {
      setTimeout(() => {
        loadUserStats();
      }, 1000);
    }

    // Notificar al componente padre si es necesario
    if (onPointsUpdate && newStats.monedas !== undefined) {
      onPointsUpdate();
    }
  };

  return (
    <AuthGuard 
      currentUser={currentUser} 
      action="jugar al minijuego"
      showAfterSeconds={5}
    >
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* Encabezado */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
            >
              <Gamepad2 className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">Arcade Retro</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Asteroids Retro
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {isGuest 
                ? "Inicia sesión para jugar, ganar monedas y competir en el ranking." 
                : "Destruye asteroides, sobrevive y gana monedas. Cada partida consume 1 vida."}
            </motion.p>
            {isGuest && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-4 mt-4"
              >
                <Button onClick={handleLoginRedirect} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Button>
                <Button onClick={handleRegisterRedirect} variant="outline" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </Button>
              </motion.div>
            )}
          </div>

          {/* Widgets de Estadísticas */}
          <StatsWidgets />

          {/* Juego */}
          <div className="flex justify-center">
            <AsteroidsGame 
              currentUser={currentUser}
              onPointsUpdate={onPointsUpdate}
              userStats={userStats}
              onStatsUpdate={handleStatsUpdate}
              onRefreshStats={loadUserStats}
            />
          </div>

          {/* Información del Juego */}
          {!isGuest && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">🎮 Cómo Jugar</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong className="text-foreground">Flechas ← →</strong> para girar la nave</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong className="text-foreground">Flecha ↑</strong> para acelerar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong className="text-foreground">Espacio</strong> para disparar</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong className="text-foreground">Destruye asteroides</strong> para ganar puntos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong className="text-foreground">100 puntos = 1 moneda</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong className="text-foreground">3 vidas por partida</strong> - ¡Cuidado con los asteroides!</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Información adicional */}
          {!isOnline && !isGuest && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center"
            >
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Modo Prueba:</strong> Tu progreso se guarda localmente. 
                {userStats.vidas <= 0 && ' Recarga la página para obtener más vidas de prueba.'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default ArcadePage;