// src/services/reportService.js
const API_BASE_URL = 'http://localhost:5001/api'; 

const handleResponse = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
};

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = () => {
    // Primero intenta obtener de 'userToken' (tu configuración actual)
    let token = localStorage.getItem('userToken');
    
    // Si no existe, intenta con 'token' (configuración por defecto)
    if (!token) {
        token = localStorage.getItem('token');
    }
    
    // Si todavía no existe, busca en currentUser
    if (!token) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            token = currentUser.tokenJWT;
        } catch (error) {
            console.error('Error parsing currentUser:', error);
        }
    }
    
    return token;
};

/**
 * Envía un nuevo reporte al backend usando FormData
 */
export const createReport = async (formData, token) => {
  try {
    // Usar el token pasado como parámetro o buscar en localStorage
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('No se encontró token de autenticación');
    }

    console.log('Enviando request a:', `${API_BASE_URL}/reportes`);
    console.log('Token:', authToken.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/reportes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    console.log('Response status:', response.status);

    const data = await handleResponse(response);

    if (!response.ok) {
      const errorMessage = data.mensaje || data.message || data || `Error ${response.status}: ${response.statusText}`;
      console.error('Error del servidor:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('Reporte creado exitosamente:', data);
    return data;
  } catch (error) {
    console.error("Error en createReport:", error);
    throw (error instanceof Error) ? error : new Error('No se pudo conectar al servidor de reportes.');
  }
};

/**
 * Obtiene los reportes del usuario actual
 */
export const getMyReports = async (userId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes/misreportes/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener los reportes';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getMyReports:", error);
        throw error;
    }
};

/**
 * Obtiene reportes para validar por el usuario
 */
export const getReportsToValidate = async (userId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes/porvalidar/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener reportes para validar';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getReportsToValidate:", error);
        throw error;
    }
};

/**
 * Valida un reporte (positiva o negativamente)
 */
export const validateReport = async (validationData) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes/validar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(validationData)
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al validar el reporte';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en validateReport:", error);
        throw error;
    }
};

/**
 * Obtiene todos los reportes
 */
export const getAllReports = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener los reportes';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getAllReports:", error);
        throw error;
    }
};

/**
 * Obtiene la colonia con más reportes de alumbrado público
 */
export const getColoniaMasAlumbrado = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes/colonia-mas-alumbrado`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (response.status === 404) {
            return { 
                coloniaMasAlumbrado: 'Sin datos', 
                totalReportesAlumbrado: 0 
            };
        }

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener colonia con más alumbrado';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getColoniaMasAlumbrado:", error);
        return { 
            coloniaMasAlumbrado: 'Error al cargar', 
            totalReportesAlumbrado: 0 
        };
    }
};

/**
 * Obtiene la colonia con más reportes de baches
 */
export const getColoniaMasBaches = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes/colonia-mas-baches`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (response.status === 404) {
            return { 
                coloniaMasBaches: 'Sin datos', 
                totalReportesBaches: 0 
            };
        }

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener colonia con más baches';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getColoniaMasBaches:", error);
        return { 
            coloniaMasBaches: 'Error al cargar', 
            totalReportesBaches: 0 
        };
    }
};

/**
 * Obtiene la colonia con más reportes de daños
 */
export const getColoniaMasDanos = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes/colonia-mas-danos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (response.status === 404) {
            return { 
                coloniaMasDanos: 'Sin datos', 
                totalReportes: 0 
            };
        }

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener colonia con más daños';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getColoniaMasDanos:", error);
        return { 
            coloniaMasDanos: 'Error al cargar', 
            totalReportes: 0 
        };
    }
};