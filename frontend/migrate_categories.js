const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app/backend/categories/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { from: /bg-slate-900/g, to: 'bg-brand-bg' },
  { from: /bg-slate-800/g, to: 'bg-brand-card' },
  { from: /border-slate-700/g, to: 'border-brand-border' },
  { from: /border-b border-slate-700/g, to: 'border-b border-brand-border' },
  { from: /text-slate-200/g, to: 'text-brand-text' },
  { from: /text-slate-300/g, to: 'text-brand-text' },
  { from: /text-slate-400/g, to: 'text-brand-muted' },
  { from: /text-slate-500/g, to: 'text-brand-muted/70' },
  { from: /bg-slate-700/g, to: 'bg-brand-bg' },
  { from: /border-slate-600/g, to: 'border-brand-border' },
  { from: /hover:border-slate-500/g, to: 'hover:border-brand-border/80' },
  { from: /bg-blue-500/g, to: 'bg-brand-primary' },
  { from: /hover:bg-blue-600/g, to: 'hover:bg-brand-primary/90' },
  { from: /text-blue-400/g, to: 'text-brand-primary' },
  { from: /hover:text-blue-300/g, to: 'hover:text-brand-primary/80' },
  { from: /focus:border-blue-500/g, to: 'focus:border-brand-primary' },
  { from: /text-white/g, to: 'text-brand-text' },
  { from: /placeholder-slate-500/g, to: 'placeholder-brand-muted/50' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Specific input styles fix to match the standard
content = content.replace(/className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text placeholder-brand-muted\/50 focus:border-brand-primary focus:outline-none"/g, 'className="input-dark w-full"');
content = content.replace(/className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded text-brand-text placeholder-brand-muted\/50 focus:border-brand-primary focus:outline-none"/g, 'className="input-dark w-full"');

fs.writeFileSync(file, content, 'utf8');
console.log('Categories page migrated!');
