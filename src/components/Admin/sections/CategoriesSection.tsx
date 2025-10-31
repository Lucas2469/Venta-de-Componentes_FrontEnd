import React, { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { categoriesAPI } from '../../../api/categoriesApi';
import { Category } from "../../types";
import { mockProducts } from "../../mockData";
import { ConfirmationModal } from '../../reusables/ConfirmationModal';
import { showToast as globalShowToast } from '../../Toast';

interface CategoriesSectionProps {
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export function CategoriesSection({ onShowToast }: CategoriesSectionProps) {
  // Usar prop si está disponible, sino usar la función global
  const showToast = onShowToast || globalShowToast;
  const [categories, setCategories] = useState<Category[]>([]);
  const [products] = useState(mockProducts);
  const [newCategory, setNewCategory] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo"
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState<string | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState<Category | null>(null);
  const [categoryErrors, setCategoryErrors] = useState({
    nombre: "",
    descripcion: ""
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const validateCategoryName = (nombre: string): string => {
    if (!nombre.trim()) {
      return "El nombre es obligatorio";
    }
    if (nombre.length > 20) {
      return "El nombre no puede exceder 20 caracteres";
    }
    const specialCharsRegex = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~`]/;
    if (specialCharsRegex.test(nombre)) {
      return "El nombre no puede contener símbolos especiales";
    }
    return "";
  };

  const validateCategoryDescription = (descripcion: string): string => {
    if (descripcion.length > 70) {
      return "La descripción no puede exceder 70 caracteres";
    }
    return "";
  };

  const validateCategoryForm = (categoryData: { nombre: string; descripcion?: string }): boolean => {
    const nombreError = validateCategoryName(categoryData.nombre);
    const descripcionError = validateCategoryDescription(categoryData.descripcion || '');
    
    setCategoryErrors({
      nombre: nombreError,
      descripcion: descripcionError
    });
    
    return !nombreError && !descripcionError;
  };

  const loadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const categoriesData = await categoriesAPI.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!validateCategoryForm(newCategory)) {
      return;
    }

    try {
      setIsCategoriesLoading(true);
      await categoriesAPI.create(newCategory);
      await loadCategories();
      setNewCategory({ nombre: "", descripcion: "", estado: "activo" });
      setCategoryErrors({ nombre: "", descripcion: "" });
      setShowCategoryDialog(false);
    } catch (error) {
      console.error("Error al crear categoría:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    if (!validateCategoryForm(editingCategory)) {
      return;
    }
    
    try {
      setIsCategoriesLoading(true);
      await categoriesAPI.update(editingCategory.id, {
        nombre: editingCategory.nombre,
        descripcion: editingCategory.descripcion,
        estado: editingCategory.estado
      });
      await loadCategories();
      setEditingCategory(null);
      setCategoryErrors({ nombre: "", descripcion: "" });
      setShowCategoryDialog(false);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setCategoryActionLoading(categoryToDelete);
      await categoriesAPI.delete(categoryToDelete);

      // ✅ Éxito: Mostrar toast
      showToast('success', 'Categoría eliminada', 'La categoría ha sido eliminada correctamente');

      await loadCategories();
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error("Error al eliminar categoría:", error);

      // ✅ Manejar errores específicos con toast
      const errorMessage = error?.message || 'Error al eliminar la categoría';

      if (errorMessage.includes('productos asociados') || errorMessage.includes('foreign key')) {
        // Error por dependencias (foreign key constraint)
        showToast(
          'error',
          'No se puede eliminar esta categoría',
          'Hay productos asociados. Primero elimina o reasigna los productos a otra categoría.'
        );
      } else if (errorMessage.includes('No se pudo eliminar')) {
        showToast('error', 'Error al eliminar', errorMessage);
      } else {
        showToast(
          'error',
          'Error al eliminar categoría',
          errorMessage.length > 100 ? 'Ocurrió un error. Intenta de nuevo.' : errorMessage
        );
      }
    } finally {
      setCategoryActionLoading(null);
    }
  };

  const handleToggleCategoryStatus = async () => {
    if (!categoryToToggle) return;

    try {
      setCategoryActionLoading(categoryToToggle.id);
      await categoriesAPI.toggleStatus(categoryToToggle.id);
      await loadCategories();
      setShowStatusConfirm(false);
      setCategoryToToggle(null);
    } catch (error) {
      console.error("Error al cambiar estado de categoría:", error);
    } finally {
      setCategoryActionLoading(null);
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryErrors({ nombre: "", descripcion: "" });
    setShowCategoryDialog(true);
  };

  const openCreateCategoryDialog = () => {
    setEditingCategory(null);
    setNewCategory({ nombre: "", descripcion: "", estado: "activo" });
    setCategoryErrors({ nombre: "", descripcion: "" });
    setShowCategoryDialog(true);
  };

  const openDeleteCategoryConfirm = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteConfirm(true);
  };

  const openStatusToggleConfirm = (category: Category) => {
    setCategoryToToggle(category);
    setShowStatusConfirm(true);
  };

  return (
    <div className="space-y-6">
      {/* Categories Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
          <button
            onClick={openCreateCategoryDialog}
            disabled={isCategoriesLoading}
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isCategoriesLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Agregar Categoría
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4">
          {isCategoriesLoading && categories.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Nombre
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Descripción
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Productos
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {category.nombre}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                        {category.descripcion}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.estado === "activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {typeof category.product_count === 'number' ? category.product_count : (products?.filter(p => p.category === category.id).length || 0)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex space-x-1 sm:space-x-2">
                          <button
                            onClick={() => openStatusToggleConfirm(category)}
                            disabled={categoryActionLoading === category.id}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {categoryActionLoading === category.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : category.estado === "activo" ? (
                              <ToggleLeft className="h-4 w-4" />
                            ) : (
                              <ToggleRight className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditCategoryDialog(category)}
                            disabled={isCategoriesLoading}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteCategoryConfirm(category.id)}
                            disabled={isCategoriesLoading}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE: Card layout */}
            <div className="md:hidden space-y-3 px-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3">
                    {/* Header with name and status badge */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{category.nombre}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{category.descripcion || '-'}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          category.estado === "activo"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    {/* Product count */}
                    <div className="text-xs border-t border-gray-200 pt-2">
                      <p className="text-gray-600 font-medium mb-1">Productos</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {typeof category.product_count === 'number' ? category.product_count : (products?.filter(p => p.category === category.id).length || 0)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => openStatusToggleConfirm(category)}
                        disabled={categoryActionLoading === category.id}
                        className="flex-1 min-w-[80px] px-2 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1"
                      >
                        {categoryActionLoading === category.id ? (
                          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                        ) : category.estado === "activo" ? (
                          <>
                            <ToggleLeft className="h-4 w-4 flex-shrink-0" />
                            <span>Desact</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 flex-shrink-0" />
                            <span>Activ</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openEditCategoryDialog(category)}
                        disabled={isCategoriesLoading}
                        className="flex-1 min-w-[80px] px-2 py-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1"
                      >
                        <Edit className="h-4 w-4 flex-shrink-0" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => openDeleteCategoryConfirm(category.id)}
                        disabled={isCategoriesLoading}
                        className="flex-1 min-w-[80px] px-2 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                        <span>Borrar</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No hay categorías disponibles</p>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog - Overlay flotante sin fondo negro */}
      {showCategoryDialog && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-2 sm:p-4 max-h-[95vh] overflow-y-auto w-screen">
          <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200 mx-auto w-[95vw] sm:w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <button
                onClick={() => setShowCategoryDialog(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  id="category-name"
                  type="text"
                  placeholder="Nombre de la categoría"
                  value={editingCategory ? editingCategory.nombre : newCategory.nombre}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 20) {
                      return;
                    }
                    if (editingCategory) {
                      setEditingCategory({...editingCategory, nombre: value});
                    } else {
                      setNewCategory({...newCategory, nombre: value});
                    }
                    const error = validateCategoryName(value);
                    setCategoryErrors(prev => ({ ...prev, nombre: error }));
                  }}
                  disabled={isCategoriesLoading}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                    categoryErrors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-red-500">{categoryErrors.nombre}</span>
                  <span className="text-xs text-gray-500">
                    {(editingCategory ? editingCategory.nombre : newCategory.nombre || '').length}/20
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="category-description"
                  placeholder="Descripción de la categoría"
                  rows={3}
                  value={editingCategory ? editingCategory.descripcion : newCategory.descripcion}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 70) {
                      return;
                    }
                    if (editingCategory) {
                      setEditingCategory({...editingCategory, descripcion: value});
                    } else {
                      setNewCategory({...newCategory, descripcion: value});
                    }
                    const error = validateCategoryDescription(value);
                    setCategoryErrors(prev => ({ ...prev, descripcion: error }));
                  }}
                  disabled={isCategoriesLoading}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 resize-none ${
                    categoryErrors.descripcion ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-red-500">{categoryErrors.descripcion}</span>
                  <span className="text-xs text-gray-500">
                    {(editingCategory ? editingCategory.descripcion || '' : newCategory.descripcion || '').length}/70
                  </span>
                </div>
              </div>

            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowCategoryDialog(false)}
                disabled={isCategoriesLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                disabled={
                  isCategoriesLoading ||
                  (!editingCategory && !newCategory.nombre?.trim()) ||
                  (!!editingCategory && !editingCategory.nombre?.trim()) ||
                  categoryErrors.nombre !== "" ||
                  categoryErrors.descripcion !== ""
                }
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCategoriesLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingCategory ? "Actualizar" : "Crear"} Categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={handleToggleCategoryStatus}
        title="¿Confirmar cambio de estado?"
        message={
          categoryToToggle
            ? `¿Estás seguro de ${categoryToToggle.estado === "activo" ? "desactivar" : "activar"} la categoría "${categoryToToggle.nombre}"?${
                categoryToToggle.estado === "activo"
                  ? "\n\nLos productos de esta categoría podrían verse afectados."
                  : ""
              }`
            : ""
        }
        confirmText={categoryToToggle?.estado === "activo" ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        type={categoryToToggle?.estado === "activo" ? "warning" : "success"}
        loading={categoryActionLoading === categoryToToggle?.id}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCategory}
        title="¿Eliminar categoría?"
        message="Esta acción no se puede deshacer. Los productos asociados a esta categoría quedarán sin categoría."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={categoryActionLoading === categoryToDelete}
      />
    </div>
  );
}
