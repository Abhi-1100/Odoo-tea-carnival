"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface ProductVariant {
  id?: number;
  attribute: string;
  value: string;
  extraPrice: number;
  productId?: number;
  isActive?: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  taxPercent: number;
  description: string | null;
  sendToKitchen: boolean;
  isActive: boolean;
  category: { id: number; name: string } | null;
  variants: ProductVariant[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
}

const emptyProduct = {
  name: "",
  categoryId: null as number | null,
  price: 0,
  unit: "piece",
  taxPercent: 0,
  description: "",
  sendToKitchen: true,
  isActive: true,
  variants: [] as ProductVariant[],
};

export default function ProductsPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof emptyProduct>(emptyProduct);
  const [tab, setTab] = useState<"general" | "variants">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.products.getAll(token);
      setItems(res.data as Product[]);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.categories.getAll(token);
      setCategories(res.data as Category[]);
    } catch (error: unknown) {
      console.error("Failed to fetch categories");
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filtered = items.filter((p) => {
    const matchesCategory = catFilter === "All" || p.category?.name === catFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  const openAdd = () => {
    setForm(emptyProduct);
    setEditing(null);
    setTab("general");
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      categoryId: p.category?.id || null,
      price: p.price,
      unit: p.unit,
      taxPercent: p.taxPercent,
      description: p.description || "",
      sendToKitchen: p.sendToKitchen,
      isActive: p.isActive,
      variants: p.variants.map((v) => ({
        attribute: v.attribute,
        value: v.value,
        extraPrice: v.extraPrice,
      })),
    });
    setEditing(p);
    setTab("general");
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!token) return;

    try {
      setSaving(true);
      if (editing) {
        await api.products.update(editing.id, form, token);
        toast.success("Product updated!");
      } else {
        await api.products.create(form, token);
        toast.success("Product added!");
      }
      setModal(false);
      fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.products.delete(id, token);
      toast.success("Product deleted.");
      fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const fld = (key: keyof typeof form) => ({
    value: form[key] as string | number | boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((p) => ({ ...p, [key]: value }));
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-brand-muted text-sm mt-1">{items.length} products total</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-dark pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categoryNames.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                catFilter === c
                  ? "bg-brand-primary text-white"
                  : "bg-brand-card text-brand-muted hover:text-white border border-brand-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {["Product", "Category", "Price", "Unit", "Tax", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-brand-border/50 hover:bg-brand-bg/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted text-sm">{p.category?.name || "Uncategorized"}</td>
                  <td className="px-4 py-3 text-white text-sm font-semibold">₹{p.price}</td>
                  <td className="px-4 py-3 text-brand-muted text-sm">{p.unit}</td>
                  <td className="px-4 py-3 text-brand-muted text-sm">{p.taxPercent}%</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg bg-brand-border hover:bg-brand-primary/20 hover:text-brand-primary text-brand-muted transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-brand-border hover:bg-red-500/20 hover:text-red-400 text-brand-muted transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brand-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Product" : "Add Product"} size="lg">
        <div className="flex gap-1 mb-6 border-b border-brand-border">
          {(["general", "variants"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all -mb-px border-b-2 ${
                tab === t ? "border-brand-primary text-white" : "border-transparent text-brand-muted hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "general" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-brand-muted mb-1.5">Product Name *</label>
              <input {...fld("name")} placeholder="e.g. Margherita Pizza" className="input-dark" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Category</label>
              <select {...fld("categoryId")} className="input-dark">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Price (₹)</label>
              <input type="number" {...fld("price")} className="input-dark" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Unit</label>
              <input {...fld("unit")} className="input-dark" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Tax (%)</label>
              <input type="number" {...fld("taxPercent")} className="input-dark" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Status</label>
              <select
                value={form.isActive ? "true" : "false"}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "true" }))}
                className="input-dark"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.sendToKitchen}
                  onChange={(e) => setForm((p) => ({ ...p, sendToKitchen: e.target.checked }))}
                  className="rounded"
                />
                Send to Kitchen
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-brand-muted mb-1.5">Description</label>
              <textarea
                {...fld("description")}
                rows={3}
                placeholder="Optional description..."
                className="input-dark resize-none"
              />
            </div>
          </div>
        )}

        {tab === "variants" && (
          <div className="space-y-4">
            <p className="text-brand-muted text-sm">Add product variants like size or pack options with extra pricing.</p>
            {form.variants.map((v, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-brand-muted mb-1.5">Attribute</label>
                  <input
                    value={v.attribute}
                    onChange={(e) => {
                      const newVariants = [...form.variants];
                      newVariants[i].attribute = e.target.value;
                      setForm((p) => ({ ...p, variants: newVariants }));
                    }}
                    placeholder="e.g. Size"
                    className="input-dark"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-brand-muted mb-1.5">Value</label>
                  <input
                    value={v.value}
                    onChange={(e) => {
                      const newVariants = [...form.variants];
                      newVariants[i].value = e.target.value;
                      setForm((p) => ({ ...p, variants: newVariants }));
                    }}
                    placeholder="e.g. Large"
                    className="input-dark"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-brand-muted mb-1.5">Extra Price</label>
                  <input
                    type="number"
                    value={v.extraPrice}
                    onChange={(e) => {
                      const newVariants = [...form.variants];
                      newVariants[i].extraPrice = parseFloat(e.target.value) || 0;
                      setForm((p) => ({ ...p, variants: newVariants }));
                    }}
                    className="input-dark"
                  />
                </div>
                <button
                  onClick={() => setForm((p) => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }))}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setForm((p) => ({ ...p, variants: [...p.variants, { attribute: "", value: "", extraPrice: 0 }] }))}
              className="w-full p-3 border-2 border-dashed border-brand-border rounded-lg text-brand-muted hover:text-white hover:border-brand-primary transition-all"
            >
              + Add Variant
            </button>
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <Button variant="ghost" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            {editing ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
