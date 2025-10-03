import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Loader2, Star, Search, Filter, ArrowLeft } from "lucide-react";
import { calificationAPI } from '../../../api/CalificationApi';
import { usuariosAPI } from '../../../api/UsuariosApi';

interface CalificationPageProps {
  onBack: () => void;
}

export function CalificationPage({ onBack }: CalificationPageProps) {
  const [califications, setCalifications] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: "",
    minRating: 0,
    maxRating: 5,
    meetingPoint: "all",
    userSearch: ""
  });

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  });

  useEffect(() => {
    loadCalifications();
    loadUsuarios();
  }, []);

  const loadCalifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/calificaciones');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const calificationsData = await response.json();
      setCalifications(calificationsData);
      calculateStats(calificationsData);
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
      setError("Error al cargar las calificaciones");
      // Fallback a datos mock si falla la API
      const mockData = [
        {
          vendedor: { id: 1, nombre: "Juan", apellido: "Pérez" },
          comprador: { id: 2, nombre: "María", apellido: "González" },
          califCompradorAVendedor: 5,
          califVendedorAComprador: 4,
          fechaCita: "2024-12-20",
          horaCita: "10:30:00",
          puntoEncuentro: "Plaza 14 de Septiembress",
          direccionPunto: "IC Norte, E-0817, Avenida América, Queru Queru Central",
          referenciasPunto: "Centro",
          comentarioComprador: "Excelente vendedor, producto como se describía",
          comentarioVendedor: "Compradora muy responsable, llegó a tiempo"
        },
        {
          vendedor: { id: 3, nombre: "Carlos", apellido: "López" },
          comprador: { id: 4, nombre: "Ana", apellido: "Martínez" },
          califCompradorAVendedor: 4,
          califVendedorAComprador: 5,
          fechaCita: "2024-12-19",
          horaCita: "14:00:00",
          puntoEncuentro: "IC NORTE",
          direccionPunto: "IC Norte, E-0817, Avenida América, Queru Queru Central",
          referenciasPunto: "Zona Este",
          comentarioComprador: "Buen producto, entrega puntual",
          comentarioVendedor: "Compradora seria, buena comunicación"
        },
        {
          vendedor: { id: 5, nombre: "Luis", apellido: "García" },
          comprador: { id: 6, nombre: "Sofia", apellido: "Rodríguez" },
          califCompradorAVendedor: 3,
          califVendedorAComprador: 4,
          fechaCita: "2024-12-18",
          horaCita: "16:00:00",
          puntoEncuentro: "Terminal",
          direccionPunto: "Construcción Nueva Terminal Interdepartamental",
          referenciasPunto: "Centro",
          comentarioComprador: "Producto funcional, pero tardó en responder",
          comentarioVendedor: "Compradora paciente, buena experiencia"
        }
      ];
      setCalifications(mockData);
      calculateStats(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      setIsLoadingUsers(true);
      const usuariosData = await usuariosAPI.getAll();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      // Fallback a datos mock si falla la API
      const mockUsuarios = [
        { id: 1, nombre: "Juan", apellido: "Pérez", email: "juan@email.com" },
        { id: 2, nombre: "María", apellido: "González", email: "maria@email.com" },
        { id: 3, nombre: "Carlos", apellido: "López", email: "carlos@email.com" },
        { id: 4, nombre: "Ana", apellido: "Martínez", email: "ana@email.com" },
        { id: 5, nombre: "Luis", apellido: "García", email: "luis@email.com" },
        { id: 6, nombre: "Sofia", apellido: "Rodríguez", email: "sofia@email.com" }
      ];
      setUsuarios(mockUsuarios);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const total = data.length;
    let totalRating = 0;
    let ratingCount = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    data.forEach(calif => {
      const rating = calif.calificacion || 0;
      
      if (rating > 0) {
        totalRating += rating;
        ratingCount++;
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      }
    });

    setStats({
      total,
      averageRating: ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0,
      fiveStars: ratingDistribution[5],
      fourStars: ratingDistribution[4],
      threeStars: ratingDistribution[3],
      twoStars: ratingDistribution[2],
      oneStar: ratingDistribution[1]
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredCalifications = califications.filter(calif => {
    const searchMatch = filters.search === "" || 
      calif.vendedor?.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
      calif.comprador?.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
      calif.puntoEncuentro?.toLowerCase().includes(filters.search.toLowerCase());
    
    const ratingMatch = ((calif.califCompradorAVendedor || 0) >= filters.minRating && 
                        (calif.califCompradorAVendedor || 0) <= filters.maxRating) ||
                       ((calif.califVendedorAComprador || 0) >= filters.minRating && 
                        (calif.califVendedorAComprador || 0) <= filters.maxRating);
    
    const meetingPointMatch = filters.meetingPoint === "all" || 
      calif.puntoEncuentro === filters.meetingPoint;

    const userMatch = filters.userSearch === "" || 
      calif.vendedor?.nombre?.toLowerCase().includes(filters.userSearch.toLowerCase()) ||
      calif.vendedor?.apellido?.toLowerCase().includes(filters.userSearch.toLowerCase()) ||
      calif.comprador?.nombre?.toLowerCase().includes(filters.userSearch.toLowerCase()) ||
      calif.comprador?.apellido?.toLowerCase().includes(filters.userSearch.toLowerCase());

    return searchMatch && ratingMatch && meetingPointMatch && userMatch;
  });

  const uniqueMeetingPoints = [...new Set(califications.map(calif => calif.puntoEncuentro))];
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <h1 className="text-3xl font-bold" style={{ color: '#9d0045' }}>
              Calificaciones ({califications.length})
            </h1>
          </div>
          <Button
            onClick={loadCalifications}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>Actualizar</span>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Transacciones calificadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}/5</div>
              <div className="flex mt-1">
                {renderStars(stats.averageRating)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">5 Estrellas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fiveStars}</div>
              <p className="text-xs text-muted-foreground">Excelente</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">4 Estrellas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fourStars}</div>
              <p className="text-xs text-muted-foreground">Muy bueno</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Filter className="h-5 w-5" />
              <span>🔍 Filtros de Búsqueda</span>
            </CardTitle>
            <p className="text-sm text-blue-600">Busca calificaciones específicas por usuario, calificación o punto de encuentro</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Vendedor, comprador o punto de encuentro..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="minRating">Calificación Mínima</Label>
                <Select
                  value={filters.minRating.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todas</SelectItem>
                    <SelectItem value="1">1+ Estrellas</SelectItem>
                    <SelectItem value="2">2+ Estrellas</SelectItem>
                    <SelectItem value="3">3+ Estrellas</SelectItem>
                    <SelectItem value="4">4+ Estrellas</SelectItem>
                    <SelectItem value="5">5 Estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="maxRating">Calificación Máxima</Label>
                <Select
                  value={filters.maxRating.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, maxRating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Todas</SelectItem>
                    <SelectItem value="4">Hasta 4 Estrellas</SelectItem>
                    <SelectItem value="3">Hasta 3 Estrellas</SelectItem>
                    <SelectItem value="2">Hasta 2 Estrellas</SelectItem>
                    <SelectItem value="1">Hasta 1 Estrella</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="meetingPoint">Punto de Encuentro</Label>
                <Select
                  value={filters.meetingPoint}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, meetingPoint: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueMeetingPoints.map(point => (
                      <SelectItem key={point} value={point}>{point}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="userSearch" className="font-semibold text-blue-700">👤 Buscar Usuario</Label>
                <Input
                  id="userSearch"
                  placeholder="Nombre o apellido del usuario..."
                  value={filters.userSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, userSearch: e.target.value }))}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                />
                <p className="text-xs text-blue-600 mt-1">Busca en vendedor y comprador</p>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-blue-200">
              <div className="text-sm text-blue-600">
                {filteredCalifications.length} de {califications.length} calificaciones mostradas
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    search: "",
                    minRating: 0,
                    maxRating: 5,
                    meetingPoint: "all",
                    userSearch: ""
                  })}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Limpiar Filtros
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCalifications}
                  disabled={isLoading}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Actualizar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Calificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>
              Calificaciones ({filteredCalifications.length})
              {(filters.search || filters.userSearch) && (
                <Badge variant="secondary" className="ml-2">
                  Filtradas
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <Button onClick={loadCalifications} className="mt-4">
                  Reintentar
                </Button>
              </div>
            ) : filteredCalifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No hay calificaciones que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCalifications.map((calif, index) => (
                  <Card key={index} className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-600">Vendedor</h4>
                          <p className="text-lg font-medium">
                            {calif.vendedor?.nombre} {calif.vendedor?.apellido}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Calificación:</span>
                            <div className="flex">
                              {renderStars(calif.califCompradorAVendedor || 0)}
                            </div>
                            <span className="text-sm font-medium">
                              ({calif.califCompradorAVendedor || 0}/5)
                            </span>
                          </div>
                          {calif.comentarioComprador && (
                            <p className="text-sm text-gray-600 italic">"{calif.comentarioComprador}"</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-600">Comprador</h4>
                          <p className="text-lg font-medium">
                            {calif.comprador?.nombre} {calif.comprador?.apellido}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Calificación:</span>
                            <div className="flex">
                              {renderStars(calif.califVendedorAComprador || 0)}
                            </div>
                            <span className="text-sm font-medium">
                              ({calif.califVendedorAComprador || 0}/5)
                            </span>
                          </div>
                          {calif.comentarioVendedor && (
                            <p className="text-sm text-gray-600 italic">"{calif.comentarioVendedor}"</p>
                          )}
                        </div>
                      </div>

                      {/* Información de la cita */}
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">📅 Fecha:</span>
                            <p>{calif.fechaCita} a las {calif.horaCita}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">📍 Punto de Encuentro:</span>
                            <p>{calif.puntoEncuentro}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">🏷️ Referencias:</span>
                            <p>{calif.referenciasPunto}</p>
                          </div>
                        </div>
                        {calif.direccionPunto && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-600">📍 Dirección:</span>
                            <p className="text-sm text-gray-600">{calif.direccionPunto}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
