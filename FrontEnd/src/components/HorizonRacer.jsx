import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Play, Pause, RotateCcw, Heart, Trophy, ShoppingCart, Crosshair, Gamepad2 } from 'lucide-react';

const MetalSlugger = ({ currentUser, onPointsUpdate }) => {
  const canvasRef = useRef(null);
  const { toast } = useToast();

  // Game State
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(currentUser.gameStats?.lives || 5);
  const [highScore, setHighScore] = useState(currentUser.gameStats?.highScore || 0);

  // Game Mechanics Refs
  const player = useRef({ x: 100, y: 450, w: 40, h: 60, vx: 0, vy: 0, onGround: true, dir: 'right', shootCooldown: 0 });
  const projectiles = useRef([]);
  const enemies = useRef([]);
  const powerUps = useRef([]);
  const explosions = useRef([]);
  const level = useRef(1);
  const ammo = useRef(50);
  const enemySpawnTimer = useRef(0);

  // Parallax Background Refs
  const background = useRef({
    clouds: [],
    farHills: [],
    nearHills: [],
    trees: [],
    bushes: [],
  });

  // Input Refs
  const keys = useRef({ left: false, right: false, up: false, space: false });

  // Constants
  const GRAVITY = 0.6;
  const PLAYER_SPEED = 3;
  const JUMP_FORCE = -15;
  const GROUND_Y = 510;
  const PROJECTILE_SPEED = 10;
  const ENEMY_BASE_SPEED = 1;
  const ENEMY_SPAWN_RATE = 240;

  // --- Drawing Functions ---
  const drawPlayer = (ctx) => {
    const p = player.current;
    ctx.fillStyle = '#f0d0b0'; // Skin
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#228b22'; // Vest
    ctx.fillRect(p.x, p.y + 20, p.w, 30);
    ctx.fillStyle = '#0000cd'; // Pants
    ctx.fillRect(p.x, p.y + 50, p.w, 10);
    ctx.fillStyle = 'black'; // Eye
    const eyeX = p.dir === 'right' ? p.x + p.w - 10 : p.x;
    ctx.fillRect(eyeX, p.y + 10, 10, 10);
    ctx.fillStyle = '#555'; // Gun
    const gunX = p.dir === 'right' ? p.x + p.w : p.x - 20;
    ctx.fillRect(gunX, p.y + 25, 20, 10);
  };

  const drawEnemy = (ctx, enemy) => {
    ctx.fillStyle = '#ff6347'; // Enemy color
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = '#333'; // Visor
    ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.w - 10, 10);
  };
  
  const drawPowerUp = (ctx, powerUp) => {
      ctx.fillStyle = powerUp.type === 'ammo' ? '#ffa500' : '#00ff00';
      ctx.fillRect(powerUp.x, powerUp.y, 20, 20);
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.fillText(powerUp.type === 'ammo' ? 'A' : 'P', powerUp.x + 6, powerUp.y + 15);
  };

  const drawParallaxBackground = (ctx, width, height) => {
    // Sky
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, width, height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    background.current.clouds.forEach(c => ctx.fillRect(c.x, c.y, c.w, c.h));

    // Far Hills
    ctx.fillStyle = '#a0a8b0';
    background.current.farHills.forEach(h => {
        ctx.beginPath();
        ctx.moveTo(h.x, GROUND_Y);
        ctx.lineTo(h.x + h.w / 2, GROUND_Y - h.h);
        ctx.lineTo(h.x + h.w, GROUND_Y);
        ctx.fill();
    });

    // Near Hills
    ctx.fillStyle = '#6b7280';
    background.current.nearHills.forEach(h => {
        ctx.beginPath();
        ctx.moveTo(h.x, GROUND_Y);
        ctx.lineTo(h.x + h.w / 2, GROUND_Y - h.h);
        ctx.lineTo(h.x + h.w, GROUND_Y);
        ctx.fill();
    });

    // Ground
    ctx.fillStyle = '#9b7653';
    ctx.fillRect(0, GROUND_Y, width, height - GROUND_Y);

    // Trees
    background.current.trees.forEach(t => {
      ctx.fillStyle = '#553c2b'; // Trunk
      ctx.fillRect(t.x + t.w * 0.4, GROUND_Y - t.h, t.w * 0.2, t.h);
      ctx.fillStyle = '#228b22'; // Leaves
      ctx.beginPath();
      ctx.arc(t.x + t.w / 2, GROUND_Y - t.h, t.w / 2, Math.PI, 2 * Math.PI);
      ctx.fill();
    });

    // Bushes
    background.current.bushes.forEach(b => {
      ctx.fillStyle = '#2e8b57';
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, GROUND_Y, b.w/2, Math.PI, 2 * Math.PI);
      ctx.fill();
    });
  };

  // --- Main Draw Loop ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    drawParallaxBackground(ctx, width, height);

    drawPlayer(ctx);
    enemies.current.forEach(e => drawEnemy(ctx, e));
    powerUps.current.forEach(p => drawPowerUp(ctx, p));

    ctx.fillStyle = '#ffeb3b';
    projectiles.current.forEach(p => ctx.fillRect(p.x, p.y, 10, 5));

    explosions.current.forEach(exp => {
      ctx.fillStyle = `rgba(255, 165, 0, ${exp.life})`;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius * (1 - exp.life), 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  // --- Game Logic Update ---
  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update Parallax Background
    background.current.clouds.forEach(c => c.x -= c.speed);
    background.current.farHills.forEach(h => h.x -= h.speed);
    background.current.nearHills.forEach(h => h.x -= h.speed);
    background.current.trees.forEach(t => t.x -= t.speed);
    background.current.bushes.forEach(b => b.x -= b.speed);

    // Player Movement
    const p = player.current;
    if (keys.current.left) { p.vx = -PLAYER_SPEED; p.dir = 'left'; }
    else if (keys.current.right) { p.vx = PLAYER_SPEED; p.dir = 'right'; }
    else p.vx = 0;

    if (keys.current.up && p.onGround) { p.vy = JUMP_FORCE; p.onGround = false; }
    
    p.vy += GRAVITY;
    p.x += p.vx;
    p.y += p.vy;

    if (p.y + p.h >= GROUND_Y) { p.y = GROUND_Y - p.h; p.vy = 0; p.onGround = true; }
    p.x = Math.max(0, Math.min(800 - p.w, p.x));

    p.shootCooldown = Math.max(0, p.shootCooldown - 1);
    if (keys.current.space && p.shootCooldown === 0 && ammo.current > 0) {
        projectiles.current.push({ x: p.dir === 'right' ? p.x + p.w : p.x - 10, y: p.y + 30, vx: p.dir === 'right' ? PROJECTILE_SPEED : -PROJECTILE_SPEED });
        p.shootCooldown = 15;
        ammo.current--;
    }

    projectiles.current.forEach(proj => proj.x += proj.vx);

    enemySpawnTimer.current++;
    if (enemySpawnTimer.current > (ENEMY_SPAWN_RATE - level.current * 10)) {
        enemies.current.push({ x: 800, y: GROUND_Y - 50, w: 40, h: 50, vx: -(ENEMY_BASE_SPEED + level.current * 0.2) });
        enemySpawnTimer.current = 0;
    }

    enemies.current.forEach(enemy => {
        enemy.x += enemy.vx;
        if (p.x < enemy.x + enemy.w && p.x + p.w > enemy.x && p.y < enemy.y + enemy.h && p.y + p.h > enemy.y) {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState('gameOver');
              }
              return newLives;
            });
            toast({ title: "¡Te han dado!", description: "Has perdido una vida", variant: "destructive" });
            enemy.dead = true;
        }
    });

    projectiles.current.forEach(proj => {
        enemies.current.forEach(enemy => {
            if (!proj.dead && !enemy.dead && proj.x < enemy.x + enemy.w && proj.x + 10 > enemy.x && proj.y < enemy.y + enemy.h && proj.y + 5 > enemy.y) {
                explosions.current.push({ x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2, radius: 30, life: 1 });
                enemy.dead = true;
                proj.dead = true;
                setScore(s => s + 100);
                if (Math.random() < 0.2) { powerUps.current.push({ x: enemy.x, y: GROUND_Y - 20, type: 'ammo'}); }
            }
        });
    });
    
    powerUps.current.forEach(powerUp => {
        if (!powerUp.dead && p.x < powerUp.x + 20 && p.x + p.w > powerUp.x && p.y < powerUp.y + 20 && p.y + p.h > powerUp.y) {
            if (powerUp.type === 'ammo') ammo.current += 25;
            toast({ title: "¡Recarga!", description: "Has recogido munición" });
            powerUp.dead = true;
        }
    });

    enemies.current = enemies.current.filter(e => !e.dead && e.x + e.w > 0);
    projectiles.current = projectiles.current.filter(p => !p.dead && p.x > 0 && p.x < 800);
    powerUps.current = powerUps.current.filter(p => !p.dead);
    explosions.current = explosions.current.filter(e => (e.life -= 0.05) > 0);

    if (score > level.current * 1000) {
        level.current++;
        toast({ title: `¡Nivel ${level.current}!`, description: "¡Los enemigos son más rápidos!" });
    }

  }, [gameState, score, toast]);
  
  const generateBackgroundElement = (layer, speed, y, w, h) => {
    background.current[layer].push({
        x: 800 + Math.random() * 400,
        y, speed, w, h
    });
  };

  const initBackground = useCallback(() => {
    background.current = { clouds: [], farHills: [], nearHills: [], trees: [], bushes: [] };
    for (let i = 0; i < 5; i++) generateBackgroundElement('clouds', 0.2, Math.random() * 150, 80 + Math.random() * 80, 20 + Math.random() * 20);
    for (let i = 0; i < 10; i++) generateBackgroundElement('farHills', 0.5, 0, 100 + Math.random() * 200, 50 + Math.random() * 100);
    for (let i = 0; i < 10; i++) generateBackgroundElement('nearHills', 1, 0, 150 + Math.random() * 250, 100 + Math.random() * 150);
    for (let i = 0; i < 15; i++) generateBackgroundElement('trees', 1.5, 0, 60 + Math.random() * 40, 80 + Math.random() * 60);
    for (let i = 0; i < 20; i++) generateBackgroundElement('bushes', 2, 0, 40 + Math.random() * 30, 0);
  }, []);

  useEffect(() => {
    const gameLoop = () => {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };
    initBackground();
    const frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [draw, update, initBackground]);

  useEffect(() => {
    const handleKey = (e, value) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft') keys.current.left = value;
      if (e.key === 'ArrowRight') keys.current.right = value;
      if (e.key === 'ArrowUp') keys.current.up = value;
      if (e.key === ' ') keys.current.space = value;
    };
    const handleKeyDown = (e) => handleKey(e, true);
    const handleKeyUp = (e) => handleKey(e, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetGame = () => {
    player.current = { x: 100, y: 450, w: 40, h: 60, vx: 0, vy: 0, onGround: true, dir: 'right', shootCooldown: 0 };
    projectiles.current = [];
    enemies.current = [];
    powerUps.current = [];
    explosions.current = [];
    setScore(0);
    level.current = 1;
    ammo.current = 50;
    initBackground();
  };
  
  const startGame = () => {
    if (lives <= 0) {
      toast({ title: "Sin vidas", description: "Compra más vidas para poder jugar", variant: "destructive" });
      return;
    }
    resetGame();
    setGameState('playing');
  };

  useEffect(() => {
      if (gameState === 'gameOver') {
          const newHighScore = Math.max(highScore, score);
          setHighScore(newHighScore);
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === currentUser.id);
          if (userIndex !== -1) {
              users[userIndex].gameStats = { ...users[userIndex].gameStats, highScore: newHighScore, lives };
              localStorage.setItem('users', JSON.stringify(users));
          }
      }
  }, [gameState, score, highScore, lives, currentUser.id]);
  
  const buyLife = () => {
      const cost = 20;
      if (currentUser.points < cost) {
          toast({ title: "Puntos insuficientes", description: `Necesitas ${cost} puntos para una vida`, variant: "destructive" });
          return;
      }
      onPointsUpdate(-cost);
      setLives(l => l + 1);
      toast({ title: "¡Vida comprada!", description: "Has ganado una vida extra." });
  };
  
  useEffect(() => {
      canvasRef.current.width = 800;
      canvasRef.current.height = 600;
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Metal Slugger</h2>
                <p className="text-slate-400">¡Un arcade de acción y disparos!</p>
            </div>
            <Button variant="outline" onClick={buyLife}><ShoppingCart className="w-4 h-4 mr-2" /> Comprar Vida (20 pts)</Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-sm text-slate-400">Puntuación</p><p className="text-2xl font-bold text-white">{score}</p></div>
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-sm text-slate-400">Vidas</p><p className="text-2xl font-bold text-red-400">{lives}</p></div>
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-sm text-slate-400">Munición</p><p className="text-2xl font-bold text-yellow-400">{ammo.current}</p></div>
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-sm text-slate-400">High Score</p><p className="text-2xl font-bold text-cyan-400">{highScore}</p></div>
        </div>

        <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 border-slate-600">
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
          {gameState !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-center p-4">
              {gameState === 'menu' && <>
                <h3 className="text-4xl font-bold text-white mb-4">Metal Slugger</h3>
                <p className="text-slate-300 mb-2">Flechas para mover, Espacio para disparar.</p>
                <p className="text-slate-300 mb-6">¡Sobrevive a las hordas de enemigos!</p>
                <Button size="lg" onClick={startGame}><Play className="mr-2 h-5 w-5"/>Iniciar Juego</Button>
              </>}
              {gameState === 'paused' && <>
                <h3 className="text-4xl font-bold text-white mb-6">Pausa</h3>
                <div className="flex gap-4">
                    <Button size="lg" onClick={() => setGameState('playing')}><Play className="mr-2 h-5 w-5"/>Continuar</Button>
                    <Button size="lg" variant="secondary" onClick={() => setGameState('menu')}>Menú Principal</Button>
                </div>
              </>}
              {gameState === 'gameOver' && <>
                <h3 className="text-4xl font-bold text-red-500 mb-4">¡Juego Terminado!</h3>
                <p className="text-xl text-slate-300 mb-6">Puntuación final: {score}</p>
                <div className="flex gap-4">
                    <Button size="lg" onClick={startGame}><RotateCcw className="mr-2 h-5 w-5"/>Jugar de Nuevo</Button>
                    <Button size="lg" variant="secondary" onClick={() => setGameState('menu')}>Menú Principal</Button>
                </div>
              </>}
            </div>
          )}
        </div>
        {gameState === 'playing' && 
          <div className="flex justify-center mt-4">
              <Button onClick={() => setGameState('paused')}><Pause className="mr-2 h-4 w-4" />Pausa</Button>
          </div>
        }
      </div>
    </motion.div>
  );
};

export default MetalSlugger;