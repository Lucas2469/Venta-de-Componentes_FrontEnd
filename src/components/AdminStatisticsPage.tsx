import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded mb-1" />
              <div className="h-3 w-28 bg-muted rounded" />
            </CardContent>
          </Card>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usuariosActivosNoAdmin}</div>
            <p className="text-xs text-muted-foreground">Usuarios no admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosActivos}</div>
            <p className="text-xs text-muted-foreground">Anuncios publicados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamientos Completados</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendamientosCompletados}</div>
            <p className="text-xs text-muted-foreground">Citas finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anuncios (7 días)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosUltimos7Dias}</div>
            <p className="text-xs text-muted-foreground">Incluye hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie: Solicitudes de créditos por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Solicitudes de Créditos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
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
          </CardContent>
        </Card>

        {/* Barras: Ingresos por paquete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Ingresos por Paquete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
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
              <p className="text-xs text-muted-foreground mt-2">
                Sin transacciones aprobadas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
