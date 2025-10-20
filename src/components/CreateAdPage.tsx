
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createAdProduct,
  getCategorias,
  getPuntosEncuentro,
  getCreditosDisponibles,
} from "../api/AdProduct";
import { Upload, X, FileText, Image as ImageIcon, DollarSign, ChevronDown } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "./Toast";

type Categoria = { id: number; nombre: string };
type Punto = { id: number; nombre: string };

interface CreateAdPageProps {
  onBack?: () => void; // opcional para evitar errores en rutas
  currentUser?: any; // usuario logueado
}

export default function CreateAdPage({ onBack, currentUser }: CreateAdPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuthContext();
  const { showToast, ToastComponent } = useToast();

  // Usar user del contexto si currentUser no está disponible
  const activeUser = currentUser || user;

  // datos dinámicos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [creditos, setCreditos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // formulario
  const [form, setForm] = useState({
    categoriaId: "",
    puntoEncuentroId: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
  });

  // imágenes (previews y archivos reales)
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const redirectedRef = useRef(false); // anti doble redirección

  // Cargar combos + créditos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, pts] = await Promise.all([
          getCategorias(),           // [{id, nombre}]
          getPuntosEncuentro(),      // [{id, nombre}]
        ]);

        if (!mounted) return;
        setCategorias(Array.isArray(cats) ? cats : []);
        setPuntos(Array.isArray(pts) ? pts : []);

        // Usar créditos directamente del usuario autenticado
        const userCredits = activeUser?.creditos_disponibles || activeUser?.credits || 0;
        setCreditos(userCredits);
      } catch (e) {
        console.error("[CreateAdPage] load error:", e);
        if (mounted) setCreditos(0);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeUser?.id, activeUser?.creditos_disponibles]);

  // Redirigir a compra de créditos si no alcanza (evitar bucle si ya estás ahí)
  useEffect(() => {
    if (loading) return;
    if (location.pathname === "/buy-credits") return;
    if (redirectedRef.current) return;

    console.log('🔍 Verificando créditos:', creditos);
    if ((creditos ?? 0) < 1) {
      console.log('⚠️ Sin créditos, redirigiendo a compra...');
      redirectedRef.current = true;
      navigate("/buy-credits");
    }
  }, [creditos, loading, location.pathname, navigate]);

  const handleInput = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // ✅ Validación en tiempo real para stock
    if (field === 'stock') {
      const stockValue = Number(value);
      if (stockValue > 0 && (creditos ?? 0) < stockValue) {
        setErrors((prev) => ({
          ...prev,
          stock: `Stock excede tus créditos disponibles (tienes ${creditos || 0})`
        }));
      } else if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } else if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const onSelectCategoria = (value: string) => handleInput("categoriaId", value);
  const onSelectPunto = (value: string) => handleInput("puntoEncuentroId", value);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const selected = Array.from(files);
    const total = imageFiles.length + selected.length;
    if (total > 6) {
      setErrors((p) => ({ ...p, images: "Máximo 6 imágenes permitidas" }));
      return;
    }

    setImageFiles((prev) => [...prev, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = useMemo(() => {
    return () => {
      const errs: Record<string, string> = {};
      if (!form.nombre.trim()) errs.nombre = "El título es requerido";
      if (!form.descripcion.trim()) errs.descripcion = "La descripción es requerida";
      // ✅ Validación mejorada para precio
      if (!form.precio) {
        errs.precio = "El precio es requerido";
      } else {
        const precioValue = Number(form.precio);
        if (precioValue <= 0) {
          errs.precio = "El precio debe ser mayor a 0";
        }
      }
      
      // ✅ Validación mejorada para stock
      if (!form.stock) {
        errs.stock = "La cantidad es requerida";
      } else {
        const stockValue = Number(form.stock);
        
        // Validar que sea un número entero positivo
        if (!Number.isInteger(stockValue)) {
          errs.stock = "La cantidad debe ser un número entero (sin decimales)";
        } else if (stockValue <= 0) {
          errs.stock = "La cantidad debe ser mayor a 0";
        } else if ((creditos ?? 0) < stockValue) {
          errs.stock = `Stock excede tus créditos disponibles (tienes ${creditos || 0})`;
        }
      }

      if (!form.categoriaId) errs.categoriaId = "Selecciona una categoría";
      if (!form.puntoEncuentroId) errs.puntoEncuentroId = "Selecciona un punto de encuentro";
      if (imageFiles.length === 0) errs.images = "Debes subir al menos una imagen";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };
  }, [form, imageFiles.length, creditos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const vendedorId = activeUser?.id ? parseInt(activeUser.id.toString()) : 2;
      const res = await createAdProduct(
        {
          vendedorId: vendedorId,
          categoriaId: Number(form.categoriaId),
          puntoEncuentroId: Number(form.puntoEncuentroId),
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          stock: Number(form.stock),
        },
        imageFiles
      );

      // Actualizar créditos del usuario en el contexto
      await refreshProfile();

      // Mostrar toast de éxito
      showToast('success', '¡Producto creado!', res.message || 'Tu producto se ha publicado exitosamente.');

      // Esperar un poco para que el usuario vea el toast antes de navegar
      setTimeout(() => {
        if (onBack) onBack();
        else navigate("/catalog");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || "Error al crear el anuncio";
      setErrors((p) => ({ ...p, submit: errorMessage }));
      showToast('error', 'Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || creditos === null) {
    return <p className="px-4 py-8">Cargando...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#9d0045]">
            Crear Nuevo Anuncio
          </h1>
          <button
            onClick={onBack ? onBack : () => navigate("/catalog")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Volver al Catálogo
          </button>
        </div>

        {/* Aviso de créditos + política */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">Tus créditos disponibles</p>
              <p className="text-3xl font-bold text-blue-900">{creditos || 0}</p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Cada unidad de stock consume 1 crédito
              </p>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/buy-credits")}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Comprar más créditos
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-800 flex items-center">
            <span className="mr-2">⚠️</span>
            <strong>Importante:</strong> Una vez publicado, no podrás editar este producto (solo eliminarlo).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Básica */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900">

                <FileText className="h-5 w-5" />
                <span>Información Básica</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>

                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Anuncio *
                </label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Arduino UNO R3 Original con Cable USB"
                  value={form.nombre}
                  onChange={(e) => handleInput("nombre", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent ${
                    errors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div>

                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  placeholder="Describe tu componente: estado, especificaciones, compatibilidad..."
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => handleInput("descripcion", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent resize-vertical ${
                    errors.descripcion ? "border-red-500" : "border-gray-300"
                  }`}

                />
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>

                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (Bs) *
                  </label>
                  <input

                    id="precio"
                    type="number"
                    placeholder="25"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permitir números positivos con hasta 2 decimales
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        handleInput("precio", value);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent ${
                      errors.precio ? "border-red-500" : "border-gray-300"
                    }`}

                  />
                  {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                    <span className="ml-2 text-xs text-gray-500">
                      (= créditos a usar)
                    </span>
                  </label>
                  <input
                    id="stock"
                    type="number"
                    placeholder="1"
                    min="1"
                    step="1"
                    max={creditos || undefined}
                    value={form.stock}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir números enteros positivos
                      if (value === '' || /^\d+$/.test(value)) {
                        handleInput("stock", value);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent ${
                      errors.stock
                        ? "border-red-500 bg-red-50"
                        : form.stock && Number(form.stock) > 0 && Number(form.stock) <= (creditos || 0)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.stock && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.stock}
                    </p>
                  )}
                  {!errors.stock && form.stock && Number(form.stock) > 0 && (
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">✓</span>
                      Se descontarán {form.stock} crédito{Number(form.stock) !== 1 ? 's' : ''}
                      (te quedarán {(creditos || 0) - Number(form.stock)})
                    </p>
                  )}
                  {!form.stock && (
                    <p className="text-gray-500 text-xs mt-1">
                      Tienes {creditos || 0} crédito{(creditos || 0) !== 1 ? 's' : ''} disponible{(creditos || 0) !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div>

                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <div className="relative">
                    <select
                      id="categoria"
                      value={form.categoriaId}
                      onChange={(e) => onSelectCategoria(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent appearance-none bg-white ${
                        errors.categoriaId ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Seleccionar</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.categoriaId && <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="punto" className="block text-sm font-medium text-gray-700 mb-1">
                  Punto de encuentro *
                </label>
                <div className="relative">
                  <select
                    id="punto"
                    value={form.puntoEncuentroId}
                    onChange={(e) => onSelectPunto(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent appearance-none bg-white ${
                      errors.puntoEncuentroId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar</option>
                    {puntos.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.puntoEncuentroId && (
                  <p className="text-red-500 text-sm mt-1">{errors.puntoEncuentroId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <ImageIcon className="h-5 w-5" />
                <span>Imágenes *</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Haz clic aquí para subir imágenes</p>
                    <p className="text-sm text-gray-500 mt-2">Puedes subir múltiples imágenes (máx. 6)</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((src, index) => (
                      <div key={index} className="relative">
                        <img src={src} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          aria-label="Eliminar imagen"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
              </div>
            </div>
          </div>

          {/* Info de costos */}
          <div className={`border rounded-lg shadow-sm ${
            form.stock && Number(form.stock) > (creditos || 0)
              ? "bg-red-50 border-red-300"
              : "bg-blue-50 border-blue-200"
          }`}>
            <div className={`px-6 py-4 border-b ${
              form.stock && Number(form.stock) > (creditos || 0)
                ? "border-red-300"
                : "border-blue-200"
            }`}>
              <h3 className={`flex items-center space-x-2 text-lg font-semibold ${
                form.stock && Number(form.stock) > (creditos || 0)
                  ? "text-red-800"
                  : "text-blue-800"
              }`}>
                <DollarSign className="h-5 w-5" />
                <span>Resumen de Publicación</span>
              </h3>
            </div>
            <div className={`p-6 space-y-2 text-sm ${
              form.stock && Number(form.stock) > (creditos || 0)
                ? "text-red-700"
                : "text-blue-700"
            }`}>
              <div className="flex justify-between items-center font-medium">
                <span>Créditos disponibles:</span>
                <span className="text-lg">{creditos || 0}</span>
              </div>
              {form.stock && Number(form.stock) > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span>Stock a publicar:</span>
                    <span className="text-lg">-{form.stock}</span>
                  </div>
                  <div className="border-t border-current opacity-30 my-2"></div>
                  <div className="flex justify-between items-center font-bold text-base">
                    <span>Te quedarán:</span>
                    <span className={`text-xl ${
                      (creditos || 0) - Number(form.stock) < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}>
                      {(creditos || 0) - Number(form.stock)} crédito{((creditos || 0) - Number(form.stock)) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}
              <div className={`mt-4 pt-4 border-t ${
                form.stock && Number(form.stock) > (creditos || 0)
                  ? "border-red-300"
                  : "border-blue-300"
              }`}>
                <p className="text-xs">
                  <strong>Importante:</strong> Stock = Créditos a descontar. Una vez publicado, no podrás editar este anuncio (solo eliminarlo).
                </p>
              </div>
              {errors.submit && <p className="text-red-600 mt-2">{errors.submit}</p>}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack ? onBack : () => navigate("/catalog")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || (form.stock && Number(form.stock) > (creditos || 0))}
              className="flex-1 px-4 py-2 bg-[#9d0045] text-white rounded-md hover:bg-[#8b003d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Creando..." : "Crear Anuncio"}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Component */}
      <ToastComponent />
    </div>
  );
}

