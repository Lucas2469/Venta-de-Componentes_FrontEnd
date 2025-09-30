import { API_CONFIG, getApiUrl } from './api';

// Tipos para la API de productos
export interface ProductFilters {
    page?: number;
    limit?: number;
    category?: number;
    minPrice?: number;
    maxPrice?: number;
    estado?: 'activo' | 'inactivo' | 'agotado';
    search?: string;
}

export interface ProductImage {
    id: number;
    url_imagen: string;
    orden_visualizacion: number;
    fecha_subida: string;
}

export interface HorarioVendedor {
    dia_semana: 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';
    hora_inicio: string;
    hora_fin: string;
    estado: 'activo' | 'inactivo';
}

export interface ProductDetail {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    especificaciones: string | null;
    estado: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    categoria_nombre: string;
    categoria_id: number;
    vendedor_nombre: string;
    vendedor_apellido: string;
    vendedor_id: number;
    vendedor_calificacion: string;
    vendedor_total_ventas: number;
    vendedor_fecha_registro?: string;
    imagen_principal?: string;
    total_imagenes?: number;
    imagenes?: ProductImage[];
    productos_relacionados?: ProductSummary[];
    horarios_vendedor?: HorarioVendedor[];
    // Información del punto de encuentro
    punto_encuentro_nombre?: string;
    punto_encuentro_direccion?: string;
    punto_encuentro_referencias?: string;
    coordenadas_lat?: number;
    coordenadas_lng?: number;
    punto_encuentro_id: number;

}

export interface ProductSummary {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    estado: string;
    imagen_principal: string;
    categoria_nombre: string;
    categoria_id: number;
    vendedor_id: number;
    vendedor_nombre: string;
    vendedor_apellido: string;
    vendedor_calificacion: string;
    total_imagenes: number;
}

export interface PaginatedProductsResponse {
    success: boolean;
    message: string;
    data: ProductSummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface SingleProductResponse {
    success: boolean;
    message: string;
    data: ProductDetail;
}

export interface ProductStatsResponse {
    success: boolean;
    message: string;
    data: {
        total_productos: number;
        productos_activos: number;
        productos_inactivos: number;
        productos_agotados: number;
        precio_promedio: number;
        precio_minimo: number;
        precio_maximo: number;
        stock_total: number;
    };
}

class ProductsApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS);
    }

    // Obtener todos los productos con filtros
    async getAllProducts(filters: ProductFilters = {}): Promise<PaginatedProductsResponse> {
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
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Obtener producto por ID
    async getProductById(id: number): Promise<SingleProductResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    // Buscar productos
    async searchProducts(query: string, filters: ProductFilters = {}): Promise<PaginatedProductsResponse> {
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
            console.error('Error searching products:', error);
            throw error;
        }
    }

    // Obtener productos por categoría
    async getProductsByCategory(categoryId: number, filters: ProductFilters = {}): Promise<PaginatedProductsResponse> {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const url = `${this.baseUrl}/category/${categoryId}?${queryParams.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw error;
        }
    }

    // Obtener estadísticas de productos
    async getProductStats(): Promise<ProductStatsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product stats:', error);
            throw error;
        }
    }

    // Verificar disponibilidad
    async checkAvailability(id: number) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/availability`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error checking availability:', error);
            throw error;
        }
    }

    // Actualizar estado de producto
    async updateProductStatus(id: number, estado: 'activo' | 'inactivo' | 'expirado' | 'agotado') {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating product status:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
export const productsApi = new ProductsApi();