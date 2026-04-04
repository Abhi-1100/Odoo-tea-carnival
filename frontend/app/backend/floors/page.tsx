"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Users, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

type TableStatus = "available" | "occupied" | "reserved";

interface Table {
  id: number;
  floorId: number;
  tableNumber: string;
  seats: number;
  isActive: boolean;
  status: TableStatus;
  appointmentResource: string | null;
}

interface Floor {
  id: number;
  name: string;
  isActive: boolean;
  tables: Table[];
}

type TableForm = { tableNumber: string; seats: string; isActive: boolean; status: TableStatus; appointmentResource: string };

const emptyTable: TableForm = { tableNumber: "", seats: "4", isActive: true, status: "available", appointmentResource: "" };

export default function FloorsPage() {
  const { token } = useAuthStore();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [floorModal, setFloorModal] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [form, setForm] = useState<TableForm>(emptyTable);
  const [newFloorName, setNewFloorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFloors = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.floors.getAll(token);
      const floorsData = res.data as Floor[];
      setFloors(floorsData);
      if (floorsData.length > 0 && !activeFloorId) {
        setActiveFloorId(floorsData[0].id);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch floors");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  const activeFloor = floors.find((f) => f.id === activeFloorId);

  const openAdd = () => {
    setForm(emptyTable);
    setEditTable(null);
    setModal(true);
  };

  const openEdit = (t: Table) => {
    setForm({
      tableNumber: t.tableNumber,
      seats: t.seats.toString(),
      isActive: t.isActive,
      status: t.status,
      appointmentResource: t.appointmentResource || "",
    });
    setEditTable(t);
    setModal(true);
  };

  const saveTable = async () => {
    if (!form.tableNumber.trim()) {
      toast.error("Table number is required");
      return;
    }
    if (!activeFloorId || !token) return;

    try {
      setSaving(true);
      const tableData = {
        floorId: activeFloorId,
        tableNumber: form.tableNumber,
        seats: parseInt(form.seats) || 4,
        isActive: form.isActive,
        status: form.status,
        appointmentResource: form.appointmentResource || null,
      };

      if (editTable) {
        await api.tables.update(editTable.id, tableData, token);
        toast.success("Table updated!");
      } else {
        await api.tables.create(tableData, token);
        toast.success("Table added!");
      }
      setModal(false);
      fetchFloors();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save table");
    } finally {
      setSaving(false);
    }
  };

  const deleteTable = async (id: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this table?")) return;

    try {
      await api.tables.delete(id, token);
      toast.success("Table removed.");
      fetchFloors();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete table");
    }
  };

  const addFloor = async () => {
    if (!newFloorName.trim()) {
      toast.error("Floor name required");
      return;
    }
    if (!token) return;

    try {
      const res = await api.floors.create({ name: newFloorName }, token);
      const newFloor = res.data as Floor;
      toast.success("Floor added!");
      fetchFloors();
      setActiveFloorId(newFloor.id);
      setFloorModal(false);
      setNewFloorName("");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to add floor");
    }
  };

  const deleteFloor = async (id: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this floor and all its tables?")) return;

    try {
      await api.floors.delete(id, token);
      toast.success("Floor deleted.");
      if (activeFloorId === id) {
        setActiveFloorId(floors.find((f) => f.id !== id)?.id || null);
      }
      fetchFloors();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete floor");
    }
  };

  const updateTableStatus = async (id: number, status: TableStatus) => {
    if (!token) return;
    try {
      await api.tables.updateStatus(id, status, token);
      fetchFloors();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const statusColor: Record<TableStatus, string> = {
    available: "border-green-500/40 bg-green-500/5",
    occupied: "border-orange-500/40 bg-orange-500/5",
    reserved: "border-gray-500/40 bg-gray-500/5",
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Floor Plan</h1>
          <p className="text-brand-muted text-sm mt-1">Manage your dining floors and tables</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" icon={<Plus size={16} />} onClick={() => setFloorModal(true)}>
            Add Floor
          </Button>
          <Button icon={<Plus size={16} />} onClick={openAdd} disabled={!activeFloorId}>
            Add Table
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      ) : floors.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          No floors yet. Create your first floor to get started!
        </div>
      ) : (
        <>
          <div className="flex gap-2 border-b border-brand-border pb-1">
            {floors.map((f) => (
              <div key={f.id} className="flex items-center">
                <button
                  onClick={() => setActiveFloorId(f.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all -mb-px border-b-2 ${
                    f.id === activeFloorId
                      ? "border-brand-primary text-brand-text"
                      : "border-transparent text-brand-muted hover:text-brand-text"
                  }`}
                >
                  {f.name}
                </button>
                <button
                  onClick={() => deleteFloor(f.id)}
                  className="ml-1 p-1 text-brand-muted hover:text-red-400 transition-colors"
                  title="Delete floor"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {activeFloor?.tables.map((t) => (
              <div key={t.id} className={`card p-4 border ${statusColor[t.status]} transition-all ${!t.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl font-bold text-brand-text">T{t.tableNumber}</div>
                  <Badge variant={t.status} dot />
                </div>
                <div className="flex items-center gap-1.5 text-brand-muted text-xs mb-4">
                  <Users size={12} /> {t.seats} seats
                </div>
                <div className="flex gap-1 mb-2">
                  {(["available", "occupied", "reserved"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateTableStatus(t.id, s)}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        t.status === s ? "bg-brand-primary text-brand-text" : "bg-brand-border text-brand-muted hover:text-brand-text"
                      }`}
                      title={s.charAt(0).toUpperCase() + s.slice(1)}
                    >
                      {s === "available" ? "AVL" : s === "occupied" ? "OCC" : "RES"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(t)}
                    className="flex-1 py-1.5 rounded-lg bg-brand-border hover:bg-brand-primary/20 hover:text-brand-primary text-brand-muted text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => deleteTable(t.id)}
                    className="p-1.5 rounded-lg bg-brand-border hover:bg-red-500/20 hover:text-red-400 text-brand-muted transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {(!activeFloor?.tables.length) && (
              <div className="col-span-full text-center py-16 text-brand-muted">
                No tables on this floor. Add one!
              </div>
            )}
          </div>
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editTable ? "Edit Table" : "Add Table"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-brand-muted mb-1.5 block">Table Number *</label>
              <input
                value={form.tableNumber}
                onChange={(e) => setForm((p) => ({ ...p, tableNumber: e.target.value }))}
                placeholder="e.g. 5"
                className="input-dark"
              />
            </div>
            <div>
              <label className="text-xs text-brand-muted mb-1.5 block">Seats</label>
              <input
                type="number"
                value={form.seats}
                onChange={(e) => setForm((p) => ({ ...p, seats: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div>
              <label className="text-xs text-brand-muted mb-1.5 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TableStatus }))}
                className="input-dark"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-brand-muted mb-1.5 block">Resource (optional)</label>
              <input
                value={form.appointmentResource}
                onChange={(e) => setForm((p) => ({ ...p, appointmentResource: e.target.value }))}
                placeholder="e.g. Booth A"
                className="input-dark"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                form.isActive ? "bg-brand-primary border-brand-primary" : "border-brand-border"
              }`}
              onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            >
              {form.isActive && <Check size={12} className="text-brand-text" />}
            </span>
            <span className="text-sm text-brand-text">Active table</span>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveTable} disabled={saving}>
              {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {editTable ? "Save Changes" : "Add Table"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={floorModal} onClose={() => setFloorModal(false)} title="Add Floor" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-brand-muted mb-1.5 block">Floor Name</label>
            <input
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              placeholder="e.g. Second Floor"
              className="input-dark"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setFloorModal(false)}>
              Cancel
            </Button>
            <Button onClick={addFloor}>Add Floor</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
