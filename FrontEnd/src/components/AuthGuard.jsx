import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, AlertTriangle, Shield, X, UserPlus } from 'lucide-react';
import { logout } from '@/services/authService';
import { checkIfGuest } from '@/utils/authUtils';

const AuthGuard = ({ 
  children, 
  currentUser, 
  action = "realizar esta acción",
  showAfterSeconds = null
}) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Usar la utilidad para verificar si es invitado
  const isGuest = checkIfGuest(currentUser);

  useEffect(() => {
    // Si es un usuario invitado y queremos mostrar el modal después de X segundos
    if (showAfterSeconds && isGuest) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, showAfterSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [showAfterSeconds, isGuest]);

  // Función para limpiar token de invitado
  const clearGuestToken = () => {
    // Si es un usuario invitado, limpiamos específicamente el token
    if (isGuest) {
      console.log('Limpiando token de invitado...');
      logout(); // Esto elimina userToken y currentUser del localStorage
      
      // También podemos limpiar cualquier dato específico de invitado
      localStorage.removeItem('asteroidsOfflineStats');
      localStorage.removeItem('guestSession');
      
      return true;
    }
    return false;
  };

  const handleLoginRedirect = () => {
    // Limpiar token de invitado antes de redirigir
    clearGuestToken();
    setShowModal(false);
    
    // Forzar redirección a login
    window.location.href = '/login';
  };

  const handleRegisterRedirect = () => {
    // Limpiar token de invitado antes de redirigir
    clearGuestToken();
    setShowModal(false);
    window.location.href = '/register';
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleActionClick = (e) => {
    if (isGuest) {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
        e.stopPropagation();
      }
      setShowModal(true);
      return false;
    }
    return true;
  };

  // Si no es invitado, renderiza los hijos normalmente
  if (!isGuest) {
    return children;
  }

  // Clonar children para agregar el handler de click
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: (e) => {
          if (handleActionClick(e) && child.props.onClick) {
            child.props.onClick(e);
          }
        },
        // También manejar eventos de teclado si es necesario
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (handleActionClick(e) && child.props.onKeyDown) {
              child.props.onKeyDown(e);
            }
          }
        }
      });
    }
    return child;
  });

  return (
    <>
      {/* Render children con protección */}
      {childrenWithProps}

      {/* Modal de autenticación */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl relative"
            >
              {/* Botón de cerrar */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6 pt-2">
                {/* Icono */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
                    <Shield className="w-12 h-12 text-amber-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">Acceso Restringido</h3>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-300 text-sm mb-2">
                      <span className="text-amber-400 font-semibold">Modo Invitado:</span> Solo lectura
                    </p>
                    <p className="text-slate-400 text-sm">
                      Para <span className="text-amber-400 font-semibold">{action}</span>, necesitas una cuenta registrada.
                    </p>
                    
                    <div className="mt-3 text-xs text-slate-500 text-left">
                      <p className="mb-1">✅ <span className="text-green-400">Funciones disponibles:</span></p>
                      <ul className="space-y-1 ml-2">
                        <li>• Ver reportes y mapa</li>
                        <li>• Explorar la aplicación</li>
                        <li>• Ver ranking público</li>
                      </ul>
                      
                      <p className="mt-2 mb-1">❌ <span className="text-red-400">Funciones bloqueadas:</span></p>
                      <ul className="space-y-1 ml-2">
                        <li>• Crear reportes</li>
                        <li>• Validar reportes</li>
                        <li>• Jugar minijuegos</li>
                        <li>• Ganar puntos/monedas</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="sm:flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Continuar como invitado
                  </Button>
                  <Button
                    onClick={handleLoginRedirect}
                    className="sm:flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Iniciar sesión
                  </Button>
                </div>

                {/* Botón de registro */}
                <div className="w-full">
                  <Button
                    variant="outline"
                    onClick={handleRegisterRedirect}
                    className="w-full bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Crear cuenta nueva
                  </Button>
                </div>

                {/* Info adicional */}
                <p className="text-xs text-slate-500 pt-2">
                  Al iniciar sesión o registrarte, se cerrará tu sesión de invitado.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthGuard;