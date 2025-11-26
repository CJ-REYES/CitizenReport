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
 * Envía un nuevo reporte al backend usando FormData (para el archivo binario IFormFile).
 */
export const createReport = async (formData) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/reportes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al crear el reporte';
            throw new Error(errorMessage);
        }

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