import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiCheckBadge, HiOutlineCamera } from 'react-icons/hi2';
import useAuth from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [college, setCollege] = useState(user?.college || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { name, phone, hostel, college });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold">Profile Settings</h1>

      <div className="glass-card mt-8 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-gradient font-display text-2xl font-bold text-white overflow-hidden">
              {user?.avatar ? <img src={user.avatar} className="h-20 w-20 object-cover" alt="" /> : user?.name?.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-white" title="Avatar upload coming soon"><HiOutlineCamera className="h-3.5 w-3.5" /></button>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-semibold">{user?.name} {user?.isSellerVerified && <HiCheckBadge className="h-4 w-4 text-primary-500" />}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Campus Email</label>
            <input value={user?.email || ''} className="input-field mt-1.5" disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="input-field mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Hostel / Block</label>
            <input value={hostel} onChange={(e) => setHostel(e.target.value)} placeholder="Block C" className="input-field mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">College Name</label>
            <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. XYZ Institute of Technology" className="input-field mt-1.5" />
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-primary mt-6 disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );
}