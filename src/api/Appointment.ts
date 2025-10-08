// api/Appointment.ts
export interface CreateAppointmentRequest {
  producto_id: number;
  comprador_id: number;
  fecha_cita: string; // YYYY-MM-DD format
  hora_cita: string; // HH:mm format
  cantidad_solicitada: number;
  precio_total: number;
}
export interface CreateAppointmentResponse {
  id: number;
  producto_id: number;
  comprador_id: number;
  vendedor_id: number;
  punto_encuentro_id: number;
  fecha_cita: string;
  hora_cita: string;
  dia_semana: string;
  cantidad_solicitada: number;
}

export interface AppointmentError {
  error: string;
}

export interface Appointment {
  id: number;
  producto_id: number;
  comprador_id: number;
  vendedor_id: number;
  punto_encuentro_id: number;
  fecha_cita: string;
  hora_cita: string;
  dia_semana: string;
  estado: 'agendado' | 'confirmado' | 'completado' | 'cancelado';
  fecha_agendamiento: string;
  fecha_confirmacion?: string;
  fecha_completado?: string;
  fecha_actualizacion: string;
  motivo_cancelacion?: string;
  // Datos adicionales del JOIN
  producto_nombre: string;
  producto_precio: string | number; // Puede venir como string desde la DB
  producto_imagen?: string;
  comprador_nombre?: string;
  comprador_telefono?: string;
  vendedor_nombre?: string;
  vendedor_telefono?: string;
  punto_encuentro_nombre: string;
  punto_encuentro_direccion: string;
  punto_encuentro_referencias?: string;
}

export interface ConfirmAppointmentRequest {
  actorUserId: number;
}
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
class AppointmentApi {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      console.log('Status:', response.status);
      console.log('Status text:', response.statusText);

      // Manejar diferentes tipos de respuesta
      const contentType = response.headers.get('content-type');

      let responseData;
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = text ? { message: text } : {};
      }

      console.log('Respuesta del servidor:', responseData);

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Error en la solicitud:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  /**
   * Obtener agendamientos donde el usuario es vendedor
   */
  async getVendorAppointments(vendedorId: number, estado?: string): Promise<any> {
    try {
      let url = `${API_URL}/appointments/vendedor/${vendedorId}`;
      if (estado) {
        url += `?estado=${encodeURIComponent(estado)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: responseData.data || responseData
      };

    } catch (error) {
      console.error('Error al obtener agendamientos del vendedor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  /**
   * Obtener agendamientos donde el usuario es comprador
   */
  async getBuyerAppointments(compradorId: number, estado?: string): Promise<any> {
    try {
      let url = `${API_URL}/appointments/comprador/${compradorId}`;
      if (estado) {
        url += `?estado=${encodeURIComponent(estado)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: responseData.data || responseData
      };

    } catch (error) {
      console.error('Error al obtener agendamientos del comprador:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  /**
   * Confirmar un agendamiento (solo vendedor)
   */
  async confirmAppointment(appointmentId: number, vendedorId: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/confirmacion/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actorUserId: vendedorId }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || responseData.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Error al confirmar agendamiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  /**
   * Rechazar un agendamiento con motivo
   */
  async rejectAppointment(appointmentId: number, motivo: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'cancelado',
          motivo_cancelacion: motivo
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || responseData.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Error al rechazar agendamiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  /**
   * Marcar agendamiento como completado
   */
  async markAsCompleted(appointmentId: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'completado'
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || responseData.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Error al marcar como completado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
}

export const appointmentApi = new AppointmentApi();