// src/api/packsApi.ts

import axios from "axios";

/** Tipo que devuelve tu backend para un paquete de créditos */
export interface CreditPack {
  id: number;
  nombre: string;
  cantidad_creditos: number | string;
  precio: number | string;
  descripcion?: string | null;
  qr_imagen_url?: string | null;
}

/** Base de la API (usa env si existe, si no localhost) */
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ?? "http://localhost:5000";

export const PACKS_API = `${API_BASE}/api/packs`;

/** Helper para componer URLs absolutas de imágenes/archivos */
export const buildAssetUrl = (rel?: string | null) =>
  rel ? `${API_BASE}${rel.startsWith("/") ? rel : `/${rel}`}` : null;

/* --------- CRUD --------- */

/** GET /api/packs */
export const listPacks = async (): Promise<CreditPack[]> => {
  const { data } = await axios.get(PACKS_API);
  return data;
};

export type CreatePackPayload = {
  nombre: string;
  cantidad_creditos: string | number;
  precio: string | number;
  qr: File;                 
  descripcion?: string;
};

/** POST /api/packs (FormData con 'qr') */
export const createPack = async (payload: CreatePackPayload): Promise<void> => {
  const fd = new FormData();
  fd.append("nombre", payload.nombre);
  fd.append("cantidad_creditos", String(payload.cantidad_creditos));
  fd.append("precio", String(payload.precio));
  fd.append("qr", payload.qr);
  fd.append("descripcion", payload.descripcion ?? "");
  await axios.post(PACKS_API, fd);
};

export type UpdatePackPayload = {
  id: number;
  nombre: string;
  cantidad_creditos: string | number;
  precio: string | number;
  descripcion?: string;
  qr?: File | null;        
};

/** PUT /api/packs/:id (FormData; incluye 'qr' solo si se cambió) */
export const updatePack = async (payload: UpdatePackPayload): Promise<void> => {
  const fd = new FormData();
  fd.append("nombre", payload.nombre);
  fd.append("cantidad_creditos", String(payload.cantidad_creditos));
  fd.append("precio", String(payload.precio));
  fd.append("descripcion", payload.descripcion ?? "");
  if (payload.qr) fd.append("qr", payload.qr);
  await axios.put(`${PACKS_API}/${payload.id}`, fd);
};

/** DELETE /api/packs/:id */
export const deletePack = async (id: number): Promise<void> => {
  await axios.delete(`${PACKS_API}/${id}`);
};
