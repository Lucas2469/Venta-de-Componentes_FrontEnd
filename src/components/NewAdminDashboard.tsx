import { useState, useEffect, useRef } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
//Comprobantes
import ComprobantesPage from "./ComprobantesPage";
//Paquetes Creditos
import CreditPackagesPage from "./CreditPackagesPage";

import { 
  Users, 
  CreditCard, 
  MapPin, 
  BarChart3, 
  Package, 
  FileImage, 
  ShoppingBag, 
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Upload,
  Settings,
  PieChart as PieChartIcon,
  Receipt,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { mockUsers, mockProducts, mockMeetingPoints, mockCreditPackages, mockCategories, mockRatings } from "./mockData";
import { User, Product, MeetingPoint, CreditPackage, Category, CreditPurchase, Rating } from "./types";
import axios from "axios";

export function NewAdminDashboard() {
  const [activeSection, setActiveSection] = useState("statistics");
  const [users, setUsers] = useState(mockUsers.map(user => ({ ...user, isActive: true })));
  const [products, setProducts] = useState(mockProducts.map(product => ({ ...product, status: 'active' as const })));
  const [meetingPoints, setMeetingPoints] = useState(mockMeetingPoints);
  //Paquetes
  const [creditPackages, setCreditPackages] = useState<any[]>([]);

  const [categories, setCategories] = useState(mockCategories);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showAdDisableModal, setShowAdDisableModal] = useState(false);

  const [disableReason, setDisableReason] = useState("");

  const [ratings] = useState(mockRatings);
  const [selectedZone, setSelectedZone] = useState<string>("todas");

  const [newMeetingPoint, setNewMeetingPoint] = useState({
    name: "",
    address: "", 
    zone: "centro" as const,
    coordinates: { lat: -16.5000, lng: -68.1193 },
    searchAddress: ""
  });

  //API base
  const API_BASE = "http://localhost:5000";
  const API_URL = `${API_BASE}/api/packs`;
  const CREDIT_API = `${API_BASE}/api/creditos`;


  useEffect(() => {
  const fetchPacks = async () => {
    try {
      const res = await axios.get(API_URL);
      setCreditPackages(res.data);
    } catch (err) {
      console.error("Error al cargar paquetes", err);
    }
  };
  fetchPacks();
}, []);
  
  
  // Filtros para calificaciones
  const [ratingsFilters, setRatingsFilters] = useState({
    username: "",
    minRating: 0,
    meetingPointId: "all",
    type: "all" as "all" | "seller" | "buyer"
  });

  // Mock credit purchases data with more samples
  const [creditPurchases, setCreditPurchases] = useState<CreditPurchase[]>([
    {
      id: "1",
      userId: "1",
      packageId: "1",
      amount: 50,
      proofImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      status: "pending",
      createdAt: "2024-12-18"
    },
    {
      id: "2", 
      userId: "4",
      packageId: "2",
      amount: 90,
      status: "approved",
      createdAt: "2024-12-17"
    },
    {
      id: "3",
      userId: "2",
      packageId: "1",
      amount: 50,
      proofImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      status: "rejected",
      rejectionReason: "Comprobante ilegible",
      createdAt: "2024-12-16"
    },
    {
      id: "4",
      userId: "3",
      packageId: "3",
      amount: 150,
      proofImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      status: "pending",
      createdAt: "2024-12-15"
    }
  ]);

  const statistics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.role === 'user').length,
    totalSellers: users.filter(u => u.isSeller).length,
    totalBuyers: users.filter(u => u.isBuyer).length,
    activeProducts: products.filter(p => p.status === 'active').length,
    weeklyAds: products.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.createdAt) >= weekAgo;
    }).length,
    totalCategories: categories.length,
    totalMeetingPoints: meetingPoints.length
  };

  const menuItems = [
    { id: "statistics", label: "Estadísticas", icon: BarChart3 },
    { id: "users", label: "Gestión Usuarios", icon: Users },
    { id: "payment-proofs", label: "Comprobantes", icon: Receipt },
    { id: "meeting-points", label: "Puntos de Encuentro", icon: MapPin },
    { id: "credit-packages", label: "Paquetes Créditos", icon: Package },
    { id: "ads-management", label: "Gestión Anuncios", icon: ShoppingBag },
    { id: "categories", label: "Categorías", icon: Settings },
    { id: "ratings", label: "Calificaciones", icon: Star }
  ];

  const handleRejectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setShowRejectionModal(true);
  };

  /*const confirmRejectProduct = () => {
    setProducts(prev => prev.map(p => 
      p.id === selectedProductId ? { 
        ...p, 
        status: 'rejected' as const,
        rejectionReason: rejectionReason
      } : p
    ));
    setShowRejectionModal(false);
    setRejectionReason("");
    setSelectedProductId("");
  };*/

  const handleApproveProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, status: 'active' as const } : p
    ));
  };

  // Nuevas funciones para manejo de usuarios
  const handleToggleUserStatus = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserEditModal(true);
  };

  const confirmToggleUserStatus = () => {
    setUsers(prev => prev.map(u => 
      u.id === selectedUserId ? { ...u, isActive: !u.isActive } : u
    ));
    setShowUserEditModal(false);
    setSelectedUserId("");
  };

  // Nuevas funciones para anuncios
  const handleToggleAdStatus = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product?.status === 'active') {
      setSelectedProductId(productId);
      setShowAdDisableModal(true);
    } else {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: 'active' as const, disableReason: undefined } : p
      ));
    }
  };

  /*const confirmDisableAd = () => {
    setProducts(prev => prev.map(p => 
      p.id === selectedProductId ? { 
        ...p, 
        status: 'inactive' as const,
        disableReason: disableReason
      } : p
    ));
    setShowAdDisableModal(false);
    setDisableReason("");
    setSelectedProductId("");
  };*/

  // Funciones para solicitudes de pago
  
  /*const handleApprovePurchase = (purchaseId: string) => {
    setCreditPurchases(prev => prev.map(p => 
      p.id === purchaseId ? { ...p, status: 'approved' as const } : p
    ));
  };*/

  /*const handleRejectPurchase = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setShowPurchaseRejectModal(true);
  };*/

  /*const confirmRejectPurchase = () => {
    setCreditPurchases(prev => prev.map(p => 
      p.id === selectedPurchaseId ? { 
        ...p, 
        status: 'rejected' as const,
        rejectionReason: purchaseRejectionReason
      } : p
    ));
    setShowPurchaseRejectModal(false);
    setPurchaseRejectionReason("");
    setSelectedPurchaseId("");
  };*/

  const renderStatistics = () => {
    // Datos para el gráfico circular de solicitudes de pago
    const paymentStatusData = [
      {
        name: 'Pendientes',
        value: creditPurchases.filter(p => p.status === 'pending').length,
        color: '#fbbf24' // Amarillo
      },
      {
        name: 'Aprobadas',
        value: creditPurchases.filter(p => p.status === 'approved').length,
        color: '#10b981' // Verde
      },
      {
        name: 'Rechazadas',
        value: creditPurchases.filter(p => p.status === 'rejected').length,
        color: '#ef4444' // Rojo
      }
    ];

    // Datos para el gráfico de barras de usuarios por mes
    const userRegistrationData = [
      { month: 'Oct', users: 12 },
      { month: 'Nov', users: 18 },
      { month: 'Dic', users: 24 }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Usuarios no admin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.activeProducts}</div>
              <p className="text-xs text-muted-foreground">Anuncios publicados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anuncios Semanales</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.weeklyAds}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 días</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5" />
                <span>Solicitudes de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Registros por Mes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userRegistrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#9d0045" name="Nuevos Usuarios" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Usuarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Vendedores</span>
                <Badge>{statistics.totalSellers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Compradores</span>
                <Badge>{statistics.totalBuyers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Administradores</span>
                <Badge>{users.filter(u => u.role === 'admin').length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Categorías</span>
                <Badge>{statistics.totalCategories}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Puntos de Encuentro</span>
                <Badge>{statistics.totalMeetingPoints}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Paquetes de Créditos</span>
                <Badge>{creditPackages.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  //Comprobante Pagos




  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convertir coordenadas del click a lat/lng (simulado para La Paz)
    const lat = -16.5200 + (y / rect.height) * 0.1; // Rango aprox de La Paz
    const lng = -68.1500 + (x / rect.width) * 0.1;
    
    setNewMeetingPoint(prev => ({
      ...prev,
      coordinates: { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }
    }));
  };



  const filteredMeetingPoints = selectedZone === "todas" 
    ? meetingPoints 
    : meetingPoints.filter(point => point.zone === selectedZone);

  const renderMeetingPoints = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zone-filter">Filtrar por Zona</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las zonas</SelectItem>
                  <SelectItem value="norte">Zona Norte</SelectItem>
                  <SelectItem value="centro">Zona Centro</SelectItem>
                  <SelectItem value="sur">Zona Sur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de puntos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Puntos de Encuentro ({filteredMeetingPoints.length})</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Punto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Punto de Encuentro</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo punto de encuentro para las transacciones. Haz clic en el mapa para seleccionar ubicación.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="point-name">Nombre del Lugar</Label>
                    <Input 
                      id="point-name" 
                      placeholder="Ej: Plaza San Francisco"
                      value={newMeetingPoint.name}
                      onChange={(e) => setNewMeetingPoint(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="point-zone">Zona</Label>
                    <Select 
                      value={newMeetingPoint.zone} 
                      onValueChange={(value: any) => setNewMeetingPoint(prev => ({...prev, zone: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="norte">Zona Norte</SelectItem>
                        <SelectItem value="centro">Zona Centro</SelectItem>
                        <SelectItem value="sur">Zona Sur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="point-address">Dirección</Label>
                  <Input 
                    id="point-address" 
                    placeholder="Dirección completa"
                    value={newMeetingPoint.address}
                    onChange={(e) => setNewMeetingPoint(prev => ({...prev, address: e.target.value}))}
                  />
                </div>

                {/* Búsqueda de dirección */}
                <div>
                  <Label htmlFor="address-search">Buscar Dirección</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="address-search"
                      placeholder="Ej: Av. Arce, Calle Comercio..."
                      value={newMeetingPoint.searchAddress}
                      onChange={(e) => setNewMeetingPoint(prev => ({...prev, searchAddress: e.target.value}))}
                    />
                    <Button 
                      type="button"
                      onClick={() => {
                        // Simulación de búsqueda de dirección
                        const mockResults = [
                          { address: "Av. Arce, La Paz", lat: -16.5050, lng: -68.1300 },
                          { address: "Calle Comercio, La Paz", lat: -16.4960, lng: -68.1340 },
                          { address: "Plaza Murillo, La Paz", lat: -16.4945, lng: -68.1335 }
                        ];
                        
                        const result = mockResults.find(r => 
                          r.address.toLowerCase().includes(newMeetingPoint.searchAddress.toLowerCase())
                        ) || mockResults[0];
                        
                        setNewMeetingPoint(prev => ({
                          ...prev,
                          address: result.address,
                          coordinates: { lat: result.lat, lng: result.lng }
                        }));
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>

                {/* Mapa Simulado */}
                <div>
                  <Label>Ubicación en el Mapa (Haz clic para seleccionar)</Label>
                  <div 
                    className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair relative overflow-hidden"
                    onClick={handleMapClick}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='nonzero'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Haz clic para seleccionar ubicación</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Coordenadas: {newMeetingPoint.coordinates.lat.toFixed(6)}, {newMeetingPoint.coordinates.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    {/* Marcador de ubicación seleccionada */}
                    <div 
                      className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-2 -translate-y-2"
                      style={{
                        left: `${((newMeetingPoint.coordinates.lng + 68.1500) / 0.1) * 100}%`,
                        top: `${((newMeetingPoint.coordinates.lat + 16.5200) / 0.1) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button className="flex-1">
                    Guardar Punto de Encuentro
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Coordenadas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetingPoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="font-medium">{point.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      point.zone === 'norte' ? 'default' :
                      point.zone === 'centro' ? 'secondary' : 'outline'
                    }>
                      {point.zone.charAt(0).toUpperCase() + point.zone.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{point.address}</TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdsManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Anuncios</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vista Previa</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="max-w-xs">
                  <div className="truncate">{product.title}</div>
                </TableCell>
                <TableCell>{product.sellerName}</TableCell>
                <TableCell>Bs {product.price}</TableCell>
                <TableCell>
                  <Badge variant={
                    product.status === 'active' ? 'default' :
                    product.status === 'inactive' ? 'secondary' : 'destructive'
                  }>
                    {product.status === 'active' ? 'Activo' :
                     product.status === 'inactive' ? 'Inactivo' : 'Rechazado'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant={product.status === 'active' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleAdStatus(product.id)}
                    >
                      {product.status === 'active' ? (
                        <ToggleLeft className="h-4 w-4" />
                      ) : (
                        <ToggleRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Transacciones</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-gray-500">
                      {user.isSeller && user.isBuyer ? 'Vendedor/Comprador' :
                       user.isSeller ? 'Vendedor' :
                       user.isBuyer ? 'Comprador' : 'Usuario'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'Usuario'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{user.rating}</span>
                  </div>
                </TableCell>
                <TableCell>{user.totalTransactions}</TableCell>
                <TableCell>{user.credits}</TableCell>
                <TableCell>{new Date(user.registrationDate).toLocaleDateString('es-ES')}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {user.role !== 'admin' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderCategories = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorías</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nombre</Label>
                <Input id="category-name" placeholder="Nombre de la categoría" />
              </div>
              <div>
                <Label htmlFor="category-description">Descripción</Label>
                <Input id="category-description" placeholder="Descripción de la categoría" />
              </div>
              <Button className="w-full">Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <Badge>{products.filter(p => p.category === category.id).length}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Función para filtrar calificaciones
  const filterRatings = (ratingsToFilter: Rating[], type: 'seller' | 'buyer') => {
    return ratingsToFilter.filter(rating => {
      // Filtro por tipo
      if (rating.type !== type) return false;
      
      // Filtro por nombre de usuario
      if (ratingsFilters.username) {
        const seller = users.find(u => u.id === rating.sellerId);
        const buyer = users.find(u => u.id === rating.buyerId);
        const targetUser = type === 'seller' ? seller : buyer;
        
        if (!targetUser?.username.toLowerCase().includes(ratingsFilters.username.toLowerCase())) {
          return false;
        }
      }
      
      // Filtro por calificación mínima
      if (rating.rating < ratingsFilters.minRating) return false;
      
      // Filtro por punto de encuentro
      if (ratingsFilters.meetingPointId !== "all" && rating.meetingPointId !== ratingsFilters.meetingPointId) {
        return false;
      }
      
      return true;
    });
  };

  const sellerRatings = filterRatings(ratings, 'seller');
  const buyerRatings = filterRatings(ratings, 'buyer');

  const renderRatings = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="username-filter">Buscar por Usuario</Label>
              <Input
                id="username-filter"
                placeholder="Nombre de usuario..."
                value={ratingsFilters.username}
                onChange={(e) => setRatingsFilters(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="rating-filter">Calificación Mínima</Label>
              <Select 
                value={ratingsFilters.minRating.toString()} 
                //onValueChange={(value) => setRatingsFilters(prev => ({ ...prev, minRating: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas las calificaciones</SelectItem>
                  <SelectItem value="1">1+ estrellas</SelectItem>
                  <SelectItem value="2">2+ estrellas</SelectItem>
                  <SelectItem value="3">3+ estrellas</SelectItem>
                  <SelectItem value="4">4+ estrellas</SelectItem>
                  <SelectItem value="5">5 estrellas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="meeting-point-filter">Punto de Encuentro</Label>
              <Select 
                value={ratingsFilters.meetingPointId} 
                //onValueChange={(value) => setRatingsFilters(prev => ({ ...prev, meetingPointId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los puntos</SelectItem>
                  {meetingPoints.map(point => (
                    <SelectItem key={point.id} value={point.id}>
                      {point.name} ({point.zone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type-filter">Tipo de Calificación</Label>
              <Select 
                value={ratingsFilters.type} 
                onValueChange={(value: any) => setRatingsFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="seller">Para Vendedores</SelectItem>
                  <SelectItem value="buyer">Para Compradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setRatingsFilters({ username: "", minRating: 0, meetingPointId: "all", type: "all" })}
            >
              Limpiar Filtros
            </Button>
            <div className="text-sm text-gray-600">
              {ratingsFilters.type === "all" ? 
                `${sellerRatings.length + buyerRatings.length} calificaciones encontradas` :
                ratingsFilters.type === "seller" ? 
                `${sellerRatings.length} calificaciones de vendedores encontradas` :
                `${buyerRatings.length} calificaciones de compradores encontradas`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users
                .filter(u => u.isSeller)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{user.rating}</span>
                        <span className="text-xs text-gray-500">
                          ({user.totalTransactions} transacciones)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Compradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users
                .filter(u => u.isBuyer)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{user.rating}</span>
                        <span className="text-xs text-gray-500">
                          ({user.totalTransactions} transacciones)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla Detallada de Calificaciones para Vendedores */}
      {(ratingsFilters.type === "all" || ratingsFilters.type === "seller") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Calificaciones Detalladas de Vendedores ({sellerRatings.length})</span>
            </CardTitle>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Fecha de Encuentro</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Comentario</TableHead>
                <TableHead>Punto de Encuentro</TableHead>
                <TableHead>Fecha de Calificación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellerRatings.map((rating) => {
                const seller = users.find(u => u.id === rating.sellerId);
                const buyer = users.find(u => u.id === rating.buyerId);
                const meetingPoint = meetingPoints.find(mp => mp.id === rating.meetingPointId);
                return (
                  <TableRow key={rating.id}>
                    <TableCell>
                      <div className="font-medium">{seller?.username || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{seller?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{buyer?.username || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{buyer?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(rating.meetingDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(rating.rating)}
                        </div>
                        <Badge variant="outline">{rating.rating}/5</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={rating.feedback}>
                        {rating.feedback}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">{meetingPoint?.name || 'N/A'}</div>
                          <Badge variant="outline" className="text-xs">
                            {meetingPoint?.zone}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Tabla Detallada de Calificaciones para Compradores */}
      {(ratingsFilters.type === "all" || ratingsFilters.type === "buyer") && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-blue-500" />
            <span>Calificaciones Detalladas de Compradores ({buyerRatings.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprador</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Fecha de Encuentro</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Comentario</TableHead>
                <TableHead>Punto de Encuentro</TableHead>
                <TableHead>Fecha de Calificación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyerRatings.map((rating) => {
                const seller = users.find(u => u.id === rating.sellerId);
                const buyer = users.find(u => u.id === rating.buyerId);
                const meetingPoint = meetingPoints.find(mp => mp.id === rating.meetingPointId);
                return (
                  <TableRow key={rating.id}>
                    <TableCell>
                      <div className="font-medium">{buyer?.username || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{buyer?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{seller?.username || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{seller?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(rating.meetingDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(rating.rating)}
                        </div>
                        <Badge variant="outline">{rating.rating}/5</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={rating.feedback}>
                        {rating.feedback}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">{meetingPoint?.name || 'N/A'}</div>
                          <Badge variant="outline" className="text-xs">
                            {meetingPoint?.zone}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "statistics":
        return renderStatistics();
      case "users":
        return renderUsers();
      case "payment-proofs":
        return <ComprobantesPage />;
      case "meeting-points":
        return renderMeetingPoints();
      case "credit-packages":
        return <CreditPackagesPage />;
      case "ads-management":
        return renderAdsManagement();
      case "categories":
        return renderCategories();
      case "ratings":
        return renderRatings();
      default:
        return renderStatistics();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold" style={{ color: '#9d0045' }}>
            ELECTROMARKET
          </h1>
          <p className="text-sm text-gray-600 mt-1">Panel Administrativo</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-3 py-2 mb-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-electromarket-maroon text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeSection)?.label || 'Estadísticas'}
            </h2>
          </div>
          
          {renderContent()}
        </div>
      </div>

      {/* User Edit Modal */}
      <Dialog open={showUserEditModal} onOpenChange={setShowUserEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estado de Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cambiar el estado de este usuario?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p>
                El usuario será {users.find(u => u.id === selectedUserId)?.isActive ? 'inhabilitado' : 'activado'}.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowUserEditModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmToggleUserStatus}
                className="flex-1"
                style={{ backgroundColor: '#9d0045' }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Disable Modal */}
      <Dialog open={showAdDisableModal} onOpenChange={setShowAdDisableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inhabilitar Anuncio</DialogTitle>
            <DialogDescription>
              Por favor indica la razón por la cual se está inhabilitando este anuncio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="disable-reason">Motivo de inhabilitación</Label>
              <Textarea
                id="disable-reason"
                placeholder="Describe el motivo de la inhabilitación..."
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAdDisableModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                //onClick={confirmDisableAd}
                className="flex-1"
                disabled={!disableReason.trim()}
              >
                Inhabilitar Anuncio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}