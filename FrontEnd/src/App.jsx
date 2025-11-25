import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MapPage from '@/pages/MapPage';
import ArcadePage from '@/pages/ArcadePage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  // Initial load of user data
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
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  const handlePointsUpdate = (points) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, points: currentUser.points + points };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex].points = updatedUser.points;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  return (
    <Router>
      <Helmet>
        <title>CiudadApp - Mejora tu ciudad</title>
        <meta name="description" content="Plataforma gamificada para reportar problemas urbanos y mejorar tu ciudad." />
      </Helmet>
      
      {/* LÓGICA PRINCIPAL:
         1. Si hay usuario (currentUser), renderizamos Navigation envolviendo las rutas.
         2. Si NO hay usuario, mostramos el contenedor de Login (sin sidebar).
      */}
      
      {currentUser ? (
        // VISTA AUTENTICADA: Navigation envuelve el contenido
        <Navigation currentUser={currentUser} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<DashboardPage currentUser={currentUser} />} />
            <Route path="/map" element={<MapPage currentUser={currentUser} onPointsEarned={handlePointsUpdate} />} />
            <Route path="/arcade" element={<ArcadePage currentUser={currentUser} onPointsUpdate={handlePointsUpdate} />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage currentUser={currentUser} />} />
            <Route path="/admin" element={<AdminPage currentUser={currentUser} />} />
            {/* Cualquier otra ruta redirige al dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Navigation>
      ) : (
        // VISTA PÚBLICA / LOGIN: Fondo original, sin menú lateral
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Routes>
            <Route 
              path="/login" 
              element={
                <LoginPage 
                  onLogin={handleLogin} 
                  isAuthenticated={!!currentUser} 
                />
              } 
            />
            {/* Si intenta entrar a cualquier otra ruta sin loguearse, va al login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}

      <Toaster />
    </Router>
  );
}

export default App;