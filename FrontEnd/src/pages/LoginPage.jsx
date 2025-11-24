import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, LogIn, Shield } from 'lucide-react';

const LoginPage = ({ onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { toast } = useToast();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !password || (!isLogin && !username)) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        onLogin(user);
        navigate('/');
      } else {
        toast({
          title: "Error",
          description: "Email o contraseña incorrectos",
          variant: "destructive"
        });
      }
    } else {
      if (users.find(u => u.email === email)) {
        toast({
          title: "Error",
          description: "El email ya está registrado",
          variant: "destructive"
        });
        return;
      }
      
      if (users.find(u => u.username === username)) {
        toast({
          title: "Error",
          description: "El nombre de usuario ya existe",
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

      navigate('/');
    }
  };

  return (
   <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center p-4">



      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >

        {/* Tarjeta */}
        <div className="bg-white rounded-2xl shadow-xl border border-borderLight p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-textMain mb-2">CiudadApp</h1>
            <p className="text-textMuted">Reporta y mejora tu ciudad</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(true)}
              className={`flex-1 ${
                isLogin
                  ? "bg-primary hover:bg-primaryDark text-white"
                  : "border-primary text-primary"
              }`}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>

            <Button
              variant={!isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(false)}
              className={`flex-1 ${
                !isLogin
                  ? "bg-primary hover:bg-primaryDark text-white"
                  : "border-primary text-primary"
              }`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Registrarse
            </Button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div>
                <Label htmlFor="username" className="text-textMain">Usuario</Label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-bgCard border border-borderLight rounded-lg text-textMain placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Tu nombre de usuario"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-textMain">Email</Label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-bgCard border border-borderLight rounded-lg text-textMain placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-textMain">Contraseña</Label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-bgCard border border-borderLight rounded-lg text-textMain placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primaryDark text-white"
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Demo */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primaryDark text-center">
              💡 Demo: Usa admin@test.com / admin
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
