export default function SelfOrderSettings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Self Ordering</h1>
      <p className="text-brand-muted text-sm">Configure self-ordering settings and QR token generation.</p>
      <div className="mt-8 card p-6 max-w-lg">
        <p className="text-brand-muted text-sm">To let customers self-order, share this URL:</p>
        <div className="mt-3 bg-brand-bg border border-brand-border rounded-lg px-4 py-3 flex items-center justify-between">
          <code className="text-brand-primary text-sm">/self-order/table-5</code>
          <button className="text-brand-muted hover:text-white text-xs transition-colors">Copy</button>
        </div>
      </div>
    </div>
  );
}
