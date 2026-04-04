"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

const PRESET_COLORS = [
  "#0891B2", // Cyan
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#EF4444", // Red
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const { token } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#0891B2",
  });

  // Load categories
  useEffect(() => {
    loadCategories();
  }, [token]);

  const loadCategories = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.categories.getAll(token);
      if (response.success) {
        setCategories(response.data as Category[]);
      }
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    if (showForm && !editingId) return;
    setEditingId(null);
    setFormData({ name: "", description: "", color: "#0891B2" });
    setShowForm(!showForm);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const response = await api.categories.update(editingId, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
        }, token);
        if (response.success) {
          toast.success("Category updated successfully");
          loadCategories();
        }
      } else {
        // Create new
        const response = await api.categories.create({
          name: formData.name,
          description: formData.description,
          color: formData.color,
        }, token);
        if (response.success) {
          toast.success("Category created successfully");
          loadCategories();
        }
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", description: "", color: "#0891B2" });
    } catch (error) {
      toast.error(editingId ? "Failed to update category" : "Failed to create category");
      console.error(error);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      const response = await api.categories.delete(id, token);
      if (response.success) {
        toast.success("Category deleted successfully");
        loadCategories();
      }
    } catch (error) {
      toast.error("Failed to delete category");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "", color: "#0891B2" });
  };

  const handleColorChange = (color: string) => {
    setFormData({ ...formData, color });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetId) return;

    const draggedIndex = categories.findIndex((c) => c.id === draggedItem);
    const targetIndex = categories.findIndex((c) => c.id === targetId);

    const newCategories = [...categories];
    [newCategories[draggedIndex], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[draggedIndex],
    ];

    setCategories(newCategories);
    setDraggedItem(null);
    // Note: In a real app, you'd persist this order to the backend
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-bg">
        <div className="text-brand-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Navigation Strip */}
      <div className="bg-brand-card border-b border-brand-border sticky top-0 z-10">
        <div className="min-h-12 flex items-center px-4 gap-6">
          <button className="text-sm font-medium text-brand-muted hover:text-white transition">
            Orders
          </button>
          <button className="text-sm font-medium text-brand-primary hover:text-brand-teal transition">
            Products
          </button>
          <button className="text-sm font-medium text-brand-muted hover:text-white transition">
            Reporting
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-primary mb-4">Product Category</h1>
          
          {/* New Button */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={handleAddNew}
              className="bg-brand-primary text-[#0d0d0b] hover:bg-[#f2ca50] font-bold px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={18} />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded text-white placeholder-brand-muted focus:border-brand-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-brand-card border border-brand-border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-brand-primary mb-4">
              {editingId ? "Edit Category" : "New Category"}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category name"
                  className="w-full px-3 py-2 bg-transparent border border-brand-border rounded text-white placeholder-brand-muted focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 bg-transparent border border-brand-border rounded text-white placeholder-brand-muted focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Color
                </label>
                <div className="flex gap-3 items-center">
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          formData.color === color
                            ? "border-brand-primary shadow-lg scale-110 shadow-brand-primary/30"
                            : "border-brand-border hover:border-white"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex gap-2 items-center ml-4">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-brand-muted">{formData.color}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-brand-primary text-[#0d0d0b] hover:bg-[#f2ca50] font-bold px-4 py-2 rounded"
                >
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  onClick={handleCancel}
                  className="bg-transparent border border-brand-border hover:bg-brand-border text-white px-4 py-2 rounded"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-brand-card border border-brand-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border bg-brand-card">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white w-12">
                    •••
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                    Product Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                    Color
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                    Products
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-white w-12">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-brand-muted">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, category.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, category.id)}
                      className={`border-b border-brand-border hover:bg-brand-border/30 transition ${
                        draggedItem === category.id ? "bg-brand-border/30 opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center cursor-move">
                        <GripVertical
                          size={16}
                          className="text-brand-muted hover:text-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-white hover:text-brand-primary font-medium transition"
                        >
                          {category.name}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-brand-border"
                            style={{ backgroundColor: category.color }}
                            title={category.color}
                          />
                          <span className="text-xs text-brand-muted">{category.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-brand-border/30 text-white px-2 py-1 rounded text-sm">
                          {category._count?.products || 0} products
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 transition"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-6 text-sm text-brand-muted">
           <p>💡 Click on a category name to edit it. Drag rows to reorder categories.</p>
        </div>
      </div>
    </div>
  );
}
