import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Trophy, Coins, Zap } from 'lucide-react';

const UserStatsWidgets = ({ userStats, currentUser, isOnline }) => {
  const MAX_LIVES = 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl mb-6">
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
            <p className="text-2xl font-bold text-white">{userStats.vidas}</p>
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
            <p className="text-2xl font-bold text-white">{userStats.mejorScore}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-purple-300">Récord Personal</p>
          <p className="text-xs text-purple-300 mt-1">
            {userStats.ultimoScore > userStats.mejorScore ? '🔥 Nuevo!' : ''}
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
            <p className="text-2xl font-bold text-white">{userStats.monedas}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-300">Modo</p>
          <p className="text-xs text-green-300 mt-1">
            {isOnline ? '🟢 Online' : '🟡 Offline'}
          </p>
        </div>
      </motion.div>

      {/* Widget de Estado */}
      <motion.div 
        className="bg-orange-600/20 border border-orange-500 rounded-lg p-4 flex items-center justify-between"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center">
          <Zap className="h-8 w-8 text-orange-400 mr-3" />
          <div>
            <p className="text-sm text-orange-200">Estado</p>
            <p className="text-lg font-bold text-white">
              {userStats.vidas > 0 ? 'Listo para Jugar' : 'Sin Vidas'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-orange-300">Usuario</p>
          <p className="text-xs text-orange-300 mt-1">
            {currentUser?.nombre || 'Invitado'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserStatsWidgets;