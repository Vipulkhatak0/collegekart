import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCloudArrowUp, HiOutlineSparkles, HiOutlineCurrencyRupee, HiOutlineMapPin, HiOutlineXMark } from 'react-icons/hi2';
import { categories } from '../data/mockData.js';
import api, { getErrorMessage } from '../lib/api.js';
import useAuth from '../context/AuthContext.jsx';
import { getCurrentPosition, reverseGeocode } from '../lib/geo.js';

export default function SellProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.hostel || '');
  const [coords, setCoords] = useState(null);
  const [allowCOD, setAllowCOD] = useState(true);
  const [files, setFiles] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generateDescription = async () => {
    if (!title) return toast.error('Add a product title first.');
    setGenerating(true);
    try {
      const { data } = await api.post('/products/ai/description', { title, category, condition });
      setDescription(data.description);
      toast.success('AI description generated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const suggestPrice = async () => {
    if (!category) return toast.error('Select a category first.');
    try {
      const { data } = await api.post('/products/ai/price-suggestion', { category });
      setPrice(String(data.suggestedPrice));
      toast.success(`Suggested price based on similar listings: ₹${data.suggestedPrice.toLocaleString()}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

 const useMyLocation = async () => {
  setLocating(true);
  try {
    const pos = await getCurrentPosition();
    setCoords(pos);
    const placeName = await reverseGeocode(pos.lat, pos.lng);
    if (placeName) setAddress(placeName);
    toast.success('Location captured! Buyers nearby will see this listing first.');
  } catch {
    toast.error('Could not access your location. You can still enter an address manually.');
  } finally {
    setLocating(false);
  }
};

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 6);
    setFiles(selected);
  };

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.error('Add at least one photo.');
    if (!phone.trim()) return toast.error('A contact phone number is required, .');
    if (!address.trim()) return toast.error('Add your pickup location / hostel block.');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('condition', condition);
      formData.append('allowCOD', allowCOD);
      formData.append('phone', phone);
      formData.append('address', address);
      if (coords) { formData.append('lat', coords.lat); formData.append('lng', coords.lng); }
      files.forEach((f) => formData.append('images', f));

      const { data } = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing published!');
      navigate(`/product/${data.product._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <span className="section-eyebrow">List your item</span>
      <h1 className="mt-2 font-display text-2xl font-bold">Sell a Product</h1>

      <form onSubmit={handleSubmit} className="glass-card mt-8 space-y-5 p-6">
        <div>
          <label className="text-sm font-medium">Product Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. TI-84 Plus Calculator" className="input-field mt-1.5" required />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
         <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field mt-1.5" style={{ colorScheme: 'dark light' }} required>
            <option value="" disabled>Select a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Condition</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input-field mt-1.5" style={{ colorScheme: 'dark light' }}>
            <option>Like New</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium">
            Description
            <button type="button" onClick={generateDescription} className="flex items-center gap-1 text-xs font-semibold text-primary-500">
              <HiOutlineSparkles className="h-3.5 w-3.5" /> {generating ? 'Generating...' : 'AI Generate'}
            </button>
          </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the condition, usage, and why it's worth buying..." className="input-field mt-1.5" required />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium">
            Price (₹)
            <button type="button" onClick={suggestPrice} className="flex items-center gap-1 text-xs font-semibold text-primary-500">
              <HiOutlineCurrencyRupee className="h-3.5 w-3.5" /> AI Suggest
            </button>
          </label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="1" placeholder="1500" className="input-field mt-1.5" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Contact Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" className="input-field mt-1.5" required />
            <p className="mt-1 text-[11px] text-slate-400">Shown on your listing so buyers can call or WhatsApp you — just like OLX.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Pickup Location / Hostel</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Block C Hostel, Main Campus" className="input-field mt-1.5" required />
          </div>
        </div>

        <div>
  <button type="button" onClick={useMyLocation} disabled={locating} className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 disabled:opacity-60">
    <HiOutlineMapPin className="h-4 w-4" /> {locating ? 'Locating...' : coords ? 'Location pinned ✓' : 'Use my current location'}
  </button>
  <p className="mt-1 text-[11px] text-slate-400">Pinning your exact location lets nearby students find this in "Near Me" search.</p>

  {coords && (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      <iframe
        title="Your pinned location"
        width="100%"
        height="180"
        style={{ border: 0 }}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.01}%2C${coords.lat - 0.01}%2C${coords.lng + 0.01}%2C${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
      />
    </div>
  )}
</div>

        <div>
          <label className="text-sm font-medium">Photos</label>
          <label className="mt-1.5 flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:border-primary-400">
            <HiOutlineCloudArrowUp className="h-6 w-6" />
            <span className="text-xs">Click or drag to upload up to 6 images</span>
            <input type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
          </label>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white">
                    <HiOutlineXMark className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-brand-gradient-soft p-3">
          <input type="checkbox" id="cod" checked={allowCOD} onChange={(e) => setAllowCOD(e.target.checked)} className="h-4 w-4 accent-primary-500" />
          <label htmlFor="cod" className="text-xs text-slate-600 dark:text-slate-300">Allow Cash on Delivery / campus meet-up</label>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {submitting ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}
