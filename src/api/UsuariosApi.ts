import axios from "axios";
import { getApiBaseUrl } from "../config/api";

const API_URL = getApiBaseUrl();

export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`);
      return response.data;
    } catch (error: any) {
      console.error("Error al cargar usuarios:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudieron cargar los usuarios");
    }
  },

  // Obtener usuario por ID
  getById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error al cargar usuario:", error);
      if (error.response) {
        throw new Error(`Error del servidor: ${error.response.data.error || error.response.status}`);
      }
      throw new Error("No se pudo cargar el usuario");
    }
  }
};
