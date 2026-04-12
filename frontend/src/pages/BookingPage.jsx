import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  House, ArrowLeft, CalendarBlank, Clock, MapPin, 
  ArrowRight, CheckCircle, SprayBottle, Money
} from '@phosphor-icons/react';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { Calendar } from '../components/ui/calendar';
import { format } from 'date-fns';

const SERVICE_AREAS = [
  "Margate", "Ramsgate", "Shelly Beach", "St Michael's On Sea", 
  "Oslo Beach", "Uvongo", "Umtentweni", "Port Shepstone", "Port Edward"
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00"
];

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    property_address: '',
    property_area: '',
    bedrooms: '',
    notes: '',
    special_requests: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get(`${API}/services`);
        setServices(data);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !formData.property_address || !formData.property_area) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        service_id: selectedService.id,
        property_address: formData.property_address,
        property_area: formData.property_area,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: selectedTime,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        notes: formData.notes,
        special_requests: formData.special_requests
      };

      await axios.post(`${API}/bookings`, bookingData, { withCredentials: true });
      toast.success('Booking created successfully!');
      navigate('/client');
    } catch (err) {
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0D7377] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E0D8]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/client')} className="p-2 hover:bg-[#F5E6D3] rounded-full transition-colors">
            <ArrowLeft size={24} className="text-[#4A6B6C]" />
          </button>
          <div>
            <h1 className="font-semibold text-[#0A2A2B] text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Book a Service
            </h1>
            <p className="text-sm text-[#4A6B6C]">Step {step} of 3</p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[#E5E0D8]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#0D7377]' : 'bg-[#E5E0D8]'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Select a Service
            </h2>
            
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-medium text-[#0A2A2B] mb-4">{category}</h3>
                <div className="grid gap-3">
                  {categoryServices.map(service => (
                    <button
                      key={service.id}
                      data-testid={`service-option-${service.id}`}
                      onClick={() => setSelectedService(service)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedService?.id === service.id 
                          ? 'border-[#0D7377] bg-[#0D7377]/5 ring-2 ring-[#0D7377]/20' 
                          : 'border-[#E5E0D8] bg-white hover:border-[#0D7377]/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#0A2A2B]">{service.name}</h4>
                          <p className="text-sm text-[#4A6B6C] mt-1">{service.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-[#0D7377]">
                            R{service.price_min} - R{service.price_max}
                          </p>
                          <p className="text-xs text-[#4A6B6C]">{service.price_unit}</p>
                        </div>
                      </div>
                      {selectedService?.id === service.id && (
                        <CheckCircle size={24} weight="fill" className="text-[#0D7377] mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-8">
              <button
                data-testid="next-step-1"
                onClick={() => selectedService && setStep(2)}
                disabled={!selectedService}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight weight="bold" size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Choose Date & Time
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <h3 className="font-medium text-[#0A2A2B] mb-4 flex items-center gap-2">
                  <CalendarBlank size={20} />
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md"
                />
              </div>

              {/* Time Slots */}
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <h3 className="font-medium text-[#0A2A2B] mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  Select Time
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      data-testid={`time-slot-${time}`}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        selectedTime === time 
                          ? 'border-[#0D7377] bg-[#0D7377] text-white' 
                          : 'border-[#E5E0D8] hover:border-[#0D7377]/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                data-testid="next-step-2"
                onClick={() => selectedDate && selectedTime && setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight weight="bold" size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Property Details */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-semibold text-[#0A2A2B] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Property Details
            </h2>

            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-6">
              {/* Summary */}
              <div className="bg-[#F5E6D3] rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-[#0A2A2B] mb-2">{selectedService?.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-[#4A6B6C]">
                  <span className="flex items-center gap-1">
                    <CalendarBlank size={16} />
                    {selectedDate && format(selectedDate, 'PPP')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {selectedTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Money size={16} />
                    R{selectedService?.price_min} - R{selectedService?.price_max}
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0A2A2B] mb-2">
                    Property Address *
                  </label>
                  <input
                    data-testid="property-address-input"
                    type="text"
                    value={formData.property_address}
                    onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none"
                    placeholder="123 Beach Road"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A2B] mb-2">
                    Area *
                  </label>
                  <select
                    data-testid="property-area-select"
                    value={formData.property_area}
                    onChange={(e) => setFormData({ ...formData, property_area: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none"
                    required
                  >
                    <option value="">Select area</option>
                    {SERVICE_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A2B] mb-2">
                    Number of Bedrooms
                  </label>
                  <select
                    data-testid="bedrooms-select"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none"
                  >
                    <option value="">Select</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A2B] mb-2">
                    Special Requests / Notes
                  </label>
                  <textarea
                    data-testid="notes-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] outline-none"
                    rows={3}
                    placeholder="Access instructions, specific areas to focus on, etc."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                data-testid="submit-booking-btn"
                onClick={handleSubmit}
                disabled={submitting || !formData.property_address || !formData.property_area}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Booking
                    <CheckCircle weight="fill" size={18} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default BookingPage;
