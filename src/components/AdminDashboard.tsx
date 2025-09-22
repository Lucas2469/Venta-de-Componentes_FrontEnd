<<<<<<< HEAD
import React from "react";
=======
>>>>>>> AnettG
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
<<<<<<< HEAD
import { 
  Users, 
  BarChart3, 
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Users, 
  CreditCard, 
  MapPin, 
  BarChart3, 
  Package, 
>>>>>>> AnettG
  FileImage, 
  ShoppingBag, 
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Upload
} from "lucide-react";
import { mockUsers, mockProducts, mockMeetingPoints, mockCreditPackages, mockCategories } from "./mockData";
<<<<<<< HEAD
import { CreditPurchase } from "./types";
=======
import { User, Product, MeetingPoint, CreditPackage, Category, CreditPurchase } from "./types";
>>>>>>> AnettG

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState(mockUsers);
  const [products, setProducts] = useState(mockProducts);
  const [meetingPoints, setMeetingPoints] = useState(mockMeetingPoints);
  const [creditPackages, setCreditPackages] = useState(mockCreditPackages);
  const [categories, setCategories] = useState(mockCategories);

  // Mock credit purchases data
  const [creditPurchases] = useState<CreditPurchase[]>([
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

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleApproveProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, status: 'active' as const } : p
    ));
  };

  const handleRejectProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, status: 'rejected' as const } : p
    ));
  };

  const handleDeleteMeetingPoint = (pointId: string) => {
    setMeetingPoints(prev => prev.filter(mp => mp.id !== pointId));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const OverviewCard = ({ title, value, icon: Icon, description }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    description: string 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#9d0045' }}>
          Panel Administrativo
        </h1>
        <Badge variant="outline" className="px-3 py-1">
          Administrador
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Estadísticas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="products">Anuncios</TabsTrigger>
          <TabsTrigger value="credits">Créditos</TabsTrigger>
          <TabsTrigger value="meeting-points">Puntos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="packages">Paquetes</TabsTrigger>
          <TabsTrigger value="ratings">Calificaciones</TabsTrigger>
        </TabsList>

        {/* Overview/Statistics */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <OverviewCard
              title="Usuarios Totales"
              value={statistics.totalUsers}
              icon={Users}
              description="Usuarios registrados"
            />
            <OverviewCard
              title="Usuarios Activos"
              value={statistics.activeUsers}
              icon={Users}
              description="Usuarios no admin"
            />
            <OverviewCard
              title="Productos Activos"
              value={statistics.activeProducts}
              icon={ShoppingBag}
              description="Anuncios publicados"
            />
            <OverviewCard
              title="Anuncios Semanales"
              value={statistics.weeklyAds}
              icon={BarChart3}
              description="Últimos 7 días"
            />
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
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 
                           user.isSeller && user.isBuyer ? 'Ambos' :
                           user.isSeller ? 'Vendedor' : 'Comprador'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.registrationDate).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{user.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.role !== 'admin' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* Products/Ads Management */}
        <TabsContent value="products" className="space-y-6">
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
                    <TableHead>Vistas</TableHead>
                    <TableHead>Fecha</TableHead>
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
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
                        <Badge variant={
                          product.status === 'active' ? 'default' :
                          product.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {product.status === 'active' ? 'Activo' :
                           product.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.views}</TableCell>
                      <TableCell>{new Date(product.createdAt).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {product.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleApproveProduct(product.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectProduct(product.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Purchases */}
        <TabsContent value="credits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Créditos</CardTitle>
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
                        <TableCell>${purchase.amount}</TableCell>
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
                          {purchase.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meeting Points CRUD */}
        <TabsContent value="meeting-points" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Puntos de Encuentro</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Punto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuevo Punto de Encuentro</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo punto de encuentro para las transacciones
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" placeholder="Nombre del lugar" />
                    </div>
                    <div>
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" placeholder="Dirección completa" />
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
                    <TableHead>Dirección</TableHead>
                    <TableHead>Coordenadas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetingPoints.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell>{point.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{point.address}</TableCell>
                      <TableCell>
                        {point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteMeetingPoint(point.id)}
                          >
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
        </TabsContent>

        {/* Categories CRUD */}
        <TabsContent value="categories" className="space-y-6">
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
                    <DialogDescription>
                      Crea una nueva categoría para los productos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Nombre</Label>
                      <Input id="category-name" placeholder="Nombre de la categoría" />
                    </div>
                    <div>
                      <Label htmlFor="category-description">Descripción</Label>
                      <Textarea id="category-description" placeholder="Descripción de la categoría" />
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
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>
                        <Badge>{products.filter(p => p.category === category.id).length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
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
        </TabsContent>

        {/* Credit Packages CRUD */}
        <TabsContent value="packages" className="space-y-6">
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
                    <DialogDescription>
                      Crea un nuevo paquete de créditos para los vendedores
                    </DialogDescription>
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
        </TabsContent>

        {/* Ratings View */}
        <TabsContent value="ratings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Sellers */}
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
                      <div key={user.id} className="flex items-center space-x-3">
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

            {/* Top Buyers */}
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
                      <div key={user.id} className="flex items-center space-x-3">
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

          {/* All Ratings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Todas las Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Transacciones</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(u => u.role === 'user')
                    .sort((a, b) => b.rating - a.rating)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.isSeller && user.isBuyer ? 'Ambos' :
                             user.isSeller ? 'Vendedor' : 'Comprador'}
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
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}