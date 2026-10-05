import React, { useState } from 'react';
import Button from '../../components/Button';
import { Briefcase, Search, MapPin, Clock, Building, Bookmark, BookmarkCheck, Filter, ExternalLink, Sparkles, Globe, GraduationCap, Landmark, Users, Wifi } from 'lucide-react';

const JobPortal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('search');

  const filters = [
    { id: 'all', label: 'All Jobs', icon: Briefcase },
    { id: 'internship', label: 'Internships', icon: GraduationCap },
    { id: 'remote', label: 'Remote', icon: Wifi },
    { id: 'government', label: 'Government', icon: Landmark },
    { id: 'campus', label: 'Campus', icon: Building },
    { id: 'referral', label: 'Referral', icon: Users },
  ];

  const sampleJobs = [
    { id: 1, title: 'Frontend Developer', company: 'Google', location: 'Bangalore', type: 'Full-time', salary: '18-25 LPA', match: 92, posted: '2 days ago', tags: ['React', 'TypeScript', 'CSS'], category: 'all' },
    { id: 2, title: 'React Intern', company: 'Microsoft', location: 'Hyderabad', type: 'Internship', salary: '40K/month', match: 88, posted: '1 day ago', tags: ['React', 'JavaScript'], category: 'internship' },
    { id: 3, title: 'Full Stack Developer', company: 'Flipkart', location: 'Remote', type: 'Remote', salary: '15-20 LPA', match: 85, posted: '3 days ago', tags: ['Node.js', 'React', 'MongoDB'], category: 'remote' },
    { id: 4, title: 'Software Engineer', company: 'TCS', location: 'Mumbai', type: 'Campus', salary: '7-9 LPA', match: 78, posted: '5 days ago', tags: ['Java', 'SQL', 'DSA'], category: 'campus' },
    { id: 5, title: 'Backend Developer', company: 'Amazon', location: 'Bangalore', type: 'Full-time', salary: '22-30 LPA', match: 74, posted: '1 week ago', tags: ['Node.js', 'AWS', 'Docker'], category: 'all' },
    { id: 6, title: 'Python Developer', company: 'ISRO', location: 'Ahmedabad', type: 'Government', salary: '12 LPA', match: 65, posted: '3 days ago', tags: ['Python', 'ML', 'Data'], category: 'government' },
    { id: 7, title: 'SDE Intern', company: 'Razorpay', location: 'Bangalore', type: 'Internship', salary: '50K/month', match: 90, posted: '6 hours ago', tags: ['Go', 'React', 'PostgreSQL'], category: 'internship' },
    { id: 8, title: 'DevOps Engineer', company: 'Zomato', location: 'Remote', type: 'Remote', salary: '16-22 LPA', match: 60, posted: '4 days ago', tags: ['Docker', 'K8s', 'AWS'], category: 'remote' },
  ];

  const filteredJobs = sampleJobs.filter(j => {
    const matchesFilter = activeFilter === 'all' || j.category === activeFilter;
    const matchesSearch = !searchQuery || j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleSave = (id) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-blue-400" />
            Job Portal
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> AI Recommended
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Search jobs, internships, remote & campus placements — with AI match scoring</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('search')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'search' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'text-slate-400 border border-white/5 hover:bg-slate-800/60'}`}>Search</button>
          <button onClick={() => setActiveTab('saved')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'saved' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'text-slate-400 border border-white/5 hover:bg-slate-800/60'}`}>Saved ({savedJobs.length})</button>
          <button onClick={() => setActiveTab('applied')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'applied' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'text-slate-400 border border-white/5 hover:bg-slate-800/60'}`}>Applied</button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jobs, companies, skills..."
            className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/10 focus:border-blue-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeFilter === f.id ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60'}`}>
            <f.icon className="w-3.5 h-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Job Cards */}
      <div className="space-y-3">
        {(activeTab === 'saved' ? filteredJobs.filter(j => savedJobs.includes(j.id)) : filteredJobs).map(job => (
          <div key={job.id} className="liquid-glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-blue-500/20 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Building className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-200">{job.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{job.company} • {job.location} • {job.type}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.tags.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-[10px] text-slate-400 font-medium">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                job.match >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                job.match >= 60 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-slate-800 border-white/5 text-slate-400'}`}>
                {job.match}% Match
              </div>
              <span className="text-xs text-slate-500">{job.salary}</span>
              <div className="flex gap-1.5">
                <button onClick={() => toggleSave(job.id)} className={`p-1.5 rounded-lg transition-colors ${savedJobs.includes(job.id) ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400'}`}>
                  {savedJobs.includes(job.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[10px] text-slate-600">{job.posted}</span>
            </div>
          </div>
        ))}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No jobs found matching your criteria.</div>
        )}
      </div>
    </div>
  );
};

export default JobPortal;
