import { useState, useEffect, useRef } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "./ui/dialog";
import { Eye, Edit, Trash2, Plus, X, Check, Upload, Package } from "lucide-react";

import {
  listPacks, createPack, updatePack, deletePack, buildAssetUrl, type CreditPack,
} from "../api/packsApi";

const MAX_IMG_MB = 5;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

export default function CreditPackagesPage() {
  const [creditPackages, setCreditPackages] = useState<CreditPack[]>([]);
  const [showQr, setShowQr] = useState<string | null>(null);

  const [newCreditPack, setNewCreditPack] = useState<{
    nombre: string;
    cantidad_creditos: string | number;
    precio: string | number;
    qr: File | null;
    descripcion: string;
  }>({
    nombre: "",
    cantidad_creditos: "",
    precio: "",
    qr: null,
    descripcion: "",
  });

  const [isSavingNew, setIsSavingNew] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editPack, setEditPack] = useState<any>({
    id: null,
    nombre: "",
    cantidad_creditos: "",
    precio: "",
    qr: null as File | null,
    qr_imagen_url: "",
    descripcion: "",
  });
  const fileEditRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listPacks().then(setCreditPackages).catch(console.error);
  }, []);

  const isPositiveInteger = (v: any) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0;
  };

  const validateFile = (file: File | null) => {
    if (!file) return null;
    if (!ALLOWED_MIME.includes(file.type)) return "Formato de archivo no permitido (usa JPG/PNG/WEBP).";
    if (file.size > MAX_IMG_MB * 1024 * 1024) return `El archivo supera ${MAX_IMG_MB}MB.`;
    return null;
  };

  const validateNew = () => {
    if (!newCreditPack.nombre.trim()) return "El nombre es obligatorio.";
    if (!isPositiveInteger(newCreditPack.cantidad_creditos)) return "Los créditos deben ser un número entero positivo.";
    if (Number(newCreditPack.precio) <= 0) return "El precio debe ser mayor a 0.";
    if (!newCreditPack.qr) return "El código QR es obligatorio.";
    const fileErr = validateFile(newCreditPack.qr);
    if (fileErr) return fileErr;
    if (String(newCreditPack.nombre).length > 80) return "El nombre no debe superar 80 caracteres.";
    if (String(newCreditPack.descripcion || "").length > 300) return "La descripción no debe superar 300 caracteres.";
    return null;
  };

  const validateEdit = () => {
    if (!editPack.nombre.trim()) return "El nombre es obligatorio";
    if (!isPositiveInteger(editPack.cantidad_creditos)) return "Los créditos deben ser un número entero positivo";
    if (Number(editPack.precio) <= 0) return "El precio debe ser mayor a 0";
    if (String(editPack.nombre).length > 100) return "El nombre no debe superar 100 caracteres.";
    if (String(editPack.descripcion || "").length > 500) return "La descripción no debe superar 500 caracteres.";
    if (editPack.qr) {
      const fileErr = validateFile(editPack.qr);
      if (fileErr) return fileErr;
    }
    return null;
  };

  const handleCreditPackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNew();
    if (err) return alert(err);

    try {
      setIsSavingNew(true);
      await createPack({
        nombre: newCreditPack.nombre.trim(),
        cantidad_creditos: newCreditPack.cantidad_creditos,
        precio: newCreditPack.precio,
        qr: newCreditPack.qr as File,
        descripcion: newCreditPack.descripcion?.trim(),
      });
      setNewCreditPack({ nombre: "", cantidad_creditos: "", precio: "", qr: null, descripcion: "" });
      setCreditPackages(await listPacks());
    } catch (error: any) {
      console.error("Error al crear paquete", error);
      alert(error?.response?.data?.error || "Error al crear paquete");
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleCreditPackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "qr") {
      const file = files?.[0] || null;
      const fileErr = validateFile(file);
      if (file && fileErr) {
        alert(fileErr);
        return;
      }
      setNewCreditPack(prev => ({ ...prev, qr: file }));
      return;
    }
    setNewCreditPack(prev => ({ ...prev, [name]: value }));
  };

  const openEditModal = (pack: CreditPack) => {
    setEditPack({
      id: pack.id,
      nombre: pack.nombre,
      cantidad_creditos: String(pack.cantidad_creditos),
      precio: String(pack.precio),
      qr: null,
      qr_imagen_url: pack.qr_imagen_url,
      descripcion: pack.descripcion ?? "",
    });
    setEditOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "qr") {
      const file = files?.[0] || null;
      const fileErr = validateFile(file);
      if (file && fileErr) {
        alert(fileErr);
        return;
      }
      setEditPack((p: any) => ({ ...p, qr: file }));
      return;
    }
    setEditPack((p: any) => ({ ...p, [name]: value }));
  };

  const saveEdit = async () => {
    const err = validateEdit();
    if (err) return alert(err);
    try {
      setSavingEdit(true);
      await updatePack({
        id: editPack.id,
        nombre: editPack.nombre.trim(),
        cantidad_creditos: editPack.cantidad_creditos,
        precio: editPack.precio,
        descripcion: editPack.descripcion?.trim(),
        qr: editPack.qr,
      });
      setCreditPackages(await listPacks());
      setEditOpen(false);
    } catch (error: any) {
      console.error("Error al actualizar paquete", error);
      alert(error?.response?.data?.error || "Error al actualizar paquete");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePack = async (id: number) => {
    if (!confirm("¿Eliminar paquete?")) return;
    try {
      await deletePack(id);
      setCreditPackages(await listPacks());
    } catch (error: any) {
      console.error("Error al eliminar paquete", error);
      alert(error?.response?.data?.error || "Error al eliminar paquete");
    }
  };

  return (
    <div className="space-y-6">
      {/* Crear */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Paquete de Créditos</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreditPackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del paquete</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={newCreditPack.nombre}
                  maxLength={100}
                  onChange={handleCreditPackChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cantidad_creditos">Créditos</Label>
                <Input
                  id="cantidad_creditos"
                  name="cantidad_creditos"
                  type="number"
                  min="1"
                  step="1"
                  value={newCreditPack.cantidad_creditos}
                  onChange={handleCreditPackChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="precio">Precio (Bs)</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newCreditPack.precio}
                  onChange={handleCreditPackChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  type="text"
                  value={newCreditPack.descripcion}
                  maxLength={500}
                  onChange={handleCreditPackChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="qr">Subir QR de pago</Label>
              <Input
                id="qr"
                name="qr"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCreditPackChange}
                required
              />
              {newCreditPack.qr && (
                <p className="text-sm text-green-600 mt-1">
                  Archivo seleccionado: {newCreditPack.qr.name}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Formatos permitidos: PNG, JPG/JPEG, WEBP. Tamaño máx: {MAX_IMG_MB}MB.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setNewCreditPack({
                    nombre: "",
                    cantidad_creditos: "",
                    precio: "",
                    qr: null,
                    descripcion: "",
                  })
                }
                disabled={isSavingNew}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSavingNew ||
                  !newCreditPack.nombre ||
                  !newCreditPack.cantidad_creditos ||
                  !newCreditPack.precio ||
                  !newCreditPack.qr
                }
              >
                {isSavingNew ? "Guardando..." : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Paquete
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Paquetes de Créditos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {creditPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay paquetes de créditos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Precio (Bs)</TableHead>
                  <TableHead>QR de Pago</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditPackages.map((pack) => (
                  <TableRow key={pack.id}>
                    <TableCell className="font-medium">{pack.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pack.cantidad_creditos} créditos</Badge>
                    </TableCell>
                    <TableCell>
                      Bs {Number(pack.precio).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {pack.qr_imagen_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowQr(pack.qr_imagen_url!)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver QR
                        </Button>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin QR</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => openEditModal(pack)}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePack(pack.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal QR */}
      <Dialog open={!!showQr} onOpenChange={(open: boolean) => { 
            if (!open) setShowQr(null); 
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR del Paquete</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {showQr && (
              <img
                src={buildAssetUrl(showQr) ?? ""}
                alt="Código QR de pago"
                className="max-w-full h-auto max-h-64 object-contain border rounded-lg"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQr(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Paquete de Créditos</DialogTitle>
            <DialogDescription>
              Actualiza los datos del paquete. El QR es opcional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                name="nombre"
                value={editPack.nombre}
                maxLength={100}
                onChange={handleEditChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-creditos">Créditos</Label>
              <Input
                id="edit-creditos"
                name="cantidad_creditos"
                type="number"
                min={1}
                step={1}
                value={editPack.cantidad_creditos}
                onChange={handleEditChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-precio">Precio (Bs)</Label>
              <Input
                id="edit-precio"
                name="precio"
                type="number"
                min={0.01}
                step={0.01}
                value={editPack.precio}
                onChange={handleEditChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-descripcion">Descripción (opcional)</Label>
              <Input
                id="edit-descripcion"
                name="descripcion"
                value={editPack.descripcion}
                maxLength={500}
                onChange={handleEditChange}
              />
            </div>

            <div className="grid gap-2">
              <Label>Código QR</Label>
              <div className="flex items-center gap-4">
                {editPack.qr ? (
                  <img
                    src={URL.createObjectURL(editPack.qr)}
                    alt="QR nuevo"
                    className="h-24 w-24 object-contain rounded border"
                  />
                ) : editPack.qr_imagen_url ? (
                  <img
                    src={buildAssetUrl(editPack.qr_imagen_url) ?? ""}
                    alt="QR actual"
                    className="h-24 w-24 object-contain rounded border"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Sin QR</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <input
              ref={fileEditRef}
              type="file"
              name="qr"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleEditChange}
              className="sr-only"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileEditRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Seleccionar archivo
            </Button>
            {editPack.qr && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditPack((p: any) => ({ ...p, qr: null }))}
              >
                Quitar archivo
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit}>
              <Check className="h-4 w-4 mr-2" />
              {savingEdit ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
