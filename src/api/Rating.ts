import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl();

export interface Rating {
  id: number;
  producto_id: number;
  agendamiento_id: number;
  calificador_id: number;
  calificado_id: number;
  tipo_calificacion: 'comprador_a_vendedor' | 'vendedor_a_comprador';
  calificacion: number;
  comentario?: string;
  fecha_calificacion: string;
  estado: 'activo' | 'inactivo';
}

export interface CreateRatingRequest {
  producto_id: number;
  agendamiento_id: number;
  calificador_id: number;
  calificado_id: number;
  tipo_calificacion: 'comprador_a_vendedor' | 'vendedor_a_comprador';
  calificacion: number;
  comentario?: string;
}

export interface RatingResponse {
  success: boolean;
  message: string;
  data?: Rating;
}

export const ratingApi = {
  // Crear nueva calificación
  async createRating(ratingData: CreateRatingRequest): Promise<RatingResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/calificaciones`, ratingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear calificación');
    }
  },

  // Obtener calificaciones de un producto
  async getProductRatings(productId: number): Promise<Rating[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calificaciones/producto/${productId}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener calificaciones');
    }
  },

  // Obtener calificaciones de un usuario
  async getUserRatings(userId: number): Promise<Rating[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calificaciones/usuario/${userId}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener calificaciones del usuario');
    }
  },

  // Verificar si un agendamiento ya fue calificado
  async checkIfRated(agendamientoId: number, calificadorId: number, tipoCalificacion: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calificaciones/check/${agendamientoId}/${calificadorId}/${tipoCalificacion}`);
      return response.data.exists || false;
    } catch (error: any) {
      return false; // Si hay error, asumimos que no está calificado
    }
  }
};

export default ratingApi;