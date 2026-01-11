// src/utils/authUtils.js
export const checkIfGuest = (currentUser = null) => {
  // Prioridad 1: Usar currentUser de props si está disponible
  if (currentUser?.isGuest !== undefined) {
    return currentUser.isGuest;
  }
  
  // Prioridad 2: Verificar localStorage
  try {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return storedUser.isGuest === true || (storedUser.id && storedUser.id < 0);
  } catch (error) {
    return false;
  }
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  } catch (error) {
    return {};
  }
};