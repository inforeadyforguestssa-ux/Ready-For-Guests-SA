import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeSimple, ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAFAF7]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {!sent ? (
          <>
            <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Forgot Password
            </h2>
            <p className="text-[#4A6B6C] mb-8">
              Enter your email and we will send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Email</label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle size={64} className="text-[#0D7377] mx-auto mb-4" weight="fill" />
            <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Check your email</h2>
            <p className="text-[#4A6B6C]">If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
          </div>
        )}
        <div className="mt-8 text-center">
          <Link to="/login" className="text-[#4A6B6C] hover:text-[#0D7377] transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
