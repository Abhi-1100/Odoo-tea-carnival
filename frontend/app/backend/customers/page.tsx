"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Search, Menu, Pencil, Trash2, Loader2, List } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string;
  totalSales: number;
  isActive: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Puducherry",
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
};

export default function BackendCustomersPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadCustomers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.customers.getAll(token);
      setCustomers((res.data as Customer[]) || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [customers, search]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      addressLine1: customer.addressLine1 || "",
      addressLine2: customer.addressLine2 || "",
      city: customer.city || "",
      state: customer.state || "",
      country: customer.country || "India",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete this customer?")) return;
    try {
      await api.customers.delete(id, token);
      toast.success("Customer deleted");
      if (editingId === id) {
        resetForm();
        setShowForm(false);
      }
      loadCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete customer");
    }
  };

  const saveCustomer = async () => {
    if (!token) return;

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim() || undefined,
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        country: form.country.trim() || "India",
      };

      if (editingId) {
        await api.customers.update(editingId, payload, token);
        toast.success("Customer updated");
      } else {
        await api.customers.create(payload, token);
        toast.success("Customer created");
      }

      resetForm();
      setShowForm(false);
      loadCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="card overflow-hidden border border-brand-border/70">
        <div className="border-b border-brand-border px-5 py-3 flex items-center justify-between text-sm text-brand-muted">
          <div className="flex items-center gap-6">
            <Link href="/backend/orders" className="hover:text-white">Orders</Link>
            <Link href="/backend/products" className="hover:text-white">Products</Link>
            <Link href="/backend/reports" className="hover:text-white">Reporting</Link>
          </div>
          <button className="text-brand-muted hover:text-white">
            <Menu size={16} />
          </button>
        </div>

        {!showForm ? (
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2">
                <button onClick={handleNew} className="px-3 py-1.5 rounded-md bg-fuchsia-300/30 text-fuchsia-100 text-sm">New</button>
                <h1 className="text-3xl font-bold text-white">Customer</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Customer........"
                    className="input-dark pl-9"
                  />
                </div>
                <button className="h-9 w-9 rounded border border-brand-border bg-brand-bg text-brand-muted hover:text-white inline-flex items-center justify-center">
                  <List size={14} />
                </button>
              </div>
            </div>

            <div className="border border-brand-border/70 rounded-md overflow-hidden">
              <div className="grid grid-cols-12 bg-brand-bg/40 border-b border-brand-border px-3 py-2 text-sm text-brand-muted font-medium">
                <div className="col-span-4">Name</div>
                <div className="col-span-5">Contact</div>
                <div className="col-span-2">Total Sales</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {loading ? (
                <div className="py-10 flex items-center justify-center text-brand-muted">
                  <Loader2 size={18} className="animate-spin mr-2" /> Loading customers...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-10 text-center text-brand-muted">No customers found</div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div key={customer.id} className="grid grid-cols-12 px-3 py-3 border-b border-brand-border/50 last:border-b-0 text-sm items-start">
                    <div className="col-span-4 text-white">[] {customer.name}</div>
                    <div className="col-span-5 space-y-1">
                      <div className="flex items-center gap-2 text-brand-muted">
                        <Mail size={13} /> {customer.email || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-brand-muted">
                        <Phone size={13} /> {customer.phone}
                      </div>
                    </div>
                    <div className="col-span-2 text-white font-semibold">${Math.round(Number(customer.totalSales || 0)).toLocaleString()}</div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button onClick={() => handleEdit(customer)} className="h-7 w-7 rounded border border-brand-border text-brand-muted hover:text-white inline-flex items-center justify-center">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(customer.id)} className="h-7 w-7 rounded border border-brand-border text-red-300 hover:text-red-100 inline-flex items-center justify-center">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-md bg-fuchsia-300/30 text-fuchsia-100 text-sm">New</button>
                <h1 className="text-3xl font-bold text-white">Customer</h1>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="h-9 px-3 rounded border border-brand-border text-brand-muted hover:text-white"
              >
                List View
              </button>
            </div>

            <div className="max-w-xl space-y-4">
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g Eric Smith"
                className="input-dark"
              />

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-brand-muted">
                  <Mail size={14} />
                  <input value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="eric@odoo.com" className="input-dark" />
                </div>
                <div className="flex items-center gap-2 text-brand-muted">
                  <Phone size={14} />
                  <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 9898989898" className="input-dark" />
                </div>
              </div>

              <div>
                <label className="text-brand-muted text-sm">Address</label>
                <div className="mt-2 space-y-3">
                  <input value={form.addressLine1} onChange={(e) => setField("addressLine1", e.target.value)} placeholder="St, 1" className="input-dark" />
                  <input value={form.addressLine2} onChange={(e) => setField("addressLine2", e.target.value)} placeholder="St, 2" className="input-dark" />

                  <div className="grid grid-cols-3 gap-3">
                    <input value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder="City" className="input-dark" />
                    <div>
                      <input
                        value={form.state}
                        onChange={(e) => setField("state", e.target.value)}
                        placeholder="State"
                        className="input-dark"
                        list="india-states"
                      />
                      <datalist id="india-states">
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state} />
                        ))}
                      </datalist>
                    </div>
                    <input value={form.country} onChange={(e) => setField("country", e.target.value)} placeholder="Country" className="input-dark" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  disabled={saving}
                  onClick={saveCustomer}
                  className="px-4 py-2 rounded-md bg-brand-primary text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update Customer" : "Create Customer"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-md border border-brand-border text-brand-muted hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
