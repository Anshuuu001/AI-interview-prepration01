import React, { useState } from 'react';
import { Folder, Tag, Star, Cloud, Eye, FileText, Copy, History, Brain, Search, Plus, Trash2, File } from 'lucide-react';

const FileManager = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'Resume_v3.pdf', type: 'resume', size: '240 KB', modified: '2 days ago', tags: ['resume', 'latest'], starred: true },
    { id: 2, name: 'System_Design_Notes.md', type: 'notes', size: '15 KB', modified: '1 week ago', tags: ['notes', 'system design'], starred: false },
    { id: 3, name: 'DSA_Cheatsheet.pdf', type: 'cheatsheet', size: '180 KB', modified: '2 weeks ago', tags: ['dsa', 'cheatsheet'], starred: true },
    { id: 4, name: 'Interview_Feedback.txt', type: 'feedback', size: '8 KB', modified: '3 days ago', tags: ['interview'], starred: false },
    { id: 5, name: 'Portfolio_Code.html', type: 'code', size: '45 KB', modified: '5 days ago', tags: ['portfolio', 'code'], starred: false },
  ]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const toggleStar = (id) => setFiles(prev => prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  const deleteFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const filtered = files.filter(f => {
    if (filter === 'starred' && !f.starred) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Folder className="w-6 h-6 text-amber-400" /> Smart File Manager
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Organize your files with tags, favorites, AI organization, and version history</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
        </div>
        <button onClick={() => setFilter(filter === 'starred' ? 'all' : 'starred')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filter === 'starred' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-slate-900/40 border-white/5 text-slate-400'}`}>
          <Star className="w-4 h-4" />
        </button>
      </div>

      <div className="liquid-glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-white/5">
          <span className="col-span-5">Name</span><span className="col-span-2">Size</span><span className="col-span-2">Modified</span><span className="col-span-2">Tags</span><span className="col-span-1">Actions</span>
        </div>
        {filtered.map(f => (
          <div key={f.id} className="grid grid-cols-12 gap-4 items-center px-5 py-3 hover:bg-white/[0.02] border-b border-white/[0.03] transition-colors">
            <div className="col-span-5 flex items-center gap-3">
              <File className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-200 truncate">{f.name}</span>
            </div>
            <span className="col-span-2 text-[11px] text-slate-500">{f.size}</span>
            <span className="col-span-2 text-[11px] text-slate-500">{f.modified}</span>
            <div className="col-span-2 flex flex-wrap gap-1">
              {f.tags.map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-500">{t}</span>)}
            </div>
            <div className="col-span-1 flex gap-1">
              <button onClick={() => toggleStar(f.id)} className={`p-1 rounded ${f.starred ? 'text-amber-400' : 'text-slate-700 hover:text-amber-400'}`}><Star className="w-3 h-3" /></button>
              <button onClick={() => deleteFile(f.id)} className="p-1 rounded text-slate-700 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-slate-600">No files found</p>}
      </div>
    </div>
  );
};

export default FileManager;
