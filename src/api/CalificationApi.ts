import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const calificationAPI = {
  // Obtener todas las calificaciones
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/calificaciones`);
      return response.data;
    } catch (error: any) {
      console.error("Error al cargar calificaciones:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudieron cargar las calificaciones");
    }
  },

  // Crear una nueva calificación
  create: async (newCalification: any) => {
    try {
      console.log("Enviando datos al servidor:", JSON.stringify(newCalification, null, 2));
      
      const response = await axios.post(`${API_URL}/calificaciones`, newCalification, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      console.log("Respuesta del servidor:", response.data);
      return response.data?.calificacion ?? response.data;
    } catch (error: any) {
      console.error("Error completo al crear calificación:", error);
      
      if (error.response) {
        console.error("Datos de respuesta del error:", error.response.data);
        console.error("Status del error:", error.response.status);
        
        throw new Error(`Error del servidor (${error.response.status}): ${error.response.data.error || 'Error interno del servidor'}`);
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor:", error.request);
        throw new Error("No se pudo conectar con el servidor. Verifique que el servidor esté ejecutándose.");
      } else {
        console.error("Error de configuración:", error.message);
        throw new Error(`Error de configuración: ${error.message}`);
      }
    }
  },

  // Actualizar una calificación
  update: async (id: string, updatedCalification: any) => {
    try {
      const response = await axios.put(`${API_URL}/calificaciones/${id}`, updatedCalification);
      return response.data?.calificacion ?? response.data;
    } catch (error: any) {
      console.error("Error al actualizar calificación:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo actualizar la calificación");
    }
  },

  // Eliminar una calificación
  delete: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/calificaciones/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error al eliminar calificación:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo eliminar la calificación");
    }
  }
};
