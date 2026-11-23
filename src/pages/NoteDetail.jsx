import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";
import AdUnit from "../components/AdUnit.jsx";

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
      const res = await api.post(`/notes/${id}/download`, {}, { responseType: "blob" });
      const disposition = res.headers["content-disposition"] || "";
      const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1];
      const filename = (encoded && decodeURIComponent(encoded)) || plain || note.fileName || `${note.title}.${note.fileType || "file"}`;
      const url = URL.createObjectURL(res.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        try { toast.error(JSON.parse(await err.response.data.text()).message || "The file could not be downloaded."); }
        catch { toast.error("The file could not be downloaded. Please try again."); }
      } else toast.error(getErrorMessage(err));
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

      <div className="mt-4 border border-slate-200 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-surface-darkCard">
        <div className="flex items-center justify-between">
          <span className="border border-slate-200 bg-[#F6F7F9] px-2.5 py-1 text-xs font-semibold uppercase text-[#3768A6] dark:border-white/10 dark:bg-white/10 dark:text-primary-400">
            {note.type === "pyq" ? "PYQ" : note.type === "study_material" ? "Material" : "Notes"}
          </span>
          {note.price > 0 ? (
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">₹{note.price}</span>
          ) : (
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
          )}
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-[#17212F] dark:text-white">
          {note.title}
        </h1>
        {note.description && (
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{note.description}</p>
        )}

        <p className="mt-5 text-sm font-medium text-[#17212F] dark:text-white">{note.subject} · {note.course} · Semester {note.semester}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{note.college}</p>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          {(note.fileType || "file").toUpperCase()}{note.fileSize ? ` · ${(note.fileSize / 1024 / 1024).toFixed(1)} MB` : ""} · Uploaded by {note.uploader?.name}
        </p>

        {note.price > 0 ? (
          <button
            disabled
            className="mt-6 w-full cursor-not-allowed border border-slate-200 bg-slate-100 py-3 font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-400"
          >
            Paid downloads coming soon
          </button>
        ) : (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary mt-6 w-full disabled:opacity-50"
          >
            {downloading ? "Downloading…" : "Download file"}
          </button>
        )}
      </div>

      <div className="mt-6">
        <AdUnit slot="5638179916" />
      </div>
    </div>
  );
}
