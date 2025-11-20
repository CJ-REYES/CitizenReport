
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Play, Pause, RotateCcw, Heart, Trophy, ShoppingCart, Coins, Gamepad2 } from 'lucide-react';

const ArcadeGame = ({ currentUser, onPointsUpdate }) => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(currentUser.gameStats?.lives || 5);
  const [playerPos, setPlayerPos] = useState(50);
  const [obstacles, setObstacles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(5);
  const gameLoopRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    if (user && user.gameStats) {
      setLives(user.gameStats.lives);
    }
  }, [currentUser]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        // Move obstacles
        setObstacles(prev => {
          const updated = prev.map(obs => ({
            ...obs,
            y: obs.y + gameSpeed
          })).filter(obs => obs.y < 100);

          // Add new obstacles
          if (Math.random() < 0.02) {
            updated.push({
              id: Date.now(),
              x: Math.random() * 80 + 10,
              y: -5,
              type: Math.random() > 0.7 ? 'coin' : 'obstacle'
            });
          }

          return updated;
        });

        // Check collisions
        setObstacles(prev => {
          const collisions = prev.filter(obs => {
            const collision = Math.abs(obs.x - playerPos) < 8 && obs.y > 85 && obs.y < 95;
            if (collision) {
              if (obs.type === 'coin') {
                setScore(s => s + 10);
                toast({
                  title: "+10 puntos!",
                  description: "¡Moneda recolectada!",
                });
              } else {
                setLives(l => {
                  const newLives = l - 1;
                  if (newLives <= 0) {
                    setGameState('gameOver');
                  }
                  return newLives;
                });
                toast({
                  title: "¡Colisión!",
                  description: "Has perdido una vida",
                  variant: "destructive"
                });
              }
              return false;
            }
            return true;
          });
          return collisions;
        });

        // Level progression
        if (score > 0 && score % 100 === 0) {
          setLevel(l => l + 1);
          setGameSpeed(s => s + 0.5);
        }
      }, 50);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, playerPos, gameSpeed, score, toast]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState === 'playing') {
        if (e.key === 'ArrowLeft') {
          setPlayerPos(p => Math.max(10, p - 5));
        } else if (e.key === 'ArrowRight') {
          setPlayerPos(p => Math.min(90, p + 5));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  const startGame = () => {
    if (lives <= 0) {
      toast({
        title: "Sin vidas",
        description: "Necesitas comprar más vidas para jugar",
        variant: "destructive"
      });
      return;
    }
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setGameSpeed(5);
    setObstacles([]);
    setPlayerPos(50);
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const endGame = () => {
    setGameState('gameOver');
    
    // Update user stats
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      const currentHighScore = users[userIndex].gameStats?.highScore || 0;
      users[userIndex].gameStats = {
        ...users[userIndex].gameStats,
        highScore: Math.max(currentHighScore, score),
        gamesPlayed: (users[userIndex].gameStats?.gamesPlayed || 0) + 1,
        lives: lives
      };
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  const buyLife = () => {
    const cost = 20;
    if (currentUser.points < cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${cost} puntos para comprar una vida`,
        variant: "destructive"
      });
      return;
    }

    onPointsUpdate(-cost);
    setLives(l => l + 1);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].gameStats = {
        ...users[userIndex].gameStats,
        lives: lives + 1
      };
      localStorage.setItem('users', JSON.stringify(users));
    }

    toast({
      title: "¡Vida comprada!",
      description: "Has ganado una vida adicional",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Arcade Game</h2>
              <p className="text-slate-400 text-sm">¡Esquiva obstáculos y recoge monedas!</p>
            </div>
          </div>
          <Button variant="outline" onClick={buyLife}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar Vida (20 pts)
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Trophy className="w-4 h-4" />
              <span>Puntuación</span>
            </div>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Heart className="w-4 h-4" />
              <span>Vidas</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{lives}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Trophy className="w-4 h-4" />
              <span>Nivel</span>
            </div>
            <p className="text-2xl font-bold text-white">{level}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Coins className="w-4 h-4" />
              <span>High Score</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{currentUser.gameStats?.highScore || 0}</p>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl overflow-hidden border-4 border-slate-700" style={{ height: '500px' }}>
          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
              <h3 className="text-3xl font-bold text-white mb-4">¡Bienvenido al Arcade!</h3>
              <p className="text-slate-400 mb-2">Usa las flechas ← → para moverte</p>
              <p className="text-slate-400 mb-6">Esquiva obstáculos rojos y recoge monedas doradas</p>
              <Button size="lg" onClick={startGame}>
                <Play className="w-5 h-5 mr-2" />
                Iniciar Juego
              </Button>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
              <h3 className="text-3xl font-bold text-white mb-6">Juego Pausado</h3>
              <div className="flex gap-4">
                <Button size="lg" onClick={resumeGame}>
                  <Play className="w-5 h-5 mr-2" />
                  Continuar
                </Button>
                <Button size="lg" variant="outline" onClick={() => setGameState('menu')}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Menú
                </Button>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
              <h3 className="text-3xl font-bold text-white mb-4">¡Juego Terminado!</h3>
              <p className="text-xl text-slate-400 mb-2">Puntuación Final: {score}</p>
              <p className="text-lg text-slate-400 mb-6">Nivel Alcanzado: {level}</p>
              <div className="flex gap-4">
                <Button size="lg" onClick={startGame}>
                  <Play className="w-5 h-5 mr-2" />
                  Jugar de Nuevo
                </Button>
                <Button size="lg" variant="outline" onClick={() => setGameState('menu')}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Menú
                </Button>
              </div>
            </div>
          )}

          {/* Game Elements */}
          {gameState === 'playing' && (
            <>
              {/* Player */}
              <div
                className="absolute bottom-[5%] w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg transition-all duration-100 flex items-center justify-center text-2xl"
                style={{ left: `${playerPos}%`, transform: 'translateX(-50%)' }}
              >
                🚗
              </div>

              {/* Obstacles and Coins */}
              {obstacles.map(obs => (
                <div
                  key={obs.id}
                  className={`absolute w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
                    obs.type === 'coin' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{
                    left: `${obs.x}%`,
                    top: `${obs.y}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {obs.type === 'coin' ? '💰' : '🚧'}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Controls */}
        {gameState === 'playing' && (
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={pauseGame}>
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
            <Button variant="outline" onClick={endGame}>
              Terminar Juego
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2">Instrucciones:</h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Usa las flechas del teclado (← →) para mover tu vehículo</li>
            <li>• Esquiva los obstáculos rojos 🚧 para no perder vidas</li>
            <li>• Recoge las monedas doradas 💰 para ganar puntos</li>
            <li>• Cada 100 puntos subes de nivel y aumenta la velocidad</li>
            <li>• Compra vidas adicionales con tus puntos ganados en reportes</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default ArcadeGame;
