import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, House, ArrowRight } from '@phosphor-icons/react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-[#E5E0D8] p-8 md:p-12 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} weight="fill" className="text-green-600" />
        </div>
        
        <h1 className="text-2xl font-semibold text-[#0A2A2B] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Payment Successful!
        </h1>
        
        <p className="text-[#4A6B6C] mb-8">
          Your booking has been confirmed. You will receive a confirmation email shortly with all the details.
        </p>

        {bookingId && (
          <p className="text-sm text-[#4A6B6C] bg-[#F5E6D3] rounded-lg p-3 mb-6">
            Booking Reference: <span className="font-mono font-medium">{bookingId.slice(0, 8)}...</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            data-testid="go-to-dashboard-btn"
            onClick={() => navigate('/client')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            View My Bookings
            <ArrowRight weight="bold" size={18} />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="text-[#4A6B6C] hover:text-[#0D7377] flex items-center justify-center gap-2"
          >
            <House size={18} />
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
