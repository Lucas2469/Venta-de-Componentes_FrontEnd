// /api/adProduct.ts
export interface CreateAdProductPayload {
  vendedorId: number;
  categoriaId: number;
  puntoEncuentroId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  orden?: number[];
}

export interface CreateAdProductResponse {
  message: string;
  producto: any;
  imagenes: any[];
  creditos_cobrados?: number;
  creditos_restantes?: number;
}

const BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function createAdProduct(
  payload: CreateAdProductPayload,
  files: File[]
): Promise<CreateAdProductResponse> {
  if (!files || files.length === 0) {
    throw new Error("Debes adjuntar al menos una imagen.");
  }
  if (files.length > 6) {
    throw new Error("Máximo 6 imágenes permitidas.");
  }

  const form = new FormData();
  form.append("vendedor_id", String(payload.vendedorId));
  form.append("categoria_id", String(payload.categoriaId));
  form.append("punto_encuentro_id", String(payload.puntoEncuentroId));
  form.append("nombre", payload.nombre);
  form.append("descripcion", payload.descripcion);
  form.append("precio", String(payload.precio));
  form.append("stock", String(payload.stock));
  if (payload.orden && payload.orden.length === files.length) {
    form.append("orden", payload.orden.join(","));
  }

  files.forEach((file) => form.append("images", file, file.name));

  const res = await fetch(`${BASE_URL}/ad-products`, {
    method: "POST",
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message || data.details)) ||
      `Error HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data as CreateAdProductResponse;
}

// --- Métodos auxiliares ---

export async function getCategorias() {
  const res = await fetch(`${BASE_URL}/ad-products/categorias`);
 
  if (!res.ok) throw new Error("Error al obtener categorías");
  return res.json();
}

export async function getPuntosEncuentro() {
  const res = await fetch(`${BASE_URL}/ad-products/puntos-encuentro`);
  
  if (!res.ok) throw new Error("Error al obtener puntos de encuentro");
  return res.json();
}

export async function getCreditosDisponibles(vendedorId: number) {
  const res = await fetch(`${BASE_URL}/ad-products/vendedor/${vendedorId}`);
 
  if (!res.ok) throw new Error("Error al obtener créditos disponibles");
  return res.json();
}