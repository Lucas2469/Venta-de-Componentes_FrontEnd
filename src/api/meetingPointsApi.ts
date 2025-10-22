// api/meetingPointsApi.ts
import axios from "axios";
import { getApiBaseUrl } from "../config/api";

const API_URL = getApiBaseUrl();

export const meetingPointsAPI = {
  // Obtener todos los puntos de encuentro
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/puntosencuentro`);
      return response.data;
    } catch (error: any) {
      console.error("Error al cargar puntos de encuentro:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudieron cargar los puntos de encuentro");
    }
  },

  // Crear un nuevo punto de encuentro
  create: async (newPoint: any) => {
    try {
      console.log("Enviando datos al servidor:", JSON.stringify(newPoint, null, 2));
      
      const response = await axios.post(`${API_URL}/puntosencuentro`, newPoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 segundos timeout
      });
      
      console.log("Respuesta del servidor:", response.data);
      // El backend devuelve { message, meetingPoint }
      return response.data?.meetingPoint ?? response.data;
    } catch (error: any) {
      console.error("Error completo al crear punto de encuentro:", error);
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error("Datos de respuesta del error:", error.response.data);
        console.error("Status del error:", error.response.status);
        console.error("Headers del error:", error.response.headers);
        
        throw new Error(`Error del servidor (${error.response.status}): ${error.response.data.error || 'Error interno del servidor'}`);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error("No se recibió respuesta del servidor:", error.request);
        throw new Error("No se pudo conectar con el servidor. Verifique que el servidor esté ejecutándose.");
      } else {
        // Error al configurar la solicitud
        console.error("Error de configuración:", error.message);
        throw new Error(`Error de configuración: ${error.message}`);
      }
    }
  },

  // Actualizar un punto de encuentro
  update: async (id: string, updatedPoint: any) => {
    try {
      const response = await axios.put(`${API_URL}/puntosencuentro/${id}`, updatedPoint);
      // El backend puede devolver el objeto actualizado directamente o envuelto
      return response.data?.meetingPoint ?? response.data;
    } catch (error: any) {
      console.error("Error al actualizar punto de encuentro:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo actualizar el punto de encuentro");
    }
  },

  // Eliminar un punto de encuentro
  delete: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/puntosencuentro/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error al eliminar punto de encuentro:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo eliminar el punto de encuentro");
    }
  },

  // Alternar estado (activo/inactivo)
  toggleStatus: async (id: string) => {
    try {
      const detail = await axios.get(`${API_URL}/puntosencuentro/${id}`).then(r => r.data);
      const nextEstado = (detail?.estado === 'activo') ? 'inactivo' : 'activo';
      const payload = { ...detail, estado: nextEstado };
      const response = await axios.put(`${API_URL}/puntosencuentro/${id}`, payload);
      return response.data?.meetingPoint ?? { ...detail, estado: nextEstado };
    } catch (error: any) {
      console.error("Error al alternar estado del punto de encuentro:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo alternar el estado del punto de encuentro");
    }
  }
};