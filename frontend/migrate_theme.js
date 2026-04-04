const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const backendDir = path.join(__dirname, 'app', 'backend');
const files = fs.existsSync(backendDir) ? walk(backendDir) : [];

const dashboardFile = path.join(__dirname, 'app', 'dashboard', 'page.tsx');
if (fs.existsSync(dashboardFile)) files.push(dashboardFile);

const sidebarFile = path.join(__dirname, 'components', 'Sidebar.tsx');
if (fs.existsSync(sidebarFile)) files.push(sidebarFile);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Simple global replacements
    content = content.replace(/text-white/g, 'text-brand-text');
    content = content.replace(/hover:text-white/g, 'hover:text-brand-primary');
    
    // Some specific category colors (lightening them)
    content = content.replace(/bg-sky-500\/20 text-sky-300/g, 'bg-sky-100 text-sky-800 border border-sky-200');
    content = content.replace(/bg-amber-500\/20 text-amber-300/g, 'bg-amber-100 text-amber-800 border border-amber-200');
    content = content.replace(/bg-emerald-500\/20 text-emerald-300/g, 'bg-emerald-100 text-emerald-800 border border-emerald-200');
    content = content.replace(/bg-violet-500\/20 text-violet-300/g, 'bg-violet-100 text-violet-800 border border-violet-200');
    content = content.replace(/bg-rose-500\/20 text-rose-300/g, 'bg-rose-100 text-rose-800 border border-rose-200');
    
    // Sidebar specific hex codes
    if (file.includes('Sidebar.tsx')) {
        content = content.replace(/bg-\[#271310\]/g, 'bg-brand-bg');
        content = content.replace(/border-\[#3E2723\]/g, 'border-brand-border');
        content = content.replace(/bg-\[#3E2723\]/g, 'bg-brand-card');
        content = content.replace(/bg-\[#3E2723\]\/50/g, 'bg-brand-card/50');
        content = content.replace(/text-\[#FDF9F0\]/g, 'text-brand-text');
        
        content = content.replace(/bg-\[#D4A373\]/g, 'bg-brand-primary');
        content = content.replace(/text-\[#D4A373\]/g, 'text-brand-primary');
        content = content.replace(/border-\[#D4A373\]/g, 'border-brand-primary');
        content = content.replace(/shadow-\[#D4A373\]/g, 'shadow-brand-primary');
        
        // Fix up specific text transparencies
        content = content.replace(/text-brand-text\/60/g, 'text-brand-muted');
        content = content.replace(/text-brand-text\/50/g, 'text-brand-muted');
        content = content.replace(/text-brand-text\/80/g, 'text-brand-text');
    } else {
        // general dark colors in pages
        content = content.replace(/text-sky-300/g, 'text-brand-primary');
        content = content.replace(/text-fuchsia-100/g, 'text-brand-primary');
        content = content.replace(/bg-fuchsia-300\/30/g, 'bg-brand-primary/10 border border-brand-primary/20');
        content = content.replace(/text-red-300/g, 'text-red-500');
        content = content.replace(/hover:text-red-100/g, 'hover:text-red-700');
        content = content.replace(/bg-\[#151a28\]/g, 'bg-brand-card');
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
});
