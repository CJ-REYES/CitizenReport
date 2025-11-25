import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Map, Gamepad2, LayoutDashboard, Shield, User, Award, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Aceptamos 'children' para poder envolver el contenido de la página
const Navigation = ({ currentUser, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Definimos los items del menú principal (Izquierda)
  // Nota: Quitamos 'Perfil' de aquí porque lo moveremos arriba
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'map', label: 'Mapa', icon: Map, path: '/map' },
    { id: 'game', label: 'Arcade', icon: Gamepad2, path: '/arcade' },
    { id: 'leaderboard', label: 'Ranking', icon: Award, path: '/leaderboard' },
  ];

  if (currentUser?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ========================================
        VISTA ESCRITORIO (Desktop) 
        ========================================
      */}

      {/* 1. SIDEBAR IZQUIERDO (Navegación) */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 z-50 bg-slate-800 border-r border-slate-700">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CiudadApp</h1>
            <p className="text-[10px] text-slate-400">Mejora tu ciudad</p>
          </div>
        </div>

        {/* Menu Items Vertical */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <NavLink key={item.id} to={item.path}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start flex items-center space-x-3 ${
                    isActive ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* Footer del Sidebar (Opcional, info de versión o similar) */}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          v1.0.0 CiudadApp
        </div>
      </aside>

      {/* 2. TOP BAR SUPERIOR (Perfil y Logout) */}
      <header className="hidden lg:flex items-center justify-end h-16 fixed top-0 right-0 left-64 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-8">
        <div className="flex items-center space-x-4">
          {/* Enlace a Perfil */}
          <NavLink to="/profile">
             {({ isActive }) => (
                <Button 
                  variant="ghost" 
                  className={`flex items-center space-x-2 ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-medium text-white leading-none">{currentUser?.name || 'Usuario'}</p>
                    <p className="text-xs text-slate-400 mt-1">Ver Perfil</p>
                  </div>
                </Button>
             )}
          </NavLink>

          <div className="h-6 w-px bg-slate-700 mx-2" />

          {/* Botón Salir */}
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onLogout} 
            className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </Button>
        </div>
      </header>


      {/* ========================================
        VISTA MÓVIL (Mobile) - Conservada
        ========================================
      */}
      <header className="lg:hidden bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">CiudadApp</h1>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <nav className="mt-4 pb-4 space-y-2 animate-in slide-in-from-top-2">
              {/* Menu Items Móvil */}
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
                      className="w-full justify-start flex items-center space-x-2"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  )}
                </NavLink>
              ))}
              
              <div className="border-t border-slate-700 my-2 pt-2">
                {/* Perfil Móvil */}
                <NavLink 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block mb-2"
                >
                   <Button variant="ghost" className="w-full justify-start text-slate-300">
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                   </Button>
                </NavLink>

                {/* Salir Móvil */}
                <Button variant="destructive" onClick={onLogout} className="w-full flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Salir
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* ========================================
        CONTENIDO PRINCIPAL 
        ========================================
        Ajustamos el padding izquierdo (lg:pl-64) para que el sidebar no tape el contenido
        y el padding superior (lg:pt-16) para la barra superior.
      */}
      <main className="lg:pl-64 lg:pt-16 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Navigation;