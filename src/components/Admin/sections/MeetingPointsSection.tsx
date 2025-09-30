import React, { useState, useEffect } from "react";
import { MapPin, Loader2, Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { meetingPointsAPI } from '../../../api/meetingPointsApi';
import MapComponent from '../../MapComponent';
import { MeetingPoint } from "../../types";
import { ConfirmationModal } from '../../reusables/ConfirmationModal';

export function MeetingPointsSection() {
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [newMeetingPoint, setNewMeetingPoint] = useState({
    nombre: "",
    direccion: "",
    referencias: "",
    coordenadas_lat: -16.5000,
    coordenadas_lng: -68.1193,
    estado: "activo" as "activo" | "inactivo"
  });
  const [editingMeetingPoint, setEditingMeetingPoint] = useState<MeetingPoint | null>(null);
  const [showMeetingPointDialog, setShowMeetingPointDialog] = useState(false);
  const [showDeleteMeetingPointConfirm, setShowDeleteMeetingPointConfirm] = useState(false);
  const [meetingPointToDelete, setMeetingPointToDelete] = useState<MeetingPoint | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [meetingPointToToggle, setMeetingPointToToggle] = useState<MeetingPoint | null>(null);
  const [isMeetingPointsLoading, setIsMeetingPointsLoading] = useState(false);
  const [meetingPointActionLoading, setMeetingPointActionLoading] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: -16.5000, lng: -68.1193 });
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>("todas");


  useEffect(() => {
    loadMeetingPoints();
  }, []);

  const loadMeetingPoints = async () => {
    try {
      setIsMeetingPointsLoading(true);
      const meetingPointsData = await meetingPointsAPI.getAll();
      setMeetingPoints(meetingPointsData);
    } catch (error) {
      console.error("Error al cargar puntos de encuentro:", error);
    } finally {
      setIsMeetingPointsLoading(false);
    }
  };

  const handleCreateMeetingPoint = async () => {
    try {
      setIsMeetingPointsLoading(true);
      const meetingPointToCreate = {
        ...newMeetingPoint,
        coordenadas_lat: Number(newMeetingPoint.coordenadas_lat),
        coordenadas_lng: Number(newMeetingPoint.coordenadas_lng)
      };
      await meetingPointsAPI.create(meetingPointToCreate);
      await loadMeetingPoints();
      setNewMeetingPoint({
        nombre: "",
        direccion: "",
        referencias: "",
        coordenadas_lat: -16.5000,
        coordenadas_lng: -68.1193,
        estado: "activo"
      });
      setShowMeetingPointDialog(false);
    } catch (error) {
      console.error("Error al crear punto de encuentro:", error);
    } finally {
      setIsMeetingPointsLoading(false);
    }
  };

  const handleUpdateMeetingPoint = async () => {
    if (!editingMeetingPoint) return;
    
    try {
      setIsMeetingPointsLoading(true);
      await meetingPointsAPI.update(editingMeetingPoint.id, {
        nombre: editingMeetingPoint.nombre,
        direccion: editingMeetingPoint.direccion,
        referencias: editingMeetingPoint.referencias,
        coordenadas_lat: editingMeetingPoint.coordenadas_lat,
        coordenadas_lng: editingMeetingPoint.coordenadas_lng,
        estado: editingMeetingPoint.estado
      });
      await loadMeetingPoints();
      setEditingMeetingPoint(null);
      setShowMeetingPointDialog(false);
    } catch (error) {
      console.error("Error al actualizar punto de encuentro:", error);
    } finally {
      setIsMeetingPointsLoading(false);
    }
  };

  const handleDeleteMeetingPoint = async () => {
    if (!meetingPointToDelete) return;

    try {
      setMeetingPointActionLoading(meetingPointToDelete.id);
      await meetingPointsAPI.delete(meetingPointToDelete.id);
      await loadMeetingPoints();
      setShowDeleteMeetingPointConfirm(false);
      setMeetingPointToDelete(null);
    } catch (error) {
      console.error("Error al eliminar punto de encuentro:", error);
    } finally {
      setMeetingPointActionLoading(null);
    }
  };

  const handleToggleMeetingPointStatus = async () => {
    if (!meetingPointToToggle) return;

    try {
      setMeetingPointActionLoading(meetingPointToToggle.id);
      await meetingPointsAPI.toggleStatus(meetingPointToToggle.id);
      await loadMeetingPoints();
      setShowStatusConfirm(false);
      setMeetingPointToToggle(null);
    } catch (error) {
      console.error("Error al cambiar estado de punto de encuentro:", error);
    } finally {
      setMeetingPointActionLoading(null);
    }
  };

  const openEditMeetingPointDialog = (meetingPoint: MeetingPoint) => {
    setEditingMeetingPoint({
      ...meetingPoint,
      coordenadas_lat: Number(meetingPoint.coordenadas_lat) || -16.5000,
      coordenadas_lng: Number(meetingPoint.coordenadas_lng) || -68.1193
    });
    setShowMeetingPointDialog(true);
  };

  const openCreateMeetingPointDialog = () => {
    setEditingMeetingPoint(null);
    setNewMeetingPoint({
      nombre: "",
      direccion: "",
      referencias: "",
      coordenadas_lat: -17.3935419,
      coordenadas_lng: -66.1570139,
      estado: "activo"
    });
    setShowMeetingPointDialog(true);
  };

  const openDeleteMeetingPointConfirm = (meetingPoint: MeetingPoint) => {
    setMeetingPointToDelete(meetingPoint);
    setShowDeleteMeetingPointConfirm(true);
  };

  const openStatusToggleConfirm = (meetingPoint: MeetingPoint) => {
    setMeetingPointToToggle(meetingPoint);
    setShowStatusConfirm(true);
  };

  const handleLocationSelect = (latlng: { lat: number; lng: number }) => {
    if (editingMeetingPoint) {
      setEditingMeetingPoint({
        ...editingMeetingPoint,
        coordenadas_lat: latlng.lat,
        coordenadas_lng: latlng.lng
      });
    } else {
      setNewMeetingPoint({
        ...newMeetingPoint,
        coordenadas_lat: latlng.lat,
        coordenadas_lng: latlng.lng
      });
    }
  };

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;
    
    try {
      setIsSearchingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5&accept-language=es&countrycodes=bo`
      );
      const results = await response.json();
      
      if (results && results.length > 0) {
        const firstResult = results[0];
        const lat = parseFloat(firstResult.lat);
        const lng = parseFloat(firstResult.lon);
        const address = firstResult.display_name;
        
        if (editingMeetingPoint) {
          setEditingMeetingPoint({
            ...editingMeetingPoint,
            direccion: address,
            coordenadas_lat: lat,
            coordenadas_lng: lng
          });
        } else {
          setNewMeetingPoint({
            ...newMeetingPoint,
            direccion: address,
            coordenadas_lat: lat,
            coordenadas_lng: lng
          });
        }
        setMapCenter({ lat, lng });
      } else {
        alert("No se encontraron resultados para la dirección ingresada");
      }
    } catch (error) {
      console.error("Error en la búsqueda de dirección:", error);
      alert("Error al buscar la dirección. Intenta nuevamente.");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const filteredMeetingPoints = meetingPoints.filter(point => {
    const zoneMatch = selectedZone === "todas" || point.referencias === selectedZone;
    return zoneMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label htmlFor="zone-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Zona
              </label>
              <select
                id="zone-filter"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas las zonas</option>
                <option value="Zona Norte">Zona Norte</option>
                <option value="Zona Sur">Zona Sur</option>
                <option value="Zona Este">Zona Este</option>
                <option value="Zona Oeste">Zona Oeste</option>
                <option value="Centro">Centro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Points Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Puntos de Encuentro ({filteredMeetingPoints.length})
          </h3>
          <button
            onClick={openCreateMeetingPointDialog}
            disabled={isMeetingPointsLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMeetingPointsLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Agregar Punto
          </button>
        </div>
        <div className="px-6 py-4">
          {isMeetingPointsLoading && meetingPoints.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : meetingPoints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-4">No hay puntos de encuentro registrados</p>
              <button
                onClick={openCreateMeetingPointDialog}
                disabled={isMeetingPointsLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Punto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referencias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordenadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMeetingPoints.map((point) => (
                    <tr key={point.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {point.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {point.direccion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {point.referencias || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {point.coordenadas_lat ? Number(point.coordenadas_lat).toFixed(7) : 'N/A'},
                        {point.coordenadas_lng ? Number(point.coordenadas_lng).toFixed(7) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            point.estado === "activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {point.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openStatusToggleConfirm(point)}
                            disabled={meetingPointActionLoading === point.id}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {meetingPointActionLoading === point.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : point.estado === "activo" ? (
                              <ToggleLeft className="h-4 w-4" />
                            ) : (
                              <ToggleRight className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditMeetingPointDialog(point)}
                            disabled={isMeetingPointsLoading}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteMeetingPointConfirm(point)}
                            disabled={isMeetingPointsLoading}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {showMeetingPointDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMeetingPointDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMeetingPoint ? "Editar Punto de Encuentro" : "Nuevo Punto de Encuentro"}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {editingMeetingPoint
                  ? "Modifica la información del punto de encuentro."
                  : "Agrega un nuevo punto de encuentro para las transacciones. Haz clic en el mapa para seleccionar ubicación."}
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="point-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Lugar *
                </label>
                <input
                  id="point-name"
                  type="text"
                  placeholder="Ej: Plaza San Francisco"
                  value={editingMeetingPoint ? editingMeetingPoint.nombre : newMeetingPoint.nombre}
                  onChange={(e) =>
                    editingMeetingPoint
                      ? setEditingMeetingPoint({...editingMeetingPoint, nombre: e.target.value})
                      : setNewMeetingPoint({...newMeetingPoint, nombre: e.target.value})
                  }
                  disabled={isMeetingPointsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="point-address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  id="point-address"
                  type="text"
                  placeholder="Dirección completa"
                  value={editingMeetingPoint ? editingMeetingPoint.direccion : newMeetingPoint.direccion}
                  onChange={(e) =>
                    editingMeetingPoint
                      ? setEditingMeetingPoint({...editingMeetingPoint, direccion: e.target.value})
                      : setNewMeetingPoint({...newMeetingPoint, direccion: e.target.value})
                  }
                  disabled={isMeetingPointsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="point-references" className="block text-sm font-medium text-gray-700 mb-2">
                  Zona/Referencia *
                </label>
                <select
                  id="point-references"
                  value={editingMeetingPoint ? editingMeetingPoint.referencias : newMeetingPoint.referencias}
                  onChange={(e) =>
                    editingMeetingPoint
                      ? setEditingMeetingPoint({...editingMeetingPoint, referencias: e.target.value})
                      : setNewMeetingPoint({...newMeetingPoint, referencias: e.target.value})
                  }
                  disabled={isMeetingPointsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccionar zona</option>
                  <option value="Zona Norte">Zona Norte</option>
                  <option value="Zona Sur">Zona Sur</option>
                  <option value="Zona Este">Zona Este</option>
                  <option value="Zona Oeste">Zona Oeste</option>
                  <option value="Centro">Centro</option>
                </select>
              </div>

              <div>
                <label htmlFor="address-search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Dirección
                </label>
                <div className="flex space-x-2">
                  <input
                    id="address-search"
                    type="text"
                    placeholder="Ej: Av. Arce, La Paz, Bolivia"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    disabled={isMeetingPointsLoading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchAddress();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleSearchAddress}
                    disabled={isMeetingPointsLoading || isSearchingAddress || !searchAddress.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearchingAddress ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Buscar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ej: "Calle Comercio, La Paz" o "Plaza Murillo, Bolivia"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación en el Mapa (Haz clic para seleccionar)
                </label>
                <MapComponent
                  onLocationSelect={handleLocationSelect}
                  initialPosition={{
                    lat: editingMeetingPoint ? Number(editingMeetingPoint.coordenadas_lat) : Number(newMeetingPoint.coordenadas_lat),
                    lng: editingMeetingPoint ? Number(editingMeetingPoint.coordenadas_lng) : Number(newMeetingPoint.coordenadas_lng)
                  }}
                  mapCenter={editingMeetingPoint ? {
                    lat: Number(editingMeetingPoint.coordenadas_lat),
                    lng: Number(editingMeetingPoint.coordenadas_lng)
                  } : null}
                  disabled={isMeetingPointsLoading}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Coordenadas: {editingMeetingPoint
                    ? `${editingMeetingPoint.coordenadas_lat ? Number(editingMeetingPoint.coordenadas_lat).toFixed(6) : 'N/A'}, ${editingMeetingPoint.coordenadas_lng ? Number(editingMeetingPoint.coordenadas_lng).toFixed(6) : 'N/A'}`
                    : `${newMeetingPoint.coordenadas_lat ? Number(newMeetingPoint.coordenadas_lat).toFixed(6) : 'N/A'}, ${newMeetingPoint.coordenadas_lng ? Number(newMeetingPoint.coordenadas_lng).toFixed(6) : 'N/A'}`}
                </div>
              </div>

            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowMeetingPointDialog(false)}
                disabled={isMeetingPointsLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={editingMeetingPoint ? handleUpdateMeetingPoint : handleCreateMeetingPoint}
                disabled={
                  isMeetingPointsLoading ||
                  (!editingMeetingPoint && (!newMeetingPoint.nombre?.trim() || !newMeetingPoint.direccion?.trim())) ||
                  (!!editingMeetingPoint && (!editingMeetingPoint.nombre?.trim() || !editingMeetingPoint.direccion?.trim()))
                }
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMeetingPointsLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingMeetingPoint ? "Actualizar" : "Crear"} Punto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={handleToggleMeetingPointStatus}
        title="¿Confirmar cambio de estado?"
        message={
          meetingPointToToggle
            ? `¿Estás seguro de ${meetingPointToToggle.estado === "activo" ? "desactivar" : "activar"} el punto de encuentro "${meetingPointToToggle.nombre}"?${
                meetingPointToToggle.estado === "activo"
                  ? "\n\nLas transacciones programadas en este punto podrían verse afectadas."
                  : ""
              }`
            : ""
        }
        confirmText={meetingPointToToggle?.estado === "activo" ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        type={meetingPointToToggle?.estado === "activo" ? "warning" : "success"}
        loading={meetingPointActionLoading === meetingPointToToggle?.id}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteMeetingPointConfirm}
        onClose={() => setShowDeleteMeetingPointConfirm(false)}
        onConfirm={handleDeleteMeetingPoint}
        title="¿Eliminar punto de encuentro?"
        message={
          meetingPointToDelete
            ? `¿Estás seguro de eliminar el punto de encuentro "${meetingPointToDelete.nombre}"?\n\nEsta acción no se puede deshacer. Las transacciones que usen este punto quedarán sin referencia.`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={meetingPointActionLoading === meetingPointToDelete?.id}
      />
    </div>
  );
}