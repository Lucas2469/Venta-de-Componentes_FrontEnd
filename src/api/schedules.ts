// src/api/schedules.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchSchedules(vendedorId: number) {
  const res = await fetch(`${API_URL}/schedules/${vendedorId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}

// CREATE -> enviar como array
export async function createSchedule(schedule: any) {
  const res = await fetch(`${API_URL}/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vendedor_id: schedule.vendedor_id,
      horarios: [ // 👈 backend espera array
        {
          dia_semana: schedule.dia_semana,
          hora_inicio: schedule.hora_inicio,
          hora_fin: schedule.hora_fin
        }
      ]
    }),
  });
  if (!res.ok) throw new Error("Error al crear horario");
  return res.json();
}

// UPDATE -> igual, pero pasando array de horarios
export async function updateSchedule(id: number, horario: any) {
  const res = await fetch(`${API_URL}/schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(horario), // { vendedor_id, dia_semana, hora_inicio, hora_fin }
  });
  if (!res.ok) throw new Error("Error al actualizar horario");
  return res.json();
}

// DELETE -> backend debe recibir id del horario, no del vendedor
export async function deleteSchedule(id: number) {
  const res = await fetch(`${API_URL}/schedules/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar horario");
  return res.json();
}
