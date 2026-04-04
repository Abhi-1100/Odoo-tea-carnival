"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, X, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
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
  unit: "Unit",
  taxPercent: 5,
  description: "",
  sendToKitchen: true,
  isActive: true,
  variants: [] as ProductVariant[],
};

const unitOptions = ["KG", "Unit", "Liter"];
const taxOptions = [5, 18, 28];
const categoryColorClasses = [
  "bg-sky-500/20 text-sky-300",
  "bg-amber-500/20 text-amber-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-violet-500/20 text-violet-300",
  "bg-rose-500/20 text-rose-300",
];

export default function ProductsPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof emptyProduct>(emptyProduct);
  const [tab, setTab] = useState<"general" | "variants">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionOpen, setActionOpen] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

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

  const handleNew = () => {
    setForm(emptyProduct);
    setEditing(null);
    setTab("general");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      handleNew();
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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const deleteSelected = async () => {
    if (!token || selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected product(s)?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => api.products.delete(id, token)));
      toast.success("Selected products deleted");
      setSelectedIds([]);
      setActionOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete selected products");
    }
  };

  const archiveSelected = async () => {
    if (!token || selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) => api.products.update(id, { isActive: false }, token)),
      );
      toast.success("Selected products archived");
      setSelectedIds([]);
      setActionOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to archive selected products");
    }
  };

  const handleCreateCategory = async () => {
    if (!token) return;

    const name = categoryName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }

    const exists = categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error("Category already exists");
      return;
    }

    try {
      setSavingCategory(true);
      const res = await api.categories.create({
        name,
        description: categoryDescription.trim() || undefined,
        isActive: true,
      }, token);

      const created = res.data as Category;
      setCategories((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, categoryId: created.id }));
      setCatFilter(created.name);
      setCategoryName("");
      setCategoryDescription("");
      setCategoryModal(false);
      toast.success("Category added");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to add category");
    } finally {
      setSavingCategory(false);
    }
  };

  const categoryLabel = categories.find((c) => c.id === form.categoryId)?.name;

  const categoryBadgeClass = (name: string | undefined) => {
    if (!name) return "bg-brand-border text-brand-muted";
    const seed = name.charCodeAt(0) + name.length;
    return categoryColorClasses[seed % categoryColorClasses.length];
  };

  return (
    <div className="p-8 space-y-6">
      <div className="card overflow-hidden border border-brand-border/70">
        <div className="border-b border-brand-border px-5 py-3 flex items-center justify-between text-sm text-brand-muted">
          <div className="flex items-center gap-6">
            <Link href="/backend/orders" className="hover:text-white">Orders</Link>
            <Link href="/backend/products" className="text-white">Products</Link>
            <Link href="/backend/reports" className="hover:text-white">Reporting</Link>
          </div>
          <button className="text-brand-muted hover:text-white">
            <Menu size={16} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-brand-border">
          <div className="inline-flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-sky-300">Products</h1>
            {editing ? <span className="text-xs text-brand-muted">Editing #{editing.id}</span> : null}
          </div>
          <p className="text-brand-muted text-sm">{items.length} products total</p>
        </div>

        <div className="px-5 py-3 border-b border-brand-border">
          <div className="text-sm text-brand-muted mb-1">Product</div>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g Eric Smith"
            className="input-dark max-w-md"
          />
        </div>

        <div className="px-5 pt-3 flex gap-2 border-b border-brand-border">
          <button
            onClick={() => setTab("general")}
            className={`px-4 py-2 text-sm border border-brand-border border-b-0 rounded-t-md ${
              tab === "general" ? "bg-brand-bg text-white" : "text-brand-muted"
            }`}
          >
            General Info
          </button>
          <button
            onClick={() => setTab("variants")}
            className={`px-4 py-2 text-sm border border-brand-border border-b-0 rounded-t-md ${
              tab === "variants" ? "bg-brand-bg text-white" : "text-brand-muted"
            }`}
          >
            Varint
          </button>
        </div>

        {tab === "general" ? (
          <div className="px-5 py-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="text-white text-2xl sr-only">Category</label>
                <div className="text-white text-3xl hidden">Category</div>
                <div className="text-white text-sm mb-2">Category</div>
                <div className="flex items-center gap-2">
                  {categoryLabel ? (
                    <span className={"inline-flex items-center gap-1 rounded-md px-3 py-1 text-sm " + categoryBadgeClass(categoryLabel)}>
                      {categoryLabel}
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, categoryId: null }))}
                        className="text-inherit/80 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ) : null}
                  <select
                    value={form.categoryId?.toString() || ""}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value ? Number(e.target.value) : null }))}
                    className="input-dark max-w-xs"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <Button variant="ghost" size="sm" onClick={() => setCategoryModal(true)}>
                    New
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-white text-sm mb-2">Product Description</div>
                <input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g Burger with chees"
                  className="input-dark"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-[1fr_140px] gap-3 items-end">
                <div>
                  <div className="text-white text-sm mb-2">Prices</div>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="input-dark"
                  />
                </div>
                <div>
                  <div className="text-white text-sm mb-2">UOM</div>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                    className="input-dark"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_140px] gap-3 items-end">
                <div>
                  <div className="text-white text-sm mb-2">Tax</div>
                  <select
                    value={form.taxPercent}
                    onChange={(e) => setForm((p) => ({ ...p, taxPercent: Number(e.target.value) }))}
                    className="input-dark"
                  >
                    {taxOptions.map((tax) => (
                      <option key={tax} value={tax}>{tax}%</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5">
            <div className="overflow-hidden border border-brand-border rounded-md">
              <div className="grid grid-cols-12 px-3 py-2 text-xs uppercase text-brand-muted bg-brand-bg/40 border-b border-brand-border">
                <div className="col-span-3">Attributes</div>
                <div className="col-span-3">Value</div>
                <div className="col-span-3">Unit</div>
                <div className="col-span-2">Extra Prices</div>
                <div className="col-span-1"></div>
              </div>

              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 px-3 py-2 gap-2 border-b border-brand-border/50 items-center">
                  <input
                    value={v.attribute}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[i].attribute = e.target.value;
                      setForm((p) => ({ ...p, variants: next }));
                    }}
                    className="input-dark col-span-3"
                    placeholder="Pack"
                  />
                  <input
                    value={v.value}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[i].value = e.target.value;
                      setForm((p) => ({ ...p, variants: next }));
                    }}
                    className="input-dark col-span-3"
                    placeholder="6"
                  />
                  <select className="input-dark col-span-3" value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}>
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={v.extraPrice}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[i].extraPrice = parseFloat(e.target.value) || 0;
                      setForm((p) => ({ ...p, variants: next }));
                    }}
                    className="input-dark col-span-2"
                    placeholder="20"
                  />
                  <button
                    onClick={() => setForm((p) => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }))}
                    className="col-span-1 h-9 w-9 rounded border border-brand-border text-red-300 hover:text-red-100 inline-flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setForm((p) => ({ ...p, variants: [...p.variants, { attribute: "", value: "", extraPrice: 0 }] }))}
                className="w-full py-2 text-left px-3 text-sky-300 hover:bg-brand-bg/30"
              >
                New
              </button>
            </div>
          </div>
        )}

        <div className="px-5 py-4 border-t border-brand-border flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={handleNew}>Reset</Button>
          <Button onClick={handleSave} disabled={saving} icon={saving ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}>
            {editing ? "Update Product" : "Save Product"}
          </Button>
        </div>
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
        <div className="px-4 py-2 border-b border-brand-border flex items-center justify-end gap-2 relative">
          {selectedIds.length > 0 && (
            <span className="px-3 py-1.5 rounded bg-sky-500/20 text-sky-300 text-xs">x {selectedIds.length} Selected</span>
          )}
          <button
            onClick={() => setActionOpen((v) => !v)}
            className="px-3 py-1.5 text-xs border border-brand-border bg-brand-bg text-white rounded"
          >
            * Action
          </button>

          {actionOpen && (
            <div className="absolute right-4 top-11 z-10 min-w-28 border border-brand-border bg-[#151a28] rounded shadow-xl overflow-hidden">
              <button onClick={archiveSelected} className="block w-full text-left px-3 py-2 text-xs text-brand-muted hover:text-white hover:bg-brand-bg">
                ^ Archived
              </button>
              <button onClick={deleteSelected} className="block w-full text-left px-3 py-2 text-xs text-red-300 hover:text-white hover:bg-brand-bg">
                Delete
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {["Product", "Sale Prices", "Tax", "UOM", "Category"].map((h) => (
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSelect(p.id)}
                        className="h-4 w-4 rounded-sm border border-brand-border inline-flex items-center justify-center text-xs text-brand-muted"
                      >
                        {selectedIds.includes(p.id) ? "x" : ""}
                      </button>
                      <button onClick={() => openEdit(p)} className="text-white text-sm font-medium hover:text-sky-300">
                        {p.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white text-sm font-semibold">₹{p.price}</td>
                  <td className="px-4 py-3 text-brand-muted text-sm">{p.taxPercent}%</td>
                  <td className="px-4 py-3 text-brand-muted text-sm">{p.unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={"px-3 py-1 rounded-md text-sm " + categoryBadgeClass(p.category?.name)}>
                        {p.category?.name || "Uncategorized"}
                      </span>
                      {!p.isActive ? <span className="px-2 py-1 rounded text-xs bg-slate-500/20 text-slate-300">Archived</span> : null}
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="h-7 w-7 rounded border border-brand-border text-red-300 hover:text-red-100 inline-flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-brand-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={categoryModal} onClose={() => setCategoryModal(false)} title="Add Category" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-brand-muted mb-1.5">Category Name *</label>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Tea"
              className="input-dark"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1.5">Description (Optional)</label>
            <textarea
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              rows={3}
              placeholder="Short note for this category"
              className="input-dark resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setCategoryModal(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={savingCategory}>
              {savingCategory ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Add Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
