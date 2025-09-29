import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { MapPin, Loader2, Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "../../ui/badge";
import { meetingPointsAPI } from '../../../api/meetingPointsApi';
import MapComponent from '../../MapComponent';
import { MeetingPoint } from "../../types";

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
  const [meetingPointToDelete, setMeetingPointToDelete] = useState<string | null>(null);
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
      setMeetingPointActionLoading(meetingPointToDelete);
      await meetingPointsAPI.delete(meetingPointToDelete);
      await loadMeetingPoints();
      setShowDeleteMeetingPointConfirm(false);
      setMeetingPointToDelete(null);
    } catch (error) {
      console.error("Error al eliminar punto de encuentro:", error);
    } finally {
      setMeetingPointActionLoading(null);
    }
  };

  const handleToggleMeetingPointStatus = async (meetingPointId: string) => {
    try {
      setMeetingPointActionLoading(meetingPointId);
      await meetingPointsAPI.toggleStatus(meetingPointId);
      await loadMeetingPoints();
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

  const openDeleteMeetingPointConfirm = (meetingPointId: string) => {
    setMeetingPointToDelete(meetingPointId);
    setShowDeleteMeetingPointConfirm(true);
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
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <Label htmlFor="zone-filter">Filtrar por Zona</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las zonas</SelectItem>
                  <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                  <SelectItem value="Zona Sur">Zona Sur</SelectItem>
                  <SelectItem value="Zona Este">Zona Este</SelectItem>
                  <SelectItem value="Zona Oeste">Zona Oeste</SelectItem>
                  <SelectItem value="Centro">Centro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Puntos de Encuentro ({filteredMeetingPoints.length})</CardTitle>
          <Button onClick={openCreateMeetingPointDialog} disabled={isMeetingPointsLoading}>
            {isMeetingPointsLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Agregar Punto
          </Button>
        </CardHeader>
        <CardContent>
          {isMeetingPointsLoading && meetingPoints.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : meetingPoints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No hay puntos de encuentro registrados</p>
              <Button 
                onClick={openCreateMeetingPointDialog} 
                className="mt-4"
                disabled={isMeetingPointsLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Punto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Referencias</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetingPoints.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-medium">{point.nombre}</TableCell>
                    <TableCell className="max-w-xs truncate">{point.direccion}</TableCell>
                    <TableCell className="max-w-xs truncate">{point.referencias || '-'}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {point.coordenadas_lat ? Number(point.coordenadas_lat).toFixed(4) : 'N/A'}, 
                      {point.coordenadas_lng ? Number(point.coordenadas_lng).toFixed(4) : 'N/A'}
                    </TableCell>
                   <TableCell>
                         <Badge variant={point.estado === "activo" ? "default" : "secondary"}>
                        {point.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                        </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleMeetingPointStatus(point.id)}
                          disabled={meetingPointActionLoading === point.id}
                        >
                          {meetingPointActionLoading === point.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : point.estado === "activo" ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditMeetingPointDialog(point)}
                          disabled={isMeetingPointsLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openDeleteMeetingPointConfirm(point.id)}
                          disabled={isMeetingPointsLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showMeetingPointDialog} onOpenChange={setShowMeetingPointDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMeetingPoint ? "Editar Punto de Encuentro" : "Nuevo Punto de Encuentro"}
            </DialogTitle>
            <DialogDescription>
              {editingMeetingPoint 
                ? "Modifica la información del punto de encuentro." 
                : "Agrega un nuevo punto de encuentro para las transacciones. Haz clic en el mapa para seleccionar ubicación."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="point-name">Nombre del Lugar *</Label>
              <Input 
                id="point-name" 
                placeholder="Ej: Plaza San Francisco"
                value={editingMeetingPoint ? editingMeetingPoint.nombre : newMeetingPoint.nombre}
                onChange={(e) => 
                  editingMeetingPoint 
                    ? setEditingMeetingPoint({...editingMeetingPoint, nombre: e.target.value})
                    : setNewMeetingPoint({...newMeetingPoint, nombre: e.target.value})
                }
                disabled={isMeetingPointsLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="point-address">Dirección *</Label>
              <Input 
                id="point-address" 
                placeholder="Dirección completa"
                value={editingMeetingPoint ? editingMeetingPoint.direccion : newMeetingPoint.direccion}
                onChange={(e) => 
                  editingMeetingPoint 
                    ? setEditingMeetingPoint({...editingMeetingPoint, direccion: e.target.value})
                    : setNewMeetingPoint({...newMeetingPoint, direccion: e.target.value})
                }
                disabled={isMeetingPointsLoading}
              />
            </div>

            <div>
              <Label htmlFor="point-references">Zona/Referencia *</Label>
              <Select
                value={editingMeetingPoint ? editingMeetingPoint.referencias : newMeetingPoint.referencias}
                onValueChange={(value) =>   
                  editingMeetingPoint 
                    ? setEditingMeetingPoint({...editingMeetingPoint, referencias: value})
                    : setNewMeetingPoint({...newMeetingPoint, referencias: value})
                }
                disabled={isMeetingPointsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                  <SelectItem value="Zona Sur">Zona Sur</SelectItem>
                  <SelectItem value="Zona Este">Zona Este</SelectItem>
                  <SelectItem value="Zona Oeste">Zona Oeste</SelectItem>
                  <SelectItem value="Centro">Centro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address-search">Buscar Dirección</Label>
              <div className="flex space-x-2">
                <Input
                  id="address-search"
                  placeholder="Ej: Av. Arce, La Paz, Bolivia"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  disabled={isMeetingPointsLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchAddress();
                    }
                  }}
                />
                <Button 
                  type="button"
                  onClick={handleSearchAddress}
                  disabled={isMeetingPointsLoading || isSearchingAddress || !searchAddress.trim()}
                >
                  {isSearchingAddress ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ej: "Calle Comercio, La Paz" o "Plaza Murillo, Bolivia"
              </p>
            </div>

            <div>
              <Label>Ubicación en el Mapa (Haz clic para seleccionar)</Label>
              <MapComponent
                onLocationSelect={handleLocationSelect}
                initialPosition={{
                  lat: editingMeetingPoint ? editingMeetingPoint.coordenadas_lat : newMeetingPoint.coordenadas_lat,
                  lng: editingMeetingPoint ? editingMeetingPoint.coordenadas_lng : newMeetingPoint.coordenadas_lng
                }}
                {...({ mapCenter } as any)}
                disabled={isMeetingPointsLoading}
              />
              <div className="text-xs text-gray-500 mt-1">
                Coordenadas: {editingMeetingPoint 
                  ? `${editingMeetingPoint.coordenadas_lat ? Number(editingMeetingPoint.coordenadas_lat).toFixed(6) : 'N/A'}, ${editingMeetingPoint.coordenadas_lng ? Number(editingMeetingPoint.coordenadas_lng).toFixed(6) : 'N/A'}`
                  : `${newMeetingPoint.coordenadas_lat ? Number(newMeetingPoint.coordenadas_lat).toFixed(6) : 'N/A'}, ${newMeetingPoint.coordenadas_lng ? Number(newMeetingPoint.coordenadas_lng).toFixed(6) : 'N/A'}`}
              </div>
            </div>

            <div>
              <Label htmlFor="point-status">Estado</Label>
              <Select
                value={editingMeetingPoint ? editingMeetingPoint.estado : newMeetingPoint.estado}
                onValueChange={(value: "activo" | "inactivo") => 
                  editingMeetingPoint 
                    ? setEditingMeetingPoint({...editingMeetingPoint, estado: value})
                    : setNewMeetingPoint({...newMeetingPoint, estado: value})
                }
                disabled={isMeetingPointsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowMeetingPointDialog(false)}
                className="flex-1"
                disabled={isMeetingPointsLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingMeetingPoint ? handleUpdateMeetingPoint : handleCreateMeetingPoint}
                className="flex-1"
                disabled={isMeetingPointsLoading || 
                  (!editingMeetingPoint && (!newMeetingPoint.nombre.trim() || !newMeetingPoint.direccion.trim())) ||
                  (editingMeetingPoint && (!editingMeetingPoint.nombre.trim() || !editingMeetingPoint.direccion.trim()))
                }
              >
                {isMeetingPointsLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {editingMeetingPoint ? "Actualizar" : "Crear"} Punto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteMeetingPointConfirm} onOpenChange={setShowDeleteMeetingPointConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro de eliminar este punto de encuentro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Las transacciones que usen este punto quedarán sin referencia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteMeetingPointConfirm(false)}
              disabled={meetingPointActionLoading === meetingPointToDelete}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMeetingPoint}
              disabled={meetingPointActionLoading === meetingPointToDelete}
            >
              {meetingPointActionLoading === meetingPointToDelete ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}