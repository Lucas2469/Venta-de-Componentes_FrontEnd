import axios from "axios";

export interface StatsResponse {
  usuariosActivosNoAdmin: number;
  productosActivos: number;
  agendamientosCompletados: number;
  productosUltimos7Dias: number;
  solicitudesCreditosPorEstado: {
    aprobada: number;
    pendiente: number;
    rechazada: number;
  };
  ingresosPorPaquete: Array<{ pack: string; total: number }>;
}

const API_BASE = import.meta.env.VITE_API_URL;

export const STATS_API = `${API_BASE}/api/stats`;

// Retry logic with exponential backoff
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<any> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Stats API retry ${attempt + 1}/${maxRetries - 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export const getStats = async (): Promise<StatsResponse> => {
  return retryWithBackoff(
    async () => {
      const { data } = await axios.get(STATS_API, { timeout: 10000 });
      return data as StatsResponse;
    },
    3, // maxRetries
    1000 // baseDelay in ms
  );
};
