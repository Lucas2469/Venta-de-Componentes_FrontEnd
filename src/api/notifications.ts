import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Notification {
  id: number;
  remitente_id?: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo_notificacion: string;
  estado: 'no_vista' | 'vista';
  prioridad: string;
  fecha_creacion: string;
  fecha_vista?: string;
  remitente_nombre?: string;
  remitente_apellido?: string;
}

export interface NotificationFilters {
  estado?: 'no_vista' | 'vista';
  tipo_notificacion?: string;
  page?: number;
  limit?: number;
}

export interface CreateNotificationData {
  remitente_id?: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo_notificacion?: string;
}

/**
 * Obtener notificaciones de un usuario
 */
export async function fetchUserNotifications(
  userId: number,
  filters?: NotificationFilters
): Promise<Notification[]> {
  try {
    let url = `${API_BASE_URL}/notifications/user/${userId}`;
    const params = new URLSearchParams();

    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo_notificacion) params.append('tipo_notificacion', filters.tipo_notificacion);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Error al obtener notificaciones');
  }
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function fetchUnreadNotificationsCount(userId: number): Promise<number> {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/user/${userId}/unread-count`);
    return response.data.data?.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
  try {
    const response = await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      usuario_id: userId
    });
    return response.data.success || false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Crear nueva notificación
 */
export async function createNotification(data: CreateNotificationData): Promise<boolean> {
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications`, data);
    return response.data.success || false;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Eliminar notificación
 */
export async function deleteNotification(notificationId: number, userId: number): Promise<boolean> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
      data: { usuario_id: userId }
    });
    return response.data.success || false;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

/**
 * Obtener las últimas notificaciones para el panel del header (límite de 5)
 */
export async function fetchRecentNotifications(userId: number): Promise<Notification[]> {
  return fetchUserNotifications(userId, { limit: 5 });
}