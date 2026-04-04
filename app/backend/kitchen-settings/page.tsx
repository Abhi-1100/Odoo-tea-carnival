export default function KitchenSettings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Kitchen Display Settings</h1>
      <p className="text-brand-muted text-sm">Configure kitchen screen layout, sound alerts, and auto-refresh interval.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 max-w-lg">
        {[{ label: "Auto-refresh interval", value: "15 seconds" }, { label: "Sound alerts", value: "Enabled" }, { label: "Display columns", value: "3 (To Cook / Preparing / Completed)" }].map(s => (
          <div key={s.label} className="card p-4 flex items-center justify-between">
            <span className="text-white text-sm">{s.label}</span>
            <span className="text-brand-primary text-sm font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
