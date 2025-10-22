// Configuración de la API
const getBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Función helper para obtener URLs de API
export const getApiBaseUrl = (): string => {
  return getBaseUrl();
};

// Configuración de autenticación
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_tokens',
  USER_KEY: 'auth_user',
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes de expirar
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'ElectroMarket',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plataforma de compra/venta de componentes electrónicos',
  SUPPORT_EMAIL: 'support@electromarket.bo',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    REGEX: /^[0-9]{8}$/,
    MIN_LENGTH: 8,
    MAX_LENGTH: 8,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    REGEX: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  },
};

// Configuración de roles y permisos
export const ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendedor',
  BUYER: 'comprador',
} as const;

export const PERMISSIONS = {
  CREATE_PRODUCTS: [ROLES.VENDOR, ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
  VIEW_ADMIN_PANEL: [ROLES.ADMIN],
  BUY_CREDITS: [ROLES.BUYER, ROLES.VENDOR],
  SCHEDULE_APPOINTMENTS: [ROLES.BUYER, ROLES.VENDOR],
  RATE_USERS: [ROLES.BUYER, ROLES.VENDOR],
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
  POSITION: 'top-right',
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
  MAX_PAGE_SIZE: 100,
};

// Configuración de filtros
export const FILTER_CONFIG = {
  PRICE_RANGES: [
    { label: 'Hasta Bs. 50', value: 'low', min: 0, max: 50 },
    { label: 'Bs. 50 - 200', value: 'medium', min: 50, max: 200 },
    { label: 'Más de Bs. 200', value: 'high', min: 200, max: Infinity },
  ],
  PRODUCT_STATES: [
    { label: 'Con stock', value: 'activo' },
    { label: 'Todos los estados', value: '' },
    { label: 'Agotados', value: 'agotado' },
  ],
};

// Configuración de mapas
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: -17.3730,
    lng: -66.1520,
  },
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 18,
  MIN_ZOOM: 10,
};

// Configuración de créditos
export const CREDITS_CONFIG = {
  MIN_PURCHASE: 1,
  MAX_PURCHASE: 1000,
  COST_PER_CREDIT: 5, // Bs. 5 por crédito
  PACKAGES: [
    { credits: 11, price: 51, name: 'Pack Básico' },
    { credits: 25, price: 120, name: 'Pack Estándar' },
    { credits: 50, price: 220, name: 'Pack Premium' },
    { credits: 100, price: 400, name: 'Pack Profesional' },
    { credits: 200, price: 750, name: 'Pack Empresarial' },
  ],
};

// Configuración de calificaciones
export const RATING_CONFIG = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  DEFAULT_RATING: 5,
  REQUIRED_FOR_COMPLETION: true,
};

// Configuración de horarios
export const SCHEDULE_CONFIG = {
  DAYS_OF_WEEK: [
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
    'domingo',
  ],
  TIME_SLOTS: Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  }),
  MIN_DURATION: 30, // minutos
  MAX_DURATION: 480, // 8 horas
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  ENABLE_LOGGING: import.meta.env.DEV,
  ENABLE_DEBUG_TOOLS: import.meta.env.DEV,
  MOCK_API: false,
  ENABLE_HOT_RELOAD: import.meta.env.DEV,
};

// Función para obtener la URL completa de la API
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Función para obtener la URL de imágenes
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, construir la URL completa
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${cleanBaseUrl}${cleanImagePath}`;
};

// Función para validar si el usuario tiene un rol específico
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Función para validar si el usuario tiene un permiso específico
export const hasPermission = (userRole: string, permission: keyof typeof PERMISSIONS): boolean => {
  return PERMISSIONS[permission].includes(userRole as any);
};

// Función para formatear precios
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(price);
};

// Función para formatear fechas
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

// Función para formatear fechas y horas
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};
