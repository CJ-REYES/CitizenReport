const API_BASE_URL = 'http://localhost:5001/users';

// Función auxiliar para manejar respuestas que pueden ser Texto o JSON
const handleResponse = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
};

export const registerUser = async (nombre, email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Nombre: nombre,
            Email: email,
            Password: password,
        }),
    });

    const data = await handleResponse(response);

    if (!response.ok) {
        throw new Error(data.message || data); 
    }
    
    return data;
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Email: email,
            Password: password,
        }),
    });

    const data = await handleResponse(response);

    if (!response.ok) {
        throw new Error(data.message || data);
    }
    
    return data;
};

export const storeAuthData = (userData) => {
    const token = userData.tokenJWT || userData.TokenJWT;

    localStorage.setItem('userToken', token);
    
    localStorage.setItem('currentUser', JSON.stringify({
        id: userData.idUser || userData.IdUser,
        nombre: userData.nombreUser || userData.NombreUser,
        email: userData.email || userData.Email,
        puntos: userData.puntos || userData.Puntos,
        rango: userData.rango || userData.Rango || 'Ciudadano Novato',
        monedas: userData.monedas || userData.Monedas || 0,
        vidas: userData.vidas || userData.Vidas || 0,
        rankColor: userData.rankColor || userData.RankColor || '#808080',
        rankIcon: userData.rankIcon || userData.RankIcon || '👤',
        role: userData.role || 'citizen',
        token: token,
        isGuest: userData.isGuest || false
    }));
};

export const logout = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
  localStorage.removeItem('guestSession');
  // No limpiar asteroidsOfflineStats aquí para mantener progreso local
};
// SERVICIO DE INVITADO
export const loginAsGuest = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/guest-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            throw new Error(data.message || data || 'Error al generar token de invitado');
        }
        
        return data;
    } catch (error) {
        console.error("Error en loginAsGuest:", error);
        throw error;
    }
};

export const storeGuestData = (guestData) => {
    const token = guestData.tokenJWT || guestData.TokenJWT;
    localStorage.setItem('userToken', token);
    
    localStorage.setItem('currentUser', JSON.stringify({
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
        token: token,
        isGuest: true
    }));
};

export const isGuestUser = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Verificar por ID negativo y/o la propiedad isGuest
    return currentUser.isGuest === true || (currentUser.id && currentUser.id < 0);
  } catch (error) {
    return false;
  }
};

// También puedes agregar una función para limpiar específicamente datos de invitado:
export const clearGuestSession = () => {
  if (isGuestUser()) {
    logout();
    localStorage.removeItem('asteroidsOfflineStats');
    localStorage.removeItem('guestSession');
    console.log('Sesión de invitado limpiada');
    return true;
  }
  return false;
};