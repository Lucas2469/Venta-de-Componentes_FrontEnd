// components/MeetingPointsPage.tsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Edit, Trash2, CheckCircle, Plus, ArrowLeft, XCircle, Save, X, RefreshCw, Search } from 'lucide-react';
import MapComponent from './MapComponent';
import { meetingPointsAPI } from '../api/meetingPointsApi';

export const MeetingPointsPage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    referencias: '',
    coordenadas_lat: -17.3895,
    coordenadas_lng: -66.1568,
    estado: 'activo'
  });

  const [meetingPoints, setMeetingPoints] = useState([]);
  const [filteredMeetingPoints, setFilteredMeetingPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -17.3895, lng: -66.1568 });

  // Opciones para el dropdown de referencias
  const referenceOptions = [
    { value: '', label: 'Seleccionar zona' },
    { value: 'Zona Norte', label: 'Zona Norte' },
    { value: 'Zona Sur', label: 'Zona Sur' },
    { value: 'Zona Este', label: 'Zona Este' },
    { value: 'Zona Oeste', label: 'Zona Oeste' },
    { value: 'Centro', label: 'Centro' },
    { value: 'Otra', label: 'Otra ubicación' }
  ];

  // Cargar puntos de encuentro desde la base de datos
  useEffect(() => {
    loadMeetingPoints();
  }, []);

  // Filtrar puntos de encuentro cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMeetingPoints(meetingPoints);
    } else {
      const filtered = meetingPoints.filter(point => 
        point.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        point.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (point.referencias && point.referencias.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMeetingPoints(filtered);
    }
  }, [searchTerm, meetingPoints]);

  const loadMeetingPoints = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await meetingPointsAPI.getAll();
      setMeetingPoints(data || []);
      setFilteredMeetingPoints(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los puntos de encuentro');
      console.error('Error detallado:', err);
      setMeetingPoints([]);
      setFilteredMeetingPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (position) => {
    setFormData(prev => ({
      ...prev,
      coordenadas_lat: position.lat,
      coordenadas_lng: position.lng
    }));
  };

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;
    
    try {
      setIsSearchingAddress(true);
      
      // Usar Nominatim (OpenStreetMap) para geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5&accept-language=es&countrycodes=bo`
      );
      
      const results = await response.json();
      
      if (results && results.length > 0) {
        const firstResult = results[0];
        const lat = parseFloat(firstResult.lat);
        const lng = parseFloat(firstResult.lon);
        const address = firstResult.display_name;
        
        setFormData(prev => ({
          ...prev,
          direccion: address,
          coordenadas_lat: lat,
          coordenadas_lng: lng
        }));
        
        // Actualizar la posición del mapa
        setMapCenter({ lat, lng });
      } else {
        setError("No se encontraron resultados para la dirección ingresada");
      }
    } catch (error) {
      console.error("Error en la búsqueda de dirección:", error);
      setError("Error al buscar la dirección. Intenta nuevamente.");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!formData.nombre || !formData.direccion) {
      setError('Por favor complete todos los campos obligatorios');
      setSubmitting(false);
      return;
    }

    if (!formData.coordenadas_lat || !formData.coordenadas_lng) {
      setError('Por favor seleccione una ubicación en el mapa');
      setSubmitting(false);
      return;
    }

    try {
      if (editingPoint) {
        await meetingPointsAPI.update(editingPoint.id, formData);
        setSuccess('Punto de encuentro actualizado exitosamente');
      } else {
        await meetingPointsAPI.create(formData);
        setSuccess('Punto de encuentro registrado exitosamente');
      }

      await loadMeetingPoints();
      resetForm();
    } catch (err) {
      setError(err.message || 'Error al guardar el punto de encuentro');
      console.error('Error detallado en submit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateButtonClick = () => {
    handleSubmit(null);
  };

  const handleEditPoint = (point) => {
    setEditingPoint(point);
    setFormData({
      nombre: point.nombre || '',
      direccion: point.direccion || '',
      referencias: point.referencias || '',
      coordenadas_lat: Number(point.coordenadas_lat) || -17.3895,
      coordenadas_lng: Number(point.coordenadas_lng) || -66.1568,
      estado: point.estado || 'activo'
    });
  };

  const handleDeleteClick = (point) => {
    setPointToDelete(point);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError('');
      setSubmitting(true);
      await meetingPointsAPI.delete(pointToDelete.id);
      setSuccess('Punto de encuentro eliminado permanentemente');
      await loadMeetingPoints();
    } catch (err) {
      setError(err.message || 'Error al eliminar el punto de encuentro');
      console.error('Error detallado in delete:', err);
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
      setPointToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      referencias: '',
      coordenadas_lat: -17.3895,
      coordenadas_lng: -66.1568,
      estado: 'activo'
    });
    setEditingPoint(null);
  };

  const cancelEdit = () => {
    resetForm();
    setError('');
    setSuccess('');
  };

  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined) return 'N/A';
    const num = Number(coord);
    return isNaN(num) ? 'N/A' : num.toFixed(6);
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const renderMeetingPoints = () => {
    if (!Array.isArray(filteredMeetingPoints)) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando puntos de encuentro...</p>
        </div>
      );
    }

    if (filteredMeetingPoints.length === 0) {
      if (searchTerm) {
        return (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron resultados para "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-800 mt-2"
            >
              Limpiar búsqueda
            </button>
          </div>
        );
      }
      
      return (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay puntos de encuentro registrados</p>
          <p className="text-gray-500 text-sm mt-2">Utilice el formulario para crear el primer punto</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeetingPoints.map((point) => (
          <div key={point.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{point.nombre}</h3>
              </div>
              <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                point.estado === 'activo' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}>
                {point.estado === 'activo' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {point.estado ? point.estado.charAt(0).toUpperCase() + point.estado.slice(1) : 'Desconocido'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium block mb-1">Dirección:</span>
                <p className="text-gray-700 leading-tight">{point.direccion || 'Sin dirección'}</p>
              </div>
              {point.referencias && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium block mb-1">Referencias:</span>
                  <p className="text-gray-700 leading-tight">{point.referencias}</p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                <span>Coordenadas: {formatCoordinate(point.coordenadas_lat)}, {formatCoordinate(point.coordenadas_lng)}</span>
              </div>
              <div className="text-xs text-gray-400">
                <span>Creado: {point.fecha_creacion ? new Date(point.fecha_creacion).toLocaleDateString() : 'Fecha desconocida'}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <button 
                onClick={() => handleEditPoint(point)}
                style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                className="flex items-center text-xs p-2 rounded hover:bg-opacity-90 transition-colors"
                disabled={submitting}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </button>
              <button 
                onClick={() => handleDeleteClick(point)}
                style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                className="flex items-center text-xs p-2 rounded hover:bg-opacity-90 transition-colors"
                disabled={submitting}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
        {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Confirmar eliminación permanente</h3>
                <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={submitting}
                >
                <X className="h-5 w-5" />
                </button>
            </div>
            <p className="text-gray-600 mb-6">
                ¿Está seguro de que desea eliminar permanentemente el punto de encuentro 
                <span style={{ color: '#9d0045', fontWeight: 'bold' }}> "{pointToDelete?.nombre}"</span>?
                <br />
                <span className="text-red-600 font-medium">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex justify-end space-x-3">
                <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={submitting}
                >
                Cancelar
                </button>
                <button
                onClick={handleDeleteConfirm}
                style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                className="px-4 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50 flex items-center"
                disabled={submitting}
                >
                {submitting ? (
                    <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                    </>
                ) : (
                    'Eliminar Permanentemente'
                )}
                </button>
            </div>
            </div>
        </div>
        )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#9d0045' }}>
              Puntos de encuentro
            </h1>
            <p className="text-gray-600 text-lg">Gestión de los puntos de encuentros</p>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center bg-white text-black font-medium border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >

            Volver al Catálogo
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-start">
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-700 hover:red-900 ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-start">
              <div>
                <strong>Éxito:</strong> {success}
              </div>
              <button 
                onClick={() => setSuccess('')}
                className="text-green-700 hover:green-900 ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Puntos existentes</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {Array.isArray(filteredMeetingPoints) ? filteredMeetingPoints.length : 0} de {Array.isArray(meetingPoints) ? meetingPoints.length : 0} registrados
                </span>
              </div>
              
              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, dirección o referencias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando puntos de encuentro...</p>
                </div>
              ) : (
                renderMeetingPoints()
              )}
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
                {editingPoint ? 'Editar punto de encuentro' : 'Crear nuevo punto de encuentro'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del punto de encuentro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Dirección
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      placeholder="Ej: Av. Arce, La Paz, Bolivia"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={submitting || isSearchingAddress}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchAddress();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSearchAddress}
                      disabled={submitting || isSearchingAddress || !searchAddress.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                    >
                      {isSearchingAddress ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ej: "Calle Comercio, La Paz" o "Plaza Murillo, Bolivia"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona/Referencias
                  </label>
                  <select
                    name="referencias"
                    value={formData.referencias}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={submitting}
                  >
                    {referenceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mostrar campo de estado solo cuando se está editando */}
                {editingPoint && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select 
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={submitting}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar ubicación *
                  </label>
                  <MapComponent 
                    onLocationSelect={handleLocationSelect}
                    initialPosition={{
                      lat: formData.coordenadas_lat,
                      lng: formData.coordenadas_lng
                    }}
                    mapCenter={mapCenter}
                    disabled={submitting}
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Coordenadas: {Number(formData.coordenadas_lat).toFixed(6)}, {Number(formData.coordenadas_lng).toFixed(6)}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  {editingPoint && (
                    <button 
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium text-sm disabled:opacity-50"
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    type="submit"
                    style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                    className={`${editingPoint ? 'flex-1' : 'w-full'} py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium text-sm flex items-center justify-center shadow-md disabled:opacity-50`}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {editingPoint ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingPoint ? 'Actualizar' : 'Crear'} Punto
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            ¿Por qué usar puntos de encuentro?
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-700">
            <li className="flex items-center"><div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>Lugares seguros y vigilados</li>
            <li className="flex items-center"><div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>Horarios establecidos</li>
            <li className="flex items-center"><div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>Protección para ambas partes</li>
            <li className="flex items-center"><div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>Ambiente adecuado para transacciones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 

MeetingPointsPage.propTypes = {
  onBack: PropTypes.func.isRequired,
};