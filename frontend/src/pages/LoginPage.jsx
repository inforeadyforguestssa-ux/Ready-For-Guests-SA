import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeSimple, Lock, ArrowRight, Eye, EyeSlash } from '@phosphor-icons/react';
import { useAuth, formatApiErrorDetail } from '../App';
import { toast } from 'sonner';

const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/nkyi7qj0_WhatsApp%20Image%202026-04-05%20at%208.07.29%20PM.jpeg";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/app');
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={HERO_IMAGE} 
          alt="Ready for Guests" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D7377]/80 to-transparent" />
        <div className="relative z-10 p-12 flex flex-col justify-end">
          <h1 className="text-4xl font-semibold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome Back
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Access your dashboard to manage bookings, track jobs, and keep your properties guest-ready.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#FAFAF7]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img 
              src={HERO_IMAGE} 
              alt="Ready for Guests" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-semibold text-[#0D7377] text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ready for Guests
            </span>
          </Link>

          <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Sign In
          </h2>
          <p className="text-[#4A6B6C] mb-8">
            Enter your credentials to access your account
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Email</label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <input
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
            <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A6B6C] hover:text-[#0D7377]"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-4"><Link to="/forgot-password" className="text-sm text-[#0D7377] hover:underline">Forgot password?</Link></div>
            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight weight="bold" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#4A6B6C]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#0D7377] font-medium hover:underline" data-testid="register-link">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-[#4A6B6C] hover:text-[#0D7377] transition-colors">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
