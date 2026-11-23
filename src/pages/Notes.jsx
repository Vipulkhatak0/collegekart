import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineArrowDownTray, HiOutlineDocumentText, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import api, { getErrorMessage } from '../lib/api.js';

const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
const types = [{ value: 'all', label: 'All resources' }, { value: 'notes', label: 'Notes' }, { value: 'pyq', label: 'Past papers' }, { value: 'study_material', label: 'Study material' }];

function formatSize(size) {
  if (!size) return '';
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [type, setType] = useState('all');
  const [college, setCollege] = useState('all');
  const [downloading, setDownloading] = useState('');

  useEffect(() => { api.get('/notes/colleges/list').then(r => setColleges(r.data.colleges || [])).catch(() => {}); }, []);

  const fetchNotes = useCallback(() => {
    setLoading(true); setError('');
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (semester) params.semester = semester;
    if (type !== 'all') params.type = type;
    if (college !== 'all') params.college = college;
    api.get('/notes', { params }).then(r => setNotes(r.data.notes || []))
      .catch(err => { setNotes([]); setError(getErrorMessage(err)); })
      .finally(() => setLoading(false));
  }, [search, semester, type, college]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const download = async (note) => {
    setDownloading(note._id);
    try {
      const response = await api.post(`/notes/${note._id}/download`, {}, { responseType: 'blob' });
      const disposition = response.headers['content-disposition'] || '';
      const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1];
      const filename = (encoded && decodeURIComponent(encoded)) || plain || note.fileName || `${note.title}.${note.fileType || 'file'}`;
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        try { const body = JSON.parse(await err.response.data.text()); toast.error(body.message || 'The file could not be downloaded.'); }
        catch { toast.error('The file could not be downloaded. Please try again.'); }
      } else toast.error(getErrorMessage(err));
    } finally { setDownloading(''); }
  };

  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-7">
      <div><p className="section-eyebrow">Student resources</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#142B4A]">Notes library</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#697586]">Find notes, past papers, and study material shared by students. Every free resource includes a direct download.</p></div>
      <Link to="/notes/upload" className="btn-primary">Upload a resource</Link>
    </div>

    <form onSubmit={(e) => { e.preventDefault(); setSearch(query); }} className="mt-6 grid gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto]">
      <label className="flex min-w-0 items-center gap-2 border border-slate-200 px-3 focus-within:border-[#3768A6]"><HiOutlineMagnifyingGlass className="h-5 w-5 shrink-0 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, subject, or course" className="h-11 w-full border-0 bg-transparent text-sm outline-none" aria-label="Search notes" /></label>
      <select value={college} onChange={e => setCollege(e.target.value)} className="input-field sm:w-52" aria-label="College filter"><option value="all">All colleges</option>{colleges.map(c => <option key={c} value={c}>{c}</option>)}</select>
      <select value={semester} onChange={e => setSemester(e.target.value)} className="input-field sm:w-44" aria-label="Semester filter"><option value="">All semesters</option>{semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}</select>
      <div className="flex flex-wrap gap-2 sm:col-span-3">{types.map(t => <button key={t.value} type="button" onClick={() => setType(t.value)} className={`border px-3.5 py-2 text-sm font-medium transition ${type === t.value ? 'border-[#142B4A] bg-[#142B4A] text-white' : 'border-slate-200 bg-white text-[#697586] hover:border-slate-400'}`}>{t.label}</button>)}</div>
    </form>

    <div className="mt-6 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#17212F]">{loading ? 'Loading resources…' : `${notes.length} ${notes.length === 1 ? 'resource' : 'resources'}`}</h2></div>
    {loading ? <div className="mt-4 grid gap-3" aria-live="polite">{[1,2,3].map(i => <div key={i} className="h-32 animate-pulse border border-slate-200 bg-white" />)}</div>
      : error ? <div role="alert" className="mt-4 border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error} <button className="ml-2 font-semibold underline" onClick={fetchNotes}>Try again</button></div>
      : notes.length === 0 ? <div className="mt-4 border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><HiOutlineDocumentText className="mx-auto h-8 w-8 text-slate-400"/><h3 className="mt-3 font-semibold text-[#17212F]">No resources found</h3><p className="mt-1 text-sm text-[#697586]">Try another search or filter, or share a resource with your college.</p><Link to="/notes/upload" className="mt-4 inline-block text-sm font-semibold text-[#3768A6]">Upload a resource</Link></div>
      : <div className="mt-4 divide-y divide-slate-200 border border-slate-200 bg-white">{notes.map(note => <article key={note._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:px-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center border border-slate-200 bg-[#F6F7F9] text-[#3768A6]"><HiOutlineDocumentText className="h-5 w-5"/></div>
        <div className="min-w-0 flex-1"><Link to={`/notes/${note._id}`} className="font-semibold text-[#17212F] hover:text-[#3768A6]">{note.title}</Link><p className="mt-1 text-sm text-[#697586]">{note.subject} · {note.course} · Semester {note.semester}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span>{(note.fileType || 'file').toUpperCase()}</span>{note.fileSize && <span>{formatSize(note.fileSize)}</span>}{note.createdAt && <span>Added {new Date(note.createdAt).toLocaleDateString()}</span>}<span>{note.college}</span></div></div>
        <div className="flex items-center gap-3 sm:shrink-0"><span className="text-xs font-medium uppercase text-slate-500">{note.type === 'pyq' ? 'Past paper' : note.type === 'study_material' ? 'Study material' : 'Notes'}</span>{note.price > 0 ? <Link to={`/notes/${note._id}`} className="border border-slate-300 px-4 py-2 text-sm font-semibold text-[#142B4A]">View details</Link> : <button type="button" onClick={() => download(note)} disabled={downloading === note._id} className="inline-flex items-center justify-center gap-2 border border-[#142B4A] px-4 py-2 text-sm font-semibold text-[#142B4A] hover:bg-[#142B4A] hover:text-white disabled:opacity-50"><HiOutlineArrowDownTray className="h-4 w-4"/>{downloading === note._id ? 'Downloading…' : 'Download'}</button>}</div>
      </article>)}</div>}
  </div>;
}
