// src/pages/LoginPage.jsx (Código actualizado)

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, LogIn, Shield } from 'lucide-react';
// Importamos las funciones del servicio
import { registerUser, loginUser, storeAuthData } from '../services/authService'; // Asegúrate de que la ruta sea correcta

const LoginPage = ({ onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Usaremos 'username' como 'Nombre' para el backend
  const { toast } = useToast();

  // Si ya está autenticado, redirige al dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- [ VALIDACIONES DEL FRONTEND ] ---

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
    
    // --- [ LÓGICA DE LOGIN Y REGISTRO CON EL BACKEND ] ---
    
    try {
        if (isLogin) {
            // 1. Lógica de INICIO DE SESIÓN
            const userData = await loginUser(email, password);

            // 2. Almacenar datos y token en localStorage
            storeAuthData(userData);

            // 3. Llamar a la función onLogin (para actualizar el estado global)
            // Pasamos los datos que necesita el componente padre para saber que el usuario ha iniciado sesión
            onLogin(userData); 
            
            navigate('/');
        } else {
            // 1. Lógica de REGISTRO
            // Usamos 'username' para el campo 'Nombre' del backend
            await registerUser(username, email, password);

            // 2. Mostrar toast de éxito
            toast({
                title: "¡Registro exitoso!",
                description: "Tu cuenta ha sido creada. Por favor, inicia sesión.",
            });

            // 3. Mandar al usuario a la pestaña de login
            setIsLogin(true); // Cambia a la pestaña de Iniciar Sesión

            // Opcional: limpiar campos después de un registro exitoso
            setEmail('');
            setPassword('');
            setUsername(''); 
        }
    } catch (error) {
        console.error("Error de autenticación:", error.message);
        toast({
            title: "Error de Servidor",
            description: error.message, // Muestra el mensaje de error del backend (e.g., "CREDENCIALES INVALIDAS")
            variant: "destructive"
        });
    }
  };

  return (
   <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center p-4">
      {/* ... (Todo el resto del JSX se mantiene igual) ... */}
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
                  placeholder="Tu nombre (se usará como Nombre)"
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