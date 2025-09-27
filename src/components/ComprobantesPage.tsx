import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileImage, Check, X } from "lucide-react";

import {
  getTransacciones,
  aprobarTransaccion,
  rechazarTransaccion,
  buildProofUrl,
  type CreditTx
} from "../api/creditosApi";

import { listPacks, type CreditPack } from "../api/packsApi";

type EstadoFiltro = "all" | "aprobada" | "pendiente" | "rechazada";

export default function ComprobantesPage() {
  const [creditTxs, setCreditTxs] = useState<CreditTx[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  const [q, setQ] = useState("");
  const [estadoFlt, setEstadoFlt] = useState<EstadoFiltro>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [packIdFlt, setPackIdFlt] = useState<string>("all");

  const [proofOpen, setProofOpen] = useState(false);
  const [proofSrc, setProofSrc] = useState<string | null>(null);

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [showPurchaseRejectModal, setShowPurchaseRejectModal] = useState(false);
  const [purchaseRejectionReason, setPurchaseRejectionReason] = useState("");

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

  const handleApprovePurchase = async (id: number) => {
    try {
      setLoadingAction(true);
      await aprobarTransaccion(id);
      await refreshTransactions();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprobantes de Pago</CardTitle>
      </CardHeader>
      <CardContent>

        {/* Toolbar de filtros */}
        <div className="mb-4 grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <Label>Búsqueda</Label>
            <Input
              placeholder="Usuario, paquete, estado, monto o fecha…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div>
            <Label>Estado</Label>
            <Select value={estadoFlt} onValueChange={(v: EstadoFiltro) => setEstadoFlt(v)}>
              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobado</SelectItem>
                <SelectItem value="rechazada">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Paquete</Label>
            <Select value={packIdFlt} onValueChange={setPackIdFlt}>
              <SelectTrigger><SelectValue placeholder="Paquete" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {packs.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Desde</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div>
            <Label>Hasta</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="md:col-span-6">
            <Button variant="outline" onClick={resetFiltros}>Limpiar filtros</Button>
          </div>
        </div>

        <div className="mb-2 text-sm text-muted-foreground">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </div>

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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  No hay resultados con los filtros actuales.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.usuario}</TableCell>
                  <TableCell>{tx.pack_nombre}</TableCell>
                  <TableCell>{formatMonto(tx.monto_pagado)}</TableCell>
                  <TableCell>
                    {tx.comprobante_pago_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProof(tx.comprobante_pago_url)}
                        className="gap-2"
                      >
                        <FileImage className="h-4 w-4" /> Ver
                      </Button>
                    ) : (
                      <span className="text-gray-500 text-sm">Sin comprobante</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={estadoBadgeVariant(tx.estado)}>
                      {estadoLabel(tx.estado)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFecha(tx.fecha_compra)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {tx.estado !== "aprobada" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprovePurchase(tx.id)}
                          disabled={loadingAction}
                          title="Aprobar"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {tx.estado === "pendiente" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectModal(tx.id)}
                          disabled={loadingAction}
                          title="Rechazar"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Modal: Ver comprobante */}
      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2">
            {proofSrc ? (
              <img
                src={proofSrc}
                alt="Comprobante"
                className="max-h-[70vh] w-auto rounded-md border object-contain"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Sin imagen</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProofOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Rechazar con motivo */}
      <Dialog
        open={showPurchaseRejectModal}
        onOpenChange={(open: boolean) => {
          setShowPurchaseRejectModal(open);
          if (!open) {
            setPurchaseRejectionReason("");
            setSelectedPurchaseId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud de Pago</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. Se guardará como comentario del administrador.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="purchase-rejection-reason">Motivo del rechazo</Label>
            <Textarea
              id="purchase-rejection-reason"
              value={purchaseRejectionReason}
              onChange={(e) => setPurchaseRejectionReason(e.target.value)}
              placeholder="Describe el motivo del rechazo…"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseRejectModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={submitRejectPurchase}
              disabled={loadingAction || !purchaseRejectionReason.trim()}
            >
              Rechazar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}