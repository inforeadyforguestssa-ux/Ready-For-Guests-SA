import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  House, CalendarBlank, Clock, MapPin, Bell, SignOut, Plus, 
  CheckCircle, SpinnerGap, Warning, XCircle, CaretRight, User
} from '@phosphor-icons/react';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'status-pending', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'status-confirmed', icon: CheckCircle },
  assigned: { label: 'Assigned', color: 'status-assigned', icon: User },
  in_progress: { label: 'In Progress', color: 'status-in_progress', icon: SpinnerGap },
  completed: { label: 'Completed', color: 'status-completed', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'status-cancelled', icon: XCircle }
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/bookings`, { withCredentials: true }),
        axios.get(`${API}/notifications`, { withCredentials: true })
      ]);
      setBookings(bookingsRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status?status=cancelled`, {}, { withCredentials: true });
      toast.success('Booking cancelled');
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const markNotificationsRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

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
      <header className="bg-white border-b border-[#E5E0D8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <House weight="fill" className="text-[#0D7377]" size={28} />
            <span className="font-semibold text-[#0D7377] text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ready for Guests
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                data-testid="notifications-btn"
                onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); }}
                className="relative p-2 hover:bg-[#F5E6D3] rounded-full transition-colors"
              >
                <Bell size={24} className="text-[#4A6B6C]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E0D8] max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-[#E5E0D8]">
                    <h3 className="font-semibold text-[#0A2A2B]">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-[#4A6B6C] text-center">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-[#E5E0D8] last:border-0 ${!notif.is_read ? 'bg-[#F5E6D3]/30' : ''}`}>
                        <p className="font-medium text-[#0A2A2B] text-sm">{notif.title}</p>
                        <p className="text-[#4A6B6C] text-sm">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="font-medium text-[#0A2A2B] text-sm">{user?.name}</p>
                <p className="text-[#4A6B6C] text-xs capitalize">{user?.role}</p>
              </div>
              <button 
                data-testid="logout-btn"
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-full transition-colors text-[#4A6B6C] hover:text-red-500"
              >
                <SignOut size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0A2A2B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-[#4A6B6C]">Manage your property cleaning bookings</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <button
            data-testid="book-service-btn"
            onClick={() => navigate('/book')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus weight="bold" size={20} />
            Book a Service
          </button>
        </motion.div>

        {/* Active Bookings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Active Bookings
          </h2>
          
          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 text-center">
              <CalendarBlank size={48} className="text-[#4A6B6C] mx-auto mb-4" />
              <p className="text-[#4A6B6C]">No active bookings</p>
              <button
                onClick={() => navigate('/book')}
                className="mt-4 text-[#0D7377] font-medium hover:underline"
              >
                Book your first service →
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeBookings.map(booking => {
                const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div 
                    key={booking.id} 
                    className="bg-white rounded-2xl border border-[#E5E0D8] p-6 card-hover"
                    data-testid={`booking-card-${booking.id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#0A2A2B]">{booking.service_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon size={14} className="inline mr-1" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#4A6B6C]">
                          <span className="flex items-center gap-1">
                            <CalendarBlank size={16} />
                            {new Date(booking.scheduled_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {booking.scheduled_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {booking.property_area}
                          </span>
                        </div>
                        {booking.team_name && (
                          <p className="text-sm text-[#0D7377] mt-2">
                            Team: {booking.team_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#0D7377] font-semibold">{booking.price_estimate}</span>
                        {booking.status === 'pending' && (
                          <button
                            data-testid={`cancel-booking-${booking.id}`}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Past Bookings
            </h2>
            <div className="grid gap-4">
              {pastBookings.slice(0, 5).map(booking => {
                const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                
                return (
                  <div 
                    key={booking.id} 
                    className="bg-white rounded-2xl border border-[#E5E0D8] p-4 opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#0A2A2B]">{booking.service_name}</h3>
                        <p className="text-sm text-[#4A6B6C]">
                          {new Date(booking.scheduled_date).toLocaleDateString()} • {booking.property_area}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
