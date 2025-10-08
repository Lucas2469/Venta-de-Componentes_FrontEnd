import React, { useEffect, useState } from "react";
import { createSchedule, deleteSchedule, fetchSchedules, updateSchedule } from "../api/schedules";
import { Pencil, Trash2, Plus, Clock, Calendar, MapPin, User, ArrowLeft, Save, X } from "lucide-react";
import { ConfirmationModal } from "./reusables/ConfirmationModal";
import { showToast } from "./Toast";
import { useAuthContext } from "../contexts/AuthContext";

// =================== TIPOS ===================
export interface ScheduleItem {
  id?: number;
  vendedor_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

interface MisHorariosPageProps {
  onNavigate: (page: string) => void;
}

const DAYS: { label: string; value: string; emoji: string }[] = [
  { label: "Domingo", value: "domingo", emoji: "🌞" },
  { label: "Lunes", value: "lunes", emoji: "💼" },
  { label: "Martes", value: "martes", emoji: "⚡" },
  { label: "Miércoles", value: "miércoles", emoji: "🚀" },
  { label: "Jueves", value: "jueves", emoji: "💪" },
  { label: "Viernes", value: "viernes", emoji: "🎉" },
  { label: "Sábado", value: "sábado", emoji: "🌈" },
];

// =================== VALIDACIONES ===================
function validRange(start: string, end: string): boolean {
  return start < end;
}

function isValidBusinessHour(time: string): boolean {
  const hour = parseInt(time.split(':')[0]);
  // Horarios válidos: 6:00 AM a 10:00 PM (22:00)
  return hour >= 6 && hour <= 22;
}

function isReasonableTimeRange(start: string, end: string): boolean {
  const startHour = parseInt(start.split(':')[0]);
  const endHour = parseInt(end.split(':')[0]);

  // Evitar horarios muy tempranos (antes de 6 AM) o muy tardíos (después de 10 PM)
  if (startHour < 6 || endHour > 22) {
    return false;
  }

  // Evitar horarios muy cortos (menos de 1 hora) o muy largos (más de 12 horas)
  const startTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  return durationHours >= 1 && durationHours <= 12;
}

function hasTimeOverlap(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string
): boolean {
  const newStartTime = new Date(`2000-01-01T${newStart}`);
  const newEndTime = new Date(`2000-01-01T${newEnd}`);
  const existingStartTime = new Date(`2000-01-01T${existingStart}`);
  const existingEndTime = new Date(`2000-01-01T${existingEnd}`);

  // Verificar si hay solapamiento
  return (
    (newStartTime < existingEndTime && newEndTime > existingStartTime)
  );
}

function validateScheduleConflict(
  items: ScheduleItem[],
  newSchedule: { dia_semana: string; hora_inicio: string; hora_fin: string },
  editingId: number | null
): string | null {
  // Buscar horarios del mismo día (excluyendo el que estamos editando)
  const sameDay = items.filter(item =>
    item.dia_semana === newSchedule.dia_semana &&
    item.id !== editingId
  );

  for (const existing of sameDay) {
    if (hasTimeOverlap(
      newSchedule.hora_inicio,
      newSchedule.hora_fin,
      existing.hora_inicio,
      existing.hora_fin
    )) {
      const existingRange = `${existing.hora_inicio.slice(0,5)} - ${existing.hora_fin.slice(0,5)}`;
      return `Ya tienes un horario configurado de ${existingRange} que se solapa con el horario que intentas crear.`;
    }
  }

  return null; // No hay conflictos
}

// Función para validar en tiempo real
function validateFormRealTime(
  form: { dia_semana: string; hora_inicio: string; hora_fin: string },
  items: ScheduleItem[],
  editingId: number | null
) {
  const errors: {
    dia_semana?: string;
    hora_inicio?: string;
    hora_fin?: string;
    general?: string;
  } = {};

  // Validar campos obligatorios
  if (!form.dia_semana) {
    errors.dia_semana = "Selecciona un día de la semana";
  }

  if (!form.hora_inicio) {
    errors.hora_inicio = "Ingresa la hora de inicio";
  }

  if (!form.hora_fin) {
    errors.hora_fin = "Ingresa la hora de fin";
  }

  // Si hay campos vacíos, no validar el resto
  if (!form.dia_semana || !form.hora_inicio || !form.hora_fin) {
    return errors;
  }

  // Validar hora inicio < hora fin
  if (!validRange(form.hora_inicio, form.hora_fin)) {
    errors.hora_fin = "La hora de fin debe ser mayor que la hora de inicio";
  }

  // Validar horarios de negocio
  if (!isValidBusinessHour(form.hora_inicio)) {
    errors.hora_inicio = "Hora debe estar entre 6:00 AM y 10:00 PM";
  }

  if (!isValidBusinessHour(form.hora_fin)) {
    errors.hora_fin = "Hora debe estar entre 6:00 AM y 10:00 PM";
  }

  // Validar rango de tiempo razonable
  if (form.hora_inicio && form.hora_fin && validRange(form.hora_inicio, form.hora_fin)) {
    if (!isReasonableTimeRange(form.hora_inicio, form.hora_fin)) {
      const startTime = new Date(`2000-01-01T${form.hora_inicio}`);
      const endTime = new Date(`2000-01-01T${form.hora_fin}`);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      if (durationHours < 1) {
        errors.general = "El horario debe tener al menos 1 hora de duración";
      } else if (durationHours > 12) {
        errors.general = "El horario no puede durar más de 12 horas seguidas";
      }
    }
  }

  // Validar conflictos con horarios existentes
  if (form.dia_semana && form.hora_inicio && form.hora_fin && !errors.hora_inicio && !errors.hora_fin) {
    const conflictMessage = validateScheduleConflict(items, form, editingId);
    if (conflictMessage) {
      errors.general = conflictMessage;
    }
  }

  return errors;
}

// =================== COMPONENTE ===================
const MisHorariosPage: React.FC<MisHorariosPageProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuthContext();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Estados del formulario
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ dia_semana: string; hora_inicio: string; hora_fin: string }>({
    dia_semana: "",
    hora_inicio: "",
    hora_fin: ""
  });

  // Estados de validación en tiempo real
  const [validationErrors, setValidationErrors] = useState<{
    dia_semana?: string;
    hora_inicio?: string;
    hora_fin?: string;
    general?: string;
  }>({});

  // Estados del modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const vendedorId = currentUser ? parseInt(currentUser.id.toString()) : 0;

  // =================== EFECTOS ===================
  useEffect(() => {
    loadSchedules();
  }, []);

  // Validación en tiempo real
  useEffect(() => {
    const errors = validateFormRealTime(form, items, editingId);
    setValidationErrors(errors);
  }, [form, items, editingId]);

  // =================== FUNCIONES ===================
  async function loadSchedules() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSchedules(vendedorId);
      setItems(data);
    } catch (e: any) {
      setError(e.message ?? "Error cargando horarios");
      showToast("error", e.message ?? "Error cargando horarios");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ dia_semana: "", hora_inicio: "", hora_fin: "" });
    setEditingId(null);
    setShowForm(false);
    setValidationErrors({});
  }

  function startNewSchedule() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(schedule: ScheduleItem) {
    setEditingId(schedule.id ?? null);
    setForm({
      dia_semana: schedule.dia_semana,
      hora_inicio: schedule.hora_inicio,
      hora_fin: schedule.hora_fin
    });
    setShowForm(true);
  }

  async function handleSubmit() {
    // Usar las validaciones ya calculadas
    const errors = validateFormRealTime(form, items, editingId);
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      // Mostrar el primer error encontrado
      const firstError = errors.general || errors.dia_semana || errors.hora_inicio || errors.hora_fin;
      if (firstError) {
        showToast("error", firstError);
      }
      return;
    }

    const payload: ScheduleItem = {
      vendedor_id: vendedorId,
      dia_semana: form.dia_semana,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
    };

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await updateSchedule(editingId, payload);
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, ...payload } : it)));
        showToast("success", "Horario actualizado exitosamente");
      } else {
        await createSchedule(payload);
        // Recargar para obtener el ID real del backend
        await loadSchedules();
        showToast("success", "Horario creado exitosamente");
      }

      resetForm();
    } catch (e: any) {
      const errorMsg = e.message ?? "Error guardando horario";
      setError(errorMsg);
      showToast("error", errorMsg);
    } finally {
      setSaving(false);
    }
  }

  function showDeleteConfirmation(schedule: ScheduleItem) {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirm() {
    if (!scheduleToDelete?.id) return;

    try {
      setDeleting(true);
      await deleteSchedule(scheduleToDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== scheduleToDelete.id));
      setShowDeleteModal(false);
      setScheduleToDelete(null);
      showToast("success", "Horario eliminado exitosamente");

      if (editingId === scheduleToDelete.id) {
        resetForm();
      }
    } catch (e: any) {
      const errorMsg = e.message ?? "Error eliminando horario";
      showToast("error", errorMsg);
    } finally {
      setDeleting(false);
    }
  }

  const getDayData = (dia_semana: string) => {
    return DAYS.find(d => d.value === dia_semana) || { label: dia_semana, emoji: "📅" };
  };

  const getTimeRange = (hora_inicio: string, hora_fin: string) => {
    return `${hora_inicio.slice(0, 5)} - ${hora_fin.slice(0, 5)}`;
  };

  // =================== RENDER ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header con navegación */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate("catalog")}
                className="flex items-center space-x-2 text-gray-600 hover:text-pink-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-pink-700" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Mis Horarios</h1>
                  <p className="text-sm text-gray-600">Gestiona tu disponibilidad</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                 <p className="text-sm font-medium text-gray-900">{currentUser?.nombre} {currentUser?.apellido}</p>
                <p className="text-xs text-gray-500">Vendedor</p>
              </div>
              <div className="bg-pink-100 p-2 rounded-full">
                <User className="h-5 w-5 text-pink-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Panel de información y estadísticas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información del vendedor */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-6 w-6 text-pink-700" />
                <h3 className="text-lg font-bold text-gray-900">Información</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total de horarios:</span>
                  <span className="font-bold text-pink-700">{items.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Días configurados:</span>
                  <span className="font-bold text-pink-700">{new Set(items.map(item => item.dia_semana)).size}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    items.length > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {items.length > 0 ? 'Configurado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-pink-700 to-pink-800 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="h-6 w-6" />
                <h3 className="text-lg font-bold">Disponibilidad</h3>
              </div>
              <p className="text-pink-100 text-sm mb-4">
                Define tus días y horarios de disponibilidad para que los compradores puedan agendar citas contigo.
              </p>
              <div className="text-pink-100 text-sm">
                Los compradores verán estos horarios al intentar contactarte para agendar una cita.
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-blue-900">Tips importantes</h4>
              </div>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Define horarios realistas que puedas cumplir</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Los compradores verán estos horarios al agendar</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Puedes tener múltiples horarios por día</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Panel principal con tabla y formulario */}
          <div className="lg:col-span-2 space-y-6">

            {/* Formulario (mostrar solo cuando showForm es true) */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      {editingId ? <Pencil className="h-5 w-5 text-pink-700" /> : <Plus className="h-5 w-5 text-pink-700" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {editingId ? "Editar Horario" : "Nuevo Horario"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {editingId ? "Modifica los datos del horario" : "Agrega un nuevo horario de disponibilidad"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Información de reglas */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Reglas importantes</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Horarios permitidos: 6:00 AM a 10:00 PM</li>
                    <li>• Duración: mínimo 1 hora, máximo 12 horas</li>
                    <li>• No se permiten horarios solapados en el mismo día</li>
                    <li>• Hora de inicio debe ser menor que hora de fin</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Día de la semana
                    </label>
                    <select
                      value={form.dia_semana}
                      onChange={(e) => setForm((f) => ({ ...f, dia_semana: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.dia_semana
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-pink-500 focus:border-transparent'
                      }`}
                    >
                      <option value="">Selecciona un día</option>
                      {DAYS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.emoji} {d.label}
                        </option>
                      ))}
                    </select>
                    {validationErrors.dia_semana && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationErrors.dia_semana}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de inicio
                      <span className="text-xs text-gray-500 ml-1">(6:00 AM - 10:00 PM)</span>
                    </label>
                    <input
                      type="time"
                      value={form.hora_inicio}
                      onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                      min="06:00"
                      max="22:00"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.hora_inicio
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-pink-500 focus:border-transparent'
                      }`}
                    />
                    {validationErrors.hora_inicio && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationErrors.hora_inicio}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de fin
                      <span className="text-xs text-gray-500 ml-1">(6:00 AM - 10:00 PM)</span>
                    </label>
                    <input
                      type="time"
                      value={form.hora_fin}
                      onChange={(e) => setForm((f) => ({ ...f, hora_fin: e.target.value }))}
                      min="06:00"
                      max="22:00"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.hora_fin
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-pink-500 focus:border-transparent'
                      }`}
                    />
                    {validationErrors.hora_fin && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationErrors.hora_fin}
                      </p>
                    )}
                  </div>
                </div>

                {/* Error general (conflictos y duración) */}
                {validationErrors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-red-500 text-lg">🚫</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-900 mb-1">Error de validación</h4>
                        <p className="text-sm text-red-800">{validationErrors.general}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={resetForm}
                    disabled={saving}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving || Object.keys(validationErrors).length > 0}
                    className="flex items-center space-x-2 px-8 py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{editingId ? "Actualizar" : "Guardar"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de horarios */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Horarios Configurados</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Gestiona tus horarios de disponibilidad
                    </p>
                  </div>
                  {!showForm && (
                    <button
                      onClick={startNewSchedule}
                      className="flex items-center space-x-2 px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar</span>
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando horarios...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Sin horarios configurados</h4>
                  <p className="text-gray-600 mb-6">
                    Aún no has configurado tus horarios de disponibilidad.<br />
                    Agrega tu primer horario para que los compradores puedan contactarte.
                  </p>
                  <button
                    onClick={startNewSchedule}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Primer Horario</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Día
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Horario
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Duración
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item) => {
                        const dayData = getDayData(item.dia_semana);
                        const startTime = new Date(`2000-01-01T${item.hora_inicio}`);
                        const endTime = new Date(`2000-01-01T${item.hora_fin}`);
                        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                        const duration = Math.round(durationHours * 10) / 10; // Redondear a 1 decimal

                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{dayData.emoji}</span>
                                <div>
                                  <div className="font-medium text-gray-900">{dayData.label}</div>
                                  <div className="text-sm text-gray-500">
                                    {item.dia_semana}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-mono text-sm font-medium text-gray-900">
                                {getTimeRange(item.hora_inicio, item.hora_fin)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {duration % 1 === 0 ? `${duration}h` : `${duration}h`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => startEdit(item)}
                                  className="p-2 text-gray-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Editar horario"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => showDeleteConfirmation(item)}
                                  className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Eliminar horario"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-red-100 p-1 rounded-full">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setScheduleToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Horario"
        message={`¿Estás seguro de que deseas eliminar el horario del ${scheduleToDelete ? getDayData(scheduleToDelete.dia_semana).label : ''} de ${scheduleToDelete ? getTimeRange(scheduleToDelete.hora_inicio, scheduleToDelete.hora_fin) : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default MisHorariosPage;