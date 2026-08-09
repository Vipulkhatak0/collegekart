import { Link } from 'react-router-dom';

export default function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note._id}`}
      className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg transition flex flex-col"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-primary-400 text-xs font-semibold px-2.5 py-1 uppercase">
          {note.type === 'pyq' ? 'PYQ' : note.type === 'study_material' ? 'Material' : 'Notes'}
        </span>
        {note.price > 0 ? (
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">₹{note.price}</span>
        ) : (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
        )}
      </div>

      <h3 className="mt-3 font-display font-semibold text-sm text-slate-800 dark:text-white line-clamp-2">
        {note.title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{note.college}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {note.subject} · Sem {note.semester}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
        {note.downloadCount} downloads · by {note.uploader?.name}
      </p>
    </Link>
  );
}