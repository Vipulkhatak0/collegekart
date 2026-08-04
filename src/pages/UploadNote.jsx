import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";
import useAuth from "../context/AuthContext.jsx";

export default function UploadNote() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", description: "", type: "notes", subject: "", course: "", semester: "1", price: "0",
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (user && !user.college) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          Please add your college name to your profile before uploading.
        </p>
        <button
          onClick={() => navigate("/profile")}
          className="mt-4 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("file", file);

      const res = await api.post("/notes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Uploaded!");
      navigate(`/notes/${res.data.note._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-1">
        Upload to Library
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Uploading as {user?.name} · {user?.college}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Title (e.g. 'Data Structures Unit 3 Notes')"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          rows={3}
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
        >
          <option value="notes">Notes</option>
          <option value="pyq">PYQ Paper</option>
          <option value="study_material">Study Material</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Subject (e.g. 'Data Structures')"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
            required
          />
          <input
            placeholder="Course (e.g. 'B.Tech CSE')"
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            placeholder="Price (0 = free)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5">
            File (PDF, Word doc, or image — max 15MB)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm dark:text-slate-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-gradient text-white py-3 font-semibold disabled:opacity-50"
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}