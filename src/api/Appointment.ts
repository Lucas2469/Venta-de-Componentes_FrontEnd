import { Alert } from "@/components/ui/alert";

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
}

export const appointmentApi = new AppointmentApi();