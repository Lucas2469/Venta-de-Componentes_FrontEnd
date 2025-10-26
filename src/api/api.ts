// Configuración centralizada de la API
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'https://apielectromarket.hermesoft.com',
    ENDPOINTS: {
        PRODUCTS: '/api/products',
        USERS: '/api/users',
        MEETING_POINTS: '/api/puntosencuentro',
        NOTIFICATIONS: '/api/notifications'
    }
};

// Función helper para construir URLs de imágenes
export const getImageUrl = (relativePath: string): string => {
    if (!relativePath) return '/placeholder-image.jpg';
    
    if (relativePath.startsWith('http')) {
        return relativePath;
    }
    
    return `${API_CONFIG.BASE_URL}${relativePath}`;
};

// Función helper para construir URLs de API
export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};