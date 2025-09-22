import { useEffect, useMemo, useState, ReactElement } from "react";
import { createSchedule, deleteSchedule, fetchSchedules, updateSchedule } from "../api/schedules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Mis horarios</DialogTitle>
          <DialogDescription>
            {title}. Define tus rangos por día (ej. 10:00–11:30).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Formulario */}
          <Card className="border-dashed">
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <Label>Día</Label>
                <Select
                  value={form.dia_semana}
                  onValueChange={(v) => setForm((f) => ({ ...f, dia_semana: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Hora inicio</Label>
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                />
              </div>

              <div>
                <Label>Hora fin</Label>
                <Input
                  type="time"
                  value={form.hora_fin}
                  onChange={(e) => setForm((f) => ({ ...f, hora_fin: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {editingId ? (
                    <span className="inline-flex items-center gap-2"><Pencil className="h-4 w-4" /> Guardar</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Agregar</span>
                  )}
                </Button>
                {editingId && (
                  <Button onClick={resetForm}>Cancelar</Button>
                )}
              </div>
            </CardContent>
          </Card>

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
                        <Button variant="outline" size="icon" onClick={() => startEdit(it)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={() => handleDelete(it.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      Aún no tienes horarios. Agrega el primero con el formulario superior.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
