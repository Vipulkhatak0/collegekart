import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import useAuth from '../context/AuthContext.jsx';
import { getErrorMessage } from '../lib/api.js';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await forgotPassword(email);
      if (data.userId) {
        setUserId(data.userId);
        toast.success('OTP sent! Check your email.');
      } else {
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword({ userId, otp, newPassword });
      toast.success('Password reset! You are now logged in.');
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
          <h1 className="mt-4 font-display text-xl font-bold">{userId ? 'Reset your password' : 'Forgot password'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {userId ? `Enter the OTP sent to ${email} and your new password` : 'Enter your email to receive a reset code'}
          </p>
        </div>

        {!userId ? (
          <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu" className="input-field !pl-10" required
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <input
              value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP" className="input-field" maxLength={6} required
            />
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password" className="input-field !pl-10" required minLength={6}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          Remembered your password? <Link to="/login" className="font-semibold text-primary-500">Login</Link>
        </p>
      </div>
    </div>
  );
}