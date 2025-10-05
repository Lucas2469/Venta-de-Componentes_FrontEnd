import React, { useState, useEffect } from 'react';
import { productsApi, ProductDetail as ProductDetailType, HorarioVendedor } from '../api/productsApi';
import { getImageUrl } from '../api/api';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { appointmentApi, CreateAppointmentRequest } from '../api/Appointment';
import { Loader2 } from 'lucide-react';

interface ProductDetailProps {
    productId: number;
    currentUser: { id: string | number; role?: string } | null;
    onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, currentUser, onBack }) => {
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
    // Calcular ID real del usuario logueado (misma lógica que Header.tsx)
    const isAdmin = currentUser?.role === "admin";
    const comprador_id = currentUser?.id ? parseInt(currentUser.id.toString()) : (isAdmin ? 1 : 2);

    // Debug: Verificar los IDs
    console.log("🔍 DEBUG - ProductDetail:");
    console.log("currentUser:", currentUser);
    console.log("currentUser.id:", currentUser?.id);
    console.log("comprador_id calculado:", comprador_id);
    console.log("isAdmin:", isAdmin);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await productsApi.getProductById(productId);

                if (response.success) {
                    setProduct(response.data);
                    setQuantity(1); // Reset quantity when product changes
                } else {
                    setError('Producto no encontrado');
                }
            } catch (err) {
                setError('Error al cargar el producto');
                console.error('Error loading product:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    // Loading state mejorado
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center justify-center min-h-64">
                        <div className="relative mb-8">
                            {/* Spinner sofisticado */}
                            <div className="w-24 h-24 border-4 border-transparent border-t-indigo-600 border-r-purple-600 rounded-full animate-spin"></div>
                            <div className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-b-pink-500 border-l-blue-500 rounded-full animate-spin animation-delay-150"></div>
                            <div className="absolute top-4 left-4 w-16 h-16 border-4 border-transparent border-t-green-500 border-r-orange-500 rounded-full animate-spin animation-delay-300"></div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                                🔍 Cargando producto
                            </h3>
                            <p className="text-gray-600 mb-6">Preparando todos los detalles para ti...</p>

                            {/* Dots animados */}
                            <div className="flex justify-center space-x-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
                                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state mejorado
    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-12 text-center shadow-xl">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-4xl text-white">❌</span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Producto no encontrado</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {error || 'El producto que buscas no está disponible o no existe.'}
                        </p>

                        <button
                            onClick={onBack}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                        >
                            ← Volver al catálogo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(price);
    };

    const formatDiasSemana = (dia: string) => {
        const dias = {
            'lunes': '🟦 Lun',
            'martes': '🟩 Mar',
            'miércoles': '🟨 Mié',
            'jueves': '🟪 Jue',
            'viernes': '🟫 Vie',
            'sábado': '🟥 Sáb',
            'domingo': '🟧 Dom'
        };
        return dias[dia as keyof typeof dias] || dia;
    };

    // Quantity management functions
    const handleQuantityChange = (newQuantity: number) => {
        if (product && newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const increaseQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleContactSeller = () => {
        setShowScheduleModal(true);
    };

    const handleScheduleConfirm = async (fecha: Date, horario: HorarioVendedor, horaExacta: string, cantidad_solicitada: number, precio_total: number) => {
        if (!product) return;

        // Validar stock disponible
        if (cantidad_solicitada > product.stock) {
            alert(`Stock insuficiente. Solo hay ${product.stock} unidad${product.stock !== 1 ? 'es' : ''} disponible${product.stock !== 1 ? 's' : ''}.`);
            return;
        }

        setIsCreatingAppointment(true);

        try {
            const appointmentData: CreateAppointmentRequest = {
                producto_id: product.id,
                comprador_id: comprador_id,
                fecha_cita: fecha.toISOString().split('T')[0],
                hora_cita: horaExacta,
                cantidad_solicitada: cantidad_solicitada,
                precio_total: precio_total
            };

            const response = await appointmentApi.createAppointment(appointmentData);

            alert(`Encuentro agendado exitosamente para ${fecha.toLocaleDateString('es-ES')} de ${horario.hora_inicio} a ${horario.hora_fin}.\nCantidad: ${cantidad_solicitada} unidad${cantidad_solicitada !== 1 ? 'es' : ''}\nTotal: ${formatPrice(precio_total)}`);

            setShowScheduleModal(false);
        } catch (error: any) {
            console.error('Error al crear agendamiento:', error);
            alert(error.response?.data?.message || 'Error al agendar el encuentro. Por favor intenta nuevamente.');
        } finally {
            setIsCreatingAppointment(false);
        }
    };

    const images = product.imagenes || [];
    const currentImage = images[currentImageIndex]?.url_imagen || product.imagen_principal;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Botón de regreso espectacular */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="group flex items-center space-x-3 px-6 py-3 bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <span className="text-white font-bold">←</span>
                        </div>
                        <span className="text-gray-700 font-semibold group-hover:text-indigo-600 transition-colors">
                            Volver al catálogo
                        </span>
                    </button>
                </div>

                {/* Contenedor principal COMPACTO con glassmorphism */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* Galería de imágenes COMPACTA */}
                        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                            {/* Imagen principal con efectos */}
                            <div className="relative aspect-[4/3] w-full bg-white rounded-xl overflow-hidden shadow-lg group">
                                <img
                                    src={getImageUrl(currentImage || '')}
                                    alt={product.nombre}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                    }}
                                />

                                {/* Badge de estado flotante */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm ${
                                        product.estado === 'activo' ? 'bg-green-500/90 text-white' :
                                        product.estado === 'agotado' ? 'bg-red-500/90 text-white' :
                                        'bg-gray-500/90 text-white'
                                    }`}>
                                        {product.estado === 'activo' ? '✅ Disponible' :
                                         product.estado === 'agotado' ? '❌ Agotado' :
                                         product.estado}
                                    </span>
                                </div>
                            </div>

                            {/* Miniaturas COMPACTAS */}
                            {images.length > 1 && (
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${
                                                index === currentImageIndex
                                                    ? 'border-indigo-500 shadow-md'
                                                    : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            <img
                                                src={getImageUrl(image.url_imagen)}
                                                alt={`${product.nombre} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {index === currentImageIndex && (
                                                <div className="absolute inset-0 bg-indigo-500/20"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Información del producto COMPACTA */}
                        <div className="p-6 space-y-6">
                            {/* Header COMPACTO del producto */}
                            <div className="space-y-3">
                                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {product.nombre}
                                </h1>

                                {/* Precio y stock en una línea */}
                                <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                                    <div>
                                        <p className="text-xs text-red-600 font-semibold uppercase">Precio</p>
                                        <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                            {formatPrice(product.precio)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600 font-semibold uppercase">Stock</p>
                                        <p className="text-xl font-bold text-gray-900">{product.stock} unidades</p>
                                    </div>
                                </div>
                            </div>

                            {/* Selector de cantidad COMPACTO */}
                            {product.estado === 'activo' && product.stock > 0 && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        📊 Cantidad deseada
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Controles de cantidad */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={decreaseQuantity}
                                                disabled={quantity <= 1}
                                                className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                            >
                                                −
                                            </button>

                                            <div className="flex-1 relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={product.stock}
                                                    value={quantity}
                                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                                    className="w-full px-4 py-2 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-bold bg-white"
                                                />
                                            </div>

                                            <button
                                                onClick={increaseQuantity}
                                                disabled={quantity >= product.stock}
                                                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Precio total */}
                                        <div className="bg-white/80 rounded-lg p-3 border border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Total:</span>
                                                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                    {formatPrice(product.precio * quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grid de información compacta */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* Descripción */}
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                        📝 Descripción
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">{product.descripcion}</p>
                                </div>

                                {/* Especificaciones técnicas */}
                                {product.especificaciones && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                            ⚙️ Especificaciones
                                        </h3>
                                        <div className="bg-white/80 rounded-lg p-3">
                                            <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm">
                                                {product.especificaciones}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Grid de información del vendedor y detalles */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Vendedor */}
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                        👤 Vendedor
                                    </h3>
                                    <div className="bg-white/80 rounded-lg p-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">
                                                    {product.vendedor_nombre?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">
                                                    {product.vendedor_nombre} {product.vendedor_apellido}
                                                </h4>
                                                <div className="flex items-center space-x-4 text-xs">
                                                    <span className="text-gray-600">
                                                        ⭐ {parseFloat(product.vendedor_calificacion).toFixed(1)}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        🛍️ {product.vendedor_total_ventas} ventas
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Punto de encuentro */}
                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                        📍 Punto de encuentro
                                    </h3>
                                    {product.punto_encuentro_nombre ? (
                                        <div className="bg-white/80 rounded-lg p-3">
                                            <h4 className="font-bold text-blue-900 mb-1">
                                                {product.punto_encuentro_nombre}
                                            </h4>
                                            <p className="text-blue-800 text-sm font-medium">
                                                📍 {product.punto_encuentro_direccion}
                                            </p>
                                            {product.coordenadas_lat && product.coordenadas_lng && (
                                                <a
                                                    href={`https://maps.google.com/?q=${product.coordenadas_lat},${product.coordenadas_lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    🗺️ Ver en Maps
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 rounded-lg p-3">
                                            <p className="text-gray-600 text-sm">No especificado</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Horarios compactos */}
                            {product.horarios_vendedor && product.horarios_vendedor.length > 0 && (
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                        🕒 Horarios de atención
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {product.horarios_vendedor.map((horario, index) => (
                                            <div key={index} className="bg-white/80 rounded-lg p-2 text-center">
                                                <div className="text-xs font-bold text-gray-900">
                                                    {formatDiasSemana(horario.dia_semana)}
                                                </div>
                                                <div className="text-xs text-gray-700">
                                                    {horario.hora_inicio} - {horario.hora_fin}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categoría compacta */}
                            <div className="text-center">
                                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                                    <p className="text-sm font-bold text-purple-700">
                                        🏷️ {product.categoria_nombre}
                                    </p>
                                </div>
                            </div>

                            {/* Botón de contactar vendedor COMPACTO pero épico */}
                            <div className="pt-4">
                                <button
                                    onClick={handleContactSeller}
                                    className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <div className="relative flex items-center justify-center space-x-2">
                                        <span className="text-lg">📅</span>
                                        <span className="text-lg">Contactar al vendedor</span>
                                    </div>
                                </button>
                                <p className="text-center text-gray-500 mt-2 text-sm">
                                    🤝 Agenda una cita para ver el producto y realizar la compra
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productos relacionados COMPACTOS */}
                {product.productos_relacionados && product.productos_relacionados.length > 0 && (
                    <div className="mt-8">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                                🔗 Productos Relacionados
                            </h3>
                            <p className="text-gray-600 text-sm">Otros productos que podrían interesarte</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {product.productos_relacionados.map((relatedProduct, index) => (
                                <div
                                    key={relatedProduct.id}
                                    className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                                    onClick={() => window.location.reload()}
                                >
                                    <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                        <img
                                            src={getImageUrl(relatedProduct.imagen_principal)}
                                            alt={relatedProduct.nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                            {relatedProduct.nombre}
                                        </h4>
                                        <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                            {formatPrice(relatedProduct.precio)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de agendamiento */}
            {showScheduleModal && product && (
                <ScheduleMeetingModal
                    isOpen={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    productName={product.nombre}
                    vendorName={`${product.vendedor_nombre} ${product.vendedor_apellido}`}
                    horarios={product.horarios_vendedor || []}
                    puntoEncuentro={{
                        nombre: product.punto_encuentro_nombre || 'No especificado',
                        direccion: product.punto_encuentro_direccion || 'No especificado',
                        referencias: product.punto_encuentro_referencias
                    }}
                    quantity={quantity}
                    unitPrice={product.precio}
                    stock={product.stock}
                    onConfirm={handleScheduleConfirm}
                />
            )}
        </div>
    );
};