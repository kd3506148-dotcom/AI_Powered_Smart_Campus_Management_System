import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, RefreshCw, Send } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

const initialForm = { title: '', description: '', category: 'Other', priority: 'Medium', location: '' };

export default function ComplaintsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadComplaints = async () => {
    setLoading(true);
    try { setComplaints((await api.get('/complaints')).data.complaints || []); }
    catch (error) { addToast(error.response?.data?.message || 'Could not load complaints', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadComplaints(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/complaints', form);
      setForm(initialForm); setShowForm(false); addToast('Complaint submitted successfully', 'success'); loadComplaints();
    } catch (error) { addToast(error.response?.data?.message || 'Could not submit complaint', 'error'); }
  };

  const update = async (id, status) => {
    try { await api.put(`/complaints/${id}`, { status }); addToast('Complaint updated', 'success'); loadComplaints(); }
    catch (error) { addToast(error.response?.data?.message || 'Could not update complaint', 'error'); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
      <div><p className="text-xs font-bold uppercase tracking-wider text-cyan-600">Phase 3</p><h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Complaints & Work Orders</h1><p className="text-sm text-slate-500 mt-1">Track campus issues from submission to resolution.</p></div>
      {user?.role === 'Student' && <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold"><Plus className="w-4 h-4" />New complaint</button>}
    </header>
    {showForm && <form onSubmit={submit} className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">{[['title','Title'],['location','Location']].map(([key,label]) => <label key={key} className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}<input required={key === 'title'} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-transparent px-3 py-2.5 text-sm" /></label>)}</div>
      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Description<textarea required value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows="4" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-transparent px-3 py-2.5 text-sm" /></label>
      <div className="grid sm:grid-cols-2 gap-4">{[['category',['Other','Hostel','Academic','Infrastructure','Mess/Canteen','Network/WiFi','Maintenance']],['priority',['Low','Medium','High','Urgent']]].map(([key, options]) => <label key={key} className="text-xs font-bold text-slate-600 dark:text-slate-300">{key}<select value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2.5 text-sm">{options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div>
      <button className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white"><Send className="w-4 h-4" />Submit complaint</button>
    </form>}
    <div className="flex justify-end"><button onClick={loadComplaints} className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600"><RefreshCw className="w-4 h-4" />Refresh</button></div>
    <section className="space-y-3">{loading ? <p className="text-sm text-slate-500">Loading complaints...</p> : complaints.length === 0 ? <p className="bg-white dark:bg-navy-900 rounded-2xl p-8 text-center text-sm text-slate-500">No complaints found.</p> : complaints.map(item => <article key={item._id} className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200 dark:border-navy-800"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"><div><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><h2 className="font-bold text-navy-900 dark:text-white">{item.title}</h2></div><p className="text-sm text-slate-500 mt-2">{item.description}</p><p className="text-xs text-slate-400 mt-2">{item.category} · {item.priority} · {item.location}</p></div><span className="rounded-full px-3 py-1 text-xs font-bold bg-cyan-500/10 text-cyan-700">{item.status}</span></div>{['Staff','Admin'].includes(user?.role) && item.status !== 'Resolved' && <button onClick={() => update(item._id, 'Resolved')} className="mt-4 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Mark resolved</button>}</article>)}</section>
  </div>;
}