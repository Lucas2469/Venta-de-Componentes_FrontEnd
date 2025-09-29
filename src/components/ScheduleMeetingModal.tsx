import React, { useState, useEffect } from 'react';
import { HorarioVendedor } from '../api/productsApi';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  vendorName: string;
  horarios: HorarioVendedor[];
  puntoEncuentro: {
    nombre: string;
    direccion: string;
    referencias?: string;  
  };
  onConfirm: (fecha: Date, horario: HorarioVendedor, cantidad_solicitada: number) => void;
  stock: number; // Nuevo prop para el stock
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  productName,
  vendorName,
  horarios,
  puntoEncuentro,
  onConfirm,
  stock,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<HorarioVendedor | null>(null);
  const [cantidadSolicitada, setCantidadSolicitada] = useState<number>(1); // Estado para la cantidad
  const [errors, setErrors] = useState<string[]>([]);

  const dayMap = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miércoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sábado',
  };

  const availableDays = horarios.map((h) => h.dia_semana);

  const isDateValid = (date: Date): boolean => {
    const dayOfWeek = dayMap[date.getDay() as keyof typeof dayMap];
    return availableDays.includes(dayOfWeek as any);
  };

  const getAvailableHorariosForDate = (date: Date): HorarioVendedor[] => {
    const dayOfWeek = dayMap[date.getDay() as keyof typeof dayMap];
    return horarios.filter((h) => h.dia_semana === dayOfWeek);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getMonth() === currentMonth;
      const isPast = date < today;
      const isValid = isDateValid(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push({
        date,
        isCurrentMonth,
        isPast,
        isValid: isCurrentMonth && !isPast && isValid,
        isToday,
        isSelected: selectedDate?.toDateString() === date.toDateString(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    if (date < new Date() || !isDateValid(date)) return;
    setSelectedDate(date);
    setSelectedHorario(null);
    setErrors([]);
  };

  const handleHorarioSelect = (horario: HorarioVendedor) => {
    setSelectedHorario(horario);
    setErrors([]);
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 1; // Valor por defecto 1 si no es un número
    setCantidadSolicitada(value);
    setErrors([]); // Limpiar errores al cambiar
  };

  const handleConfirm = () => {
    const newErrors = [];

    if (!selectedDate) newErrors.push('Debe seleccionar una fecha');
    if (!selectedHorario) newErrors.push('Debe seleccionar un horario');
    if (cantidadSolicitada <= 0) newErrors.push('La cantidad debe ser mayor a 0');
    if (cantidadSolicitada > stock) newErrors.push(`La cantidad solicitada (${cantidadSolicitada}) excede el stock disponible (${stock})`);

    setErrors(newErrors);

    if (newErrors.length === 0 && selectedDate && selectedHorario) {
      console.log('Datos a enviar desde modal:', {
        producto_id: 2, // Fijo para depuración
        comprador_id: 4, // Fijo para depuración
        fecha_cita: selectedDate.toISOString().split('T')[0],
        hora_cita: selectedHorario.hora_inicio,
        cantidadSolicitada,
      });
      onConfirm(selectedDate, selectedHorario, cantidadSolicitada);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedHorario(null);
      setCantidadSolicitada(1); // Resetear cantidad al cerrar
      setErrors([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calendarDays = generateCalendarDays();
  const availableHorariosForSelectedDate = selectedDate ? getAvailableHorariosForDate(selectedDate) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Agendar encuentro</h2>
              <p className="text-gray-600"><strong>{productName}</strong> - Vendedor: {vendorName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar fecha</h3>
            <div className="mb-4">
              <h4 className="text-center font-medium text-gray-900">
                {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
              </h4>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.date)}
                  disabled={!day.isValid}
                  className={`
                    aspect-square text-sm font-medium rounded-lg transition-colors
                    ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                    ${day.isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${day.isValid ? 'hover:bg-blue-100 cursor-pointer' : 'cursor-not-allowed'}
                    ${day.isSelected ? 'bg-blue-600 text-white' : ''}
                    ${day.isToday && !day.isSelected ? 'bg-blue-50 text-blue-600 font-bold' : ''}
                    ${!day.isValid && day.isCurrentMonth && !day.isPast ? 'text-gray-400 bg-gray-50' : ''}
                  `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-600 rounded"></div><span>Fecha seleccionada</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div><span>Días disponibles</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div><span>Días no disponibles</span></div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar horario</h3>
              {selectedDate ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Horarios para {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}:
                  </p>
                  {availableHorariosForSelectedDate.length > 0 ? (
                    <div className="space-y-2">
                      {availableHorariosForSelectedDate.map((horario, index) => (
                        <button
                          key={index}
                          onClick={() => handleHorarioSelect(horario)}
                          className={`
                            w-full p-3 rounded-lg border transition-colors text-left
                            ${selectedHorario === horario ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
                          `}
                        >
                          <div className="font-medium">{horario.hora_inicio} - {horario.hora_fin}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">No hay horarios disponibles para esta fecha</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Primero selecciona una fecha</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cantidad solicitada</h3>
              <input
                type="number"
                min="1"
                max={stock}
                value={cantidadSolicitada}
                onChange={handleCantidadChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese la cantidad"
              />
              <p className="text-sm text-gray-600 mt-1">Stock disponible: {stock} unidades</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📍 Punto de encuentro</h4>
              <p className="text-blue-800 font-medium">{puntoEncuentro.nombre}</p>
              <p className="text-blue-700 text-sm">{puntoEncuentro.direccion}</p>
              {puntoEncuentro.referencias && (
                <p className="text-blue-600 text-sm mt-1"><strong>Referencias:</strong> {puntoEncuentro.referencias}</p>
              )}
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mx-6 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Por favor corrige los siguientes errores:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => <li key={index}>• {error}</li>)}
              </ul>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Confirmar y Agendar
          </button>
        </div>
      </div>
    </div>
  );
};