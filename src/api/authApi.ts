import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

// Configuración base de la API - Usa .env para producción
const API_BASE_URL = getApiBaseUrl();

// Interfaz para los datos de usuario
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  tipo_usuario: 'admin' | 'comprador' | 'vendedor';
  creditos_disponibles: number;
  estado: string;
  fecha_registro: string;
  fecha_ultima_actividad?: string;
  calificacion_promedio?: number;
  total_intercambios_vendedor?: number;
  total_intercambios_comprador?: number;
  // Propiedades opcionales para compatibilidad
  rating?: number;
  totalTransactions?: number;
  username?: string;
  role?: 'user' | 'admin';
  registrationDate?: string;
  credits?: number;
  isSeller?: boolean;
  isBuyer?: boolean;
  isActive?: boolean;
}

// Interfaz para los tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Interfaz para la respuesta de autenticación
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Interfaz para login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interfaz para registro
export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password: string;
  tipo_usuario?: 'comprador' | 'vendedor';
}

// Interfaz para cambio de contraseña
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Clase para manejo de autenticación
class AuthService {
  private static instance: AuthService;
  private tokens: AuthTokens | null = null;
  private user: User | null = null;

  private constructor() {
    this.loadTokensFromStorage();
    this.setupAxiosInterceptors();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Cargar tokens desde localStorage
  private loadTokensFromStorage(): void {
    try {
      const storedTokens = localStorage.getItem('auth_tokens');
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedTokens && storedUser) {
        this.tokens = JSON.parse(storedTokens);
        this.user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      this.clearAuth();
    }
  }

  // Guardar tokens en localStorage
  private saveTokensToStorage(): void {
    if (this.tokens && this.user) {
      localStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
      localStorage.setItem('auth_user', JSON.stringify(this.user));
    }
  }

  // Limpiar autenticación
  private clearAuth(): void {
    this.tokens = null;
    this.user = null;
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  }

  // Configurar interceptores de axios
  private setupAxiosInterceptors(): void {
    // Interceptor para agregar token a requests
    axios.interceptors.request.use(
      (config) => {
        if (this.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y refresh token
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // No intentar refresh en endpoints de autenticación (login, register, etc)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                              originalRequest.url?.includes('/auth/register') ||
                              originalRequest.url?.includes('/auth/forgot-password');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            // Reintentar request original con nuevo token
            originalRequest.headers.Authorization = `Bearer ${this.tokens?.accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Login
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      if (response.data.success) {
        this.tokens = response.data.data.tokens;
        this.user = response.data.data.user;
        this.saveTokensToStorage();
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error en login');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error de conexión al servidor');
    }
  }

  // Registro
  public async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.success) {
        this.tokens = response.data.data.tokens;
        this.user = response.data.data.user;
        this.saveTokensToStorage();
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error en registro');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error de conexión al servidor');
    }
  }

  // Refresh token
  public async refreshToken(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.tokens.refreshToken
      });

      if (response.data.success) {
        this.tokens = response.data.data.tokens;
        this.saveTokensToStorage();
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      if (this.tokens?.accessToken && this.tokens?.refreshToken) {
        // Enviar refresh token para invalidarlo en el servidor
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          refreshToken: this.tokens.refreshToken
        }, {
          headers: { Authorization: `Bearer ${this.tokens.accessToken}` }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearAuth();
    }
  }

  // Obtener perfil
  public async getProfile(): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      
      if (response.data.success) {
        this.user = response.data.data;
        this.saveTokensToStorage();
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error obteniendo perfil');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error de conexión al servidor');
    }
  }

  // Cambiar contraseña
  public async changePassword(passwordData: ChangePasswordData): Promise<void> {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/change-password`, passwordData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error cambiando contraseña');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error de conexión al servidor');
    }
  }

  // Verificar token
  public async verifyToken(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  // Getters
  public isAuthenticated(): boolean {
    return !!(this.tokens?.accessToken && this.user);
  }

  public getCurrentUser(): User | null {
    return this.user;
  }

  public getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  public isAdmin(): boolean {
    return this.user?.tipo_usuario === 'admin';
  }

  public isVendor(): boolean {
    return this.user?.tipo_usuario === 'vendedor';
  }

  public isBuyer(): boolean {
    return this.user?.tipo_usuario === 'comprador';
  }

  // Actualizar usuario en memoria
  public updateUser(updatedUser: Partial<User>): void {
    if (this.user) {
      this.user = { ...this.user, ...updatedUser };
      this.saveTokensToStorage();
    }
  }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();

// Exportar funciones de conveniencia
export const login = (credentials: LoginCredentials) => authService.login(credentials);
export const register = (userData: RegisterData) => authService.register(userData);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const isAdmin = () => authService.isAdmin();
export const isVendor = () => authService.isVendor();
export const isBuyer = () => authService.isBuyer();
export const updateUser = (user: Partial<User>) => authService.updateUser(user);
