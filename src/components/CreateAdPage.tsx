import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createAdProduct,
  getCategorias,
  getPuntosEncuentro,
  getCreditosDisponibles,
} from "../api/AdProduct";
import { Upload, X, FileText, Image as ImageIcon, DollarSign, ChevronDown } from "lucide-react";

const VENDEDOR_ID = 2; // TODO: reemplazar por el id real del usuario logueado (JWT)

type Categoria = { id: number; nombre: string };
type Punto = { id: number; nombre: string };

interface CreateAdPageProps {
  onBack?: () => void; // opcional para evitar errores en rutas
}

export default function CreateAdPage({ onBack }: CreateAdPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
        const [cats, pts, creds] = await Promise.all([
          getCategorias(),           // [{id, nombre}]
          getPuntosEncuentro(),      // [{id, nombre}]
          getCreditosDisponibles(VENDEDOR_ID), // { creditos_disponibles: number }
        ]);

        if (!mounted) return;
        setCategorias(Array.isArray(cats) ? cats : []);
        setPuntos(Array.isArray(pts) ? pts : []);

        const parsedCredits = Number(
          (creds && (creds.creditos_disponibles ?? creds.creditos ?? creds[0]?.creditos_disponibles)) ?? 0
        );
        setCreditos(Number.isFinite(parsedCredits) ? parsedCredits : 0);
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
  }, []);

  // Redirigir a compra de créditos si no alcanza (evitar bucle si ya estás ahí)
  useEffect(() => {
    if (loading) return;
    if (location.pathname === "/buy-credits") return;
    if (redirectedRef.current) return;

    if ((creditos ?? 0) < 1) {
      redirectedRef.current = true;
      navigate("/buy-credits");
    }
  }, [loading, creditos, location.pathname, navigate]);

  const handleInput = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
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
      if (!form.precio || Number(form.precio) <= 0) errs.precio = "El precio debe ser mayor a 0";
      if (!form.stock || Number(form.stock) <= 0) errs.stock = "La cantidad debe ser mayor a 0";
      if (!form.categoriaId) errs.categoriaId = "Selecciona una categoría";
      if (!form.puntoEncuentroId) errs.puntoEncuentroId = "Selecciona un punto de encuentro";
      if (imageFiles.length === 0) errs.images = "Debes subir al menos una imagen";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };
  }, [form, imageFiles.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await createAdProduct(
        {
          vendedorId: VENDEDOR_ID,
          categoriaId: Number(form.categoriaId),
          puntoEncuentroId: Number(form.puntoEncuentroId),
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          stock: Number(form.stock),
        },
        imageFiles
      );

      alert(res.message || "Producto creado con éxito.");
      // Vuelve al catálogo (si pasó onBack lo usamos, sino navegamos)
      if (onBack) onBack();
      else navigate("/catalog");
    } catch (err: any) {
      console.error(err);
      setErrors((p) => ({ ...p, submit: err?.message || "Error al crear el anuncio" }));
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
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Créditos: {creditos}
          </span>
          <span className="text-sm text-red-600">
            ⚠️ Una vez publicado, no podrás editar este producto. Solo podrás eliminarlo.
          </span>
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
                    value={form.precio}
                    onChange={(e) => handleInput("precio", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent ${
                      errors.precio ? "border-red-500" : "border-gray-300"
                    }`}

                  />
                  {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
                </div>

                <div>

                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    id="stock"
                    type="number"
                    placeholder="1"
                    value={form.stock}
                    onChange={(e) => handleInput("stock", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9d0045] focus:border-transparent ${
                      errors.stock ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-yellow-200">
              <h3 className="flex items-center space-x-2 text-lg font-semibold text-yellow-800">
                <DollarSign className="h-5 w-5" />
                <span>Información de Costos</span>
              </h3>
            </div>
            <div className="p-6 text-sm text-yellow-700">
              <p>• Al publicar se descuentan créditos iguales al <strong>stock</strong> (p. ej. stock 5 ⇒ 5 créditos).</p>
              <p>• El anuncio queda activo; no es editable. Puedes eliminarlo.</p>
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
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-[#9d0045] text-white rounded-md hover:bg-[#8b003d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Creando..." : "Crear Anuncio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
