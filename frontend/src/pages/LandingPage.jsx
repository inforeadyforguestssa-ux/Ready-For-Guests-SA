import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SprayBottle, 
  Wind, 
  House,
  Key, 
  Phone, 
  EnvelopeSimple,
  WhatsappLogo,
  CheckCircle,
  Star,
  ArrowRight,
  List,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkle,
  Users,
  CalendarCheck,
  FileText,
  DeviceMobile,
  DownloadSimple
} from '@phosphor-icons/react';
import { useAuth } from '../App';

const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/cy96c4t5_WhatsApp%20Image%202026-04-05%20at%208.07.230PM.jpeg";
const WHATSAPP_LINK = "https://wa.me/27721953829?text=Hi%20Sandra%20I%20would%20like%20to%20book%20a%20service";

// Service images
const SERVICE_IMAGES = {
  cleaning: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/dqzk7ftf_image.png",
  freshAir: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/2025j6sv_image.png",
  guestReady: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/rttjhfa4_image.png",
  keyholding: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/0gsmuiu2_image.png"
};

// Gallery images
const GALLERY_IMAGES = [
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/dqzk7ftf_image.png", label: "Executive Suite" },
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/2025j6sv_image.png", label: "Classic Room" },
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/rttjhfa4_image.png", label: "Guest Room" },
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/0gsmuiu2_image.png", label: "Suite" },
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/corvwj0t_image.png", label: "Modern Kitchen" },
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/yookw7li_image.png", label: "Kitchenette" },
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/gza0caf2_image.png", label: "Master Bedroom" },
  { url: "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/zjarfzrp_image.png", label: "Luxury Room" }
];

const SERVICE_AREAS = [
  "Margate", "Ramsgate", "Shelly Beach", "St Michael's On Sea", 
  "Oslo Beach", "Uvongo", "Umtentweni", "Port Shepstone", "Port Edward"
];

const SERVICES_DATA = [
  {
    icon: SprayBottle,
    title: "Professional Cleaning",
    subtitle: "Sparkling Clean Homes",
    description: "From quick touch-ups to deep cleans, we ensure your property sparkles for every guest arrival.",
    features: ["Daily & Weekly Cleaning", "Deep Clean Services", "Pre & Post Holiday Clean", "Spring Clean Specials"],
    image: SERVICE_IMAGES.cleaning
  },
  {
    icon: Wind,
    title: "Fresh Air Property Care",
    subtitle: "Dehumidify & Refresh",
    description: "Keep your coastal property fresh and free from dampness with our professional dehumidifying service.",
    features: ["Mould Prevention", "Air Quality Control", "Humidity Management", "Odour Elimination"],
    image: SERVICE_IMAGES.freshAir
  },
  {
    icon: House,
    title: "Guest Ready Setups",
    subtitle: "Perfect Arrivals",
    description: "We prepare your property with fresh linens, welcome amenities, and those special finishing touches.",
    features: ["Fresh Linen Setup", "Welcome Packs", "Final Touches", "Quality Checks"],
    image: SERVICE_IMAGES.guestReady
  },
  {
    icon: Key,
    title: "Full Keyholding Service",
    subtitle: "Trusted & Reliable",
    description: "Secure key management and property access for hassle-free guest check-ins and maintenance visits.",
    features: ["Secure Key Storage", "Guest Check-ins", "Emergency Access", "Property Monitoring"],
    image: SERVICE_IMAGES.keyholding
  }
];

const REVIEWS = [
  { name: "Sarah M.", location: "Margate", text: "Sandra and her team are amazing! My Airbnb has never looked better. Highly recommend!", rating: 5 },
  { name: "John D.", location: "Uvongo", text: "Reliable, professional, and always on time. The best cleaning service on the coast!", rating: 5 },
  { name: "Lisa K.", location: "Ramsgate", text: "The Glow Up Spa service transformed my holiday home completely. Worth every rand!", rating: 5 },
  { name: "Mike P.", location: "Shelly Beach", text: "Peace of mind knowing my property is in good hands. Excellent communication too.", rating: 5 }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // PWA Install Prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // If no install prompt, show instructions
      alert('To install: On your phone browser, tap the menu (⋮ or ⋯) and select "Add to Home Screen" or "Install App"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleNavigateToApp = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F3] to-white">
      
      {/* ==================== NAVIGATION ==================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D7377]/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <House weight="fill" className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Ready for Guests</p>
                <p className="text-[#D4AF37] text-xs tracking-widest">PROPERTY SERVICES</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('services')} className="text-white/90 hover:text-white transition-colors font-medium">Services</button>
              <button onClick={() => scrollToSection('gallery')} className="text-white/90 hover:text-white transition-colors font-medium">Gallery</button>
              <button onClick={() => scrollToSection('areas')} className="text-white/90 hover:text-white transition-colors font-medium">Areas</button>
              <button onClick={() => scrollToSection('reviews')} className="text-white/90 hover:text-white transition-colors font-medium">Reviews</button>
              <Link to="/terms" className="text-white/90 hover:text-white transition-colors font-medium">Terms</Link>
              <button onClick={() => scrollToSection('contact')} className="text-white/90 hover:text-white transition-colors font-medium">Contact</button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={handleInstallApp}
                className="hidden lg:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-full text-sm transition-all border border-white/30"
              >
                <DownloadSimple weight="bold" size={18} />
                Get App
              </button>
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold px-4 py-2 rounded-full text-sm transition-all"
              >
                <WhatsappLogo weight="fill" size={20} />
                Book Now
              </a>
              <button 
                onClick={handleNavigateToApp}
                className="bg-[#D4AF37] hover:bg-[#B5952F] text-white font-semibold px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2"
              >
                <DeviceMobile weight="fill" size={18} className="hidden sm:block" />
                {user ? 'Dashboard' : 'Use App'}
              </button>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X size={28} /> : <List size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A5A5D] border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-3">
                <button onClick={() => scrollToSection('services')} className="block w-full text-left text-white py-2">Services</button>
                <button onClick={() => scrollToSection('gallery')} className="block w-full text-left text-white py-2">Gallery</button>
                <button onClick={() => scrollToSection('areas')} className="block w-full text-left text-white py-2">Areas</button>
                <button onClick={() => scrollToSection('reviews')} className="block w-full text-left text-white py-2">Reviews</button>
                <Link to="/terms" className="block w-full text-left text-white py-2">Terms & Conditions</Link>
                <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-white py-2">Contact</button>
                
                <div className="pt-4 space-y-3 border-t border-white/20">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); handleInstallApp(); }}
                    className="flex items-center justify-center gap-2 bg-white/20 text-white font-semibold px-4 py-3 rounded-full w-full"
                  >
                    <DownloadSimple weight="bold" size={24} />
                    Download App to Phone
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); handleNavigateToApp(); }}
                    className="flex items-center justify-center gap-2 bg-[#D4AF37] text-white font-semibold px-4 py-3 rounded-full w-full"
                  >
                    <DeviceMobile weight="fill" size={24} />
                    Use Our App
                  </button>
                  <a 
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-4 py-3 rounded-full w-full"
                  >
                    <WhatsappLogo weight="fill" size={24} />
                    Book on WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==================== INSTALL APP BANNER ==================== */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-20 left-4 right-4 z-40 bg-white rounded-2xl shadow-2xl p-4 border-2 border-[#D4AF37] md:left-auto md:right-4 md:w-80"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-[#0D7377] rounded-xl flex items-center justify-center flex-shrink-0">
                <DownloadSimple weight="bold" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#0A2A2B]">Install Our App</h3>
                <p className="text-sm text-[#4A6B6C]">Add to your home screen for quick access</p>
              </div>
              <button onClick={() => setShowInstallBanner(false)} className="text-[#4A6B6C]">
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleInstallApp}
                className="flex-1 bg-[#0D7377] text-white font-semibold py-2 rounded-full text-sm"
              >
                Install
              </button>
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="flex-1 bg-gray-100 text-[#4A6B6C] font-semibold py-2 rounded-full text-sm"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-20 sm:pt-24">
        {/* Hero Image as Background */}
        <div className="relative">
          <img 
            src={HERO_IMAGE} 
            alt="Ready for Guests Property Services" 
            className="w-full h-auto"
          />
          {/* Overlay for mobile readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:hidden" />
        </div>
        
        {/* Floating CTA on Mobile */}
        <div className="md:hidden absolute bottom-4 left-4 right-4">
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="hero-whatsapp-mobile"
            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold px-6 py-4 rounded-full text-lg shadow-2xl w-full"
          >
            <WhatsappLogo weight="fill" size={28} />
            Book Now on WhatsApp
          </a>
        </div>
      </section>

      {/* ==================== QUICK ACTIONS ==================== */}
      <section className="py-8 bg-[#0D7377]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl p-4 transition-all group"
            >
              <WhatsappLogo weight="fill" size={32} className="text-[#25D366]" />
              <span className="text-white font-medium text-center text-sm">Book on WhatsApp</span>
            </a>
            <button 
              onClick={() => scrollToSection('services')}
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl p-4 transition-all"
            >
              <SprayBottle weight="duotone" size={32} className="text-[#D4AF37]" />
              <span className="text-white font-medium text-center text-sm">Our Services</span>
            </button>
            <button 
              onClick={handleNavigateToApp}
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl p-4 transition-all"
            >
              <CalendarCheck weight="duotone" size={32} className="text-[#D4AF37]" />
              <span className="text-white font-medium text-center text-sm">Book Online</span>
            </button>
            <a 
              href="tel:0721953829"
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl p-4 transition-all"
            >
              <Phone weight="fill" size={32} className="text-[#D4AF37]" />
              <span className="text-white font-medium text-center text-sm">Call Sandra</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== TRUST BADGES ==================== */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#E8F4F3] rounded-full flex items-center justify-center">
                <ShieldCheck weight="duotone" size={36} className="text-[#0D7377]" />
              </div>
              <h3 className="font-semibold text-[#0A2A2B]">Trusted & Verified</h3>
              <p className="text-[#4A6B6C] text-sm">Security verification codes for every booking</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#E8F4F3] rounded-full flex items-center justify-center">
                <MapPin weight="duotone" size={36} className="text-[#0D7377]" />
              </div>
              <h3 className="font-semibold text-[#0A2A2B]">Locally Owned</h3>
              <p className="text-[#4A6B6C] text-sm">Proudly serving the Hibiscus Coast</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#E8F4F3] rounded-full flex items-center justify-center">
                <Sparkle weight="duotone" size={36} className="text-[#0D7377]" />
              </div>
              <h3 className="font-semibold text-[#0A2A2B]">Quality Guaranteed</h3>
              <p className="text-[#4A6B6C] text-sm">Professional standards every time</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SERVICES SECTION ==================== */}
      <section id="services" className="py-16 bg-gradient-to-b from-white to-[#E8F4F3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#D4AF37] font-semibold uppercase tracking-[0.2em] text-xs">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A2A2B] mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Our Services
            </h2>
            <p className="text-[#4A6B6C] mt-4 max-w-2xl mx-auto">
              Complete property care solutions for holiday homes, Airbnb properties, and private residences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES_DATA.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D7377]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                      <service.icon weight="fill" size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{service.title}</h3>
                      <p className="text-white/80 text-sm">{service.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[#4A6B6C] mb-4">{service.description}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[#0A2A2B]">
                        <CheckCircle weight="fill" size={16} className="text-[#0D7377]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a 
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 bg-[#0D7377] hover:bg-[#0A5A5D] text-white font-semibold px-6 py-3 rounded-full transition-all w-full"
                  >
                    <WhatsappLogo weight="fill" size={20} />
                    Book This Service
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PREMIUM PACKAGE ==================== */}
      <section className="py-16 bg-[#0D7377]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl border-4 border-[#D4AF37] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#D4AF37] text-white px-6 py-2 rounded-bl-2xl font-bold text-sm">
              MOST POPULAR
            </div>
            
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star weight="fill" size={18} />
              PREMIUM SERVICE
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Glow Up Cleaning Spa
            </h2>
            
            <p className="text-[#4A6B6C] text-lg mb-6 max-w-xl mx-auto">
              The ultimate property transformation! Deep clean every surface including appliances, cupboards, windows and detailed finishing touches.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8">
              <div className="bg-[#E8F4F3] rounded-2xl px-8 py-6">
                <p className="text-sm text-[#4A6B6C] mb-1">1-2 Bedroom</p>
                <p className="text-3xl font-bold text-[#0D7377]">R1,200 - R1,800</p>
              </div>
              <div className="bg-[#E8F4F3] rounded-2xl px-8 py-6">
                <p className="text-sm text-[#4A6B6C] mb-1">3-4 Bedroom</p>
                <p className="text-3xl font-bold text-[#0D7377]">R1,800 - R2,800</p>
              </div>
            </div>
            
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold px-10 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
            >
              <WhatsappLogo weight="fill" size={28} />
              Book Your Glow Up
            </a>
          </motion.div>
        </div>
      </section>

      {/* ==================== GALLERY SECTION ==================== */}
      <section id="gallery" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#D4AF37] font-semibold uppercase tracking-[0.2em] text-xs">Our Work</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A2A2B] mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Guest-Ready Results
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY_IMAGES.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img 
                  src={image.url}
                  alt={image.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {image.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SERVICE AREAS ==================== */}
      <section id="areas" className="py-16 bg-[#E8F4F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#D4AF37] font-semibold uppercase tracking-[0.2em] text-xs">Coverage</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A2A2B] mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Hibiscus Coast Service Areas
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_AREAS.map((area, index) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-md hover:shadow-lg hover:bg-[#0D7377] hover:text-white transition-all cursor-default group"
              >
                <MapPin weight="fill" size={18} className="text-[#D4AF37] group-hover:text-white" />
                <span className="font-medium">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== REVIEWS SECTION ==================== */}
      <section id="reviews" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#D4AF37] font-semibold uppercase tracking-[0.2em] text-xs">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A2A2B] mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              What Our Clients Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#E8F4F3] rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} weight="fill" size={18} className="text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-[#4A6B6C] mb-4 italic text-sm">"{review.text}"</p>
                <div>
                  <p className="font-semibold text-[#0A2A2B]">{review.name}</p>
                  <p className="text-xs text-[#4A6B6C]">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section id="contact" className="py-16 bg-[#0D7377]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Get In Touch
            </h2>
            
            <div className="bg-white rounded-3xl p-8 inline-block shadow-2xl">
              <div className="w-20 h-20 bg-[#E8F4F3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users weight="duotone" size={40} className="text-[#0D7377]" />
              </div>
              
              <p className="text-2xl font-bold text-[#0D7377] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Sandra
              </p>
              
              <div className="space-y-4 mb-8">
                <a href="tel:0721953829" className="flex items-center justify-center gap-3 text-[#4A6B6C] hover:text-[#0D7377] text-lg font-medium">
                  <Phone weight="fill" size={24} className="text-[#0D7377]" />
                  072 195 3829
                </a>
                <a href="mailto:info.readyforguestssa@gmail.com" className="flex items-center justify-center gap-3 text-[#4A6B6C] hover:text-[#0D7377]">
                  <EnvelopeSimple weight="fill" size={24} className="text-[#0D7377]" />
                  info.readyforguestssa@gmail.com
                </a>
              </div>
              
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
              >
                <WhatsappLogo weight="fill" size={28} />
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-16 bg-gradient-to-r from-[#0A5A5D] to-[#0D7377]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ready to have your property guest-ready?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Relax, we'll handle everything!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold px-10 py-5 rounded-full text-xl transition-all hover:scale-105 shadow-lg"
              >
                <WhatsappLogo weight="fill" size={32} />
                Book Now
              </a>
              <button 
                onClick={handleNavigateToApp}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#E8F4F3] text-[#0D7377] font-bold px-10 py-5 rounded-full text-xl transition-all hover:scale-105 shadow-lg"
              >
                Use Our App
                <ArrowRight weight="bold" size={24} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#0A2A2B] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                  <House weight="fill" className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-white font-bold leading-tight">Ready for Guests</p>
                  <p className="text-[#D4AF37] text-xs">PROPERTY SERVICES</p>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                Complete care for your holiday home on the Hibiscus Coast.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('services')} className="block text-white/60 hover:text-white text-sm">Services</button>
                <button onClick={() => scrollToSection('gallery')} className="block text-white/60 hover:text-white text-sm">Gallery</button>
                <Link to="/terms" className="block text-white/60 hover:text-white text-sm">Terms & Conditions</Link>
                <button onClick={handleNavigateToApp} className="block text-white/60 hover:text-white text-sm">Book Online</button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-2">
                <a href="tel:0721953829" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
                  <Phone weight="fill" size={16} />
                  072 195 3829
                </a>
                <a href="mailto:info.readyforguestssa@gmail.com" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
                  <EnvelopeSimple weight="fill" size={16} />
                  info.readyforguestssa@gmail.com
                </a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
                  <WhatsappLogo weight="fill" size={16} />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} Ready for Guests Property Services. All rights reserved.
            </p>
            <p className="text-white/30 text-xs">
              Hibiscus Coast, South Africa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
