// src/pages/LoginPage.jsx (Botón de Volver Arreglado)

import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  UserPlus, 
  LogIn, 
  Shield, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  MapPin,
  Building,
  Users
} from 'lucide-react';
import { registerUser, loginUser, storeAuthData } from '../services/authService';

const LoginPage = ({ onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDayTheme, setIsDayTheme] = useState(true);
  const { toast } = useToast();

  // Cambiar tema según login/registro
  useEffect(() => {
    setIsDayTheme(isLogin);
  }, [isLogin]);

  // Si ya está autenticado, redirige al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
            const userData = await loginUser(email, password);
            storeAuthData(userData);
            onLogin(userData);
            navigate('/dashboard');
        } else {
            await registerUser(username, email, password);
            toast({
                title: "¡Registro exitoso!",
                description: "Tu cuenta ha sido creada. Por favor, inicia sesión.",
            });
            setIsLogin(true);
            setEmail('');
            setPassword('');
            setUsername('');
        }
    } catch (error) {
        console.error("Error de autenticación:", error.message);
        toast({
            title: "Error de Servidor",
            description: error.message,
            variant: "destructive"
        });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">


      {/* Fondo Animado */}
      <div className="absolute inset-0 z-0">
        {/* Fondo base con gradiente */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isDayTheme ? "day" : "night"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 transition-all duration-1000 ${
              isDayTheme 
                ? 'bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-300' 
                : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900'
            }`}
          />
        </AnimatePresence>

        {/* Elementos del fondo */}
        <div className="absolute inset-0">
          {/* Sol/Luna */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: isDayTheme ? 360 : 0
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              },
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            className={`absolute top-8 right-8 w-16 h-16 rounded-full ${
              isDayTheme 
                ? 'bg-yellow-400 shadow-[0_0_40px_20px_rgba(250,204,21,0.3)]' 
                : 'bg-gray-200 shadow-[0_0_30px_15px_rgba(255,255,255,0.2)]'
            }`}
          >
            {!isDayTheme && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-4 left-4"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full absolute bottom-6 right-6"></div>
                <div className="w-5 h-5 bg-gray-400 rounded-full absolute bottom-4 left-8"></div>
              </div>
            )}
          </motion.div>

          {/* Nubes (solo en día) */}
          {isDayTheme && (
            <>
              <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-16 left-4 w-24 h-8 bg-white/40 rounded-full blur-sm"
              />
              <motion.div
                animate={{ x: [0, -80, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-24 left-1/4 w-20 h-6 bg-white/30 rounded-full blur-sm"
              />
              <motion.div
                animate={{ x: [0, 60, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute top-32 right-1/4 w-28 h-10 bg-white/50 rounded-full blur-sm"
              />
            </>
          )}

          {/* Estrellas (solo en noche) */}
          {!isDayTheme && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    top: `${Math.random() * 50}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </>
          )}

          {/* Edificios */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end">
            {/* Edificio 1 */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-3/4 w-16 ml-8 rounded-t-lg ${
                isDayTheme ? 'bg-gray-800' : 'bg-gray-900'
              }`}
            >
              {/* Ventanas */}
              <div className="grid grid-cols-2 gap-1 p-2">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      backgroundColor: !isDayTheme 
                        ? (Math.random() > 0.5 ? '#fbbf24' : '#374151') 
                        : '#fbbf24'
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.3,
                      repeatType: "reverse" 
                    }}
                    className="h-4 rounded-sm"
                  />
                ))}
              </div>
            </motion.div>

            {/* Edificio 2 */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "80%" }}
              transition={{ duration: 1, delay: 0.4 }}
              className={`h-2/3 w-20 ml-4 rounded-t-lg ${
                isDayTheme ? 'bg-gray-700' : 'bg-gray-800'
              }`}
            >
              <div className="grid grid-cols-3 gap-1 p-2">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      backgroundColor: !isDayTheme 
                        ? (Math.random() > 0.6 ? '#f59e0b' : '#374151') 
                        : '#f59e0b'
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      repeatType: "reverse" 
                    }}
                    className="h-3 rounded-sm"
                  />
                ))}
              </div>
            </motion.div>

            {/* Edificio 3 (más alto) */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 1, delay: 0.6 }}
              className={`h-full w-24 ml-4 rounded-t-lg ${
                isDayTheme ? 'bg-gray-900' : 'bg-gray-950'
              }`}
            >
              <div className="grid grid-cols-4 gap-1 p-2">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      backgroundColor: !isDayTheme 
                        ? (Math.random() > 0.7 ? '#f97316' : '#374151') 
                        : '#f97316'
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      delay: i * 0.1,
                      repeatType: "reverse" 
                    }}
                    className="h-2 rounded-sm"
                  />
                ))}
              </div>
            </motion.div>

            {/* Más edificios a la derecha */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "70%" }}
              transition={{ duration: 1, delay: 0.8 }}
              className={`h-2/3 w-16 ml-4 rounded-t-lg ${
                isDayTheme ? 'bg-gray-800' : 'bg-gray-900'
              }`}
            />

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "60%" }}
              transition={{ duration: 1, delay: 1 }}
              className={`h-3/5 w-12 ml-4 rounded-t-lg ${
                isDayTheme ? 'bg-gray-700' : 'bg-gray-800'
              }`}
            />
          </div>

          {/* Elementos de mapa/calles */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-yellow-500/70"></div>
          
          {/* Líneas de calle */}
          <motion.div
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-2 h-1 bg-white w-16"
          />

          {/* Iconos flotantes */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 360]
            }}
            transition={{ 
              y: { duration: 3, repeat: Infinity },
              rotate: { duration: 8, repeat: Infinity }
            }}
            className="absolute top-1/4 left-8"
          >
            <MapPin className="w-8 h-8 text-primary drop-shadow-lg" />
          </motion.div>

          <motion.div
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/3 right-12"
          >
            <Building className="w-10 h-10 text-secondary drop-shadow-lg" />
          </motion.div>

          {/* Mensaje de bienvenida animado */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "welcome-login" : "welcome-register"}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute top-20 left-12"
            >
              <div className="flex items-center gap-3">
                <Shield className={`w-10 h-10 ${
                  isDayTheme ? 'text-blue-900' : 'text-white'
                }`} />
                <div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                    {isLogin ? 'Bienvenido de vuelta' : 'Únete a la comunidad'}
                  </h2>
                  <p className="text-white/80 text-lg">
                    {isLogin 
                      ? 'Reporta y mejora tu ciudad' 
                      : 'Comienza a hacer la diferencia hoy'}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Tarjeta de Autenticación */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8"
          >
            {/* Encabezado dentro de la tarjeta */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Accede a tu cuenta para continuar' 
                  : 'Regístrate y comienza a reportar'}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-900">
                    Nombre de usuario
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                    Contraseña
                  </Label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Iniciar Sesión
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </form>

            {/* Switch entre login/registro */}
            <div className="mt-6 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {isLogin ? (
                  <>
                    <UserPlus className="w-4 h-4 inline mr-1" />
                    ¿No tienes cuenta? Regístrate
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 inline mr-1" />
                    ¿Ya tienes cuenta? Inicia sesión
                  </>
                )}
              </button>
            </div>


            {/* Enlace de regreso adicional en la tarjeta */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                ← Volver a la página principal
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/90">
              Proyecto CiudadApp • Universidad Tecnológica de Candelaria
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                  className="w-1 h-1 bg-white rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Efectos adicionales */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default LoginPage;