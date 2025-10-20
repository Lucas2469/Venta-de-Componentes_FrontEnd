import { useEffect, useState } from "react";
import { Star, Loader2, Filter, X } from "lucide-react";
import { calificationAPI } from "../api/CalificationApi";

interface Calificacion {
  agendamientoId: number;
  vendedor: {
    id: number;
    nombre: string;
    apellido: string;
  };
  comprador: {
    id: number;
    nombre: string;
    apellido: string;
  };
  califCompradorAVendedor: number | null;
  califVendedorAComprador: number | null;
  comentarioComprador: string | null;
  comentarioVendedor: string | null;
  fechaCita: string;
  horaCita: string;
  puntoEncuentro: string;
  direccionPunto: string;
  referenciasPunto: string;
}

export default function CalificacionesPage() {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [meetingPointFilter, setMeetingPointFilter] = useState("all");

  useEffect(() => {
    loadCalificaciones();
  }, []);

  const loadCalificaciones = async () => {
    try {
      setIsLoading(true);
      const data = await calificationAPI.getAll();
      setCalificaciones(data);
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para normalizar texto: quita acentos y convierte a minúsculas
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD") // Descompone caracteres con acento
      .replace(/[\u0300-\u036f]/g, ""); // Elimina los diacríticos (acentos)
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400 text-sm">Sin calificar</span>;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const uniqueMeetingPoints = [...new Set(calificaciones.map(c => c.puntoEncuentro))];

  const filteredCalificaciones = calificaciones.filter(calif => {
    const normalizedQuery = normalizeText(searchQuery);
    const searchMatch = searchQuery === "" ||
      normalizeText(calif.vendedor.nombre).includes(normalizedQuery) ||
      normalizeText(calif.vendedor.apellido).includes(normalizedQuery) ||
      normalizeText(calif.comprador.nombre).includes(normalizedQuery) ||
      normalizeText(calif.comprador.apellido).includes(normalizedQuery) ||
      normalizeText(calif.puntoEncuentro).includes(normalizedQuery);

    const ratingMatch = minRating === 0 ||
      (calif.califCompradorAVendedor && calif.califCompradorAVendedor >= minRating) ||
      (calif.califVendedorAComprador && calif.califVendedorAComprador >= minRating);

    const meetingPointMatch = meetingPointFilter === "all" || calif.puntoEncuentro === meetingPointFilter;

    return searchMatch && ratingMatch && meetingPointMatch;
  });

  const averageRating = calificaciones.length > 0
    ? (calificaciones.reduce((acc, calif) => {
        const compradorCalif = calif.califCompradorAVendedor || 0;
        const vendedorCalif = calif.califVendedorAComprador || 0;
        return acc + compradorCalif + vendedorCalif;
      }, 0) / (calificaciones.length * 2)).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calificaciones</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{calificaciones.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resultados Filtrados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{filteredCalificaciones.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Filter className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600" />
            Filtros de Búsqueda
          </h3>
          <button
            onClick={() => {
              setSearchQuery("");
              setMinRating(0);
              setMeetingPointFilter("all");
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar usuario o punto
            </label>
            <input
              type="text"
              placeholder="Nombre, apellido o punto de encuentro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación mínima
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="0">Todas</option>
              <option value="1">1+ Estrellas</option>
              <option value="2">2+ Estrellas</option>
              <option value="3">3+ Estrellas</option>
              <option value="4">4+ Estrellas</option>
              <option value="5">5 Estrellas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Punto de encuentro
            </label>
            <select
              value={meetingPointFilter}
              onChange={(e) => setMeetingPointFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Todos</option>
              {uniqueMeetingPoints.map(point => (
                <option key={point} value={point}>{point}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de calificaciones */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Calificaciones ({filteredCalificaciones.length})
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredCalificaciones.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No hay calificaciones que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCalificaciones.map((calif, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vendedor */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">V</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Vendedor</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {calif.vendedor.nombre} {calif.vendedor.apellido}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Calificación del comprador:</p>
                      {renderStars(calif.califCompradorAVendedor)}
                    </div>
                    {calif.comentarioComprador && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700 italic">"{calif.comentarioComprador}"</p>
                      </div>
                    )}
                  </div>

                  {/* Comprador */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">C</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Comprador</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {calif.comprador.nombre} {calif.comprador.apellido}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Calificación del vendedor:</p>
                      {renderStars(calif.califVendedorAComprador)}
                    </div>
                    {calif.comentarioVendedor && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700 italic">"{calif.comentarioVendedor}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del agendamiento */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-700">📅 Fecha y Hora</p>
                      <p>{calif.fechaCita} · {calif.horaCita}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">📍 Punto de Encuentro</p>
                      <p>{calif.puntoEncuentro}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">🗺️ Zona</p>
                      <p>{calif.referenciasPunto}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
