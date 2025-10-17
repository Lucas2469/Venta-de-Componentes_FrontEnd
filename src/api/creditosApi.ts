const API_BASE = "http://localhost:5000";
const CREDIT_API = `${API_BASE}/api/creditos`;

export type CreditTx = {
  id: number;
  usuario: string;
  pack_nombre: string;
  cantidad_creditos: number;
  monto_pagado?: number | null;
  comprobante_pago_url?: string | null;
  estado: "pendiente" | "aprobada" | "rechazada";
  fecha_compra?: string | null;
};

export const getTransacciones = async (): Promise<CreditTx[]> => {
  const res = await fetch(`${CREDIT_API}/transacciones`);
  if (!res.ok) throw new Error("Error al cargar transacciones");
  return res.json();
};

export const aprobarTransaccion = async (id: number) => {
  const res = await fetch(`${CREDIT_API}/transacciones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accion: "aprobar",
      comentarios_admin: "",
      admin_revisor_id: 1 // ID del admin en la base de datos
    }),
  });
  if (!res.ok) throw new Error("No se pudo aprobar la transacción");
};

export const rechazarTransaccion = async (id: number, motivo: string) => {
  const res = await fetch(`${CREDIT_API}/transacciones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accion: "rechazar",
      comentarios_admin: motivo,
      admin_revisor_id: 1 // ID del admin en la base de datos
    }),
  });
  if (!res.ok) throw new Error("No se pudo rechazar la transacción");
};

export const buildProofUrl = (relUrl?: string | null) => {
  if (!relUrl) return null;
  return `${API_BASE}${relUrl.startsWith("/") ? relUrl : `/${relUrl}`}`;
};
