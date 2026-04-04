const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'app/backend');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const replacements = [
    { from: /bg-slate-900/g, to: 'bg-brand-bg' },
    { from: /bg-slate-800/g, to: 'bg-brand-card' },
    { from: /bg-slate-800\/50/g, to: 'bg-brand-card/50' },
    { from: /bg-slate-700/g, to: 'bg-brand-bg' },
    { from: /bg-slate-750/g, to: 'bg-brand-bg' },
    { from: /border-slate-700/g, to: 'border-brand-border' },
    { from: /border-slate-800/g, to: 'border-brand-border' },
    { from: /border-slate-600/g, to: 'border-brand-border' },
    { from: /text-slate-200/g, to: 'text-brand-text' },
    { from: /text-slate-300/g, to: 'text-brand-text' },
    { from: /text-slate-400/g, to: 'text-brand-muted' },
    { from: /text-slate-500/g, to: 'text-brand-muted/70' },
    { from: /text-white/g, to: 'text-brand-text' },
    { from: /hover:bg-slate-700/g, to: 'hover:bg-brand-bg' },
    { from: /hover:bg-slate-800/g, to: 'hover:bg-brand-card' },
    { from: /bg-blue-500/g, to: 'bg-brand-primary' },
    { from: /bg-blue-600/g, to: 'bg-brand-primary' },
    { from: /hover:bg-blue-600/g, to: 'hover:bg-brand-primary/90' },
    { from: /text-blue-400/g, to: 'text-brand-primary' },
    { from: /text-blue-500/g, to: 'text-brand-primary' },
    { from: /hover:text-blue-300/g, to: 'hover:text-brand-primary/80' },
    { from: /focus:border-blue-500/g, to: 'focus:border-brand-primary' },
    { from: /placeholder-slate-500/g, to: 'placeholder-brand-muted/50' },
    { from: /placeholder-slate-400/g, to: 'placeholder-brand-muted/50' },
    { from: /hover:border-slate-500/g, to: 'hover:border-brand-border/80' },
    { from: /ring-slate-800/g, to: 'ring-brand-border' },
    { from: /divide-slate-800/g, to: 'divide-brand-border' },
    { from: /divide-slate-700/g, to: 'divide-brand-border' }
  ];

  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });

  // Re-write common input styles
  content = content.replace(/className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text placeholder-brand-muted\/50 focus:border-brand-primary focus:outline-none"/g, 'className="input-dark w-full"');
  content = content.replace(/className="w-full px-3 py-2 bg-brand-card border border-brand-border rounded text-brand-text placeholder-brand-muted\/50 focus:border-brand-primary focus:outline-none"/g, 'className="input-dark w-full"');
  content = content.replace(/className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text focus:outline-none focus:border-brand-primary transition-colors"/g, 'className="input-dark w-full"');
  content = content.replace(/className="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-brand-text focus:outline-none focus:border-brand-primary"/g, 'className="input-dark w-full"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateFile(fullPath);
    }
  }
}

processDirectory(backendDir);
console.log('Bulk migration complete!');
