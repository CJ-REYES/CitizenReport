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

// Services
import { storeAuthData, isGuestUser } from './services/authService';

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

  const handleLogin = (userData) => {
    // Usar storeAuthData para guardar datos consistentemente
    storeAuthData(userData);
    
    // Crear objeto de usuario para el estado
    const user = {
      id: userData.idUser || userData.IdUser,
      nombre: userData.nombreUser || userData.NombreUser,
      email: userData.email || userData.Email,
      puntos: userData.puntos || userData.Puntos,
      rango: userData.rango || userData.Rango,
      monedas: userData.monedas || userData.Monedas,
      vidas: userData.vidas || userData.Vidas,
      rankColor: userData.rankColor || userData.RankColor,
      rankIcon: userData.rankIcon || userData.RankIcon,
      role: 'citizen',
      isGuest: userData.isGuest || false,
      token: userData.tokenJWT || userData.TokenJWT
    };
    
    setCurrentUser(user);
    
    toast({
      title: "¡Bienvenido!",
      description: `Has iniciado sesión como ${user.nombre}`,
    });
  };

  const handleGuestLogin = (guestData) => {
    // storeGuestData ya se llama en el servicio, solo actualizamos el estado
    const guestUser = {
      id: guestData.idUser || guestData.IdUser,
      nombre: guestData.nombreUser || guestData.NombreUser || 'Invitado',
      email: guestData.email || guestData.Email || 'guest@temporal.com',
      puntos: guestData.puntos || guestData.Puntos || 0,
      rango: guestData.rango || guestData.Rango || 'Invitado',
      monedas: guestData.monedas || guestData.Monedas || 0,
      vidas: guestData.vidas || guestData.Vidas || 0,
      rankColor: guestData.rankColor || guestData.RankColor || '#808080',
      rankIcon: guestData.rankIcon || guestData.RankIcon || '👤',
      role: 'guest',
      isGuest: true,
      token: guestData.tokenJWT || guestData.TokenJWT
    };
    
    setCurrentUser(guestUser);
    
    toast({
      title: "¡Bienvenido invitado!",
      description: "Estás explorando la aplicación con funcionalidades limitadas",
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  const handlePointsUpdate = (points) => {
    if (!currentUser || currentUser.isGuest) return;
    
    const updatedUser = { 
      ...currentUser, 
      puntos: currentUser.puntos + points 
    };
    
    setCurrentUser(updatedUser);
    
    // Actualizar localStorage
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    storedUser.puntos = updatedUser.puntos;
    localStorage.setItem('currentUser', JSON.stringify(storedUser));

    toast({
      title: "¡Puntos ganados!",
      description: `Has ganado ${points} puntos. Total: ${updatedUser.puntos}`,
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
                onLogin={handleGuestLogin}
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
                  <MapPage 
                    currentUser={currentUser} 
                    onPointsEarned={currentUser.isGuest ? null : handlePointsUpdate} 
                  />
                </Navigation>
              } 
            />
            <Route 
              path="/arcade" 
              element={
                <Navigation currentUser={currentUser} onLogout={handleLogout}>
                  <ArcadePage 
                    currentUser={currentUser} 
                    onPointsUpdate={currentUser.isGuest ? null : handlePointsUpdate} 
                  />
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
                currentUser.role === 'admin' && !currentUser.isGuest ? (
                  <Navigation currentUser={currentUser} onLogout={handleLogout}>
                    <AdminPage currentUser={currentUser} />
                  </Navigation>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
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