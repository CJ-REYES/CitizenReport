// src/services/userService.js
const API_BASE_URL = 'http://localhost:5001/users';

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
    let token = localStorage.getItem('userToken');
    
    if (!token) {
        token = localStorage.getItem('token');
    }
    
    if (!token) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            token = currentUser.tokenJWT || currentUser.token;
        } catch (error) {
            console.error('Error parsing currentUser:', error);
        }
    }
    
    return token;
};

/**
 * Obtiene los datos de un usuario por su ID
 */
export const getUserById = async (userId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener el usuario';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getUserById:", error);
        throw error;
    }
};

/**
 * Actualiza los datos de un usuario
 */
export const updateUser = async (userId, userData) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al actualizar el usuario';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en updateUser:", error);
        throw error;
    }
};

/**
 * Obtiene el ranking completo de usuarios
 */
export const getRanking = async () => {
    try {
        const token = getAuthToken();
        
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/ranking`, {
            method: 'GET',
            headers: headers
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener el ranking';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getRanking:", error);
        throw error;
    }
};

/**
 * Obtiene el top 10 de usuarios
 */
export const getTopUsers = async () => {
    try {
        const token = getAuthToken();
        
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/top`, {
            method: 'GET',
            headers: headers
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener el top de usuarios';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getTopUsers:", error);
        throw error;
    }
};

/**
 * Obtiene todos los usuarios (para administración)
 */
export const getAllUsers = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${API_BASE_URL}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = data.mensaje || data.message || data || 'Error al obtener los usuarios';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getAllUsers:", error);
        throw error;
    }
};