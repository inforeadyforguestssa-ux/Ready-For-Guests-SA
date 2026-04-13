import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAFAF7]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {done ? (
          <div className="text-center">
            <CheckCircle size={64} className="text-[#0D7377] mx-auto mb-4" weight="fill" />
            <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Password Updated!</h2>
            <p className="text-[#4A6B6C]">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Set New Password</h2>
            <p className="text-[#4A6B6C] mb-8">Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0A2A2B] mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                    placeholder="Min. 6 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]">
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                  <input type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                    placeholder="Repeat password" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </>
        )}
        <div className="mt-8 text-center">
          <Link to="/login" className="text-[#4A6B6C] hover:text-[#0D7377] transition-colors text-sm">Back to Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
