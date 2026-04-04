"use client";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { products as initialProducts, CATEGORIES, Product } from "@/data/products";
import toast from "react-hot-toast";

const emptyProduct: Omit<Product, "id"> = { name: "", category: "Pizza", price: 0, unit: "piece", tax: 5, status: "active", emoji: "🍕", description: "" };

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);
  const [tab, setTab] = useState<"general" | "variants">("general");

  const filtered = items.filter(p =>
    (catFilter === "All" || p.category === catFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyProduct); setEditing(null); setTab("general"); setModal(true); };
  const openEdit = (p: Product) => { setForm({ ...p }); setEditing(p); setTab("general"); setModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (editing) {
      setItems(items.map(p => p.id === editing.id ? { ...form, id: editing.id } : p));
      toast.success("Product updated!");
    } else {
      const newP: Product = { ...form, id: `p${Date.now()}` };
      setItems([newP, ...items]);
      toast.success("Product added!");
    }
    setModal(false);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(p => p.id !== id));
    toast.success("Product deleted.");
  };

  const fld = (k: keyof typeof form) => ({ value: form[k] as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Products</h1><p className="text-brand-muted text-sm mt-1">{items.length} products total</p></div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>Add Product</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-dark pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${catFilter === c ? "bg-brand-primary text-white" : "bg-brand-card text-brand-muted hover:text-white border border-brand-border"}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {["Product", "Category", "Price", "Unit", "Tax", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-brand-border/50 hover:bg-brand-bg/40 transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="text-xl">{p.emoji}</span><span className="text-white text-sm font-medium">{p.name}</span></div></td>
                <td className="px-4 py-3 text-brand-muted text-sm">{p.category}</td>
                <td className="px-4 py-3 text-white text-sm font-semibold">₹{p.price}</td>
                <td className="px-4 py-3 text-brand-muted text-sm">{p.unit}</td>
                <td className="px-4 py-3 text-brand-muted text-sm">{p.tax}%</td>
                <td className="px-4 py-3"><Badge variant={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-brand-border hover:bg-brand-primary/20 hover:text-brand-primary text-brand-muted transition-all"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-brand-border hover:bg-red-500/20 hover:text-red-400 text-brand-muted transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-brand-muted">No products found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Product" : "Add Product"} size="lg">
        <div className="flex gap-1 mb-6 border-b border-brand-border">
          {(["general", "variants"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-all -mb-px border-b-2 ${tab === t ? "border-brand-primary text-white" : "border-transparent text-brand-muted hover:text-white"}`}>{t}</button>
          ))}
        </div>

        {tab === "general" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs text-brand-muted mb-1.5">Product Name *</label><input {...fld("name")} placeholder="e.g. Margherita Pizza" className="input-dark" /></div>
            <div><label className="block text-xs text-brand-muted mb-1.5">Category</label>
              <select {...fld("category")} className="input-dark">{CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div><label className="block text-xs text-brand-muted mb-1.5">Emoji</label><input {...fld("emoji")} className="input-dark" /></div>
            <div><label className="block text-xs text-brand-muted mb-1.5">Price (₹)</label><input type="number" {...fld("price")} className="input-dark" /></div>
            <div><label className="block text-xs text-brand-muted mb-1.5">Unit</label><input {...fld("unit")} className="input-dark" /></div>
            <div><label className="block text-xs text-brand-muted mb-1.5">Tax (%)</label><input type="number" {...fld("tax")} className="input-dark" /></div>
            <div><label className="block text-xs text-brand-muted mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as "active" | "inactive" }))} className="input-dark">
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-span-2"><label className="block text-xs text-brand-muted mb-1.5">Description</label><textarea {...fld("description")} rows={3} placeholder="Optional description..." className="input-dark resize-none" /></div>
          </div>
        )}

        {tab === "variants" && (
          <div className="space-y-4">
            <p className="text-brand-muted text-sm">Add product variants like size or pack options with extra pricing.</p>
            <div className="card p-4 border-dashed border-2 border-brand-border text-center">
              <p className="text-brand-muted text-sm">Variant editor (Pro feature — configure in backend settings)</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Save Changes" : "Add Product"}</Button>
        </div>
      </Modal>
    </div>
  );
}
