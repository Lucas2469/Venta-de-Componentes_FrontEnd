import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "./ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { FileImage, Check, X } from "lucide-react";

import {
  getTransacciones,
  aprobarTransaccion,
  rechazarTransaccion,
  buildProofUrl,
  type CreditTx
} from "../api/creditosApi";

export default function ComprobantesPage() {
  const [creditTxs, setCreditTxs] = useState<CreditTx[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  // Ver comprobante
  const [proofOpen, setProofOpen] = useState(false);
  const [proofSrc, setProofSrc] = useState<string | null>(null);

  // Rechazo
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [showPurchaseRejectModal, setShowPurchaseRejectModal] = useState(false);
  const [purchaseRejectionReason, setPurchaseRejectionReason] = useState("");

  // Carga inicial
  useEffect(() => {
    refreshTransactions();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprobantes de Pago</CardTitle>
      </CardHeader>
      <CardContent>
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
            {creditTxs.map((tx) => (
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
            ))}
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
