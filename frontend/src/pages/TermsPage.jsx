import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  House, 
  ArrowLeft,
  ShieldCheck,
  CurrencyCircleDollar,
  ChatCircle,
  Key,
  Star,
  Door,
  Warning,
  Calendar,
  Scales,
  UsersThree,
  CheckCircle,
  WhatsappLogo,
  Phone,
  EnvelopeSimple
} from '@phosphor-icons/react';

const WHATSAPP_LINK = "https://wa.me/27721953829?text=Hi%20Sandra%20I%20would%20like%20to%20book%20a%20service";

const TERMS = [
  {
    icon: Calendar,
    title: "1. Bookings",
    content: "All bookings are confirmed upon receipt of the required deposit."
  },
  {
    icon: CurrencyCircleDollar,
    title: "2. Payments",
    content: "All payments are made directly to Ready for Guests Property Services. No payments are to be made to on-site team members under any circumstances."
  },
  {
    icon: ChatCircle,
    title: "3. Communication",
    content: "All communication, service requests, and arrangements are handled directly through Sandra at Ready for Guests Property Services. Our on-site teams are responsible for delivering the service but are not authorised to make arrangements, discuss pricing, or accept instructions outside of the agreed service."
  },
  {
    icon: ShieldCheck,
    title: "4. Security Verification System",
    content: "For client safety and peace of mind, each confirmed booking is issued with a unique Service Verification Code. Clients are required to request this code from the assigned team upon arrival before granting access to the property. Only authorised Ready for Guests Property Services team members with the correct code are permitted to carry out the service."
  },
  {
    icon: Star,
    title: "5. Service Standards",
    content: "We are committed to delivering professional, high-quality cleaning and property care services to ensure properties are clean, fresh, and guest-ready."
  },
  {
    icon: Door,
    title: "6. Access",
    content: "Clients are responsible for providing access to the property at the agreed time."
  },
  {
    icon: Warning,
    title: "7. Damages",
    content: "Any damages or concerns must be reported within 24 hours of service completion."
  },
  {
    icon: Calendar,
    title: "8. Cancellations",
    content: "Cancellations must be made at least 24 hours in advance."
  },
  {
    icon: Scales,
    title: "9. Liability",
    content: "Ready for Guests Property Services will take all reasonable care but is not responsible for pre-existing damages or issues."
  },
  {
    icon: UsersThree,
    title: "10. Non-Solicitation",
    content: "Clients agree not to engage directly with any team members for private work outside of Ready for Guests Property Services. All services must be arranged through the business."
  },
  {
    icon: CheckCircle,
    title: "11. Acceptance",
    content: "By confirming a booking, the client agrees to these Terms & Conditions."
  }
];

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F3] to-white">
      {/* Header */}
      <header className="bg-[#0D7377] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <House weight="fill" className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Ready for Guests
              </h1>
              <p className="text-[#D4AF37] text-sm tracking-widest">PROPERTY SERVICES</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Terms & Conditions
            </h1>
            <p className="text-[#4A6B6C]">
              Please read these terms carefully before booking our services
            </p>
          </div>

          <div className="space-y-6">
            {TERMS.map((term, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-[#E5E0D8]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E8F4F3] rounded-xl flex items-center justify-center flex-shrink-0">
                    <term.icon weight="duotone" size={28} className="text-[#0D7377]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2A2B] text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {term.title}
                    </h3>
                    <p className="text-[#4A6B6C] leading-relaxed">
                      {term.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-[#D4AF37]/10 border-2 border-[#D4AF37] rounded-2xl p-8 text-center"
          >
            <ShieldCheck weight="duotone" size={48} className="text-[#D4AF37] mx-auto mb-4" />
            <h3 className="font-bold text-[#0A2A2B] text-xl mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your Security is Our Priority
            </h3>
            <p className="text-[#4A6B6C] max-w-2xl mx-auto">
              Our Security Verification System ensures that only authorized team members can access your property. 
              Always request the verification code before granting entry.
            </p>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-[#0D7377] rounded-2xl p-8 text-center text-white"
          >
            <h3 className="font-bold text-xl mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Questions About Our Terms?
            </h3>
            <p className="text-white/80 mb-6">
              Contact Sandra directly for any clarifications
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold px-6 py-3 rounded-full transition-all"
              >
                <WhatsappLogo weight="fill" size={24} />
                WhatsApp Sandra
              </a>
              <a 
                href="tel:0721953829"
                className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-full transition-all"
              >
                <Phone weight="fill" size={24} />
                072 195 3829
              </a>
            </div>
          </motion.div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-[#0D7377] hover:text-[#0A5A5D] font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A2A2B] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Ready for Guests Property Services. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
