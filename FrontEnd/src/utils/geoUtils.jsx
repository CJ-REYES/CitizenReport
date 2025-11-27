// src/utils/geoUtils.js

/**
 * Verifica si un punto (lat, lng) está dentro de un polígono.
 * Utiliza el algoritmo Ray Casting.
 */
const isPointInPolygon = (point, polygon) => {
    // x = Longitud, y = Latitud
    const x = point.lng, y = point.lat; 
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;
        
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        
        if (intersect) {
            inside = !inside;
        }
    }
    
    return inside;
};

// ==============================================================================
// 🎯 COLONIAS DE CANDELARIA CON POLÍGONOS EXPANDIDOS
// Se ha aumentado la extensión de la geocerca para mejorar la detección.
// ==============================================================================
const colonias = [
    {
        nombre: "Independencia",
        // Centro aproximado: 18.1829, -91.0401
        poligono: [
            { lat: 18.1854, lng: -91.0436 }, 
            { lat: 18.1854, lng: -91.0366 }, 
            { lat: 18.1804, lng: -91.0366 }, 
            { lat: 18.1804, lng: -91.0436 }, 
            { lat: 18.1854, lng: -91.0436 }, // Cierre
        ]
    },
    {
        nombre: "Guanajuato",
        // Centro aproximado: 18.1883, -91.0415
        poligono: [
            { lat: 18.1908, lng: -91.0450 }, 
            { lat: 18.1908, lng: -91.0380 }, 
            { lat: 18.1858, lng: -91.0380 }, 
            { lat: 18.1858, lng: -91.0450 }, 
            { lat: 18.1908, lng: -91.0450 }, // Cierre
        ]
    },
    {
        nombre: "San Isidro",
        // Centro aproximado: 18.1868, -91.0515
        poligono: [
            { lat: 18.1893, lng: -91.0550 }, 
            { lat: 18.1893, lng: -91.0480 }, 
            { lat: 18.1843, lng: -91.0480 }, 
            { lat: 18.1843, lng: -91.0550 }, 
            { lat: 18.1893, lng: -91.0550 }, // Cierre
        ]
    },
    {
        nombre: "Centro",
        // Centro aproximado: 18.1859, -91.0453
        poligono: [
            { lat: 18.1884, lng: -91.0488 }, 
            { lat: 18.1884, lng: -91.0418 }, 
            { lat: 18.1834, lng: -91.0418 }, 
            { lat: 18.1834, lng: -91.0488 }, 
            { lat: 18.1884, lng: -91.0488 }, // Cierre
        ]
    },
    {
        nombre: "San Martin",
        // Centro aproximado: 18.1942, -91.0411
        poligono: [
            { lat: 18.1967, lng: -91.0446 }, 
            { lat: 18.1967, lng: -91.0376 }, 
            { lat: 18.1917, lng: -91.0376 }, 
            { lat: 18.1917, lng: -91.0446 }, 
            { lat: 18.1967, lng: -91.0446 }, // Cierre
        ]
    }
];


/**
 * Busca la colonia a la que pertenece un punto (lat, lng).
 */
export const findColoniaByLocation = (point) => {
    for (const colonia of colonias) {
        if (isPointInPolygon(point, colonia.poligono)) {
            return colonia.nombre;
        }
    }
    return null; 
};