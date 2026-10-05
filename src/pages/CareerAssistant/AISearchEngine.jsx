import React, { useState } from 'react';
import { Search, MessageSquare, FileText, FolderGit2, BookOpen, History, Bookmark, StickyNote, File, Sparkles } from 'lucide-react';

const AISearchEngine = () => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState([]);

  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'history', label: 'History', icon: History },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  const mockResults = [
    { type: 'chat', title: 'React Hooks Discussion', preview: 'useEffect cleanup functions prevent memory leaks...', time: '2 hours ago', icon: MessageSquare },
    { type: 'resume', title: 'Resume v3.2', preview: 'Full Stack Developer - React, Node.js, MongoDB...', time: 'Yesterday', icon: FileText },
    { type: 'notes', title: 'System Design Notes', preview: 'Load balancer, caching strategies, database sharding...', time: '3 days ago', icon: StickyNote },
    { type: 'courses', title: 'DSA Learning Path', preview: 'Arrays, Linked Lists, Trees, Graphs, Dynamic Programming...', time: '1 week ago', icon: BookOpen },
    { type: 'projects', title: 'E-Commerce App', preview: 'Built with React + Node.js + MongoDB. Features: auth, cart...', time: '2 weeks ago', icon: FolderGit2 },
    { type: 'bookmarks', title: 'CSS Flexbox Guide', preview: 'Complete guide to CSS Flexbox with examples...', time: '1 month ago', icon: Bookmark },
  ];

  const handleSearch = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const filtered = mockResults.filter(r =>
      (activeFilter === 'all' || r.type === activeFilter) &&
      (r.title.toLowerCase().includes(q.toLowerCase()) || r.preview.toLowerCase().includes(q.toLowerCase()))
    );
    setResults(filtered.length > 0 ? filtered : mockResults.filter(r => activeFilter === 'all' || r.type === activeFilter));
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2.5">
          <Search className="w-6 h-6 text-indigo-400" /> AI Search Engine
        </h2>
        <p className="text-xs text-slate-400">Search across your entire workspace — chats, resume, projects, courses, notes, and more</p>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search everything..."
          className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 rounded-2xl text-base text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xl" />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {filters.map(f => (
          <button key={f.id} onClick={() => { setActiveFilter(f.id); handleSearch(query); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
              activeFilter === f.id ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300'}`}>
            <f.icon className="w-3 h-3" />{f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="liquid-glass-card rounded-xl p-4 flex items-start gap-3 hover:border-indigo-500/20 transition-colors cursor-pointer">
            <div className="p-2 rounded-lg bg-indigo-500/10 flex-shrink-0"><r.icon className="w-4 h-4 text-indigo-400" /></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-200">{r.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{r.preview}</p>
            </div>
            <span className="text-[10px] text-slate-600 flex-shrink-0">{r.time}</span>
          </div>
        ))}
        {query && results.length === 0 && <p className="text-center text-sm text-slate-600 py-8">No results found for "{query}"</p>}
      </div>
    </div>
  );
};

export default AISearchEngine;
