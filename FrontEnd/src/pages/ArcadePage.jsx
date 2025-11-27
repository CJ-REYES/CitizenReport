import React, { useState, useEffect } from 'react';
import AsteroidsGame from '@/components/Asteroids';
import { Heart, Trophy, Coins, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserStats, getUserMinigameStats } from '@/services/minigameService';

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

  // Función para cargar estadísticas desde el backend
  const loadUserStats = async () => {
    if (!isOnline || !currentUser?.idUser) return;
    
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
    if (isOnline) {
      loadUserStats();
    } else {
      // En modo offline, cargar desde localStorage
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
  }, [currentUser, isOnline]);

  // Widgets de Estadísticas del Usuario
  const StatsWidgets = () => (
    <div className="flex justify-center w-full mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        {/* Widget de Vidas */}
        <motion.div 
          className="bg-blue-600/20 border border-blue-500 rounded-lg p-4 flex items-center justify-between"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-400 mr-3" />
            <div>
              <p className="text-sm text-blue-200">Vidas Restantes</p>
              {userStats.isLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-white">Cargando...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">{userStats.vidas}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-300">Máximo: {MAX_LIVES}</p>
            <div className="flex mt-1">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <Heart 
                  key={i}
                  className={`h-4 w-4 ${i < userStats.vidas ? 'text-red-400 fill-red-400' : 'text-gray-400'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Widget de Mejor Score */}
        <motion.div 
          className="bg-purple-600/20 border border-purple-500 rounded-lg p-4 flex items-center justify-between"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-purple-200">Mejor Score</p>
              {userStats.isLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-white">Cargando...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">{userStats.mejorScore}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-purple-300">Récord Personal</p>
            <p className="text-xs text-purple-300 mt-1">
              {userStats.mejorScore > 0 ? '🏆 Activo' : '🎯 Sin récord'}
            </p>
          </div>
        </motion.div>

        {/* Widget de Monedas */}
        <motion.div 
          className="bg-green-600/20 border border-green-500 rounded-lg p-4 flex items-center justify-between"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-green-200">Monedas Totales</p>
              {userStats.isLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-white">Cargando...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">{userStats.monedas}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-300">Modo</p>
            <p className="text-xs text-green-300 mt-1">
              {isOnline ? '🟢 Online' : '🟡 Offline'}
            </p>
            {isOnline && (
              <button 
                onClick={loadUserStats}
                className="text-xs text-green-400 hover:text-green-300 mt-1 flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Actualizar
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Manejar actualización de estadísticas desde el juego
  const handleStatsUpdate = (newStats) => {
    setUserStats(prev => {
      const updated = { ...prev, ...newStats };
      
      // Guardar en localStorage si está en modo offline
      if (!isOnline) {
        localStorage.setItem('asteroidsOfflineStats', JSON.stringify(updated));
      }
      
      return updated;
    });

    // Recargar estadísticas desde el backend después de un momento
    if (isOnline) {
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Arcade: Asteroids Retro</h1>
        <p className="text-muted-foreground mt-2">
          Destruye asteroides, sobrevive y gana monedas. Cada partida consume 1 vida.
        </p>
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
          onRefreshStats={loadUserStats} // Pasar función para refrescar
        />
      </div>

      {/* Información del Juego */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-white mb-2">🎮 Cómo Jugar</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Flechas ← →</strong> para girar la nave</li>
          <li>• <strong>Flecha ↑</strong> para acelerar</li>
          <li>• <strong>Espacio</strong> para disparar</li>
          <li>• <strong>Destruye asteroides</strong> para ganar puntos</li>
          <li>• <strong>100 puntos = 1 moneda</strong></li>
          <li>• <strong>3 vidas por partida</strong> - ¡Cuidado con los asteroides!</li>
        </ul>
      </div>

      {/* Información adicional */}
      {!isOnline && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-center">
          <p className="text-yellow-200">
            <strong>Modo Prueba:</strong> Tu progreso se guarda localmente. 
            {userStats.vidas <= 0 && ' Recarga la página para obtener más vidas de prueba.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArcadePage;