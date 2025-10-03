import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createAdProduct,
  getCategorias,
  getPuntosEncuentro,
  getCreditosDisponibles,
} from "../api/AdProduct";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Upload, X, FileText, Image as ImageIcon, DollarSign } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "#9d0045" }}>
            Crear Nuevo Anuncio
          </h1>
          <Button variant="outline" onClick={onBack ? onBack : () => navigate("/catalog")}>
            Volver al Catálogo
          </Button>
        </div>

        {/* Aviso de créditos + política */}
        <div className="mb-4 flex items-center gap-3">
          <Badge variant="secondary">Créditos: {creditos}</Badge>
          <span className="text-sm text-red-600">
            ⚠️ Una vez publicado, no podrás editar este producto. Solo podrás eliminarlo.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nombre">Título del Anuncio *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Arduino UNO R3 Original con Cable USB"
                  value={form.nombre}
                  onChange={(e) => handleInput("nombre", e.target.value)}
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe tu componente: estado, especificaciones, compatibilidad..."
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => handleInput("descripcion", e.target.value)}
                  className={errors.descripcion ? "border-red-500" : ""}
                />
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="precio">Precio (Bs) *</Label>
                  <Input
                    id="precio"
                    type="number"
                    placeholder="25"
                    value={form.precio}
                    onChange={(e) => handleInput("precio", e.target.value)}
                    className={errors.precio ? "border-red-500" : ""}
                  />
                  {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
                </div>

                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="1"
                    value={form.stock}
                    onChange={(e) => handleInput("stock", e.target.value)}
                    className={errors.stock ? "border-red-500" : ""}
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select value={form.categoriaId} onValueChange={onSelectCategoria}>
                    <SelectTrigger className={errors.categoriaId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoriaId && <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="punto">Punto de encuentro *</Label>
                <Select value={form.puntoEncuentroId} onValueChange={onSelectPunto}>
                  <SelectTrigger className={errors.puntoEncuentroId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {puntos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.puntoEncuentroId && (
                  <p className="text-red-500 text-sm mt-1">{errors.puntoEncuentroId}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Imágenes *</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
            </CardContent>
          </Card>

          {/* Info de costos */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <DollarSign className="h-5 w-5" />
                <span>Información de Costos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700">
              <p>• Al publicar se descuentan créditos iguales al <strong>stock</strong> (p. ej. stock 5 ⇒ 5 créditos).</p>
              <p>• El anuncio queda activo; no es editable. Puedes eliminarlo.</p>
              {errors.submit && <p className="text-red-600 mt-2">{errors.submit}</p>}
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onBack ? onBack : () => navigate("/catalog")} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={submitting}
              style={{ backgroundColor: "#9d0045", color: "#ffffff" }}
            >
              {submitting ? "Creando..." : "Crear Anuncio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
