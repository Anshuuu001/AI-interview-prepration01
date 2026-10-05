import React, { useState } from 'react';
import Button from '../../components/Button';
import { Calendar, Clock, Bell, CheckSquare, ChevronLeft, ChevronRight, Plus, Trash2, Sparkles, Timer } from 'lucide-react';

const InterviewScheduler = () => {
  const [events, setEvents] = useState([
    { id: 1, title: 'Google Interview - Round 1', date: '2026-07-25', time: '10:00', type: 'interview', checklist: ['Review system design', 'Practice coding', 'Prepare questions'] },
    { id: 2, title: 'Mock Interview Practice', date: '2026-07-23', time: '14:00', type: 'practice', checklist: ['Record answers', 'Review feedback'] },
  ]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'interview' });
  const [showAdd, setShowAdd] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setEvents(prev => [...prev, { ...newEvent, id: Date.now(), checklist: [] }]);
    setNewEvent({ title: '', date: '', time: '', type: 'interview' }); setShowAdd(false);
  };

  const removeEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDay = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = getDaysInMonth(currentMonth);
  const firstDay = getFirstDay(currentMonth);
  const today = new Date();

  const getCountdown = (date, time) => {
    const target = new Date(`${date}T${time || '00:00'}`);
    const diff = target - new Date();
    if (diff <= 0) return 'Past';
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-orange-400" /> Interview Scheduler
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Schedule interviews, set reminders, and track preparation checklists</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} icon={Plus} size="sm">Add Event</Button>
      </div>

      {showAdd && (
        <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Interview title..."
              className="px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none sm:col-span-2" />
            <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
              className="px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none" />
            <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
              className="px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none" />
          </div>
          <Button onClick={addEvent} size="sm" icon={Plus}>Save Event</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 liquid-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-200">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[10px] font-bold text-slate-600 py-2">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEvent = events.some(e => e.date === dateStr);
              const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
              return (
                <div key={day} className={`py-2.5 rounded-xl text-xs font-medium transition-colors cursor-default ${
                  isToday ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                  hasEvent ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20' :
                  'text-slate-400 hover:bg-slate-800/40'}`}>
                  {day}
                  {hasEvent && <div className="w-1 h-1 rounded-full bg-orange-400 mx-auto mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Bell className="w-4 h-4 text-orange-400" /> Upcoming</h3>
          {events.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => (
            <div key={event.id} className="liquid-glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-xs font-bold text-slate-200">{event.title}</h4>
                <button onClick={() => removeEvent(event.id)} className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
                <span className="flex items-center gap-1 text-orange-400 font-bold"><Timer className="w-3 h-3" />{getCountdown(event.date, event.time)}</span>
              </div>
              {event.checklist && event.checklist.length > 0 && (
                <div className="space-y-1 mt-1">
                  {event.checklist.map((item, i) => (
                    <label key={i} className="flex items-center gap-2 text-[10px] text-slate-400 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-600 accent-indigo-500" />
                      {item}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;
