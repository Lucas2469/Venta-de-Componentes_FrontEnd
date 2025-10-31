import { useState, useEffect, useRef } from "react";
import { Eye, Edit, Trash2, Plus, X, Check, Upload, Package } from "lucide-react";

import {
  listPacks, createPack, updatePack, deletePack, buildAssetUrl, type CreditPack,
} from "../api/packsApi";
import { useToast } from "./Toast";
import { ConfirmationModal } from "./reusables/ConfirmationModal";

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

  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packToDelete, setPackToDelete] = useState<CreditPack | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hook de toast
  const { showToast, ToastComponent } = useToast();

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
    if (err) {
      showToast('warning', 'Validación', err);
      return;
    }

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
      showToast('success', '¡Paquete creado!', 'El paquete de créditos se creó exitosamente');
    } catch (error: any) {
      console.error("Error al crear paquete", error);
      showToast('error', 'Error al crear', error?.response?.data?.error || 'No se pudo crear el paquete');
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
        showToast('warning', 'Archivo inválido', fileErr);
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
        showToast('warning', 'Archivo inválido', fileErr);
        return;
      }
      setEditPack((p: any) => ({ ...p, qr: file }));
      return;
    }
    setEditPack((p: any) => ({ ...p, [name]: value }));
  };

  const saveEdit = async () => {
    const err = validateEdit();
    if (err) {
      showToast('warning', 'Validación', err);
      return;
    }
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
      showToast('success', '¡Paquete actualizado!', 'Los cambios se guardaron exitosamente');
    } catch (error: any) {
      console.error("Error al actualizar paquete", error);
      showToast('error', 'Error al actualizar', error?.response?.data?.error || 'No se pudo actualizar el paquete');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePack = (pack: CreditPack) => {
    setPackToDelete(pack);
    setShowDeleteModal(true);
  };

  const confirmDeletePack = async () => {
    if (!packToDelete) return;

    try {
      setIsDeleting(true);
      await deletePack(packToDelete.id);
      setCreditPackages(await listPacks());
      setShowDeleteModal(false);
      setPackToDelete(null);
      showToast('success', 'Paquete eliminado', 'El paquete se eliminó exitosamente');
    } catch (error: any) {
      console.error("Error al eliminar paquete", error);
      showToast('error', 'Error al eliminar', error?.response?.data?.error || 'No se pudo eliminar el paquete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Crear */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Crear Paquete de Créditos</h3>
        </div>
        <div className="p-4 sm:p-6">
          <form onSubmit={handleCreditPackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre del paquete</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCreditPack.nombre}
                  maxLength={100}
                  onChange={handleCreditPackChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="cantidad_creditos" className="block text-sm font-medium text-gray-700 mb-1">Créditos</label>
                <input
                  id="cantidad_creditos"
                  name="cantidad_creditos"
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCreditPack.cantidad_creditos}
                  onChange={handleCreditPackChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio (Bs)</label>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCreditPack.precio}
                  onChange={handleCreditPackChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  id="descripcion"
                  name="descripcion"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCreditPack.descripcion}
                  maxLength={500}
                  onChange={handleCreditPackChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="qr" className="block text-sm font-medium text-gray-700 mb-1">Subir QR de pago</label>
              <input
                id="qr"
                name="qr"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleCreditPackChange}
                required
              />
              {newCreditPack.qr && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Archivo seleccionado: {newCreditPack.qr.name}
                  </p>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={URL.createObjectURL(newCreditPack.qr)}
                      alt="Vista previa del QR"
                      className="h-32 w-32 object-contain rounded-lg border border-gray-300 bg-white"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Vista previa del código QR</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Verifica que el código QR sea correcto antes de crear el paquete
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-1">
                Formatos permitidos: PNG, JPG/JPEG, WEBP. Tamaño máx: {MAX_IMG_MB}MB.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Paquetes de Créditos Disponibles</h3>
        </div>
        <div className="p-4 sm:p-6">
          {creditPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay paquetes de créditos registrados</p>
            </div>
          ) : (
            <>
            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nombre</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Créditos</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Precio (Bs)</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">QR de Pago</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditPackages.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{pack.nombre}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {pack.cantidad_creditos}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        Bs {Number(pack.precio).toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {pack.qr_imagen_url ? (
                          <button
                            className="inline-flex items-center px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 gap-1"
                            onClick={() => setShowQr(pack.qr_imagen_url!)}
                          >
                            <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
                            Ver
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">Sin QR</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            className="inline-flex items-center px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 gap-1"
                            onClick={() => openEditModal(pack)}
                          >
                            <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            className="inline-flex items-center px-2 sm:px-3 py-1 border border-red-300 rounded-md text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            onClick={() => handleDeletePack(pack)}
                          >
                            <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-3 px-2">
              {creditPackages.map((pack) => (
                <div key={pack.id} className="bg-white rounded-lg shadow border border-gray-200 p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{pack.nombre}</p>
                      <p className="text-xs text-gray-600">{pack.cantidad_creditos} créditos · Bs {Number(pack.precio).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {pack.qr_imagen_url && (
                      <button onClick={() => setShowQr(pack.qr_imagen_url!)} className="flex-1 px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100">📷 QR</button>
                    )}
                    <button onClick={() => openEditModal(pack)} className="flex-1 px-2 py-1 text-xs font-bold text-purple-600 bg-purple-50 rounded hover:bg-purple-100">✏️ Editar</button>
                    <button onClick={() => handleDeletePack(pack)} className="flex-1 px-2 py-1 text-xs font-bold text-red-600 bg-red-50 rounded hover:bg-red-100">🗑️ Borrar</button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay QR flotante (sin fondo negro) */}
      {showQr && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-lg w-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">QR del Paquete</h3>
              <button
                onClick={() => setShowQr(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <img
                src={buildAssetUrl(showQr) ?? ""}
                alt="Código QR de pago"
                className="max-w-full h-auto max-h-96 w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar - Overlay flotante sin fondo negro */}
      {editOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-2 sm:p-4 max-h-[95vh] overflow-y-auto w-screen">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 mx-auto w-[95vw] sm:w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Editar Paquete de Créditos</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Actualiza los datos del paquete. El QR es opcional.
                </p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors ml-4"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="space-y-2">
                <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="edit-nombre"
                  name="nombre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editPack.nombre}
                  maxLength={100}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-creditos" className="block text-sm font-medium text-gray-700">Créditos</label>
                <input
                  id="edit-creditos"
                  name="cantidad_creditos"
                  type="number"
                  min={1}
                  step={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editPack.cantidad_creditos}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-precio" className="block text-sm font-medium text-gray-700">Precio (Bs)</label>
                <input
                  id="edit-precio"
                  name="precio"
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editPack.precio}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-descripcion" className="block text-sm font-medium text-gray-700">Descripción (opcional)</label>
                <input
                  id="edit-descripcion"
                  name="descripcion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editPack.descripcion}
                  maxLength={500}
                  onChange={handleEditChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Código QR</label>
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
                    <span className="text-sm text-gray-600">Sin QR</span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end gap-2">
              <input
                ref={fileEditRef}
                type="file"
                name="qr"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleEditChange}
                className="sr-only"
              />
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 gap-2"
                onClick={() => fileEditRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Seleccionar archivo
              </button>
              {editPack.qr && (
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setEditPack((p: any) => ({ ...p, qr: null }))}
                >
                  Quitar archivo
                </button>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => setEditOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                onClick={saveEdit}
                disabled={savingEdit}
              >
                <Check className="h-4 w-4 mr-2" />
                {savingEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPackToDelete(null);
        }}
        onConfirm={confirmDeletePack}
        title="Eliminar Paquete de Créditos"
        message={`¿Estás seguro de que deseas eliminar el paquete "${packToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={isDeleting}
      />

      {/* Toast de notificaciones */}
      <ToastComponent />
    </div>
  );
}