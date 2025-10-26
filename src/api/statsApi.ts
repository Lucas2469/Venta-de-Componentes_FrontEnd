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

export const getStats = async (): Promise<StatsResponse> => {
  const { data } = await axios.get(STATS_API);
  return data as StatsResponse;
};
