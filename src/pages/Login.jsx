import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import useAuth from '../context/AuthContext.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import { getErrorMessage } from '../lib/api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
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
          <h1 className="mt-4 font-display text-xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Login with your campus email</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu" className="input-field !pl-10" required
            />
          </div>

          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" className="input-field !pl-10" required
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs font-semibold text-primary-500">Forgot password?</Link>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" /> or <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        <GoogleButton onSuccess={() => navigate(from, { replace: true })} />

        <p className="mt-6 text-center text-sm text-slate-400">
          New to CollegeKart? <Link to="/register" className="font-semibold text-primary-500">Create an account</Link>
        </p>
      </div>
    </div>
  );
}