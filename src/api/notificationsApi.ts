import { API_CONFIG, getApiUrl } from './api';

// Tipos para la API de notificaciones
export interface NotificationData {
    id: number;
    remitente_id: number | null;
    usuario_id: number;
    titulo: string;
    mensaje: string;
    tipo_notificacion: 'producto' | 'creditos' | 'agendamiento' | 'calificacion';
    estado: 'vista' | 'no_vista';
    prioridad: 'baja' | 'normal' | 'alta';
    fecha_creacion: string;
    fecha_vista: string | null;
    remitente_nombre?: string;
    remitente_apellido?: string;
}

export interface CreateNotificationRequest {
    remitente_id?: number;
    usuario_id: number;
    titulo: string;
    mensaje: string;
    tipo_notificacion?: 'producto' | 'creditos' | 'agendamiento' | 'calificacion';
}

export interface NotificationResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface NotificationsListResponse {
    success: boolean;
    message: string;
    data: NotificationData[];
}

export interface UnreadCountResponse {
    success: boolean;
    message: string;
    data: {
        count: number;
    };
}

class NotificationsApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = getApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS || '/notifications');
    }

    // Crear una nueva notificación
    async createNotification(notificationData: CreateNotificationRequest): Promise<NotificationResponse> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Obtener notificaciones de un usuario
    async getNotificationsByUser(
        userId: number,
        filters: {
            estado?: 'vista' | 'no_vista';
            tipo_notificacion?: 'producto' | 'creditos' | 'agendamiento' | 'calificacion';
            page?: number;
            limit?: number;
        } = {}
    ): Promise<NotificationsListResponse> {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const url = `${this.baseUrl}/user/${userId}?${queryParams.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Marcar notificación como vista
    async markAsRead(notificationId: number, userId: number): Promise<NotificationResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario_id: userId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Contar notificaciones no vistas
    async getUnreadCount(userId: number): Promise<UnreadCountResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/user/${userId}/unread-count`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }

    // Eliminar notificación
    async deleteNotification(notificationId: number, userId: number): Promise<NotificationResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario_id: userId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
export const notificationsApi = new NotificationsApi();