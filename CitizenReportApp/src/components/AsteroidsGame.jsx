import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, Dimensions, Vibration, PanResponder, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { Home, RotateCcw, Heart, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;

const AsteroidsGame = ({ onGameEnd, onExit, userStats }) => {
  // --- ESTADOS ---
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [_, setTick] = useState(0);

  // Referencias de física
  const ship = useRef({
    x: width / 2, y: height / 2,
    vx: 0, vy: 0, angle: -Math.PI / 2,
    isThrusting: false, invulnerable: 60,
  });

  const world = useRef({
    asteroids: [],
    bullets: [],
    lastFire: 0,
    lastFrameTime: 0,
    isTouching: false,
    touchOrigin: { x: 0, y: 0 }
  });

  const requestRef = useRef();

  // --- LÓGICA DE REINICIO INTERNO ---
  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    ship.current = {
      x: width / 2, y: height / 2,
      vx: 0, vy: 0, angle: -Math.PI / 2,
      isThrusting: false, invulnerable: 60,
    };
    world.current.asteroids = Array.from({ length: 3 }, () => spawnAsteroid(null, null, 30, 1));
    world.current.bullets = [];
  };

  const spawnAsteroid = useCallback((x, y, size = 30, forceDiff) => {
    const currentDiff = forceDiff || (1 + (score / 2500));
    const speed = (Math.random() - 0.5) * 2.5 * currentDiff;
    return {
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: speed, vy: speed,
      size, id: Math.random().toString(36).substring(7),
    };
  }, [score]);

  useEffect(() => {
    world.current.asteroids = Array.from({ length: 3 }, () => spawnAsteroid());
  }, []);

  // --- CONTROLES ---
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      if (gameOver) return;
      world.current.isTouching = true;
      ship.current.isThrusting = true;
      world.current.touchOrigin = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
    },
    onPanResponderMove: (e) => {
      if (gameOver) return;
      const dx = e.nativeEvent.locationX - world.current.touchOrigin.x;
      const dy = e.nativeEvent.locationY - world.current.touchOrigin.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        ship.current.angle = Math.atan2(dy, dx);
      }
    },
    onPanResponderRelease: () => {
      world.current.isTouching = false;
      ship.current.isThrusting = false;
    }
  }), [gameOver]);

  // --- BUCLE PRINCIPAL ---
  const loop = useCallback((timestamp) => {
    if (!gameOver && timestamp - world.current.lastFrameTime >= MS_PER_FRAME) {
      world.current.lastFrameTime = timestamp;
      const s = ship.current;
      const w = world.current;

      // Física
      if (s.isThrusting) {
        s.vx += Math.cos(s.angle) * 0.22;
        s.vy += Math.sin(s.angle) * 0.22;
      }
      s.vx *= 0.97; s.vy *= 0.97;
      s.x = (s.x + s.vx + width) % width;
      s.y = (s.y + s.vy + height) % height;
      if (s.invulnerable > 0) s.invulnerable--;

      // Disparo
      if (w.isTouching && timestamp - w.lastFire > 250) {
        w.bullets.push({ x: s.x, y: s.y, vx: Math.cos(s.angle) * 9, vy: Math.sin(s.angle) * 9, t: 45, id: Math.random().toString() });
        w.lastFire = timestamp;
      }

      w.bullets = w.bullets.filter(b => {
        b.x += b.vx; b.y += b.vy; b.t--;
        return b.t > 0;
      });

      // Colisiones
      w.asteroids.forEach((ast, i) => {
        ast.x = (ast.x + ast.vx + width) % width;
        ast.y = (ast.y + ast.vy + height) % height;

        w.bullets.forEach((bull, j) => {
          if (Math.hypot(bull.x - ast.x, bull.y - ast.y) < ast.size + 5) {
            setScore(prev => prev + 100);
            if (ast.size > 15) w.asteroids.push(spawnAsteroid(ast.x, ast.y, ast.size / 2));
            w.asteroids.splice(i, 1);
            w.bullets.splice(j, 1);
            Vibration.vibrate(15);
          }
        });

        if (s.invulnerable <= 0 && Math.hypot(s.x - ast.x, s.y - ast.y) < ast.size + 8) {
          Vibration.vibrate(100);
          if (lives <= 1) {
            setLives(0);
            setGameOver(true);
            // Reportamos el final pero NO cerramos la pantalla
            setTimeout(() => {
                onGameEnd({ score, monedasGanadas: Math.floor(score/100), nuevoRecord: score > userStats.mejorScore });
            }, 0);
          } else {
            setLives(l => l - 1);
            s.invulnerable = 90;
            s.x = width/2; s.y = height/2;
            s.vx = 0; s.vy = 0;
          }
        }
      });

      if (w.asteroids.length < 3) w.asteroids.push(spawnAsteroid());
    }

    setTick(t => t + 1);
    requestRef.current = requestAnimationFrame(loop);
  }, [gameOver, lives, score, onGameEnd, spawnAsteroid, userStats.mejorScore]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  return (
    <View style={tw`flex-1 bg-black`} {...panResponder.panHandlers}>
      {/* HUD superior */}
      <View style={tw`absolute top-12 w-full flex-row justify-between px-6 z-10 items-center`}>
        <TouchableOpacity onPress={onExit} style={tw`bg-white/10 p-2 rounded-full`}>
          <Home size={22} color="white" />
        </TouchableOpacity>
        <View style={tw`items-center`}>
          <Text style={tw`text-white font-bold text-2xl`}>{score}</Text>
          <Text style={tw`text-blue-400 text-[10px] uppercase tracking-tighter`}>Nivel de Riesgo x{(1 + score/2500).toFixed(1)}</Text>
        </View>
        <View style={tw`flex-row items-center bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30`}>
          <Heart size={14} color="#ef4444" fill="#ef4444" />
          <Text style={tw`text-white font-bold ml-2 text-base`}>{lives}</Text>
        </View>
      </View>

      <Svg width={width} height={height}>
        {world.current.asteroids.map(a => (
          <Circle key={a.id} cx={a.x} cy={a.y} r={a.size} stroke="#444" strokeWidth="1.5" fill="transparent" />
        ))}
        {world.current.bullets.map(b => (
          <Circle key={b.id} cx={b.x} cy={b.y} r="2.5" fill="#3b82f6" />
        ))}
        {!gameOver && (
          <G transform={`translate(${ship.current.x},${ship.current.y}) rotate(${(ship.current.angle * 180) / Math.PI})`}>
            <Path d="M 12 0 L -8 -8 L -5 0 L -8 8 Z" fill={ship.current.invulnerable % 10 > 5 ? "transparent" : "white"} />
            {ship.current.isThrusting && <Path d="M -8 0 L -18 0" stroke="#f97316" strokeWidth="2" />}
          </G>
        )}
      </Svg>

      {/* PANTALLA DE MUERTE (OVERLAY) */}
      {gameOver && (
        <View style={[tw`absolute inset-0 bg-black/90 items-center justify-center`, { zIndex: 100 }]}>
          <View style={tw`bg-gray-900 p-8 rounded-3xl border border-white/10 items-center w-80 shadow-2xl`}>
            <Text style={tw`text-red-500 text-4xl font-black mb-1`}>GAME OVER</Text>
            <Text style={tw`text-gray-400 mb-6 uppercase tracking-widest`}>Misión Fallida</Text>

            <View style={tw`flex-row justify-around w-full mb-8`}>
                <View style={tw`items-center`}>
                    <Text style={tw`text-gray-500 text-xs`}>SCORE</Text>
                    <Text style={tw`text-white text-2xl font-bold`}>{score}</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text style={tw`text-gray-500 text-xs`}>MONEDAS</Text>
                    <Text style={tw`text-yellow-500 text-2xl font-bold`}>+{Math.floor(score/100)}</Text>
                </View>
            </View>

            <TouchableOpacity 
              onPress={resetGame}
              style={tw`bg-blue-600 w-full py-4 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg shadow-blue-500/30`}
            >
              <RotateCcw size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-bold text-lg`}>REINTENTAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onExit}
              style={tw`bg-gray-800 w-full py-4 rounded-2xl flex-row items-center justify-center`}
            >
              <Home size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-bold text-lg`}>SALIR AL MENÚ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default AsteroidsGame;