"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

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

interface Session {
  id: number;
  terminalName: string;
  status: "open" | "closed";
}

interface TableDraft {
  key: string;
  id?: number;
  tableNumber: string;
  seats: number;
  isActive: boolean;
  appointmentResource: string;
  isNew: boolean;
}

const makeDraftFromTable = (table: Table): TableDraft => ({
  key: String(table.id),
  id: table.id,
  tableNumber: table.tableNumber,
  seats: table.seats,
  isActive: table.isActive,
  appointmentResource: table.appointmentResource || "",
  isNew: false,
});

const newDraft = (seed: number): TableDraft => ({
  key: `new-${Date.now()}-${seed}`,
  tableNumber: `${100 + seed}`,
  seats: 5,
  isActive: true,
  appointmentResource: `Table ${100 + seed} (Seating 5)`,
  isNew: true,
});

export default function FloorsPage() {
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [activeFloorId, setActiveFloorId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);

  const [newFloorName, setNewFloorName] = useState("");
  const [draftTables, setDraftTables] = useState<TableDraft[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"duplicate" | "delete">("duplicate");
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [compactRows, setCompactRows] = useState(false);
  const [sortBy, setSortBy] = useState<"tableNumber" | "seats">("tableNumber");
  const [showSeatsColumn, setShowSeatsColumn] = useState(true);
  const [showActiveColumn, setShowActiveColumn] = useState(true);
  const [showResourceColumn, setShowResourceColumn] = useState(true);
  const viewMenuRef = useRef<HTMLDivElement | null>(null);

  const activeFloor = useMemo(
    () => floors.find((floor) => floor.id === activeFloorId) || null,
    [floors, activeFloorId]
  );

  const visibleColumnCount =
    2 +
    (showSeatsColumn ? 1 : 0) +
    (showActiveColumn ? 1 : 0) +
    (showResourceColumn ? 1 : 0) +
    1;

  const displayedRows = useMemo(() => {
    const sorted = [...draftTables];
    if (sortBy === "seats") {
      sorted.sort((a, b) => a.seats - b.seats || a.tableNumber.localeCompare(b.tableNumber));
      return sorted;
    }
    sorted.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
    return sorted;
  }, [draftTables, sortBy]);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [floorsRes, sessionsRes] = await Promise.all([
        api.floors.getAll(token),
        api.sessions.getAll(token),
      ]);

      const floorsData = floorsRes.data as Floor[];
      const sessionsData = sessionsRes.data as Session[];

      setFloors(floorsData);
      setSessions(sessionsData);

      if (floorsData.length > 0) {
        const nextFloorId = activeFloorId && floorsData.some((f) => f.id === activeFloorId)
          ? activeFloorId
          : floorsData[0].id;
        setActiveFloorId(nextFloorId);
      } else {
        setActiveFloorId(null);
      }

      if (sessionsData.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionsData[0].id);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load floor plan");
    } finally {
      setLoading(false);
    }
  }, [token, activeFloorId, selectedSessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!activeFloor) {
      setDraftTables([]);
      return;
    }
    setDraftTables(activeFloor.tables.map(makeDraftFromTable));
    setSelectedKeys([]);
  }, [activeFloor]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const createFloor = async () => {
    if (!token) return;
    if (!newFloorName.trim()) {
      toast.error("Floor name is required");
      return;
    }

    try {
      const res = await api.floors.create(
        { name: newFloorName.trim(), createDefaultTables: true },
        token
      );
      const created = res.data as Floor;
      toast.success("Floor created with 5 default tables");
      setNewFloorName("");
      await loadData();
      setActiveFloorId(created.id);
      setShowPlanForm(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create floor");
    }
  };

  const deleteFloor = async () => {
    if (!token || !activeFloorId) return;

    const targetFloor = floors.find((f) => f.id === activeFloorId);
    if (!targetFloor) return;

    if (!confirm(`Delete floor \"${targetFloor.name}\"?`)) return;

    try {
      const res = await api.floors.delete(activeFloorId, token) as { success: boolean; message?: string };
      toast.success(res.message || "Floor removed");
      await loadData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to remove floor");
    }
  };

  const addRow = () => {
    setDraftTables((prev) => [...prev, newDraft(prev.length + 1)]);
  };

  const updateDraft = (key: string, patch: Partial<TableDraft>) => {
    setDraftTables((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const toggleSelection = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const toggleAll = () => {
    if (selectedKeys.length === draftTables.length) {
      setSelectedKeys([]);
      return;
    }
    setSelectedKeys(draftTables.map((row) => row.key));
  };

  const applyBulkAction = async () => {
    if (!token || !activeFloorId || selectedKeys.length === 0) return;

    const selectedRows = draftTables.filter((row) => selectedKeys.includes(row.key));
    const existingIds = selectedRows.filter((row) => row.id).map((row) => row.id as number);
    const newRows = selectedRows.filter((row) => !row.id);

    try {
      if (bulkAction === "delete") {
        if (existingIds.length > 0) {
          await api.tables.bulkAction({ action: "delete", ids: existingIds, floorId: activeFloorId }, token);
        }

        if (newRows.length > 0) {
          setDraftTables((prev) => prev.filter((row) => !selectedKeys.includes(row.key)));
        }

        toast.success("Selected tables deleted");
      }

      if (bulkAction === "duplicate") {
        if (existingIds.length > 0) {
          await api.tables.bulkAction({ action: "duplicate", ids: existingIds, floorId: activeFloorId }, token);
        }

        if (newRows.length > 0) {
          const clones = newRows.map((row, idx) => ({
            ...row,
            key: `new-${Date.now()}-${idx}`,
            tableNumber: `${row.tableNumber}-copy`,
            isNew: true,
          }));
          setDraftTables((prev) => [...prev, ...clones]);
        }

        toast.success("Selected tables duplicated");
      }

      setSelectedKeys([]);
      await loadData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Bulk action failed");
    }
  };

  const savePlan = async () => {
    if (!token || !activeFloorId) return;

    const invalid = draftTables.find((table) => !table.tableNumber.trim() || table.seats <= 0);
    if (invalid) {
      toast.error("Each row must have table number and seats");
      return;
    }

    try {
      setSaving(true);

      const updates = draftTables
        .filter((table) => table.id)
        .map((table) =>
          api.tables.update(
            table.id as number,
            {
              floorId: activeFloorId,
              tableNumber: table.tableNumber.trim(),
              seats: table.seats,
              isActive: table.isActive,
              appointmentResource: table.appointmentResource.trim() || null,
            },
            token
          )
        );

      const creates = draftTables
        .filter((table) => table.isNew)
        .map((table) =>
          api.tables.create(
            {
              floorId: activeFloorId,
              tableNumber: table.tableNumber.trim(),
              seats: table.seats,
              isActive: table.isActive,
              appointmentResource: table.appointmentResource.trim() || null,
            },
            token
          )
        );

      await Promise.all([...updates, ...creates]);
      toast.success("Plan saved successfully");
      await loadData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Floor Plan</h1>
        <p className="text-brand-muted text-sm mt-1">Open a plan form and manage tables with bulk actions.</p>
      </div>

      <div className="card p-0 overflow-hidden border border-brand-border">
        <div className="border-b border-brand-border px-4 py-3 bg-brand-bg/50">
          <div className="flex items-center gap-3 text-white font-medium">
            <span>Point of Sale</span>
            <span className="text-xs text-brand-muted">Odoo Cafe</span>
          </div>
        </div>

        <div className="border-b border-brand-border px-4 py-2 text-sm text-white bg-brand-bg/30">
          POS Interface
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-brand-muted">Floor Plan</span>
            <Button size="sm" onClick={() => setShowPlanForm((v) => !v)}>
              Plan -&gt;
            </Button>
          </div>
        </div>
      </div>

      {showPlanForm && (
        <div className="card p-0 overflow-hidden border border-brand-border">
          <div className="px-4 py-3 border-b border-brand-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-brand-muted block mb-1.5">Floor Name</label>
                <input
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  placeholder="e.g. Ground Floor"
                  className="input-dark"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={createFloor} icon={<Plus size={14} />}>Create Floor + 5 Tables</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs text-brand-muted block mb-1.5">Point Of Sale (Session)</label>
                <div className="relative">
                  <select
                    value={selectedSessionId || ""}
                    onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                    className="input-dark appearance-none pr-10"
                  >
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.terminalName} ({session.status})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-brand-muted block mb-1.5">Selected Floor</label>
                <select
                  value={activeFloorId || ""}
                  onChange={(e) => setActiveFloorId(Number(e.target.value))}
                  className="input-dark"
                >
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={deleteFloor} disabled={!activeFloorId}>
                    Delete Floor
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {selectedKeys.length > 0 && (
                <span className="inline-flex items-center rounded bg-blue-600/20 text-blue-300 px-2 py-1 text-xs font-medium">
                  x {selectedKeys.length} Selected
                </span>
              )}

              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as "duplicate" | "delete")}
                className="h-8 rounded border border-brand-border bg-brand-bg px-2 text-xs text-white"
                disabled={selectedKeys.length === 0}
              >
                <option value="duplicate">Duplicate</option>
                <option value="delete">Delete</option>
              </select>

              <Button size="sm" variant="ghost" onClick={applyBulkAction} disabled={selectedKeys.length === 0}>
                Action
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={addRow}>
                Add Row
              </Button>
              <Button size="sm" onClick={savePlan} disabled={saving || !activeFloorId}>
                {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                Save Plan
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/40">
                  <th className="text-left py-2 px-3 text-xs text-brand-muted w-10">
                    <input
                      type="checkbox"
                      checked={draftTables.length > 0 && selectedKeys.length === draftTables.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="text-left py-2 px-3 text-xs text-brand-muted">Table Number</th>
                  {showSeatsColumn && <th className="text-left py-2 px-3 text-xs text-brand-muted">Seats</th>}
                  {showActiveColumn && <th className="text-left py-2 px-3 text-xs text-brand-muted">Active</th>}
                  {showResourceColumn && <th className="text-left py-2 px-3 text-xs text-brand-muted">Appointment Resource</th>}
                  <th className="text-right py-2 px-3 text-xs text-brand-muted w-14">
                    <div className="relative inline-block" ref={viewMenuRef}>
                      <button
                        type="button"
                        title="View options"
                        onClick={() => setShowViewMenu((v) => !v)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded border border-brand-border bg-brand-bg text-brand-muted hover:text-white"
                      >
                        <SlidersHorizontal size={14} />
                      </button>

                      {showViewMenu && (
                        <div className="absolute right-0 top-9 z-20 w-52 rounded-lg border border-brand-border bg-[#1f2440] p-2 shadow-lg">
                          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">View Options</p>

                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-white hover:bg-brand-bg"
                            onClick={() => setCompactRows((v) => !v)}
                          >
                            Compact rows
                            <span className="text-brand-muted">{compactRows ? "On" : "Off"}</span>
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-white hover:bg-brand-bg"
                            onClick={() => setSortBy("tableNumber")}
                          >
                            Sort by Table Number
                            <span className="text-brand-muted">{sortBy === "tableNumber" ? "Active" : ""}</span>
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-white hover:bg-brand-bg"
                            onClick={() => setSortBy("seats")}
                          >
                            Sort by Seats
                            <span className="text-brand-muted">{sortBy === "seats" ? "Active" : ""}</span>
                          </button>

                          <div className="my-1 border-t border-brand-border" />

                          <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-white hover:bg-brand-bg">
                            <input
                              type="checkbox"
                              checked={showSeatsColumn}
                              onChange={() => setShowSeatsColumn((v) => !v)}
                            />
                            Seats column
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-white hover:bg-brand-bg">
                            <input
                              type="checkbox"
                              checked={showActiveColumn}
                              onChange={() => setShowActiveColumn((v) => !v)}
                            />
                            Active column
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-white hover:bg-brand-bg">
                            <input
                              type="checkbox"
                              checked={showResourceColumn}
                              onChange={() => setShowResourceColumn((v) => !v)}
                            />
                            Resource column
                          </label>
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr key={row.key} className="border-b border-brand-border/70">
                    <td className={compactRows ? "py-1.5 px-3" : "py-2 px-3"}>
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(row.key)}
                        onChange={() => toggleSelection(row.key)}
                      />
                    </td>
                    <td className={compactRows ? "py-1.5 px-3" : "py-2 px-3"}>
                      <input
                        value={row.tableNumber}
                        onChange={(e) => updateDraft(row.key, { tableNumber: e.target.value })}
                        className="h-8 w-28 rounded border border-brand-border bg-brand-bg px-2 text-sm text-white"
                      />
                    </td>
                    {showSeatsColumn && (
                      <td className={compactRows ? "py-1.5 px-3" : "py-2 px-3"}>
                        <input
                          type="number"
                          min={1}
                          value={row.seats}
                          onChange={(e) => updateDraft(row.key, { seats: Math.max(1, Number(e.target.value) || 1) })}
                          className="h-8 w-20 rounded border border-brand-border bg-brand-bg px-2 text-sm text-white"
                        />
                      </td>
                    )}
                    {showActiveColumn && (
                      <td className={compactRows ? "py-1.5 px-3" : "py-2 px-3"}>
                        <button
                          onClick={() => updateDraft(row.key, { isActive: !row.isActive })}
                          className={`inline-flex h-6 w-10 items-center rounded-full p-1 transition-colors ${
                            row.isActive ? "bg-green-600" : "bg-slate-600"
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full bg-white transition-transform ${
                              row.isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          >
                            {row.isActive ? <Check size={12} className="text-green-700" /> : null}
                          </span>
                        </button>
                      </td>
                    )}
                    {showResourceColumn && (
                      <td className={compactRows ? "py-1.5 px-3" : "py-2 px-3"}>
                        <div className="flex items-center gap-2">
                          <input
                            value={row.appointmentResource}
                            onChange={(e) => updateDraft(row.key, { appointmentResource: e.target.value })}
                            className="h-8 w-full rounded border border-brand-border bg-brand-bg px-2 text-sm text-white"
                          />
                          {!row.id && (
                            <button
                              className="h-8 w-8 rounded border border-brand-border bg-brand-bg text-red-300 hover:text-red-200"
                              onClick={() => setDraftTables((prev) => prev.filter((table) => table.key !== row.key))}
                              title="Remove unsaved row"
                            >
                              <Trash2 size={14} className="mx-auto" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className={compactRows ? "py-1.5 px-3" : "py-2 px-3"} />
                  </tr>
                ))}
                {draftTables.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumnCount} className="text-center py-10 text-sm text-brand-muted">
                      No tables found. Create a floor or add rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
