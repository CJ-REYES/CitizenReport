import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Map, Gamepad2, LayoutDashboard, Shield, User, Award, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '../services/authService';

const Navigation = ({ currentUser, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 1. Lógica del tema: lee de localStorage o usa 'light' por defecto
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Tema 'light' por defecto si no hay nada guardado
    return savedTheme || 'light'; 
  });

  // 2. useEffect para aplicar la clase 'dark' al elemento HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. Función para alternar el tema
  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  // Componente interno para el botón de cambio de tema
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
        <Moon className="w-5 h-5" /> // Mostrar la luna para cambiar a oscuro
      ) : (
        <Sun className="w-5 h-5" /> // Mostrar el sol para cambiar a claro
      )}
      {isMobile && <span>{theme === 'light' ? 'Tema Oscuro' : 'Tema Claro'}</span>}
    </Button>
  );

  // Definimos los items del menú principal
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'map', label: 'Mapa', icon: Map, path: '/map' },
    { id: 'game', label: 'Arcade', icon: Gamepad2, path: '/arcade' },
    { id: 'leaderboard', label: 'Ranking', icon: Award, path: '/leaderboard' },
  ];

  // Agregamos opción de admin si corresponde
  if (currentUser?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/admin' });
  }

  // Manejador para el cierre de sesión
  const handleLogoutClick = () => {
    logout(); 
    if (onLogout) {
      onLogout(); 
    }
  };

  return (
    // Fondo general del contenido (fuera de la barra de navegación)
    <div className="min-h-screen bg-background dark:bg-slate-900">
      {/* ========================================
        VISTA ESCRITORIO (Desktop) 
        ========================================
      */}

      {/* SIDEBAR IZQUIERDO */}
      {/* CAMBIO: bg-secondary para el color verde claro */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 z-50 bg-secondary dark:bg-secondary border-r border-border">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            {/* Texto: text-secondary-foreground para el tema claro, dark:text-foreground para el oscuro */}
            <h1 className="text-lg font-bold text-secondary-foreground dark:text-foreground">CiudadApp</h1>
            <p className="text-[10px] text-muted-foreground">Mejora tu ciudad</p>
          </div>
        </div>

        {/* Menu Items Vertical */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <NavLink key={item.id} to={item.path}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  // Colores dinámicos para los enlaces
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

      {/* TOP BAR SUPERIOR */}
      {/* CAMBIO: bg-card/95 para blanco/gris claro, dark:bg-card/95 para gris oscuro */}
      <header className="hidden lg:flex items-center justify-end h-16 fixed top-0 right-0 left-64 z-40 bg-card/95 dark:bg-card/95 backdrop-blur border-b border-border px-8">
        <div className="flex items-center space-x-4">
          {/* Toggle de Tema en Top Bar (Desktop) */}
          <ThemeToggle />
          
          <div className="h-6 w-px bg-border mx-2" />
          
          {/* Enlace a Perfil */}
          <NavLink to="/profile">
             {({ isActive }) => (
                <Button 
                  variant="ghost" 
                  className={`flex items-center space-x-2 ${
                    isActive 
                      // Activo: bg-secondary (light), dark:bg-secondary (dark)
                      ? 'bg-secondary text-secondary-foreground dark:bg-secondary/50 dark:text-foreground' 
                      // Inactivo: text-foreground (light), dark:text-muted-foreground (dark)
                      : 'text-foreground dark:text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center border border-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-medium text-foreground leading-none">{currentUser?.name || 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ver Perfil</p>
                  </div>
                </Button>
             )}
          </NavLink>

          <div className="h-6 w-px bg-border mx-2" />

          {/* Botón Salir (Escritorio) */}
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLogoutClick} 
            className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </Button>
        </div>
      </header>


      {/* ========================================
        VISTA MÓVIL (Mobile)
        ========================================
      */}
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
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="lg:pl-64 lg:pt-16 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Navigation;