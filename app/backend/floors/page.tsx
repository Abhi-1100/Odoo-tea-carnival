"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { floors as initialFloors, Floor, Table, TableStatus } from "@/data/floors";
import toast from "react-hot-toast";

type TableForm = { number: string; seats: string; active: boolean; status: TableStatus; resource: string };
const emptyTable: TableForm = { number: "", seats: "4", active: true, status: "available", resource: "" };

export default function FloorsPage() {
  const [floors, setFloors] = useState<Floor[]>(initialFloors);
  const [activeFloorId, setActiveFloorId] = useState(initialFloors[0]?.id);
  const [modal, setModal] = useState(false);
  const [floorModal, setFloorModal] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [form, setForm] = useState<TableForm>(emptyTable);
  const [newFloorName, setNewFloorName] = useState("");

  const activeFloor = floors.find(f => f.id === activeFloorId);

  const openAdd = () => { setForm(emptyTable); setEditTable(null); setModal(true); };
  const openEdit = (t: Table) => { setForm({ number: t.number.toString(), seats: t.seats.toString(), active: t.active, status: t.status, resource: "" }); setEditTable(t); setModal(true); };

  const saveTable = () => {
    if (!form.number) { toast.error("Table number is required"); return; }
    const table: Table = { id: editTable?.id || `t${Date.now()}`, number: parseInt(form.number), seats: parseInt(form.seats) || 4, active: form.active, status: form.status };
    setFloors(prev => prev.map(f => f.id !== activeFloorId ? f : {
      ...f, tables: editTable ? f.tables.map(t => t.id === editTable.id ? table : t) : [...f.tables, table]
    }));
    toast.success(editTable ? "Table updated!" : "Table added!");
    setModal(false);
  };

  const deleteTable = (id: string) => {
    setFloors(prev => prev.map(f => f.id !== activeFloorId ? f : { ...f, tables: f.tables.filter(t => t.id !== id) }));
    toast.success("Table removed.");
  };

  const addFloor = () => {
    if (!newFloorName.trim()) { toast.error("Floor name required"); return; }
    const newF: Floor = { id: `f${Date.now()}`, name: newFloorName, tables: [] };
    setFloors(prev => [...prev, newF]);
    setActiveFloorId(newF.id);
    toast.success("Floor added!");
    setFloorModal(false);
    setNewFloorName("");
  };

  const statusColor: Record<TableStatus, string> = { available: "border-green-500/40 bg-green-500/5", occupied: "border-orange-500/40 bg-orange-500/5", reserved: "border-gray-500/40 bg-gray-500/5" };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Floor Plan</h1><p className="text-brand-muted text-sm mt-1">Manage your dining floors and tables</p></div>
        <div className="flex gap-3">
          <Button variant="ghost" icon={<Plus size={16} />} onClick={() => setFloorModal(true)}>Add Floor</Button>
          <Button icon={<Plus size={16} />} onClick={openAdd}>Add Table</Button>
        </div>
      </div>

      {/* Floor Tabs */}
      <div className="flex gap-2 border-b border-brand-border pb-1">
        {floors.map(f => (
          <button key={f.id} onClick={() => setActiveFloorId(f.id)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all -mb-px border-b-2 ${f.id === activeFloorId ? "border-brand-primary text-white" : "border-transparent text-brand-muted hover:text-white"}`}>{f.name}</button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {activeFloor?.tables.map(t => (
          <div key={t.id} className={`card p-4 border ${statusColor[t.status]} transition-all`}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl font-bold text-white">T{t.number}</div>
              <Badge variant={t.status} dot />
            </div>
            <div className="flex items-center gap-1.5 text-brand-muted text-xs mb-4"><Users size={12} /> {t.seats} seats</div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(t)} className="flex-1 py-1.5 rounded-lg bg-brand-border hover:bg-brand-primary/20 hover:text-brand-primary text-brand-muted text-xs flex items-center justify-center gap-1 transition-all"><Pencil size={12} /> Edit</button>
              <button onClick={() => deleteTable(t.id)} className="p-1.5 rounded-lg bg-brand-border hover:bg-red-500/20 hover:text-red-400 text-brand-muted transition-all"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {(!activeFloor?.tables.length) && <div className="col-span-full text-center py-16 text-brand-muted">No tables on this floor. Add one!</div>}
      </div>

      {/* Add Table Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editTable ? "Edit Table" : "Add Table"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-brand-muted mb-1.5 block">Table Number *</label><input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="e.g. 5" className="input-dark" type="number" /></div>
            <div><label className="text-xs text-brand-muted mb-1.5 block">Seats</label><input value={form.seats} onChange={e => setForm(p => ({ ...p, seats: e.target.value }))} className="input-dark" type="number" /></div>
            <div><label className="text-xs text-brand-muted mb-1.5 block">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as TableStatus }))} className="input-dark">
                <option value="available">Available</option><option value="occupied">Occupied</option><option value="reserved">Reserved</option>
              </select>
            </div>
            <div><label className="text-xs text-brand-muted mb-1.5 block">Resource (optional)</label><input value={form.resource} onChange={e => setForm(p => ({ ...p, resource: e.target.value }))} placeholder="e.g. Booth A" className="input-dark" /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.active ? "bg-brand-primary border-brand-primary" : "border-brand-border"}`} onClick={() => setForm(p => ({ ...p, active: !p.active }))}>{form.active && <Check size={12} className="text-white" />}</span>
            <span className="text-sm text-white">Active table</span>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={saveTable}>{editTable ? "Save Changes" : "Add Table"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={floorModal} onClose={() => setFloorModal(false)} title="Add Floor" size="sm">
        <div className="space-y-4">
          <div><label className="text-xs text-brand-muted mb-1.5 block">Floor Name</label><input value={newFloorName} onChange={e => setNewFloorName(e.target.value)} placeholder="e.g. Second Floor" className="input-dark" /></div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setFloorModal(false)}>Cancel</Button>
            <Button onClick={addFloor}>Add Floor</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
