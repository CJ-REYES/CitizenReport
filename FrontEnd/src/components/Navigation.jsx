import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Map, Gamepad2, LayoutDashboard, Shield, User, Award, LogOut, 
  Sun, Moon, LogIn, UserPlus, Bell, Settings, Trophy, Home, MapPin,
  ChevronDown, ChevronRight, Building, Users, BarChart3, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '../services/authService';
import { checkIfGuest, getStoredUser } from '../utils/authUtils';

const Navigation = ({ currentUser, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [localUser, setLocalUser] = useState(() => {
    return currentUser || getStoredUser();
  });

  useEffect(() => {
    if (currentUser) {
      setLocalUser(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isGuest = checkIfGuest(localUser);

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const ThemeToggle = () => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-600" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-300" />
      )}
    </motion.button>
  );

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/',
      description: 'Resumen de actividad'
    },
    { 
      id: 'map', 
      label: 'Mapa Interactivo', 
      icon: MapPin, 
      path: '/map',
      description: 'Reportes en tiempo real'
    },
    { 
      id: 'game', 
      label: 'Arcade', 
      icon: Gamepad2, 
      path: '/arcade',
      description: 'Minijuegos y recompensas'
    },
    { 
      id: 'leaderboard', 
      label: 'Ranking Global', 
      icon: Trophy, 
      path: '/leaderboard',
      description: 'Posiciones y logros'
    },
  ];

  if (localUser?.role === 'admin') {
    menuItems.push({ 
      id: 'admin', 
      label: 'Administración', 
      icon: Shield, 
      path: '/admin',
      description: 'Panel de control'
    });
  }

  const cleanGuestSession = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('guestSession');
    setLocalUser({});
    if (onLogout) onLogout();
  };

  const handleLoginRedirect = () => {
    cleanGuestSession();
    setTimeout(() => navigate('/login'), 100);
  };

  const handleRegisterRedirect = () => {
    cleanGuestSession();
    setTimeout(() => navigate('/login?tab=register'), 100);
  };

  const handleLogoutClick = () => {
    logout();
    setLocalUser({});
    if (onLogout) onLogout();
    navigate('/info');
  };

  const getUserName = () => {
    return localUser?.name || localUser?.nombreUser || localUser?.username || 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  const getUserPoints = () => {
    return localUser?.puntos || localUser?.points || 0;
  };

  const getUserRank = () => {
    return localUser?.rango || 'Ciudadano Novato';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Desktop Navigation */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="hidden lg:flex flex-col w-72 fixed inset-y-0 z-50"
      >
        {/* Sidebar */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-card to-card/95 backdrop-blur-sm border-r border-border shadow-2xl">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CiudadApp
                </h1>
                <p className="text-xs text-muted-foreground">Transformando ciudades juntos</p>
              </div>
            </div>
          </motion.div>

          {/* User Info */}
          <div className="p-6 border-b border-border">
            {isGuest ? (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Modo Invitado</p>
                    <p className="text-sm text-muted-foreground">Funciones limitadas</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                      {getUserInitials()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground truncate">{getUserName()}</p>
                    <p className="text-sm text-muted-foreground">{getUserRank()}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{getUserPoints()} puntos</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8"
                    >
                      <NavLink to="/profile">
                        <User className="w-4 h-4" />
                      </NavLink>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink to={item.path}>
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: 5 }}
                      className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 shadow-lg' 
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-gradient-to-br from-primary to-secondary' 
                          : 'bg-muted'
                      }`}>
                        <item.icon className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-primary" />
                      )}
                    </motion.div>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              
              {isGuest ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleLoginRedirect}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Ingresar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogoutClick}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Proyecto UTC • Versión 1.0
              </p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`lg:hidden sticky top-0 z-50 backdrop-blur-lg transition-all ${
          scrolled ? 'bg-card/95 shadow-lg' : 'bg-card/80'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg"
              >
                <Building className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-foreground">CiudadApp</h1>
                <p className="text-xs text-muted-foreground">Versión móvil</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-gradient-to-b from-card to-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-4">
                  {/* User Info */}
                  <div className="mb-6">
                    {isGuest ? (
                      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">Modo Invitado</p>
                            <p className="text-sm text-muted-foreground">Funciones limitadas</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{getUserName()}</p>
                            <p className="text-sm text-muted-foreground">{getUserRank()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-2 mb-6">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {({ isActive }) => (
                          <motion.div
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 rounded-xl flex items-center gap-3 ${
                              isActive 
                                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30' 
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${
                              isActive 
                                ? 'bg-gradient-to-br from-primary to-secondary' 
                                : 'bg-muted'
                            }`}>
                              <item.icon className={`w-5 h-5 ${
                                isActive ? 'text-white' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${
                                isActive ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </NavLink>
                    ))}
                  </nav>

                  {/* Actions */}
                  <div className="space-y-3">
                    {isGuest ? (
                      <>
                        <Button
                          onClick={() => {
                            handleLoginRedirect();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                        >
                          <LogIn className="w-5 h-5 mr-2" />
                          Iniciar Sesión
                        </Button>
                        <Button
                          onClick={() => {
                            handleRegisterRedirect();
                            setMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Crear Cuenta
                        </Button>
                      </>
                    ) : (
                      <>
                        <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            <User className="w-5 h-5 mr-2" />
                            Mi Perfil
                          </Button>
                        </NavLink>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleLogoutClick();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                        >
                          <LogOut className="w-5 h-5 mr-2" />
                          Cerrar Sesión
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="lg:pl-72 transition-all duration-300">
        <div className="container mx-auto p-4 lg:p-6">
          {/* Breadcrumb */}
          {location.pathname !== '/' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <NavLink to="/" className="hover:text-foreground transition-colors">
                  <Home className="w-4 h-4" />
                </NavLink>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">
                  {menuItems.find(item => item.path === location.pathname)?.label || 
                   location.pathname.split('/').pop()}
                </span>
              </div>
            </motion.div>
          )}
          
          {children}
        </div>
      </main>

      {/* Floating Action Button (Mobile only) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="lg:hidden fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/map')}
          className="p-4 bg-gradient-to-br from-primary to-secondary rounded-full shadow-2xl"
        >
          <MapPin className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Navigation;