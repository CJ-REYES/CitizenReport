import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Map, Gamepad2, LayoutDashboard, Shield, User, Award, LogOut, Sun, Moon, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '../services/authService';
import { checkIfGuest, getStoredUser } from '../utils/authUtils';

const Navigation = ({ currentUser, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Estado para el tema
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Estado local para el usuario
  const [localUser, setLocalUser] = useState(() => {
    return currentUser || getStoredUser();
  });

  // Sincronizar cuando cambia currentUser de las props
  useEffect(() => {
    if (currentUser) {
      setLocalUser(currentUser);
    }
  }, [currentUser]);

  // Aplicar tema
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Verificar si es invitado
  const isGuest = checkIfGuest(localUser);

  // Toggle del tema
  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const ThemeToggle = ({ isMobile = false }) => (
    <Button
      variant="ghost"
      size={isMobile ? "default" : "icon"}
      onClick={toggleTheme}
      className={`text-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-accent/50 transition-colors ${
        isMobile ? 'w-full justify-start mb-2' : ''
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
      {isMobile && <span>{theme === 'light' ? 'Tema Oscuro' : 'Tema Claro'}</span>}
    </Button>
  );

  // Definir items del menú
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'map', label: 'Mapa', icon: Map, path: '/map' },
    { id: 'game', label: 'Arcade', icon: Gamepad2, path: '/arcade' },
    { id: 'leaderboard', label: 'Ranking', icon: Award, path: '/leaderboard' },
  ];

  if (localUser?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/admin' });
  }

  // Función completa para limpiar datos de invitado
  const cleanGuestSession = () => {
    console.log('Limpiando sesión de invitado...');
    
    // 1. Eliminar datos de autenticación
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('guestSession');
    
    // 2. Mantener progreso del juego (opcional)
    // localStorage.removeItem('asteroidsOfflineStats');
    
    // 3. Forzar recarga del estado
    setLocalUser({});
    
    // 4. Notificar al componente padre si existe
    if (onLogout) {
      onLogout();
    }
    
    console.log('Sesión de invitado limpiada');
  };

  // Redirección a login - VERSIÓN SEGURA
  const handleLoginRedirect = () => {
    console.log('Redirigiendo a login...');
    
    // Limpiar sesión de invitado
    cleanGuestSession();
    
    // Usar window.location.href para forzar la recarga completa
    // Esto evita problemas con React Router
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
    
    // También intentar con navigate como fallback
    setTimeout(() => {
      navigate('/login');
    }, 50);
  };

  // Redirección a registro
  const handleRegisterRedirect = () => {
    cleanGuestSession();
    
    setTimeout(() => {
      window.location.href = '/register';
    }, 100);
    
    setTimeout(() => {
      navigate('/register');
    }, 50);
  };

  // Cerrar sesión para usuarios normales
  const handleLogoutClick = () => {
    // Ejecutar logout del servicio
    logout();
    
    // Limpiar estado local
    setLocalUser({});
    
    // Notificar al componente padre
    if (onLogout) {
      onLogout();
    }
    
    // Redirigir a info
    navigate('/info');
    
    // Forzar recarga para asegurar limpieza
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Obtener nombre del usuario
  const getUserName = () => {
    return localUser?.name || localUser?.nombreUser || localUser?.username || 'Usuario';
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900">
      {/* ===== VISTA ESCRITORIO ===== */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 z-50 bg-secondary dark:bg-secondary border-r border-border">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-secondary-foreground dark:text-foreground">CiudadApp</h1>
            <p className="text-[10px] text-muted-foreground">Mejora tu ciudad</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <NavLink key={item.id} to={item.path}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start flex items-center space-x-3 ${
                    isActive 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'text-secondary-foreground dark:text-muted-foreground hover:bg-secondary/50 dark:hover:bg-accent/50 hover:text-primary dark:hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <header className="hidden lg:flex items-center justify-end h-16 fixed top-0 right-0 left-64 z-40 bg-card/95 dark:bg-card/95 backdrop-blur border-b border-border px-8">
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <div className="h-6 w-px bg-border mx-2" />
          
          {/* Si es invitado */}
          {isGuest ? (
            <>
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <User className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-right">
                  <p className="font-medium">Modo Invitado</p>
                  <p className="text-xs text-muted-foreground">Funciones limitadas</p>
                </div>
              </div>
              
              <div className="h-6 w-px bg-border mx-2" />
              
              <Button 
                onClick={handleLoginRedirect}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/profile">
                {({ isActive }) => (
                  <Button 
                    variant="ghost" 
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? 'bg-secondary text-secondary-foreground dark:bg-secondary/50 dark:text-foreground' 
                        : 'text-foreground dark:text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center border border-border">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-right hidden xl:block">
                      <p className="text-sm font-medium text-foreground leading-none">{getUserName()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ver Perfil</p>
                    </div>
                  </Button>
                )}
              </NavLink>

              <div className="h-6 w-px bg-border mx-2" />

              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLogoutClick}
                className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ===== VISTA MÓVIL ===== */}
      <header className="lg:hidden bg-card dark:bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-foreground">CiudadApp</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle isMobile={false} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-muted-foreground hover:bg-muted"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="mt-4 pb-4 space-y-2 animate-in slide-in-from-top-2">
              {menuItems.map(item => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start flex items-center space-x-2 ${
                        isActive 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  )}
                </NavLink>
              ))}
              
              <div className="border-t border-border my-2 pt-2">
                {isGuest ? (
                  <>
                    <div className="mb-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mr-2">
                          <User className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Modo Invitado</p>
                          <p className="text-xs text-muted-foreground">Funciones limitadas</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleLoginRedirect}
                      variant="default" 
                      className="w-full mb-2 bg-gradient-to-r from-amber-500 to-orange-500"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={handleRegisterRedirect}
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Cuenta
                    </Button>
                  </>
                ) : (
                  <>
                    <NavLink 
                      to="/profile" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block mb-2"
                    >
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-muted">
                        <User className="w-4 h-4 mr-2" />
                        Perfil
                      </Button>
                    </NavLink>

                    <Button 
                      variant="destructive" 
                      onClick={handleLogoutClick}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Salir
                    </Button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="lg:pl-64 lg:pt-16 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Navigation;