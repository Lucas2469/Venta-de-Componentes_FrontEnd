import axios from "axios";
import { mockMeetingPoints } from "../components/mockData"; // Importa tus tipos
import { MeetingPoint } from "../components/types";

const API_URL = "http://localhost:5000/api"; 

export const getMeetingPoints = async (): Promise<MeetingPoint[]> => {
  try {
    const response = await axios.get(`${API_URL}/puntosencuentro`);
    return response.data;
  } catch (error) {
    console.error("Error al cargar puntos de encuentro:", error);
    throw new Error("No se pudieron cargar los puntos de encuentro");
  }
};

// Si necesitas más funciones (ej. crear, actualizar, eliminar):
export const createMeetingPoint = async (newPoint: Omit<MeetingPoint, "id">): Promise<MeetingPoint> => {
  try {
    const response = await axios.post(`${API_URL}/puntosencuentro`, newPoint);
    return response.data;
  } catch (error) {
    console.error("Error al crear punto de encuentro:", error);
    throw new Error("No se pudo crear el punto de encuentro");
  }
};

