import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  ShoppingBag,
  Check,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { getStats, StatsResponse } from "../api/statsApi";

const COLORS = {
  pendiente: "#fbbf24",
  aprobada: "#10b981",
  rechazada: "#ef4444",
};

const formatBs = (n: number) =>
  n.toLocaleString("es-BO", { style: "currency", currency: "BOB" });

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (e) {
        setError("No se pudieron cargar las estadísticas.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 pb-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="px-6 pb-6">
              <div className="h-8 w-20 bg-gray-200 rounded mb-1 animate-pulse" />
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return <p className="text-sm text-red-600">{error ?? "Sin datos"}</p>;
  }

  const pieData = [
    { name: "Pendientes", key: "pendiente", value: stats.solicitudesCreditosPorEstado.pendiente, color: COLORS.pendiente },
    { name: "Aprobadas", key: "aprobada", value: stats.solicitudesCreditosPorEstado.aprobada, color: COLORS.aprobada },
    { name: "Rechazadas", key: "rechazada", value: stats.solicitudesCreditosPorEstado.rechazada, color: COLORS.rechazada },
  ];

  const barData = stats.ingresosPorPaquete.length
    ? stats.ingresosPorPaquete.map((r) => ({ pack: r.pack, total: r.total }))
    : [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6 pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700">Usuarios Activos</h3>
            <Users className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.usuariosActivosNoAdmin}</div>
            <p className="text-xs text-gray-500">Usuarios no admin</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6 pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700">Productos Activos</h3>
            <ShoppingBag className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.productosActivos}</div>
            <p className="text-xs text-gray-500">Anuncios publicados</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6 pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700">Agendamientos Completados</h3>
            <Check className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.agendamientosCompletados}</div>
            <p className="text-xs text-gray-500">Citas finalizadas</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6 pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700">Anuncios (7 días)</h3>
            <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.productosUltimos7Dias}</div>
            <p className="text-xs text-gray-500">Incluye hoy</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Pie: Solicitudes de créditos por estado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <PieChartIcon className="h-4 sm:h-5 w-4 sm:w-5" />
              <span>Solicitudes de Créditos</span>
            </h3>
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Barras: Ingresos por paquete */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-4 sm:h-5 w-4 sm:w-5" />
              <span>Ingresos por Paquete</span>
            </h3>
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pack" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatBs(Number(value)), "Total"]}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total (Bs)" fill="#9d0045" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {!barData.length && (
              <p className="text-xs text-gray-500 mt-2">
                Sin transacciones aprobadas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}