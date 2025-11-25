const API_BASE_URL = 'http://localhost:5001/users'; // Asegúrate que el puerto sea el correcto (5001 o 5000)

// Función auxiliar para manejar respuestas que pueden ser Texto o JSON
const handleResponse = async (response) => {
    const text = await response.text();
    try {
        // Intenta convertirlo a JSON
        return JSON.parse(text);
    } catch (error) {
        // Si falla, devuelve el texto plano (ej: "Usuario registrado")
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
        // Si hay error, lanza el mensaje (sea objeto o string)
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
    // CORRECCIÓN IMPORTANTE:
    // .NET devuelve las propiedades en camelCase (minúscula inicial).
    // Usamos ?. para evitar errores si algo viene nulo.

    const token = userData.tokenJWT || userData.TokenJWT; // Intenta ambas por seguridad

    localStorage.setItem('userToken', token);
    
    // Guardamos un objeto limpio y consistente
    localStorage.setItem('currentUser', JSON.stringify({
        id: userData.idUser || userData.IdUser,
        nombre: userData.nombreUser || userData.NombreUser,
        email: userData.email || userData.Email,
        puntos: userData.puntos || userData.Puntos,
        role: userData.role || 'citizen', // Valor por defecto si no viene
        token: token
    }));
    
};

// Agrega esto al final de src/services/authService.js

export const logout = () => {
    // Elimina específicamente los items que creamos al iniciar sesión
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    
    // Opcional: Limpiar todo por seguridad (si no guardas otras configuraciones)
    // localStorage.clear(); 
};