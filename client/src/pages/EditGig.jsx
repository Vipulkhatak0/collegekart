import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api.js";

export default function EditGig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/gigs/${id}`)
      .then((res) => {
        const g = res.data.gig;
        setForm({
          title: g.title,
          description: g.description,
          category: g.category,
          price: g.price,
          deliveryDays: g.deliveryDays,
        });
        setExistingImages(g.portfolioImages || []);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [id]);

  const handleRemoveExisting = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalSlotsLeft = 4 - (existingImages.length + newFiles.length);
    
    if (files.length > totalSlotsLeft) {
      toast.error(`You can only upload a maximum of 4 images total.`);
      return;
    }
    setNewFiles([...newFiles, ...files]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("deliveryDays", form.deliveryDays);
      formData.append("keepImages", JSON.stringify(existingImages));

      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      await api.put(`/gigs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Gig updated!");
      navigate(`/gigs/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">Loading...</div>;

  const totalImagesCount = existingImages.length + newFiles.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Edit Gig
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white capitalize"
          >
            <option value="assignment">Assignment</option>
            <option value="project">Project</option>
            <option value="presentation">Presentation</option>
            <option value="typing">Typing</option>
            <option value="design">Design</option>
            <option value="coding">Coding</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Price (₹)</label>
            <input
              type="number"
              min="0"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Delivery Days</label>
            <input
              type="number"
              min="1"
              placeholder="Delivery days"
              value={form.deliveryDays}
              onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 dark:bg-white/5 dark:border-white/10 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Portfolio Images Management Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Portfolio Images (Max 4)
          </label>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {/* Existing Cloudinary Images */}
            {existingImages.map((imgUrl, index) => (
              <div key={`existing-${index}`} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 h-20">
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(index)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Newly Selected Local Files */}
            {newFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative group rounded-xl overflow-hidden border border-primary-400 h-20">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewFile(index)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {totalImagesCount < 4 && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 dark:file:bg-white/10 dark:file:text-white"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-gradient text-white py-3 font-semibold disabled:opacity-50 mt-4"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}