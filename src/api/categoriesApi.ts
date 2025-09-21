import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const categoriesAPI = {
  // Obtener todas las categorías
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/categorias`);
      return response.data;
    } catch (error: any) {
      console.error("Error al cargar categorías:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudieron cargar las categorías");
    }
  },

  // Crear una nueva categoría
  create: async (newCategory: any) => {
    try {
      console.log("Enviando datos al servidor:", JSON.stringify(newCategory, null, 2));
      
      const response = await axios.post(`${API_URL}/categorias`, newCategory, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      console.log("Respuesta del servidor:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error completo al crear categoría:", error);
      
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

  // Actualizar una categoría
  update: async (id: string, updatedCategory: any) => {
    try {
      const response = await axios.put(`${API_URL}/categorias/${id}`, updatedCategory);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar categoría:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo actualizar la categoría");
    }
  },

  // Eliminar una categoría
  delete: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/categorias/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error al eliminar categoría:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo eliminar la categoría");
    }
  }
};