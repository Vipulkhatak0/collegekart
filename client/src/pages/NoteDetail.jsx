import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get(`/notes/${id}`)
      .then((res) => setNote(res.data.note))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.post(`/notes/${id}/download`);
      window.open(res.data.fileUrl, "_blank");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!note) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Note not found.</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/notes" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500">
        ← Back to Library
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 uppercase">
            {note.type === "pyq" ? "PYQ" : note.type === "study_material" ? "Material" : "Notes"}
          </span>
          {note.price > 0 ? (
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">₹{note.price}</span>
          ) : (
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
          )}
        </div>

        <h1 className="mt-3 font-display text-xl font-bold text-slate-800 dark:text-white">
          {note.title}
        </h1>
        {note.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{note.description}</p>
        )}

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">{note.college}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {note.subject} · {note.course} · Semester {note.semester}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Uploaded by {note.uploader?.name} · {note.downloadCount} downloads
        </p>

        {note.price > 0 ? (
          <button
            disabled
            className="mt-6 w-full rounded-full bg-slate-300 dark:bg-white/10 text-slate-500 dark:text-slate-400 py-3 font-semibold cursor-not-allowed"
          >
            Paid downloads coming soon
          </button>
        ) : (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-6 w-full rounded-full bg-brand-gradient text-white py-3 font-semibold disabled:opacity-50"
          >
            {downloading ? "Preparing..." : "Download Free"}
          </button>
        )}
      </div>
    </div>
  );
}