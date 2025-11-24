
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Map, FileText, Gamepad2, LayoutDashboard, Shield, User, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = ({ currentUser, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'map', label: 'Mapa', icon: Map, path: '/map' },
    { id: 'report', label: 'Reportar', icon: FileText, path: '/report' },
    { id: 'game', label: 'Arcade', icon: Gamepad2, path: '/arcade' },
    { id: 'leaderboard', label: 'Ranking', icon: Award, path: '/leaderboard' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/profile' },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/admin' });
  }

  return (
    <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CiudadApp</h1>
              <p className="text-xs text-slate-400">Mejora tu ciudad</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map(item => (
              <NavLink key={item.id} to={item.path}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                )}
              </NavLink>
            ))}
            <Button variant="outline" onClick={onLogout} className="ml-4">
              Salir
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 space-y-2">
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
            <Button variant="outline" onClick={onLogout} className="w-full">
              Salir
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;
