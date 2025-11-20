
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import MapView from '@/components/MapView';
import ReportForm from '@/components/ReportForm';
import ArcadeGame from '@/components/ArcadeGame';
import AdminPanel from '@/components/AdminPanel';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Menu, X, Map, FileText, Gamepad2, LayoutDashboard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('map');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    toast({
      title: "¡Bienvenido!",
      description: `Has iniciado sesión como ${user.username}`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActiveView('map');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  const handlePointsUpdate = (points) => {
    const updatedUser = { ...currentUser, points: currentUser.points + points };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === updatedUser.username);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  if (!currentUser) {
    return (
      <>
        <Helmet>
          <title>CiudadApp - Reporta y Mejora tu Ciudad</title>
          <meta name="description" content="Plataforma gamificada para reportar problemas urbanos y mejorar tu ciudad. Gana puntos, sube de rango y juega mientras contribuyes." />
        </Helmet>
        <AuthPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const menuItems = [
    { id: 'map', label: 'Mapa', icon: Map },
    { id: 'report', label: 'Reportar', icon: FileText },
    { id: 'dashboard', label: 'Perfil', icon: LayoutDashboard },
    { id: 'game', label: 'Arcade', icon: Gamepad2 },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <>
      <Helmet>
        <title>CiudadApp - {activeView === 'map' ? 'Mapa de Reportes' : activeView === 'report' ? 'Crear Reporte' : activeView === 'dashboard' ? 'Mi Perfil' : activeView === 'game' ? 'Arcade' : 'Panel Admin'}</title>
        <meta name="description" content="Plataforma gamificada para reportar problemas urbanos y mejorar tu ciudad. Gana puntos, sube de rango y juega mientras contribuyes." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Header */}
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
              <nav className="hidden md:flex items-center space-x-2">
                {menuItems.map(item => (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    onClick={() => setActiveView(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}
                <Button variant="outline" onClick={handleLogout} className="ml-4">
                  Salir
                </Button>
              </nav>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <nav className="md:hidden mt-4 pb-4 space-y-2">
                {menuItems.map(item => (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    onClick={() => {
                      setActiveView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start flex items-center space-x-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  Salir
                </Button>
              </nav>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {activeView === 'map' && <MapView currentUser={currentUser} />}
          {activeView === 'report' && <ReportForm currentUser={currentUser} onReportSubmit={() => setActiveView('map')} onPointsEarned={handlePointsUpdate} />}
          {activeView === 'dashboard' && <Dashboard currentUser={currentUser} />}
          {activeView === 'game' && <ArcadeGame currentUser={currentUser} onPointsUpdate={handlePointsUpdate} />}
          {activeView === 'admin' && currentUser.role === 'admin' && <AdminPanel />}
        </main>

        <Toaster />
      </div>
    </>
  );
}

export default App;
