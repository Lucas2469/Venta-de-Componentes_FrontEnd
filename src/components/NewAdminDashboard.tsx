import { useState, useEffect } from "react";
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
  ToggleRight,
  Loader2,
  Search
} from "lucide-react";
import { mockUsers, mockProducts, mockMeetingPoints, mockCreditPackages, mockCategories, mockRatings } from "./mockData";
import { User, Product, MeetingPoint, CreditPackage, Category, CreditPurchase, Rating } from "./types";
import { categoriesAPI } from '../api/categoriesApi';
import { meetingPointsAPI } from '../api/meetingPointsApi';
import MapComponent from '../components/MapComponent';


export function NewAdminDashboard() {
  const [activeSection, setActiveSection] = useState("statistics");
  const [users, setUsers] = useState(mockUsers.map(user => ({ ...user, isActive: true })));
  const [products, setProducts] = useState(mockProducts.map(product => ({ ...product, status: 'active' as const })));
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [creditPackages, setCreditPackages] = useState(mockCreditPackages);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Estados para gestión de puntos de encuentro
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
  
  // Estados para gestión de categorías
  const [newCategory, setNewCategory] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo"
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState<string | null>(null);
  
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

  // Cargar categorías y puntos de encuentro al montar el componente
  useEffect(() => {
    loadCategories();
    loadMeetingPoints();
  }, []);

  const loadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const categoriesData = await categoriesAPI.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

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

  // Funciones para CRUD de categorías
  const handleCreateCategory = async () => {
    try {
      setIsCategoriesLoading(true);
      const createdCategory = await categoriesAPI.create(newCategory);
      setCategories(prev => [...prev, createdCategory]);
      setNewCategory({ nombre: "", descripcion: "", estado: "activo" });
      setShowCategoryDialog(false);
    } catch (error) {
      console.error("Error al crear categoría:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      setIsCategoriesLoading(true);
      const updatedCategory = await categoriesAPI.update(editingCategory.id, {
        nombre: editingCategory.nombre,
        descripcion: editingCategory.descripcion,
        estado: editingCategory.estado
      });
      
      setCategories(prev => prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));
      
      setEditingCategory(null);
      setShowCategoryDialog(false);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      setCategoryActionLoading(categoryToDelete);
      await categoriesAPI.delete(categoryToDelete);
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete));
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    } finally {
      setCategoryActionLoading(null);
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      setCategoryActionLoading(categoryId);
      const updatedCategory = await categoriesAPI.toggleStatus(categoryId);
      setCategories(prev => prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));
    } catch (error) {
      console.error("Error al cambiar estado de categoría:", error);
    } finally {
      setCategoryActionLoading(null);
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryDialog(true);
  };

  const openCreateCategoryDialog = () => {
    setEditingCategory(null);
    setNewCategory({ nombre: "", descripcion: "", estado: "activo" });
    setShowCategoryDialog(true);
  };

  const openDeleteCategoryConfirm = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteConfirm(true);
  };

  // Funciones para CRUD de puntos de encuentro
  // En tu meetingPointsAPI, asegúrate de que las coordenadas se envíen como números
    const handleCreateMeetingPoint = async () => {
      try {
        setIsMeetingPointsLoading(true);
        const meetingPointToCreate = {
          ...newMeetingPoint,
          coordenadas_lat: Number(newMeetingPoint.coordenadas_lat),
          coordenadas_lng: Number(newMeetingPoint.coordenadas_lng)
        };
        
        const createdMeetingPoint = await meetingPointsAPI.create(meetingPointToCreate);
        setMeetingPoints(prev => [...prev, createdMeetingPoint]);
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
      const updatedMeetingPoint = await meetingPointsAPI.update(editingMeetingPoint.id, {
        nombre: editingMeetingPoint.nombre,
        direccion: editingMeetingPoint.direccion,
        referencias: editingMeetingPoint.referencias,
        coordenadas_lat: editingMeetingPoint.coordenadas_lat,
        coordenadas_lng: editingMeetingPoint.coordenadas_lng,
        estado: editingMeetingPoint.estado
      });
      
      setMeetingPoints(prev => prev.map(mp => 
        mp.id === updatedMeetingPoint.id ? updatedMeetingPoint : mp
      ));
      
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
      setMeetingPoints(prev => prev.filter(mp => mp.id !== meetingPointToDelete));
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
      const updatedMeetingPoint = await meetingPointsAPI.toggleStatus(meetingPointId);
      setMeetingPoints(prev => prev.map(mp => 
        mp.id === updatedMeetingPoint.id ? updatedMeetingPoint : mp
      ));
    } catch (error) {
      console.error("Error al cambiar estado de punto de encuentro:", error);
    } finally {
      setMeetingPointActionLoading(null);
    }
  };

  const openEditMeetingPointDialog = (meetingPoint: MeetingPoint) => {
    // Asegúrate de que las coordenadas sean números
    const meetingPointWithCoords = {
      ...meetingPoint,
      coordenadas_lat: Number(meetingPoint.coordenadas_lat) || -16.5000,
      coordenadas_lng: Number(meetingPoint.coordenadas_lng) || -68.1193
    };
    
    setEditingMeetingPoint(meetingPointWithCoords);
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

  const handleLocationSelect = (latlng) => {
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
      
      // Usar Nominatim (OpenStreetMap) para geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5&accept-language=es`
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
      } else {
        // Mostrar mensaje de error si no se encuentran resultados
        alert("No se encontraron resultados para la dirección ingresada");
      }
    } catch (error) {
      console.error("Error en la búsqueda de dirección:", error);
      alert("Error al buscar la dirección. Intenta nuevamente.");
    } finally {
      setIsSearchingAddress(false);
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

  // Funciones para solicitudes de pago
  const handleApprovePurchase = (purchaseId: string) => {
    setCreditPurchases(prev => prev.map(p => 
      p.id === purchaseId ? { ...p, status: 'approved' as const } : p
    ));
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

  const renderCreditPurchases = () => (
    <Card>
      <CardHeader>
        <CardTitle>Comprobantes de Pago</CardTitle>
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
              const pkg = creditPackages.find(p => p.id === purchase.packageId);
              return (
                <TableRow key={purchase.id}>
                  <TableCell>{user?.username}</TableCell>
                  <TableCell>{pkg?.name}</TableCell>
                  <TableCell>Bs {purchase.amount}</TableCell>
                  <TableCell>
                    {purchase.proofImageUrl ? (
                      <Button variant="outline" size="sm">
                        <FileImage className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    ) : (
                      <span className="text-gray-500">Sin comprobante</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      purchase.status === 'approved' ? 'default' :
                      purchase.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {purchase.status === 'approved' ? 'Aprobado' :
                       purchase.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(purchase.createdAt).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {purchase.status !== 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApprovePurchase(purchase.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {purchase.status === 'pending' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectPurchase(purchase.id)}
                        >
                          <X className="h-4 w-4" />
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
  );

// Reemplaza el filtro de meeting points por este:
  const filteredMeetingPoints = selectedStatus === "todos" 
    ? meetingPoints 
    : meetingPoints.filter(point => point.estado === selectedStatus);

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
              <Label htmlFor="status-filter">Filtrar por Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
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

      {/* Diálogo para crear/editar punto de encuentro */}
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
                  <SelectItem value="Otra ubicación">Otra ubicación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda de dirección */}
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

            {/* Mapa */}
            <div>
              <Label>Ubicación en el Mapa (Haz clic para seleccionar)</Label>
              <MapComponent
                onLocationSelect={handleLocationSelect}
                initialPosition={{
                  lat: editingMeetingPoint ? editingMeetingPoint.coordenadas_lat : newMeetingPoint.coordenadas_lat,
                  lng: editingMeetingPoint ? editingMeetingPoint.coordenadas_lng : newMeetingPoint.coordenadas_lng
                }}
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

      {/* Diálogo de confirmación para eliminar punto de encuentro */}
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

  const renderCreditPackages = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Paquetes de Créditos</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Paquete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Paquete de Créditos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="package-name">Nombre</Label>
                <Input id="package-name" placeholder="Nombre del paquete" />
              </div>
              <div>
                <Label htmlFor="package-credits">Créditos</Label>
                <Input id="package-credits" type="number" placeholder="Cantidad de créditos" />
              </div>
              <div>
                <Label htmlFor="package-price">Precio (Bs)</Label>
                <Input id="package-price" type="number" placeholder="Precio en bolivianos" />
              </div>
              <div>
                <Label htmlFor="package-qr">Código QR</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen QR
                </Button>
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
              <TableHead>Créditos</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creditPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>{pkg.credits}</TableCell>
                <TableCell>Bs {pkg.price}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <FileImage className="h-4 w-4 mr-2" />
                    Ver QR
                  </Button>
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorías</CardTitle>
          <Button onClick={openCreateCategoryDialog} disabled={isCategoriesLoading}>
            {isCategoriesLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Agregar Categoría
          </Button>
        </CardHeader>
        <CardContent>
          {isCategoriesLoading && categories.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.nombre}</TableCell>
                    <TableCell className="max-w-xs truncate">{category.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant={category.estado === "activo" ? "default" : "secondary"}>
                        {category.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {products.filter(p => p.category === category.id).length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleCategoryStatus(category.id)}
                          disabled={categoryActionLoading === category.id}
                        >
                          {categoryActionLoading === category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : category.estado === "activo" ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditCategoryDialog(category)}
                          disabled={isCategoriesLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openDeleteCategoryConfirm(category.id)}
                          disabled={isCategoriesLoading}
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

      {/* Diálogo para crear/editar categoría */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nombre *</Label>
              <Input
                id="category-name"
                placeholder="Nombre de la categoría"
                value={editingCategory ? editingCategory.nombre : newCategory.nombre}
                onChange={(e) => 
                  editingCategory 
                    ? setEditingCategory({...editingCategory, nombre: e.target.value})
                    : setNewCategory({...newCategory, nombre: e.target.value})
                }
                disabled={isCategoriesLoading}
              />
            </div>
            <div>
              <Label htmlFor="category-description">Descripción</Label>
              <Textarea
                id="category-description"
                placeholder="Descripción de la categoría"
                value={editingCategory ? editingCategory.descripcion : newCategory.descripcion}
                onChange={(e) => 
                  editingCategory 
                    ? setEditingCategory({...editingCategory, descripcion: e.target.value})
                    : setNewCategory({...newCategory, descripcion: e.target.value})
                }
                disabled={isCategoriesLoading}
              />
            </div>
            <div>
              <Label htmlFor="category-status">Estado</Label>
              <Select
                value={editingCategory ? editingCategory.estado : newCategory.estado}
                onValueChange={(value: "activo" | "inactivo") => 
                  editingCategory 
                    ? setEditingCategory({...editingCategory, estado: value})
                    : setNewCategory({...newCategory, estado: value})
                }
                disabled={isCategoriesLoading}
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
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryDialog(false)}
              disabled={isCategoriesLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={isCategoriesLoading || (!editingCategory && !newCategory.nombre.trim())}
            >
              {isCategoriesLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingCategory ? "Actualizar" : "Crear"} Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro de eliminar esta categoría?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Los productos asociados a esta categoría quedarán sin categoría.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isCategoriesLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
              disabled={isCategoriesLoading}
            >
              {isCategoriesLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                onValueChange={(value) => setRatingsFilters(prev => ({ ...prev, minRating: Number(value) }))}
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
                onValueChange={(value) => setRatingsFilters(prev => ({ ...prev, meetingPointId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los puntos</SelectItem>
                  {meetingPoints.map(point => (
                    <SelectItem key={point.id} value={point.id}>
                      {point.nombre}
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
                          <div className="text-sm font-medium">{meetingPoint?.nombre || 'N/A'}</div>
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
                      <div className="font-medium">buyer?.username || 'N/A'</div>
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
                          <div className="text-sm font-medium">{meetingPoint?.nombre || 'N/A'}</div>
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
        return renderCreditPurchases();
      case "meeting-points":
        return renderMeetingPoints();
      case "credit-packages":
        return renderCreditPackages();
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
                onClick={confirmDisableAd}
                className="flex-1"
                disabled={!disableReason.trim()}
              >
                Inhabilitar Anuncio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Rejection Modal */}
      <Dialog open={showPurchaseRejectModal} onOpenChange={setShowPurchaseRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud de Pago</DialogTitle>
            <DialogDescription>
              Por favor indica la razón por la cual se está rechazando esta solicitud
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="purchase-rejection-reason">Motivo del rechazo</Label>
              <Textarea
                id="purchase-rejection-reason"
                placeholder="Describe el motivo del rechazo..."
                value={purchaseRejectionReason}
                onChange={(e) => setPurchaseRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPurchaseRejectModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmRejectPurchase}
                className="flex-1"
                disabled={!purchaseRejectionReason.trim()}
              >
                Rechazar Solicitud
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}