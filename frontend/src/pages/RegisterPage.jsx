import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeSimple, Lock, User, Phone, ArrowRight, Eye, EyeSlash, Users } from '@phosphor-icons/react';
import { useAuth, formatApiErrorDetail } from '../App';
import { toast } from 'sonner';

const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/nkyi7qj0_WhatsApp%20Image%202026-04-05%20at%208.07.29%20PM.jpeg";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      const data = await register(userData);
      toast.success(`Welcome, ${data.name}! Account created successfully.`);
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
            Join Ready for Guests
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Create your account to book professional cleaning services for your holiday property on the Hibiscus Coast.
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
            Create Account
          </h2>
          <p className="text-[#4A6B6C] mb-8">
            Fill in your details to get started
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6" data-testid="register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <input
                  data-testid="register-name-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Email</label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <input
                  data-testid="register-email-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <input
                  data-testid="register-phone-input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                  placeholder="072 123 4567"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">I am registering as a</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <select
                  data-testid="register-role-select"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all appearance-none"
                >
                  <option value="client">Property Owner / Client</option>
                  <option value="team">Cleaning Team Member</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <input
                  data-testid="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
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

            <div>
              <label className="block text-sm font-medium text-[#0A2A2B] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A6B6C]" size={20} />
                <input
                  data-testid="register-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E0D8] bg-white focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              data-testid="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight weight="bold" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#4A6B6C]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0D7377] font-medium hover:underline" data-testid="login-link">
                Sign In
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

export default RegisterPage;
