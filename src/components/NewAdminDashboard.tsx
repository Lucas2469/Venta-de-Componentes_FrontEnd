import React, { useState, useEffect } from "react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Loader2, Star, BarChart3, Users, Receipt, Package, ShoppingBag, Search, Filter } from "lucide-react";
import { mockUsers, mockProducts, mockCreditPackages, mockRatings } from "./mockData";
import { User, Product, CreditPackage, CreditPurchase, Rating } from "./types";
import { calificationAPI } from '../api/CalificationApi';
import { usuariosAPI } from '../api/UsuariosApi';
import { MainContent } from './Admin/MainContent';

export function NewAdminDashboard() {
  const [activeSection, setActiveSection] = useState("statistics");
  const [users, setUsers] = useState(mockUsers.map(user => ({ ...user, isActive: true })));
  const [products, setProducts] = useState(mockProducts.map(product => ({ ...product, status: 'active' as 'active' | 'inactive' | 'sold' | 'pending' | 'rejected' })));
  const [creditPackages, setCreditPackages] = useState(mockCreditPackages);
  const [califications, setCalifications] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState("");
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showAdDisableModal, setShowAdDisableModal] = useState(false);
  const [showPurchaseRejectModal, setShowPurchaseRejectModal] = useState(false);
  const [disableReason, setDisableReason] = useState("");
  const [purchaseRejectionReason, setPurchaseRejectionReason] = useState("");
  const [ratings] = useState(mockRatings);
  const [selectedZone, setSelectedZone] = useState<string>("todas");
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isCalificationsLoading, setIsCalificationsLoading] = useState(false);
  const [showCalificationPage, setShowCalificationPage] = useState(false);
  
  // Filtros para calificaciones
  const [calificationFilters, setCalificationFilters] = useState({
    search: "",
    minRating: 0,
    maxRating: 5,
    meetingPoint: "all",
    userSearch: ""
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
      amount: 100,
      proofImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
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
      createdAt: "2024-12-16"
    },
    {
      id: "4",
      userId: "3",
      packageId: "3",
      amount: 200,
      proofImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      status: "pending",
      createdAt: "2024-12-15"
    }
  ]);

  // Cargar calificaciones y usuarios al montar el componente
  useEffect(() => {
    console.log("🔄 Iniciando carga de calificaciones...");
    loadCalifications();
    loadUsuarios();
  }, []);

  const loadCalifications = async () => {
    try {
      setIsCalificationsLoading(true);
      const response = await fetch('http://localhost:5000/api/calificaciones');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const calificationsData = await response.json();
      console.log("Calificaciones cargadas:", calificationsData.length, "elementos");
      setCalifications(calificationsData);
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
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
          comentarioComprador: "Excelente vendedor",
          comentarioVendedor: "Compradora responsable"
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
          comentarioComprador: "Buen producto",
          comentarioVendedor: "Compradora seria"
        }
      ];
      setCalifications(mockData);
    } finally {
      setIsCalificationsLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      setIsLoadingUsuarios(true);
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
      setIsLoadingUsuarios(false);
    }
  };

  // Resto de las funciones existentes...
  const handleRejectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setShowRejectionModal(true);
  };

  const confirmRejectProduct = () => {
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
  };

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

  const handleDisableAd = (productId: string) => {
      setSelectedProductId(productId);
      setShowAdDisableModal(true);
  };

  const confirmDisableAd = () => {
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
  };

  const handleRejectPurchase = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setShowPurchaseRejectModal(true);
  };

  const confirmRejectPurchase = () => {
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
  };

  const handleApprovePurchase = (purchaseId: string) => {
    setCreditPurchases(prev => prev.map(p => 
      p.id === purchaseId ? { ...p, status: 'approved' as const } : p
    ));
  };

  // Calcular estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;
  const totalPurchases = creditPurchases.length;
  const pendingPurchases = creditPurchases.filter(p => p.status === 'pending').length;
  const approvedPurchases = creditPurchases.filter(p => p.status === 'approved').length;
  const totalRevenue = creditPurchases
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  // Calcular estadísticas de calificaciones
  const averageRating = califications.length > 0 
    ? (califications.reduce((acc, calif) => {
        const compradorCalif = calif.califCompradorAVendedor || 0;
        const vendedorCalif = calif.califVendedorAComprador || 0;
        return acc + compradorCalif + vendedorCalif;
      }, 0) / (califications.length * 2)).toFixed(1)
    : '0.0';

  const menuItems = [
    { id: "statistics", label: "Estadísticas", icon: BarChart3 },
    { id: "users", label: "Gestión Usuarios", icon: Users },
    { id: "payment-proofs", label: "Comprobantes", icon: Receipt },
    { id: "credit-packages", label: "Paquetes Créditos", icon: Package },
    { id: "ads-management", label: "Gestión Anuncios", icon: ShoppingBag },
    { id: "califications", label: "Calificaciones", icon: Star }
  ];

  const renderStatistics = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} activos
            </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} activos, {pendingProducts} pendientes
            </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras de Créditos</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPurchases} pendientes, {approvedPurchases} aprobadas
            </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              De compras aprobadas
            </p>
            </CardContent>
          </Card>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
            <CardTitle>Calificaciones Promedio</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-3xl font-bold text-center">{averageRating}/5</div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Basado en {califications.length} calificaciones
            </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
            <CardTitle>Calificaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-3xl font-bold text-center">{califications.length}</div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Calificaciones registradas
            </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  const renderUsers = () => (
    <div className="space-y-6">
    <Card>
      <CardHeader>
          <CardTitle>Gestión de Usuarios ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                        <Button 
                          variant="outline" 
                      onClick={() => handleToggleUserStatus(user.id)}
                        >
                      {user.isActive ? "Desactivar" : "Activar"}
                        </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );

  const renderCreditPurchases = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprobantes de Pago ({creditPurchases.length})</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Paquete</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Comprobante</TableHead>
                  <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {creditPurchases.map((purchase) => {
                const user = users.find(u => u.id === purchase.userId);
                const packageInfo = creditPackages.find(p => p.id === purchase.packageId);
                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{user?.username || 'N/A'}</TableCell>
                    <TableCell>{packageInfo?.name || 'N/A'}</TableCell>
                    <TableCell>${purchase.amount}</TableCell>
                    <TableCell>
                      <img 
                        src={purchase.proofImageUrl} 
                        alt="Comprobante" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        purchase.status === 'approved' ? 'default' : 
                        purchase.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }>
                        {purchase.status === 'approved' ? 'Aprobado' : 
                         purchase.status === 'rejected' ? 'Rechazado' : 
                         'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>{purchase.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {purchase.status === 'pending' && (
                          <>
                        <Button 
                          variant="outline" 
                              onClick={() => handleApprovePurchase(purchase.id)}
                            >
                              Aprobar
                        </Button>
                        <Button 
                          variant="outline" 
                              onClick={() => handleRejectPurchase(purchase.id)}
                        >
                              Rechazar
                        </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCreditPackages = () => (
    <div className="space-y-6">
    <Card>
        <CardHeader>
          <CardTitle>Paquetes de Créditos ({creditPackages.length})</CardTitle>
      </CardHeader>
      <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="text-2xl font-bold text-primary">${pkg.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Paquete de {pkg.credits} créditos</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Créditos:</span>
                      <span className="font-medium">{pkg.credits}</span>
                  </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Bonificación:</span>
                      <span className="font-medium">{pkg.bonus}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      </CardContent>
    </Card>
    </div>
  );

  const renderAdsManagement = () => (
    <div className="space-y-6">
    <Card>
      <CardHeader>
          <CardTitle>Gestión de Anuncios ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {products.map((product) => {
                const seller = users.find(u => u.id === product.sellerId);
                return (
              <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{seller?.username || 'N/A'}</TableCell>
                    <TableCell>${product.price}</TableCell>
                <TableCell>
                  <Badge variant={
                    product.status === 'active' ? 'default' :
                        product.status === 'rejected' ? 'destructive' : 
                        'secondary'
                  }>
                    {product.status === 'active' ? 'Activo' :
                         product.status === 'rejected' ? 'Rechazado' : 
                         product.status === 'pending' ? 'Pendiente' : 
                         product.status === 'sold' ? 'Vendido' : 'Inactivo'}
                  </Badge>
                </TableCell>
                    <TableCell>{product.createdAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                        {product.status === 'pending' && (
                          <>
                    <Button 
                              variant="outline"
                              onClick={() => handleApproveProduct(product.id)}
                            >
                              Aprobar
                    </Button>
                      <Button 
                              variant="outline"
                              onClick={() => handleRejectProduct(product.id)}
                      >
                              Rechazar
                      </Button>
                          </>
                        )}
                        {product.status === 'active' && (
                        <Button 
                          variant="outline" 
                            onClick={() => handleDisableAd(product.id)}
                          >
                            Desactivar
                        </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
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
  const getFilteredCalifications = () => {
    return califications.filter(calif => {
      const searchMatch = calificationFilters.search === "" || 
        calif.vendedor?.nombre?.toLowerCase().includes(calificationFilters.search.toLowerCase()) ||
        calif.comprador?.nombre?.toLowerCase().includes(calificationFilters.search.toLowerCase()) ||
        calif.puntoEncuentro?.toLowerCase().includes(calificationFilters.search.toLowerCase());
      
      const ratingMatch = ((calif.califCompradorAVendedor || 0) >= calificationFilters.minRating && 
                          (calif.califCompradorAVendedor || 0) <= calificationFilters.maxRating) ||
                         ((calif.califVendedorAComprador || 0) >= calificationFilters.minRating && 
                          (calif.califVendedorAComprador || 0) <= calificationFilters.maxRating);
      
      const meetingPointMatch = calificationFilters.meetingPoint === "all" || 
        calif.puntoEncuentro === calificationFilters.meetingPoint;

      const userMatch = calificationFilters.userSearch === "" || 
        calif.vendedor?.nombre?.toLowerCase().includes(calificationFilters.userSearch.toLowerCase()) ||
        calif.vendedor?.apellido?.toLowerCase().includes(calificationFilters.userSearch.toLowerCase()) ||
        calif.comprador?.nombre?.toLowerCase().includes(calificationFilters.userSearch.toLowerCase()) ||
        calif.comprador?.apellido?.toLowerCase().includes(calificationFilters.userSearch.toLowerCase());

      return searchMatch && ratingMatch && meetingPointMatch && userMatch;
    });
  };

  const filteredCalifications = getFilteredCalifications();
  const uniqueMeetingPoints = [...new Set(califications.map(calif => calif.puntoEncuentro))];

  const renderCalifications = () => {
    return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-2 border-blue-200 bg-blue-50">
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
                value={calificationFilters.search}
                onChange={(e) => setCalificationFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="minRating">Calificación Mínima</Label>
              <Select
                value={calificationFilters.minRating.toString()}
                onValueChange={(value) => setCalificationFilters(prev => ({ ...prev, minRating: parseInt(value) }))}
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
                value={calificationFilters.maxRating.toString()}
                onValueChange={(value) => setCalificationFilters(prev => ({ ...prev, maxRating: parseInt(value) }))}
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
                value={calificationFilters.meetingPoint}
                onValueChange={(value) => setCalificationFilters(prev => ({ ...prev, meetingPoint: value }))}
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
                value={calificationFilters.userSearch}
                onChange={(e) => setCalificationFilters(prev => ({ ...prev, userSearch: e.target.value }))}
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
                onClick={() => setCalificationFilters({
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle>Calificaciones ({filteredCalifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
            {isCalificationsLoading && califications.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
            ) : filteredCalifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No hay calificaciones que coincidan con los filtros</p>
            </div>
            ) : (
              <div className="space-y-4">
                {filteredCalifications.map((calif, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Vendedor</h4>
                        <p className="text-lg">{calif.vendedor?.nombre} {calif.vendedor?.apellido}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 mr-2">Calificación:</span>
                          <div className="flex">
                            {renderStars(calif.califCompradorAVendedor || 0)}
            </div>
            </div>
                        <p className="text-sm text-gray-600 mt-1">"{calif.comentarioComprador}"</p>
          </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Comprador</h4>
                        <p className="text-lg">{calif.comprador?.nombre} {calif.comprador?.apellido}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 mr-2">Calificación:</span>
                          <div className="flex">
                            {renderStars(calif.califVendedorAComprador || 0)}
            </div>
          </div>
                        <p className="text-sm text-gray-600 mt-1">"{calif.comentarioVendedor}"</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex justify-between items-center">
                          <span>📅 {calif.fechaCita} a las {calif.horaCita}</span>
                          <span>📍 {calif.puntoEncuentro}</span>
                  </div>
                        <div className="text-xs">
                          <p><strong>Dirección:</strong> {calif.direccionPunto}</p>
                          <p><strong>Referencias:</strong> {calif.referenciasPunto}</p>
            </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
  };

  const renderCurrentSection = () => {
    switch (activeSection) {
      case "statistics":
        return renderStatistics();
      case "users":
        return renderUsers();
      case "payment-proofs":
        return renderCreditPurchases();
      case "credit-packages":
        return renderCreditPackages();
      case "ads-management":
        return renderAdsManagement();
      case "califications":
        return renderCalifications();
      default:
        return renderStatistics();
    }
  };

  // Si se debe mostrar la página de calificaciones separada
  if (showCalificationPage) {
    return (
      <MainContent 
        currentSection="califications"
        onBack={() => setShowCalificationPage(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold" style={{ color: '#9d0045' }}>
              Admin Dashboard
          </h1>
        </div>
        <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
                    activeSection === item.id ? 'bg-gray-100 border-r-2 border-red-600' : ''
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
              </button>
              );
            })}
        </nav>
      </div>

      {/* Main Content */}
        <div className="flex-1 p-8">
          {renderCurrentSection()}
        </div>
          </div>
          
      {/* Modals */}
      <div>
        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Rechazar Producto</h3>
              <textarea
                className="w-full p-3 border rounded mb-4"
                placeholder="Motivo del rechazo..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex space-x-3">
                <Button onClick={confirmRejectProduct} disabled={!rejectionReason.trim()}>
                  Confirmar Rechazo
                </Button>
                <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
                  Cancelar
                </Button>
        </div>
      </div>
          </div>
        )}

      {/* User Edit Modal */}
        {showUserEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Cambiar Estado de Usuario</h3>
              <p className="mb-4">
                ¿Estás seguro de que quieres cambiar el estado de este usuario?
              </p>
            <div className="flex space-x-3">
                <Button onClick={confirmToggleUserStatus}>
                Confirmar
              </Button>
                <Button variant="outline" onClick={() => setShowUserEditModal(false)}>
                  Cancelar
              </Button>
            </div>
          </div>
          </div>
        )}

      {/* Ad Disable Modal */}
        {showAdDisableModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Desactivar Anuncio</h3>
              <textarea
                className="w-full p-3 border rounded mb-4"
                placeholder="Motivo de la desactivación..."
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
              />
            <div className="flex space-x-3">
                <Button onClick={confirmDisableAd} disabled={!disableReason.trim()}>
                  Confirmar Desactivación
                </Button>
                <Button variant="outline" onClick={() => setShowAdDisableModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
          </div>
        )}

        {/* Purchase Reject Modal */}
        {showPurchaseRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Rechazar Compra</h3>
              <textarea
                className="w-full p-3 border rounded mb-4"
                placeholder="Motivo del rechazo..."
                value={purchaseRejectionReason}
                onChange={(e) => setPurchaseRejectionReason(e.target.value)}
              />
            <div className="flex space-x-3">
                <Button onClick={confirmRejectPurchase} disabled={!purchaseRejectionReason.trim()}>
                  Confirmar Rechazo
                </Button>
                <Button variant="outline" onClick={() => setShowPurchaseRejectModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
              </div>
        )}
            </div>
    </div>
  );
}