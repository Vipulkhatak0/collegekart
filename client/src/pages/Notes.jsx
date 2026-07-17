import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
const types = [
  { value: "all", label: "All" },
  { value: "notes", label: "Notes" },
  { value: "pyq", label: "PYQ Papers" },
  { value: "study_material", label: "Study Material" },
];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("all");
  const [college, setCollege] = useState("all");

  useEffect(() => {
    api.get("/notes/colleges/list")
      .then((res) => setColleges(res.data.colleges || []))
      .catch(() => {});
  }, []);

  const fetchNotes = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (semester) params.semester = semester;
    if (type !== "all") params.type = type;
    if (college !== "all") params.college = college;

    api.get("/notes", { params })
      .then((res) => setNotes(res.data.notes || []))
      .catch((err) => console.error("Failed to load notes:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotes(); }, [semester, type, college]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
            Study Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Notes, PYQ papers, and study material — by college, subject, and semester.
          </p>
        </div>
        <Link
          to="/notes/upload"
          className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Upload
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 flex-wrap mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, subject, or course..."
          className="flex-1 min-w-[200px] rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 text-sm outline-none"
        />
        <button type="submit" className="rounded-full bg-primary-500 text-white px-5 py-2 text-sm font-semibold">
          Search
        </button>
      </form>

      <div className="flex gap-3 flex-wrap mb-4">
        <select
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          className="rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 text-sm"
        >
          <option value="all">All Colleges</option>
          {colleges.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 text-sm"
        >
          <option value="">All Semesters</option>
          {semesters.map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              type === t.value
                ? "bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-primary-400"
                : "text-slate-600 hover:text-primary-500 dark:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No material found. Be the first to upload!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Link
              key={note._id}
              to={`/notes/${note._id}`}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 uppercase">
                  {note.type === "pyq" ? "PYQ" : note.type === "study_material" ? "Material" : "Notes"}
                </span>
                {note.price > 0 ? (
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">₹{note.price}</span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                )}
              </div>
              <h3 className="mt-3 font-display font-semibold text-slate-800 dark:text-white line-clamp-2">
                {note.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{note.college}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {note.subject} · {note.course} · Sem {note.semester}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                {note.downloadCount} downloads · by {note.uploader?.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}