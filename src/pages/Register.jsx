import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed } from 'react-icons/hi2';
import useAuth from '../context/AuthContext.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import api, { getErrorMessage } from '../lib/api.js';

export default function Register() {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', hostel: '', college: '' });
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users/colleges/list')
      .then((res) => setCollegeOptions(res.data.colleges || []))
      .catch(() => {});
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { userId: id } = await register(form);
      setUserId(id);
      toast.success('Verification OTP sent to your email!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await verifyOtp({ userId, otp });
      toast.success('Account verified! Welcome to CollegeKart.');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 sm:px-6 py-10">
      <div className="glass-card w-full p-8">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient font-display text-xl font-bold text-white">C</span>
          <h1 className="mt-4 font-display text-xl font-bold">{userId ? 'Verify your email' : 'Create your account'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {userId ? `Enter the code sent to ${form.email}` : 'Join thousands of verified students'}
          </p>
        </div>

        {!userId ? (
          <>
            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <input value={form.name} onChange={update('name')} placeholder="Full Name" className="input-field" required />
              
              <input
                value={form.college}
                onChange={update('college')}
                placeholder="College Name"
                className="input-field"
                list="college-options"
                required
              />
              <datalist id="college-options">
                {collegeOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              <input type="email" value={form.email} onChange={update('email')} placeholder="Campus Email" className="input-field" required />
              <input type="password" value={form.password} onChange={update('password')} placeholder="Password" className="input-field" required minLength={6} />
              <input value={form.hostel} onChange={update('hostel')} placeholder="Hostel / Block (optional)" className="input-field" />
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" /> or <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <GoogleButton onSuccess={() => navigate('/')} />

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account? <Link to="/login" className="font-semibold text-primary-500">Login</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={otp} onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP" className="input-field !pl-10" maxLength={6} required
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}