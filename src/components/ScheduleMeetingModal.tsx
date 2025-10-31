import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
    quantity: number;
    unitPrice: number;
    stock: number; // Nuevo prop para el stock (AnettG)
    isLoading?: boolean; // ✅ Estado de carga para prevenir múltiples clics
    onConfirm: (fecha: Date, horario: HorarioVendedor, horaExacta: string, cantidad: number, precioTotal: number) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
    isOpen,
    onClose,
    productName,
    vendorName,
    horarios,
    puntoEncuentro,
    quantity,
    unitPrice,
    stock,
    isLoading = false,
    onConfirm
}) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedHorario, setSelectedHorario] = useState<HorarioVendedor | null>(null);
    const [selectedExactTime, setSelectedExactTime] = useState<string>(''); // Nueva state para hora exacta
    const [cantidadSolicitada, setCantidadSolicitada] = useState<number>(quantity); // Estado para la cantidad (AnettG)
    const [errors, setErrors] = useState<string[]>([]);

    // Estado para controlar el mes que se muestra en el calendario
    const today = new Date();
    const [displayMonth, setDisplayMonth] = useState<number>(today.getMonth());
    const [displayYear, setDisplayYear] = useState<number>(today.getFullYear());

    // Mapeo de días de la semana
    const dayMap = {
        0: 'domingo',
        1: 'lunes',
        2: 'martes',
        3: 'miércoles',
        4: 'jueves',
        5: 'viernes',
        6: 'sábado'
    };

    // Obtener días disponibles del vendedor
    const availableDays = horarios.map(h => h.dia_semana);

    // Funciones para navegar entre meses
    const goToPreviousMonth = () => {
        if (displayMonth === 0) {
            setDisplayMonth(11);
            setDisplayYear(displayYear - 1);
        } else {
            setDisplayMonth(displayMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (displayMonth === 11) {
            setDisplayMonth(0);
            setDisplayYear(displayYear + 1);
        } else {
            setDisplayMonth(displayMonth + 1);
        }
    };

    // Verificar si podemos ir al mes anterior (no permitir meses pasados)
    const canGoPrevious = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        if (displayYear < currentYear) return false;
        if (displayYear === currentYear && displayMonth <= currentMonth) return false;
        return true;
    };

    // Verificar si una fecha es válida (el vendedor trabaja ese día y tiene horarios disponibles)
    const isDateValid = (date: Date): boolean => {
        const today = new Date();
        const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // No permitir fechas pasadas
        if (dateNormalized < todayNormalized) {
            return false;
        }

        const dayOfWeek = dayMap[date.getDay() as keyof typeof dayMap];

        // Verificar si el vendedor trabaja ese día
        if (!availableDays.includes(dayOfWeek as any)) {
            return false;
        }

        // Si es hoy, verificar que tenga horarios disponibles
        const isToday = dateNormalized.getTime() === todayNormalized.getTime();
        if (isToday) {
            // Para hoy, verificar manualmente si hay horarios disponibles
            const horariosDelDia = horarios.filter(h => h.dia_semana === dayOfWeek);

            if (horariosDelDia.length === 0) {
                return false;
            }

            const now = new Date();
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

            const horariosDisponibles = horariosDelDia.filter(horario => {
                const [endHour, endMinute] = horario.hora_fin.split(':').map(Number);
                const endTimeInMinutes = endHour * 60 + endMinute;
                return endTimeInMinutes > (currentTimeInMinutes + 5);
            });

            return horariosDisponibles.length > 0;
        }

        // Para fechas futuras, si el vendedor trabaja ese día, es válida
        return true;
    };

    // Obtener horarios disponibles para la fecha seleccionada
    const getAvailableHorariosForDate = (date: Date): HorarioVendedor[] => {
        const dayOfWeek = dayMap[date.getDay() as keyof typeof dayMap];
        const horariosDelDia = horarios.filter(h => h.dia_semana === dayOfWeek);

        // Si la fecha seleccionada es hoy, filtrar horarios que ya pasaron
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;

            return horariosDelDia.filter(horario => {
                // Parsear hora_fin del horario (formato: "HH:MM")
                const [endHour, endMinute] = horario.hora_fin.split(':').map(Number);
                const endTimeInMinutes = endHour * 60 + endMinute;

                // Solo mostrar horarios que aún no han terminado (con margen de 5 minutos para pruebas)
                return endTimeInMinutes > (currentTimeInMinutes + 5);
            });
        }

        // Para fechas futuras, devolver todos los horarios del día
        return horariosDelDia;
    };

    // Generar días del calendario
    const generateCalendarDays = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizar la hora para comparaciones

        // Usar el mes y año que se está mostrando (displayMonth/displayYear)
        const currentMonth = displayMonth;
        const currentYear = displayYear;

        // Primer día del mes
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        // Días del mes anterior para completar la primera semana
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Generar 42 días (6 semanas x 7 días)
        const days = [];
        const currentDate = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            const date = new Date(currentDate);
            date.setHours(0, 0, 0, 0); // Normalizar la hora para comparaciones

            const isCurrentMonth = date.getMonth() === currentMonth;
            const isPast = date < today;
            const isToday = date.getTime() === today.getTime();
            const hasVendorSchedule = (() => {
                const dayOfWeek = dayMap[date.getDay() as keyof typeof dayMap];
                return availableDays.includes(dayOfWeek as any);
            })();
            const isValid = isDateValid(date);

            days.push({
                date,
                isCurrentMonth,
                isPast,
                isValid: isCurrentMonth && isValid,
                isToday,
                isSelected: selectedDate?.toDateString() === date.toDateString(),
                hasVendorSchedule
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    // Manejar selección de fecha
    const handleDateSelect = (date: Date) => {
        if (!isDateValid(date)) return;

        setSelectedDate(date);
        setSelectedHorario(null); // Reset horario cuando cambia la fecha
        setErrors([]);
    };

    // Manejar selección de horario
    const handleHorarioSelect = (horario: HorarioVendedor) => {
        setSelectedHorario(horario);
        setSelectedExactTime(''); // Reset hora exacta cuando cambia el rango
        setErrors([]);
    };

    // Generar opciones de horarios específicos dentro del rango seleccionado
    const generateSpecificTimeOptions = (horario: HorarioVendedor): string[] => {
        if (!horario) return [];

        const times: string[] = [];
        const [startHour, startMinute] = horario.hora_inicio.split(':').map(Number);
        const [endHour, endMinute] = horario.hora_fin.split(':').map(Number);

        // Convertir a minutos para facilitar el cálculo
        let currentTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        // Si es hoy, considerar la hora actual
        const isToday = selectedDate?.toDateString() === new Date().toDateString();
        if (isToday) {
            const now = new Date();
            const currentActualTimeInMinutes = now.getHours() * 60 + now.getMinutes() + 5; // Agregar 5 min de margen para pruebas
            if (currentActualTimeInMinutes > currentTimeInMinutes) {
                currentTimeInMinutes = currentActualTimeInMinutes;
                // Redondear al próximo cuarto de hora
                const remainder = currentTimeInMinutes % 15;
                if (remainder !== 0) {
                    currentTimeInMinutes += (15 - remainder);
                }
            }
        }

        // Generar horarios cada 15 minutos
        while (currentTimeInMinutes < endTimeInMinutes) {
            const hour = Math.floor(currentTimeInMinutes / 60);
            const minute = currentTimeInMinutes % 60;
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            times.push(timeString);
            currentTimeInMinutes += 15; // Incremento de 15 minutos
        }

        return times;
    };

    // Manejar selección de hora exacta
    const handleExactTimeSelect = (time: string) => {
        setSelectedExactTime(time);
        setErrors([]);
    };

    // Manejar cambio de cantidad (AnettG)
    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10) || 1;
        setCantidadSolicitada(value);
        setErrors([]);
    };

    // Validar y confirmar
    const handleConfirm = () => {
        const newErrors = [];

        if (!selectedDate) {
            newErrors.push('Debe seleccionar una fecha');
        }

        if (!selectedHorario) {
            newErrors.push('Debe seleccionar un horario');
        }

        if (!selectedExactTime) {
            newErrors.push('Debe seleccionar una hora exacta de encuentro');
        }

        if (selectedDate && !isDateValid(selectedDate)) {
            newErrors.push('La fecha seleccionada no coincide con los horarios del vendedor');
        }

        // Validación de cantidad (AnettG)
        if (cantidadSolicitada <= 0) {
            newErrors.push('La cantidad debe ser mayor a 0');
        }
        if (cantidadSolicitada > stock) {
            newErrors.push(`La cantidad solicitada (${cantidadSolicitada}) excede el stock disponible (${stock})`);
        }

        setErrors(newErrors);

        if (newErrors.length === 0 && selectedDate && selectedHorario && selectedExactTime) {
            const precioTotal = unitPrice * cantidadSolicitada;
            onConfirm(selectedDate, selectedHorario, selectedExactTime, cantidadSolicitada, precioTotal);
        }
    };

    // Reset cuando se abre/cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setSelectedDate(null);
            setSelectedHorario(null);
            setSelectedExactTime(''); // Reset hora exacta
            setCantidadSolicitada(quantity); // Reset cantidad (AnettG)
            setErrors([]);
            // Reset calendario al mes actual
            const currentDate = new Date();
            setDisplayMonth(currentDate.getMonth());
            setDisplayYear(currentDate.getFullYear());
        }
    }, [isOpen, quantity]);

    if (!isOpen) return null;

    const calendarDays = generateCalendarDays();
    const availableHorariosForSelectedDate = selectedDate ? getAvailableHorariosForDate(selectedDate) : [];

    // Helper para formatear precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(price);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Agendar encuentro
                            </h2>
                            <p className="text-gray-600">
                                <strong>{productName}</strong> - Vendedor: {vendorName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendario */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Seleccionar fecha
                        </h3>
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                                💡 <strong>Información:</strong> Solo se muestran los días donde el vendedor tiene horarios disponibles.
                                Para hoy, solo aparecen horarios que aún no han terminado.
                            </p>
                        </div>

                        {/* Cabecera del calendario con navegación */}
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                onClick={goToPreviousMonth}
                                disabled={!canGoPrevious()}
                                className={`p-2 rounded-lg transition-colors ${
                                    canGoPrevious()
                                        ? 'hover:bg-gray-100 text-gray-700'
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                                title={canGoPrevious() ? 'Mes anterior' : 'No se puede ir a meses pasados'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <h4 className="text-center font-medium text-gray-900">
                                {new Date(displayYear, displayMonth, 1).toLocaleDateString('es-ES', {
                                    month: 'long',
                                    year: 'numeric'
                                }).toUpperCase()}
                            </h4>

                            <button
                                onClick={goToNextMonth}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                                title="Mes siguiente"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Días de la semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Días del calendario */}
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

                        {/* Leyenda */}
                        <div className="mt-4 text-xs text-gray-500 space-y-1">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                <span>Fecha seleccionada</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
                                <span>Días con horarios disponibles</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded font-bold"></div>
                                <span>Hoy (solo si tiene horarios disponibles)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                                <span>Días sin horarios o pasados</span>
                            </div>
                        </div>
                    </div>

                    {/* Horarios y detalles */}
                    <div>
                        {/* Horarios disponibles */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Seleccionar horario
                            </h3>

                            {selectedDate ? (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Horarios para {selectedDate.toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}:
                                    </p>/
                                    /

                                    {availableHorariosForSelectedDate.length > 0 ? (
                                        <div className="space-y-2">
                                            {availableHorariosForSelectedDate.map((horario, index) => {
                                                const isToday = selectedDate?.toDateString() === new Date().toDateString();
                                                let statusText = '';
                                                let statusColor = '';

                                                if (isToday) {
                                                    const now = new Date();
                                                    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
                                                    const [startHour, startMinute] = horario.hora_inicio.split(':').map(Number);
                                                    const startTimeInMinutes = startHour * 60 + startMinute;

                                                    if (currentTimeInMinutes < startTimeInMinutes) {
                                                        statusText = 'Disponible hoy';
                                                        statusColor = 'text-green-600';
                                                    } else {
                                                        statusText = 'Disponible (ya iniciado)';
                                                        statusColor = 'text-orange-600';
                                                    }
                                                } else {
                                                    statusText = 'Disponible';
                                                    statusColor = 'text-green-600';
                                                }

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleHorarioSelect(horario)}
                                                        className={`
                                                            w-full p-3 rounded-lg border transition-colors text-left
                                                            ${selectedHorario === horario
                                                                ? 'border-blue-600 bg-blue-50 text-blue-900'
                                                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="font-medium">
                                                                {horario.hora_inicio} - {horario.hora_fin}
                                                            </div>
                                                            <div className={`text-xs font-medium ${statusColor}`}>
                                                                {statusText}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-yellow-800 text-sm font-medium">
                                                ⚠️ No hay horarios disponibles para esta fecha
                                            </p>
                                            <p className="text-yellow-700 text-xs mt-1">
                                                {selectedDate?.toDateString() === new Date().toDateString()
                                                    ? 'Los horarios del vendedor para hoy ya han pasado'
                                                    : 'El vendedor no tiene horarios configurados para este día'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    Primero selecciona una fecha
                                </p>
                            )}
                        </div>

                        {/* Selector de hora exacta */}
                        {selectedHorario && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Seleccionar hora exacta
                                </h3>
                                <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="text-purple-800 text-sm">
                                        🕐 <strong>Rango disponible:</strong> {selectedHorario.hora_inicio} - {selectedHorario.hora_fin}
                                    </p>
                                    <p className="text-purple-700 text-xs mt-1">
                                        Selecciona la hora exacta para tu encuentro (intervalos de 15 minutos)
                                    </p>
                                </div>

                                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                    {generateSpecificTimeOptions(selectedHorario).map((timeOption) => (
                                        <button
                                            key={timeOption}
                                            onClick={() => handleExactTimeSelect(timeOption)}
                                            className={`
                                                p-2 rounded-lg border text-sm font-medium transition-colors
                                                ${selectedExactTime === timeOption
                                                    ? 'border-purple-600 bg-purple-100 text-purple-900'
                                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                                                }
                                            `}
                                        >
                                            {timeOption}
                                        </button>
                                    ))}
                                </div>

                                {generateSpecificTimeOptions(selectedHorario).length === 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-orange-800 text-sm font-medium">
                                            ⏰ No hay horarios específicos disponibles
                                        </p>
                                        <p className="text-orange-700 text-xs mt-1">
                                            El horario seleccionado ya ha pasado o es muy próximo
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cantidad solicitada (AnettG) */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Cantidad solicitada
                            </h3>
                            <input
                                type="number"
                                min="1"
                                max={stock}
                                value={cantidadSolicitada}
                                onChange={handleCantidadChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ingrese la cantidad"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Stock disponible: {stock} unidades
                            </p>
                        </div>

                        {/* Punto de encuentro */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">
                                📍 Punto de encuentro
                            </h4>
                            <p className="text-blue-800 font-medium">{puntoEncuentro.nombre}</p>
                            <p className="text-blue-700 text-sm">{puntoEncuentro.direccion}</p>
                            {puntoEncuentro.referencias && (
                                <p className="text-blue-600 text-sm mt-1">
                                    <strong>Referencias:</strong> {puntoEncuentro.referencias}
                                </p>
                            )}
                        </div>

                        {/* Información del pedido */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-3">
                                🛒 Resumen del pedido
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-800">Cantidad:</span>
                                    <span className="font-medium text-green-900">
                                        {cantidadSolicitada} unidad{cantidadSolicitada !== 1 ? 'es' : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-800">Precio unitario:</span>
                                    <span className="font-medium text-green-900">
                                        {formatPrice(unitPrice)}
                                    </span>
                                </div>
                                <div className="border-t border-green-300 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-green-900">Total a pagar:</span>
                                        <span className="text-lg font-bold text-green-900">
                                            {formatPrice(unitPrice * cantidadSolicitada)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Errores */}
                {errors.length > 0 && (
                    <div className="mx-6 mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">
                                Por favor corrige los siguientes errores:
                            </h4>
                            <ul className="text-red-700 text-sm space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Agendando...</span>
                            </>
                        ) : (
                            'Confirmar y Agendar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};