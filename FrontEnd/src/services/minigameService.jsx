// src/services/minigameService.jsx
const API_BASE_URL = 'http://localhost:5001';

const getAuthToken = () => {
    let token = localStorage.getItem('userToken');
    if (!token) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            token = currentUser.tokenJWT;
        } catch (error) {
            console.error('Error parsing currentUser for token:', error);
        }
    }
    return token;
};

const handleResponse = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
};

export const startGame = async (userId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación.');
        }

        const response = await fetch(`${API_BASE_URL}/minigame/start-game/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && (data?.message || data?.title)) || data || response.statusText;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en startGame:", error);
        throw error;
    }
};

export const saveScore = async (userId, score) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación.');
        }

        const scoreData = {
            UserId: userId,
            Score: score
        };

        const response = await fetch(`${API_BASE_URL}/minigame/save-score`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && (data?.message || data?.title)) || data || response.statusText;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en saveScore:", error);
        throw error;
    }
};
export const getUserStats = async (userId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación.');
        }

        const response = await fetch(`${API_BASE_URL}/minigame/user-stats/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && (data?.message || data?.title)) || data || response.statusText;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getUserStats:", error);
        throw error;
    }
};

export const getUserMinigameStats = async (userId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación.');
        }

        const response = await fetch(`${API_BASE_URL}/users/minigame-stats/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && (data?.message || data?.title)) || data || response.statusText;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getUserMinigameStats:", error);
        throw error;
    }
};

export const getMinigameRanking = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación.');
        }

        const response = await fetch(`${API_BASE_URL}/minigame/ranking`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await handleResponse(response);

        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && (data?.message || data?.title)) || data || response.statusText;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error en getMinigameRanking:", error);
        throw error;
    }
};