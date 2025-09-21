import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Star, MapPin, Calendar, Eye, Crown, Trophy, Award, Plus, CreditCard, Settings, MapPin as MapPinIcon } from "lucide-react";
import { Product, User } from "./types";
import { mockProducts, mockUsers, mockCategories } from "./mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CatalogPageProps {
  searchQuery: string;
  onProductClick: (productId: string) => void;
  currentUser?: any;
  onNavigate?: (page: string) => void;
}

export function CatalogPage({ searchQuery, onProductClick, currentUser, onNavigate }: CatalogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      // Price filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Rating filter
      const matchesRating = product.sellerRating >= minRating;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.sellerRating - a.sellerRating);
        break;
      case "views":
        filtered.sort((a, b) => b.views - a.views);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  // Get top sellers and buyers
  const topSellers = mockUsers
    .filter(user => user.isSeller)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const topBuyers = mockUsers
    .filter(user => user.isBuyer)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{product.views}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-bold" style={{ color: '#9d0045' }}>
            Bs {product.price}
          </div>
          <Badge variant="outline" className="text-xs">
            {mockCategories.find(c => c.id === product.category)?.name}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">por</span>
            <span className="text-sm font-medium">{product.sellerName}</span>
          </div>
          <div className="flex items-center space-x-1">
            {renderStars(product.sellerRating)}
            <span className="text-sm text-gray-600">({product.sellerRating})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{product.meetingPoints.length} puntos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{product.availableDates.length} fechas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RankingCard = ({ title, users, icon: Icon }: { title: string; users: User[]; icon: any }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {users.map((user, index) => (
            <div key={user.id} className="flex items-center space-x-3">
              <div 
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-400 text-black' : 
                  index === 1 ? 'bg-gray-300 text-black' : 
                  index === 2 ? 'bg-yellow-600 text-white' : 
                  'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{user.username}</div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(user.rating).slice(0, 5)}
                  </div>
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
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Filters and Sort */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Select value={selectedCategory} onValueChange={(value: string) => setSelectedCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {mockCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <label className="text-sm font-medium">Precio: Bs {priceRange[0]} - Bs {priceRange[1]}</label>
                <Slider
                  value={priceRange}
                  onValueChange={(value: number[]) => setPriceRange([value[0], value[1]])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <Select 
                value={minRating.toString()} 
                onValueChange={(value: string) => setMinRating(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Calificación mínima" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Cualquier calificación</SelectItem>
                  <SelectItem value="3">3+ estrellas</SelectItem>
                  <SelectItem value="4">4+ estrellas</SelectItem>
                  <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                  <SelectItem value="rating">Mejor calificación</SelectItem>
                  <SelectItem value="views">Más vistos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} componentes encontrados
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("all");
                  setPriceRange([0, 100]);
                  setMinRating(0);
                  setSortBy("newest");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          {currentUser && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              {/* Debug info for admin */}
              {currentUser?.role === 'admin' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Modo Administrador:</strong> Logueado como {currentUser.username} (ID: {currentUser.id})
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => onNavigate?.('create-ad')}
                  style={{ backgroundColor: '#9d0045', color: '#ffffff' }}
                  className="hover:bg-opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Anuncio
                </Button>
                <Button 
                  onClick={() => onNavigate?.('buy-credits')}
                  style={{ backgroundColor: '#2eafa9ff', color: '#ffffff' }}
                  className="hover:bg-opacity-90"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Comprar Créditos
                </Button>
                <Button 
                  onClick={() => onNavigate?.('admin-dashboard')}
                  style={{ backgroundColor: '#c95119ff', color: '#ffffff' }}
                  className="hover:bg-opacity-90"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Panel Administrador
                </Button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No se encontraron componentes</div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory("all");
                  setPriceRange([0, 100]);
                  setMinRating(0);
                }}
              >
                Mostrar todos los componentes
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar - Rankings */}
        <div className="w-full lg:w-80">
          <RankingCard 
            title="Top 5 Vendedores" 
            users={topSellers} 
            icon={Crown}
          />
          
          <RankingCard 
            title="Top 5 Compradores" 
            users={topBuyers} 
            icon={Trophy}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <h3 className="font-semibold">Estadísticas</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Componentes activos:</span>
                  <span className="font-medium">{mockProducts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vendedores activos:</span>
                  <span className="font-medium">{mockUsers.filter(u => u.isSeller).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Usuarios registrados:</span>
                  <span className="font-medium">{mockUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Categorías:</span>
                  <span className="font-medium">{mockCategories.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}