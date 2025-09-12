import { API_CONFIG, getApiUrl } from './api';

// Tipos para la API de usuarios
export interface UserFilters {
    page?: number;
    limit?: number;
    estado?: 'activo' | 'suspendido' | 'inactivo';
    tipo_usuario?: 'comprador' | 'vendedor' | 'admin';
    search?: string;
}

export interface UserDetail {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    tipo_usuario: string;
    creditos_disponibles: number;
    estado: string;
    fecha_registro: string;
    fecha_ultima_actividad: string | null;
    calificacion_promedio: string;
    total_ventas: number;
    total_compras: number;
}

export interface PaginatedUsersResponse {
    success: boolean;
    message: string;
    data: UserDetail[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface SingleUserResponse {
    success: boolean;
    message: string;
    data: UserDetail;
}

export interface UserStatsResponse {
    success: boolean;
    message: string;
    data: {
        total_usuarios: number;
        total_compradores: number;
        total_vendedores: number;
        total_admins: number;
        usuarios_activos: number;
        usuarios_suspendidos: number;
        usuarios_inactivos: number;
        calificacion_promedio_general: number;
        ventas_totales: number;
        compras_totales: number;
        creditos_totales_sistema: number;
    };
}

class UsersApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = getApiUrl(API_CONFIG.ENDPOINTS.USERS);
    }

    // Obtener todos los usuarios
    async getAllUsers(filters: UserFilters = {}): Promise<PaginatedUsersResponse> {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const url = `${this.baseUrl}?${queryParams.toString()}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Obtener usuario por ID
    async getUserById(id: number): Promise<SingleUserResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    // Buscar usuarios
    async searchUsers(query: string, filters: UserFilters = {}): Promise<PaginatedUsersResponse> {
        const searchParams = new URLSearchParams({ q: query });
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value.toString());
            }
        });

        try {
            const response = await fetch(`${this.baseUrl}/search?${searchParams.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }

    // Obtener usuarios por tipo
    async getUsersByType(tipo: string, filters: UserFilters = {}): Promise<PaginatedUsersResponse> {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const url = `${this.baseUrl}/type/${tipo}?${queryParams.toString()}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users by type:', error);
            throw error;
        }
    }

    // Obtener estadísticas
    async getUserStats(): Promise<UserStatsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    // Obtener top vendedores
    async getTopVendedores(limit: number = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/top-vendedores?limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching top sellers:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
export const usersApi = new UsersApi();