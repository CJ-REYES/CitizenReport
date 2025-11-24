
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

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Helmet>
        <title>CiudadApp - Mejora tu ciudad</title>
        <meta name="description" content="Plataforma gamificada para reportar problemas urbanos y mejorar tu ciudad." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {currentUser && <Navigation currentUser={currentUser} onLogout={handleLogout} />}
        
        <main className={currentUser ? "container mx-auto px-4 py-6" : ""}>
          <Routes>
            {/* Public Route */}
            <Route 
              path="/login" 
              element={
                <LoginPage 
                  onLogin={handleLogin} 
                  isAuthenticated={!!currentUser} 
                />
              } 
            />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardPage currentUser={currentUser} /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapPage currentUser={currentUser} onPointsEarned={handlePointsUpdate} /></ProtectedRoute>} />
            {/* /report route removed */}
            <Route path="/arcade" element={<ProtectedRoute><ArcadePage currentUser={currentUser} onPointsUpdate={handlePointsUpdate} /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage currentUser={currentUser} /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage currentUser={currentUser} /></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;
