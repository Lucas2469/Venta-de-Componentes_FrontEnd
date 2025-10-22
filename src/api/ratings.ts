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
  comentario: string | null;
  fecha_comentario: string;
  estado: 'activo' | 'inactivo';
}

export interface CreateRatingRequest {
  producto_id: number;
  agendamiento_id: number;
  calificador_id: number;
  calificado_id: number;
  tipo_calificacion: 'comprador_a_vendedor' | 'vendedor_a_comprador';
  calificacion: number;
  comentario?: string | null;
}

export interface PendingRating {
  agendamiento_id: number;
  producto_id: number;
  producto_nombre: string;
  comprador_id: number;
  comprador_nombre: string;
  vendedor_id: number;
  vendedor_nombre: string;
  fecha_cita: string;
  hora_cita: string;
  can_rate_vendor: boolean;
  can_rate_buyer: boolean;
  minutes_since_meeting: number;
}

// Crear una nueva calificación
export const createRating = async (ratingData: CreateRatingRequest): Promise<Rating> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ratings`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
};

// Obtener calificaciones de un agendamiento específico
export const getRatingsByAppointment = async (agendamientoId: number): Promise<Rating[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ratings/appointment/${agendamientoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
};

// Obtener calificaciones con detalles completos del agendamiento
export const getRatingsWithAppointmentDetails = async (agendamientoId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ratings/appointment-details/${agendamientoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment rating details:', error);
    throw error;
  }
};

// Obtener calificaciones pendientes para un usuario
export const getPendingRatings = async (userId: number): Promise<PendingRating[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ratings/pending/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending ratings:', error);
    throw error;
  }
};

// Verificar si un usuario puede calificar en un agendamiento específico
export const canUserRate = async (
  agendamientoId: number,
  userId: number,
  tipoCalificacion: 'comprador_a_vendedor' | 'vendedor_a_comprador'
): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/ratings/can-rate/${agendamientoId}/${userId}/${tipoCalificacion}`
    );
    return response.data.canRate;
  } catch (error) {
    console.error('Error checking rating permission:', error);
    return false;
  }
};

// Obtener calificaciones de un usuario (recibidas)
export const getUserRatings = async (userId: number): Promise<Rating[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ratings/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
};

// Verificar si hay calificaciones que requieren atención (más de 20 minutos después del encuentro)
export const checkPendingRatingsAlert = async (userId: number): Promise<{
  hasPendingRatings: boolean;
  count: number;
  oldestMinutes: number;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ratings/alert/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking pending ratings alert:', error);
    return { hasPendingRatings: false, count: 0, oldestMinutes: 0 };
  }
};