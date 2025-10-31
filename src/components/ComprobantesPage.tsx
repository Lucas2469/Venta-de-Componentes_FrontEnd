import { useEffect, useMemo, useState } from "react";
import { FileImage, Check, X, Download   } from "lucide-react";

import {
  getTransacciones,
  aprobarTransaccion,
  rechazarTransaccion,
  buildProofUrl,
  type CreditTx
} from "../api/creditosApi";

import { listPacks, type CreditPack } from "../api/packsApi";
import { ConfirmationModal } from './reusables/ConfirmationModal';

type EstadoFiltro = "all" | "aprobada" | "pendiente" | "rechazada";

export default function ComprobantesPage() {
  const [creditTxs, setCreditTxs] = useState<CreditTx[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  const [q, setQ] = useState("");
  const [estadoFlt, setEstadoFlt] = useState<EstadoFiltro>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [packIdFlt, setPackIdFlt] = useState<string>("all");

  const [proofOpen, setProofOpen] = useState(false);
  const [proofSrc, setProofSrc] = useState<string | null>(null);

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [showPurchaseRejectModal, setShowPurchaseRejectModal] = useState(false);
  const [purchaseRejectionReason, setPurchaseRejectionReason] = useState("");

  // Estados para modal de confirmación de aprobación
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApprovalTx, setSelectedApprovalTx] = useState<CreditTx | null>(null);

  useEffect(() => {
    refreshTransactions();
    (async () => {
      try {
        const data = await listPacks();
        setPacks(data);
      } catch (e) {
        console.error("No se pudieron cargar los paquetes", e);
      }
    })();
  }, []);

  const refreshTransactions = async () => {
    try {
      const data = await getTransacciones();
      setCreditTxs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewProof = (relUrl?: string | null) => {
    const full = buildProofUrl(relUrl);
    if (!full) return;
    setProofSrc(full);
    setProofOpen(true);
  };

  const formatMonto = (m: any) =>
    m === null || m === undefined || m === "" ? "—" : `Bs ${Number(m).toFixed(2)}`;

  const formatFecha = (f?: string | null) =>
    f ? new Date(f).toLocaleDateString("es-BO") : "—";

  const estadoBadgeVariant = (estado: CreditTx["estado"]) =>
    estado === "aprobada" ? "default" : estado === "pendiente" ? "secondary" : "destructive";

  const estadoLabel = (estado: CreditTx["estado"]) =>
    estado === "aprobada" ? "Aprobado" : estado === "pendiente" ? "Pendiente" : "Rechazado";

  // Función para abrir modal de confirmación de aprobación
  const openApprovalModal = (tx: CreditTx) => {
    setSelectedApprovalTx(tx);
    setShowApprovalModal(true);
  };

  // Función para cerrar modal de confirmación de aprobación
  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedApprovalTx(null);
  };

  // Función para aprobar después de confirmación
  const handleConfirmApproval = async () => {
    if (!selectedApprovalTx) return;

    try {
      setLoadingAction(true);
      await aprobarTransaccion(selectedApprovalTx.id);
      await refreshTransactions();
      closeApprovalModal();
    } catch (e) {
      console.error(e);
      alert("No se pudo aprobar la transacción.");
    } finally {
      setLoadingAction(false);
    }
  };

  const openRejectModal = (id: number) => {
    setSelectedPurchaseId(id);
    setPurchaseRejectionReason("");
    setShowPurchaseRejectModal(true);
  };

  const submitRejectPurchase = async () => {
    if (!selectedPurchaseId) return;
    if (!purchaseRejectionReason.trim()) {
      alert("Debes indicar el motivo del rechazo.");
      return;
    }
    try {
      setLoadingAction(true);
      await rechazarTransaccion(selectedPurchaseId, purchaseRejectionReason);
      setShowPurchaseRejectModal(false);
      setSelectedPurchaseId(null);
      setPurchaseRejectionReason("");
      await refreshTransactions();
    } catch (e) {
      console.error(e);
      alert("No se pudo rechazar la transacción.");
    } finally {
      setLoadingAction(false);
    }
  };

  // filtros de busqueda
  const filtered = useMemo(() => {
    const norm = (s: any) => (s ?? "").toString().toLowerCase().trim();
    const fromDate = from ? new Date(from + "T00:00:00") : null;
    const toDate   = to   ? new Date(to   + "T23:59:59") : null;

    return creditTxs.filter((tx) => {
      if (estadoFlt !== "all" && tx.estado !== estadoFlt) return false;

      if (packIdFlt !== "all") {
        const idTx = String((tx as any).pack_creditos_id);
        if (idTx !== packIdFlt) return false;
      }
      if (tx.fecha_compra) {
        const d = new Date(tx.fecha_compra);
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
      }
      const needle = norm(q);
      if (!needle) return true;

      const haystack = [
        norm(tx.usuario),
        norm(tx.pack_nombre),
        norm(estadoLabel(tx.estado)),
        norm(formatMonto(tx.monto_pagado)),
        tx.fecha_compra ? new Date(tx.fecha_compra).toLocaleDateString("es-BO").toLowerCase() : ""
      ].join(" ");

      return haystack.includes(needle);
    });
  }, [creditTxs, q, estadoFlt, from, to, packIdFlt]);

  const resetFiltros = () => {
    setQ("");
    setEstadoFlt("all");
    setFrom("");
    setTo("");
    setPackIdFlt("all");
  };
  //Boton descarga
  const handleDownloadProof = async () => {
    if (!proofSrc) return;
    try {
      // Intento "fino": descargar como Blob (funciona si el servidor permite CORS)
      const res = await fetch(proofSrc, { mode: "cors" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename =
        proofSrc.split("/").pop()?.split("?")[0] || "comprobante.jpg";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: abrir en otra pestaña (por si no hay CORS/descarga directa)
      window.open(proofSrc, "_blank", "noopener,noreferrer");
    }
  };


  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Comprobantes de Pago</h3>
      </div>
      <div className="p-4 sm:p-6">

        {/* Toolbar de filtros */}
        <div className="mb-4 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Usuario, paquete, estado, monto o fecha…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={estadoFlt}
              onChange={(e) => setEstadoFlt(e.target.value as EstadoFiltro)}
            >
              <option value="all">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobado</option>
              <option value="rechazada">Rechazado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paquete</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={packIdFlt}
              onChange={(e) => setPackIdFlt(e.target.value)}
            >
              <option value="all">Todos</option>
              {packs.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.nombre} ({p.cantidad_creditos} créditos)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                // Validar si "hasta" es mayor que "desde"
                if (to && e.target.value && e.target.value > to) {
                  setDateError('La fecha "Desde" no puede ser mayor que "Hasta"');
                } else {
                  setDateError('');
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                // Validar si "hasta" es mayor que "desde"
                if (from && e.target.value && from > e.target.value) {
                  setDateError('La fecha "Hasta" debe ser mayor o igual que "Desde"');
                } else {
                  setDateError('');
                }
              }}
            />
            {dateError && (
              <p className="text-red-500 text-xs mt-1">{dateError}</p>
            )}
          </div>

          <div className="sm:col-span-2 md:col-span-3 lg:col-span-6">
            <button
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={resetFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mb-2 text-sm text-gray-600">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </div>

        {/* DESKTOP: Tabla tradicional */}
        <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Usuario</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Paquete</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Monto</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Comprobante</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  No hay resultados con los filtros actuales.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{tx.usuario}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{tx.pack_nombre}</div>
                      <div className="text-xs text-gray-500">{tx.cantidad_creditos} créditos</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{formatMonto(tx.monto_pagado)}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {tx.comprobante_pago_url ? (
                      <button
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 gap-2"
                        onClick={() => handleViewProof(tx.comprobante_pago_url)}
                      >
                        <FileImage className="h-4 w-4" /> Ver
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">Sin comprobante</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tx.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                      tx.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {estadoLabel(tx.estado)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{formatFecha(tx.fecha_compra)}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex gap-1 sm:gap-2">
                      {tx.estado === "pendiente" && (
                        <button
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                          onClick={() => openApprovalModal(tx)}
                          disabled={loadingAction}
                          title="Aprobar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {tx.estado === "pendiente" && (
                        <button
                          className="inline-flex items-center p-2 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                          onClick={() => openRejectModal(tx.id)}
                          disabled={loadingAction}
                          title="Rechazar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>

        {/* MOBILE: Cards Layout */}
        <div className="md:hidden space-y-3 px-4">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay resultados con los filtros actuales.</p>
            </div>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{tx.usuario}</p>
                    <p className="text-xs text-gray-600">{tx.pack_nombre} · {tx.cantidad_creditos} créditos</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    tx.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                    tx.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {estadoLabel(tx.estado)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-200 pt-2">
                  <div>
                    <p className="text-gray-600 font-medium">Monto</p>
                    <p className="font-semibold text-gray-900">{formatMonto(tx.monto_pagado)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Fecha</p>
                    <p className="font-semibold text-gray-900">{formatFecha(tx.fecha_compra)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {tx.comprobante_pago_url && (
                    <button
                      className="flex-1 px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                      onClick={() => handleViewProof(tx.comprobante_pago_url)}
                    >
                      📷 Ver Comprobante
                    </button>
                  )}
                  {tx.estado === "pendiente" && (
                    <>
                      <button
                        className="flex-1 px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700"
                        onClick={() => openApprovalModal(tx)}
                        disabled={loadingAction}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        className="flex-1 px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700"
                        onClick={() => openRejectModal(tx.id)}
                        disabled={loadingAction}
                      >
                        ❌ Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Ver comprobante - Overlay flotante sin fondo negro */}
      {proofOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-2 sm:p-4 max-h-[90vh] overflow-y-auto w-screen">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-lg mx-auto w-[95vw] sm:w-full max-w-[500px]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Comprobante de Pago</h3>
              <button
                onClick={() => setProofOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center">
              {proofSrc ? (
                <img
                  src={proofSrc}
                  alt="Comprobante"
                  className="max-h-[70vh] w-auto rounded-md border object-contain"
                />
              ) : (
                <p className="text-sm text-gray-600">Sin imagen</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {proofSrc && (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={handleDownloadProof}
                  title="Descargar comprobante"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </button>
              )}
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => setProofOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rechazar con motivo - Overlay flotante sin fondo negro */}
      {showPurchaseRejectModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-2 sm:p-4 max-h-[90vh] overflow-y-auto w-screen">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-lg mx-auto w-[95vw] sm:w-full max-w-[500px]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Rechazar Solicitud de Pago</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Indica el motivo del rechazo. Se guardará como comentario del administrador.
                </p>
              </div>
              <button
                onClick={() => setShowPurchaseRejectModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors ml-4 mt-0"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                <label htmlFor="purchase-rejection-reason" className="block text-sm font-medium text-gray-700">
                  Motivo del rechazo
                </label>
                <textarea
                  id="purchase-rejection-reason"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={purchaseRejectionReason}
                  onChange={(e) => setPurchaseRejectionReason(e.target.value)}
                  placeholder="Describe el motivo del rechazo…"
                  rows={4}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => {
                  setShowPurchaseRejectModal(false);
                  setPurchaseRejectionReason("");
                  setSelectedPurchaseId(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                onClick={submitRejectPurchase}
                disabled={loadingAction || !purchaseRejectionReason.trim()}
              >
                Rechazar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para aprobar créditos */}
      <ConfirmationModal
        isOpen={showApprovalModal}
        onClose={closeApprovalModal}
        onConfirm={handleConfirmApproval}
        title="Aprobar Compra de Créditos"
        message={selectedApprovalTx ?
          `¿Estás seguro de que quieres aprobar la compra de ${selectedApprovalTx.cantidad_creditos} créditos por ${formatMonto(selectedApprovalTx.monto_pagado)} del usuario ${selectedApprovalTx.usuario}?

⚠️ IMPORTANTE: Esta acción es irreversible y acreditará los créditos inmediatamente a la cuenta del usuario.

Asegúrate de haber verificado correctamente el comprobante de pago antes de confirmar.`
          : ""
        }
        confirmText="Sí, Aprobar Créditos"
        cancelText="Cancelar"
        type="warning"
        loading={loadingAction}
      />
    </div>
  );
}