import { useEffect, useMemo, useState, ReactElement } from "react";
import { createSchedule, deleteSchedule, fetchSchedules, updateSchedule } from "../api/schedules";
import { Pencil, Trash2, Plus, X } from "lucide-react";

// =================== TIPOS ===================
export interface ScheduleItem {
  id?: number;
  vendedor_id: number;
  dia_semana: string;   // ahora string: "lunes", "martes", etc.
  hora_inicio: string;
  hora_fin: string;
}

interface ScheduleManagerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vendedorId: number;
}

const DAYS: { label: string; value: string }[] = [
  { label: "Domingo", value: "domingo" },
  { label: "Lunes", value: "lunes" },
  { label: "Martes", value: "martes" },
  { label: "Miércoles", value: "miércoles" },
  { label: "Jueves", value: "jueves" },
  { label: "Viernes", value: "viernes" },
  { label: "Sábado", value: "sábado" },
];

function validRange(start: string, end: string) {
  return start < end; // "HH:MM" funciona lexicográficamente
}

// =================== COMPONENTE ===================
export default function ScheduleManager({ open, onOpenChange, vendedorId }: ScheduleManagerProps): ReactElement {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ dia_semana: string; hora_inicio: string; hora_fin: string }>({
    dia_semana: "",
    hora_inicio: "",
    hora_fin: ""
  });

  const title = useMemo(() => (editingId ? "Editar horario" : "Agregar horario"), [editingId]);

  // =================== FETCH ===================
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSchedules(vendedorId);
        setItems(data);
      } catch (e: any) {
        setError(e.message ?? "Error cargando horarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, vendedorId]);

  // =================== FUNCIONES ===================
  function resetForm() {
    setForm({ dia_semana: "", hora_inicio: "", hora_fin: "" });
    setEditingId(null);
  }

  async function handleSubmit() {
    if (form.dia_semana === "" || !form.hora_inicio || !form.hora_fin) return;
    if (!validRange(form.hora_inicio, form.hora_fin)) {
      setError("El rango de horas no es válido (inicio debe ser menor que fin)");
      return;
    }

    const payload: ScheduleItem = {
      vendedor_id: vendedorId,
      dia_semana: form.dia_semana,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
    };

    try {
      setLoading(true);
      setError(null);
      if (editingId) {
        const updated = await updateSchedule(editingId, payload);
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, ...payload } : it)));
      } else {
        const created = await createSchedule(payload);
        // backend devuelve {message: ...}, opcionalmente puedes re-fetch
        setItems((prev) => [...prev, { ...payload, id: Math.random() }]);
      }
      resetForm();
    } catch (e: any) {
      setError(e.message ?? "Error guardando horario");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await deleteSchedule(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (editingId === id) resetForm();
    } catch (e: any) {
      setError(e.message ?? "Error eliminando horario");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(it: ScheduleItem) {
    setEditingId(it.id ?? null);
    setForm({ dia_semana: it.dia_semana, hora_inicio: it.hora_inicio, hora_fin: it.hora_fin });
  }

  // =================== UI ===================
  if (!open) return <></>;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Mis horarios</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            {title}. Define tus rangos por día (ej. 10:00–11:30).
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid gap-4">
            {/* Formulario */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Día</label>
                  <select
                    value={form.dia_semana}
                    onChange={(e) => setForm((f) => ({ ...f, dia_semana: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Selecciona</option>
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora inicio</label>
                  <input
                    type="time"
                    value={form.hora_inicio}
                    onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora fin</label>
                  <input
                    type="time"
                    value={form.hora_fin}
                    onChange={(e) => setForm((f) => ({ ...f, hora_fin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-800 text-white rounded-md hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editingId ? (
                      <>
                        <Pencil className="h-4 w-4" />
                        Guardar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Agregar
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Día</th>
                  <th className="py-2 pr-2">Inicio</th>
                  <th className="py-2 pr-2">Fin</th>
                  <th className="py-2 pr-2 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id ?? Math.random()} className="border-b last:border-0">
                    <td className="py-2 pr-2">{DAYS.find((d) => d.value === it.dia_semana)?.label}</td>
                    <td className="py-2 pr-2">{it.hora_inicio}</td>
                    <td className="py-2 pr-2">{it.hora_fin}</td>
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(it)}
                          className="p-2 border border-gray-300 text-gray-600 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(it.id)}
                          className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Aún no tienes horarios. Agrega el primero con el formulario superior.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
