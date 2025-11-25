// src/services/reportService.js

const API_BASE_URL = 'http://localhost:5001/api/reportes'; 

const handleResponse = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
};

/**
 * Envía un nuevo reporte al backend usando FormData (para el archivo binario IFormFile).
 */
export const createReport = async (formData, token) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData // Enviamos el objeto FormData
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