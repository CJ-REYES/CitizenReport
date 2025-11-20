
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, LogIn, Shield } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username || !password || (!isLogin && !email)) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        toast({
          title: "Error",
          description: "Usuario o contraseña incorrectos",
          variant: "destructive"
        });
      }
    } else {
      if (users.find(u => u.username === username)) {
        toast({
          title: "Error",
          description: "El usuario ya existe",
          variant: "destructive"
        });
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        email,
        role: 'citizen',
        points: 0,
        rank: 'Ciudadano Novato',
        reportsCount: 0,
        gameStats: {
          highScore: 0,
          gamesPlayed: 0,
          lives: 5
        },
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      onLogin(newUser);
      
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">CiudadApp</h1>
            <p className="text-slate-400">Reporta y mejora tu ciudad</p>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(true)}
              className="flex-1"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(false)}
              className="flex-1"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Registrarse
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Usuario</Label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Tu nombre de usuario"
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password" className="text-white">Contraseña</Label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300 text-center">
              💡 Demo: Usuario "admin" / Contraseña "admin" para acceso de administrador
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
