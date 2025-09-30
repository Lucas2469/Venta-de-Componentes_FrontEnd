import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Loader2, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { categoriesAPI } from '../../../api/categoriesApi';
import { Category } from "../../types";
import { mockProducts } from "../../mockData";

export function CategoriesSection() {
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
      await loadCategories();
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    } finally {
      setCategoryActionLoading(null);
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      setCategoryActionLoading(categoryId);
      await categoriesAPI.toggleStatus(categoryId);
      await loadCategories();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorías</CardTitle>
          <Button onClick={openCreateCategoryDialog} disabled={isCategoriesLoading}>
            {isCategoriesLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Agregar Categoría
          </Button>
        </CardHeader>
        <CardContent>
          {isCategoriesLoading && categories.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.nombre}</TableCell>
                    <TableCell className="max-w-xs truncate">{category.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant={category.estado === "activo" ? "default" : "secondary"}>
                        {category.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {typeof category.product_count === 'number' ? category.product_count : products.filter(p => p.category === category.id).length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleCategoryStatus(category.id)}
                          disabled={categoryActionLoading === category.id}
                        >
                          {categoryActionLoading === category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : category.estado === "activo" ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditCategoryDialog(category)}
                          disabled={isCategoriesLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openDeleteCategoryConfirm(category.id)}
                          disabled={isCategoriesLoading}
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

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nombre *</Label>
              <Input
                id="category-name"
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
                className={categoryErrors.nombre ? "border-red-500" : ""}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-500">{categoryErrors.nombre}</span>
                <span className="text-xs text-gray-500">
                  {(editingCategory ? editingCategory.nombre : newCategory.nombre || '').length}/20
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="category-description">Descripción</Label>
              <Textarea
                id="category-description"
                placeholder="Descripción de la categoría"
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
                className={categoryErrors.descripcion ? "border-red-500" : ""}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-500">{categoryErrors.descripcion}</span>
                <span className="text-xs text-gray-500">
                  {(editingCategory ? editingCategory.descripcion || '' : newCategory.descripcion || '').length}/70
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="category-status">Estado</Label>
              <Select
                value={editingCategory ? editingCategory.estado : newCategory.estado}
                onValueChange={(value: "activo" | "inactivo") => 
                  editingCategory 
                    ? setEditingCategory({...editingCategory, estado: value})
                    : setNewCategory({...newCategory, estado: value})
                }
                disabled={isCategoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryDialog(false)}
              disabled={isCategoriesLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={isCategoriesLoading || 
                (!editingCategory && !newCategory.nombre.trim()) ||
                (editingCategory && !editingCategory.nombre.trim()) ||
                categoryErrors.nombre !== "" ||
                categoryErrors.descripcion !== ""
              }
            >
              {isCategoriesLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingCategory ? "Actualizar" : "Crear"} Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro de eliminar esta categoría?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Los productos asociados a esta categoría quedarán sin categoría.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isCategoriesLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
              disabled={isCategoriesLoading}
            >
              {isCategoriesLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
