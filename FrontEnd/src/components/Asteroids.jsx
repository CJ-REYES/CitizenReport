import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Play, RotateCcw, Asterisk } from 'lucide-react';
import { startGame as apiStartGame, saveScore as apiSaveScore } from '@/services/minigameService';

// Configuración del juego
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SHIP_SIZE = 20;
const BULLET_SIZE = 3;
const ASTEROID_BASE_SIZE = 50;
const LIVES_PER_GAME = 3; // 3 vidas por partida

const AsteroidsGame = ({ currentUser, onPointsUpdate, userStats, onStatsUpdate, onRefreshStats }) => {
  const canvasRef = useRef(null);
  const { toast } = useToast();
  const animationRef = useRef();
  
  const userId = currentUser?.idUser;
  const isOnlineMode = !!userId;

  // Estado del juego
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [currentLives, setCurrentLives] = useState(LIVES_PER_GAME); // Vidas de la partida actual

  // Referencias de juego
  const ship = useRef({ 
    x: GAME_WIDTH / 2, 
    y: GAME_HEIGHT / 2, 
    angle: 0, 
    thrust: 0, 
    vx: 0, 
    vy: 0, 
    shootCooldown: 0, 
    invulnerability: 0 
  });
  const asteroids = useRef([]);
  const bullets = useRef([]);
  const keys = useRef({});
  const asteroidSpawnTimer = useRef(0);

  // Spawn de asteroides
  const spawnAsteroid = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;
    const size = ASTEROID_BASE_SIZE;

    switch(side) {
      case 0: // Top
        x = Math.random() * GAME_WIDTH;
        y = -size;
        vx = Math.random() * 2 - 1;
        vy = Math.random() * 1.5 + 0.5;
        break;
      case 1: // Right
        x = GAME_WIDTH + size;
        y = Math.random() * GAME_HEIGHT;
        vx = -(Math.random() * 1.5 + 0.5);
        vy = Math.random() * 2 - 1;
        break;
      case 2: // Bottom
        x = Math.random() * GAME_WIDTH;
        y = GAME_HEIGHT + size;
        vx = Math.random() * 2 - 1;
        vy = -(Math.random() * 1.5 + 0.5);
        break;
      default: // Left
        x = -size;
        y = Math.random() * GAME_HEIGHT;
        vx = Math.random() * 1.5 + 0.5;
        vy = Math.random() * 2 - 1;
    }

    asteroids.current.push({ x, y, vx, vy, size });
  }, []);

  // Fin de partida
  const handleGameOver = useCallback(async (finalScore) => {
    setGameState('gameOver');
    
    // Determinar si es nuevo récord
    const nuevoRecord = finalScore > userStats.mejorScore;
    
    if (finalScore > 0 && isOnlineMode) {
        try {
            // POST /minigame/save-score con userId y score
            const result = await apiSaveScore(userId, finalScore);
            
            // Actualizar estadísticas en ArcadePage
            onStatsUpdate({
              monedas: result.totalMonedas,
              ...(nuevoRecord && { mejorScore: finalScore })
            });

            // Llamar a la función de refresh para obtener datos actualizados del backend
            if (onRefreshStats) {
                setTimeout(() => {
                    onRefreshStats();
                }, 500);
            }

            toast({
                title: "¡Partida Registrada!",
                description: `Ganaste ${result.monedasGanadas} monedas. Total: ${result.totalMonedas}`,
            });
            
            if (onPointsUpdate) onPointsUpdate();
        } catch (error) {
            toast({
                title: "Error al Guardar Score",
                description: error.message || "Tu puntuación no pudo ser registrada.",
                variant: "destructive",
            });
        }
    } else if (finalScore > 0 && !isOnlineMode) {
        // Modo offline: calcular monedas (100 puntos = 1 moneda)
        const monedasGanadas = Math.floor(finalScore / 100);
        const nuevasMonedas = userStats.monedas + monedasGanadas;
        
        // Actualizar stats offline
        onStatsUpdate({
          monedas: nuevasMonedas,
          ...(nuevoRecord && { mejorScore: finalScore })
        });

        toast({
            title: "Puntuación de Prueba",
            description: `Ganaste ${monedasGanadas} monedas. Total: ${nuevasMonedas}`,
            variant: "secondary",
        });
    }
  }, [userId, isOnlineMode, toast, onPointsUpdate, userStats.mejorScore, userStats.monedas, onStatsUpdate, onRefreshStats]);

  // Lógica principal del juego
  const updateGameLogic = useCallback(() => {
    if (gameState !== 'playing') return;

    // Movimiento de la nave
    if (keys.current['ArrowLeft']) ship.current.angle -= 0.05;
    if (keys.current['ArrowRight']) ship.current.angle += 0.05;
    
    ship.current.thrust = keys.current['ArrowUp'] ? 0.1 : 0;
    ship.current.vx += ship.current.thrust * Math.cos(ship.current.angle);
    ship.current.vy += ship.current.thrust * Math.sin(ship.current.angle);
    ship.current.vx *= 0.99;
    ship.current.vy *= 0.99;

    // Actualizar posición
    ship.current.x += ship.current.vx;
    ship.current.y += ship.current.vy;
    
    // Wrap around
    if (ship.current.x < 0) ship.current.x = GAME_WIDTH;
    if (ship.current.x > GAME_WIDTH) ship.current.x = 0;
    if (ship.current.y < 0) ship.current.y = GAME_HEIGHT;
    if (ship.current.y > GAME_HEIGHT) ship.current.y = 0;

    // Disparar
    if (keys.current[' '] && ship.current.shootCooldown === 0) {
        bullets.current.push({
            x: ship.current.x + 10 * Math.cos(ship.current.angle),
            y: ship.current.y + 10 * Math.sin(ship.current.angle),
            vx: 10 * Math.cos(ship.current.angle) + ship.current.vx * 0.5,
            vy: 10 * Math.sin(ship.current.angle) + ship.current.vy * 0.5,
        });
        ship.current.shootCooldown = 20;
    }

    // Actualizar cooldowns
    if (ship.current.shootCooldown > 0) ship.current.shootCooldown--;
    if (ship.current.invulnerability > 0) ship.current.invulnerability--;

    // Mover balas
    bullets.current = bullets.current.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        return b.x > 0 && b.x < GAME_WIDTH && b.y > 0 && b.y < GAME_HEIGHT;
    });

    // Mover asteroides
    asteroids.current.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < -a.size) a.x = GAME_WIDTH + a.size;
        if (a.x > GAME_WIDTH + a.size) a.x = -a.size;
        if (a.y < -a.size) a.y = GAME_HEIGHT + a.size;
        if (a.y > GAME_HEIGHT + a.size) a.y = -a.size;
    });

    // Detectar colisiones
    let newScore = score;
    let asteroidsHit = [];
    let bulletsHit = [];

    // Colisiones bala-asteroide
    bullets.current.forEach((b, bi) => {
        asteroids.current.forEach((a, ai) => {
            const dist = Math.hypot(b.x - a.x, b.y - a.y);
            if (dist < a.size) {
                asteroidsHit.push(ai);
                bulletsHit.push(bi);
                newScore += Math.floor(100 / (a.size / 10));
            }
        });
    });

    // Colisiones nave-asteroide
    if (ship.current.invulnerability === 0) {
        asteroids.current.forEach((a, ai) => {
            const dist = Math.hypot(ship.current.x - a.x, ship.current.y - a.y);
            if (dist < a.size + SHIP_SIZE) {
                const nuevasVidas = currentLives - 1;
                setCurrentLives(nuevasVidas);
                
                if (nuevasVidas <= 0) {
                    handleGameOver(newScore);
                } else {
                    // Resetear posición de la nave
                    ship.current.x = GAME_WIDTH / 2;
                    ship.current.y = GAME_HEIGHT / 2;
                    ship.current.vx = 0;
                    ship.current.vy = 0;
                    ship.current.invulnerability = 120;
                    asteroidsHit.push(ai);
                }
            }
        });
    }

    // Dividir asteroides
    const newAsteroids = [];
    const uniqueAsteroidsHit = [...new Set(asteroidsHit)].sort((a, b) => b - a);

    uniqueAsteroidsHit.forEach(ai => {
        const a = asteroids.current[ai];
        if (a.size > ASTEROID_BASE_SIZE / 4) {
            for (let i = 0; i < 2; i++) {
                newAsteroids.push({
                    x: a.x,
                    y: a.y,
                    vx: a.vx * 1.5 + (Math.random() * 2 - 1),
                    vy: a.vy * 1.5 + (Math.random() * 2 - 1),
                    size: a.size / 2,
                });
            }
        }
    });

    // Actualizar arrays
    asteroids.current = asteroids.current
        .filter((_, ai) => !asteroidsHit.includes(ai))
        .concat(newAsteroids);
    bullets.current = bullets.current.filter((_, bi) => !bulletsHit.includes(bi));
    setScore(newScore);

    // Spawn de nuevos asteroides
    asteroidSpawnTimer.current++;
    if (asteroidSpawnTimer.current > 120 - Math.min(newScore / 50, 100)) {
        spawnAsteroid();
        asteroidSpawnTimer.current = 0;
    }
  }, [gameState, score, handleGameOver, spawnAsteroid, currentLives]);

  // Dibujado
  const drawElements = useCallback((ctx) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Dibujar nave
    ctx.save();
    ctx.translate(ship.current.x, ship.current.y);
    ctx.rotate(ship.current.angle);
    
    const isInvulnerable = ship.current.invulnerability > 0 && 
                          Math.floor(ship.current.invulnerability / 5) % 2 === 0;
    ctx.strokeStyle = isInvulnerable ? 'yellow' : 'white';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.stroke();

    // Empuje
    if (keys.current['ArrowUp'] && gameState === 'playing') {
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(-10, -4);
        ctx.lineTo(-18 + Math.random() * 4, 0);
        ctx.lineTo(-10, 4);
        ctx.fill();
    }
    ctx.restore();

    // Asteroides
    ctx.strokeStyle = 'gray';
    asteroids.current.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Balas
    ctx.fillStyle = 'red';
    bullets.current.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_SIZE, 0, Math.PI * 2);
        ctx.fill();
    });

    // HUD en el juego
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Vidas: ${currentLives}`, GAME_WIDTH - 150, 30);
  }, [score, currentLives, gameState]);

  // Iniciar juego
  const handleStartGame = useCallback(async () => {
    if (isOnlineMode) {
        try {
            // POST /minigame/start-game/{userId} para iniciar partida
            const result = await apiStartGame(userId);
            const nuevasVidasUsuario = result.vidasRestantes;
            
            // Actualizar vidas del usuario en ArcadePage
            onStatsUpdate({
                vidas: nuevasVidasUsuario
            });

            // Llamar a la función de refresh para obtener datos actualizados del backend
            if (onRefreshStats) {
                setTimeout(() => {
                    onRefreshStats();
                }, 500);
            }

            // Resetear juego con 3 vidas por partida
            ship.current = { 
                x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, angle: 0, 
                thrust: 0, vx: 0, vy: 0, shootCooldown: 0, invulnerability: 120 
            };
            asteroids.current = [];
            bullets.current = [];
            setScore(0);
            setCurrentLives(LIVES_PER_GAME);
            asteroidSpawnTimer.current = 0;
            spawnAsteroid();
            setGameState('playing');
        } catch (error) {
            toast({
                title: "Error al Iniciar Partida",
                description: error.message,
                variant: "destructive",
            });
        }
    } else {
        // Modo offline
        if (userStats.vidas > 0) {
            const nuevasVidas = userStats.vidas - 1;
            
            // Actualizar stats offline
            onStatsUpdate({
                vidas: nuevasVidas
            });

            // Resetear juego con 3 vidas por partida
            ship.current = { 
                x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, angle: 0, 
                thrust: 0, vx: 0, vy: 0, shootCooldown: 0, invulnerability: 120 
            };
            asteroids.current = [];
            bullets.current = [];
            setScore(0);
            setCurrentLives(LIVES_PER_GAME);
            asteroidSpawnTimer.current = 0;
            spawnAsteroid();
            setGameState('playing');
        } else {
            toast({
                title: "Sin Vidas",
                description: "No tienes vidas disponibles. Regresa mañana.",
                variant: "destructive",
            });
        }
    }
  }, [userId, isOnlineMode, toast, spawnAsteroid, userStats.vidas, onStatsUpdate, onRefreshStats]);

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key] = true;
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gameLoop = () => {
      updateGameLogic();
      drawElements(ctx);
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationRef.current);
      drawElements(ctx);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, updateGameLogic, drawElements]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg shadow-2xl relative">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="border-2 border-gray-700 bg-black mb-4"
      />

      {gameState !== 'playing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white"
        >
          {gameState === 'menu' && (
            <div className="text-center">
              <h3 className="text-6xl font-extrabold text-white mb-4 flex items-center justify-center">
                <Asterisk className="mr-4 h-12 w-12 text-blue-400" /> 
                Asteroids Retro
              </h3>
              {!isOnlineMode && (
                <p className="text-yellow-400 text-xl font-bold mb-4">
                  MODO PRUEBA - Score no se guarda en servidor
                </p>
              )}
              <p className="text-xl text-gray-400 mb-8">
                Cada partida: <strong>3 vidas</strong> - ¡Haz el mejor score!
              </p>
              <Button 
                size="lg" 
                onClick={handleStartGame}
                disabled={userStats.vidas <= 0}
                className={userStats.vidas <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <Play className="mr-2 h-5 w-5"/>
                {isOnlineMode 
                  ? `Jugar (${userStats.vidas} ${userStats.vidas === 1 ? 'vida' : 'vidas'} disponibles)`
                  : userStats.vidas > 0 
                    ? 'Jugar en Modo Prueba' 
                    : 'Sin Vidas Disponibles'
                }
              </Button>
              {userStats.vidas <= 0 && (
                <p className="text-red-400 mt-4">
                  {isOnlineMode 
                    ? 'Vuelve mañana para más vidas' 
                    : 'Reinicia la página para más vidas de prueba'
                  }
                </p>
              )}
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center">
              <h3 className="text-4xl font-bold text-red-500 mb-4">¡Game Over!</h3>
              <p className="text-xl text-gray-400 mb-2">
                Puntuación final: <span className="text-white font-bold">{score}</span>
              </p>
              {score > userStats.mejorScore && (
                <p className="text-yellow-400 text-lg mb-4">
                  🎉 ¡Nuevo récord personal!
                </p>
              )}
              <div className="flex gap-4 justify-center mt-6">
                {userStats.vidas > 0 ? (
                  <Button size="lg" onClick={handleStartGame}>
                    <RotateCcw className="mr-2 h-5 w-5"/>Jugar Nuevamente
                  </Button>
                ) : (
                  <p className="text-red-500 text-lg">Sin vidas disponibles</p>
                )}
                <Button 
                  size="lg" 
                  variant="secondary" 
                  onClick={() => setGameState('menu')}
                >
                  Volver al Menú
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AsteroidsGame;