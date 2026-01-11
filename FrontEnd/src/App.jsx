// src/App.jsx (actualizado)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

// Pages
import InfoPage from '@/pages/InfoPage';
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

  const handleContinueAsGuest = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      username: 'Invitado',
      email: 'guest@ciudadapp.com',
      role: 'guest',
      points: 0,
      level: 1,
      isGuest: true
    };
    setCurrentUser(guestUser);
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
    toast({
      title: "¡Bienvenido!",
      description: "Estás explorando como invitado",
    });
  };

  const handlePointsUpdate = (points) => {
    if (!currentUser || currentUser.isGuest) return;
    
    const updatedUser = { ...currentUser, points: currentUser.points + points };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    toast({
      title: "¡Puntos ganados!",
      description: `Has ganado ${points} puntos. Total: ${updatedUser.points}`,
    });
  };

  return (
    <Router>
      <Helmet>
        <title>CiudadApp - Plataforma de Impacto Ciudadano</title>
      </Helmet>
      
      <Routes>
        {/* Ruta principal: Landing Page para usuarios no autenticados */}
        <Route 
          path="/" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <InfoPage 
                onContinueAsGuest={handleContinueAsGuest}
                isAuthenticated={!!currentUser}
              />
            )
          } 
        />
        
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage 
                onLogin={handleLogin} 
                isAuthenticated={!!currentUser} 
              />
            )
          } 
        />
        
        {/* Rutas protegidas */}
        {currentUser ? (
          <>
            <Route 
              path="/dashboard" 
              element={
                <Navigation currentUser={currentUser} onLogout={handleLogout}>
                  <DashboardPage currentUser={currentUser} />
                </Navigation>
              } 
            />
            <Route 
              path="/map" 
              element={
                <Navigation currentUser={currentUser} onLogout={handleLogout}>
                  <MapPage currentUser={currentUser} onPointsEarned={handlePointsUpdate} />
                </Navigation>
              } 
            />
            <Route 
              path="/arcade" 
              element={
                <Navigation currentUser={currentUser} onLogout={handleLogout}>
                  <ArcadePage currentUser={currentUser} onPointsUpdate={handlePointsUpdate} />
                </Navigation>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <Navigation currentUser={currentUser} onLogout={handleLogout}>
                  <LeaderboardPage />
                </Navigation>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <Navigation currentUser={currentUser} onLogout={handleLogout}>
                  <ProfilePage currentUser={currentUser} />
                </Navigation>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <Navigation currentUser={currentUser} onLogout={handleLogout}>
                  <AdminPage currentUser={currentUser} />
                </Navigation>
              } 
            />
            {/* Redirección para rutas no encontradas en estado autenticado */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          /* Redirección para rutas no encontradas en estado no autenticado */
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>

      <Toaster />
    </Router>
  );
}

export default App;