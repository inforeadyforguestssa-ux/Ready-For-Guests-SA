import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  House, CalendarBlank, Clock, MapPin, Bell, SignOut,
  CheckCircle, SpinnerGap, Camera, CaretRight, User, Phone
} from '@phosphor-icons/react';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  assigned: { label: 'Assigned', color: 'status-assigned' },
  in_progress: { label: 'In Progress', color: 'status-in_progress' },
  completed: { label: 'Completed', color: 'status-completed' }
};

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status?status=${newStatus}`, {}, { withCredentials: true });
      toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePhotoUpload = async (bookingId, file, photoType) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photo_type', photoType);
      
      await axios.post(`${API}/bookings/${bookingId}/photos?photo_type=${photoType}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Photo uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const assignedJobs = bookings.filter(b => b.status === 'assigned');
  const inProgressJobs = bookings.filter(b => b.status === 'in_progress');
  const completedJobs = bookings.filter(b => b.status === 'completed');

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
              Team Dashboard
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                data-testid="team-notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
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

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="font-medium text-[#0A2A2B] text-sm">{user?.name}</p>
                <p className="text-[#4A6B6C] text-xs capitalize">Cleaning Team</p>
              </div>
              <button 
                data-testid="team-logout-btn"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0A2A2B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Schedule
          </h1>
          <p className="text-[#4A6B6C]">Manage your assigned cleaning jobs</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 text-center">
            <p className="text-3xl font-semibold text-[#0D7377]">{assignedJobs.length}</p>
            <p className="text-sm text-[#4A6B6C]">Assigned</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 text-center">
            <p className="text-3xl font-semibold text-[#D4AF37]">{inProgressJobs.length}</p>
            <p className="text-sm text-[#4A6B6C]">In Progress</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 text-center">
            <p className="text-3xl font-semibold text-green-600">{completedJobs.length}</p>
            <p className="text-sm text-[#4A6B6C]">Completed</p>
          </div>
        </motion.div>

        {/* Assigned Jobs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Assigned Jobs
          </h2>
          
          {assignedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 text-center">
              <CalendarBlank size={48} className="text-[#4A6B6C] mx-auto mb-4" />
              <p className="text-[#4A6B6C]">No jobs assigned</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignedJobs.map(booking => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-2xl border border-[#E5E0D8] p-6"
                  data-testid={`team-job-${booking.id}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0A2A2B] text-lg mb-2">{booking.service_name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-[#4A6B6C]">
                        <span className="flex items-center gap-1">
                          <CalendarBlank size={16} />
                          {new Date(booking.scheduled_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {booking.scheduled_time}
                        </span>
                        <span className="flex items-center gap-1 col-span-2">
                          <MapPin size={16} />
                          {booking.property_address}, {booking.property_area}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={16} />
                          {booking.client_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={16} />
                          {booking.client_phone}
                        </span>
                      </div>
                      {booking.notes && (
                        <p className="mt-2 text-sm text-[#4A6B6C] bg-[#F5E6D3] p-2 rounded-lg">
                          Notes: {booking.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        data-testid={`start-job-${booking.id}`}
                        onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                        className="btn-primary flex items-center gap-2"
                      >
                        <SpinnerGap size={18} />
                        Start Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* In Progress Jobs */}
        {inProgressJobs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              In Progress
            </h2>
            <div className="grid gap-4">
              {inProgressJobs.map(booking => (
                <div 
                  key={booking.id} 
                  className="bg-[#E0E7FF] rounded-2xl border border-[#3730A3]/20 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0A2A2B] text-lg mb-2">{booking.service_name}</h3>
                      <div className="text-sm text-[#4A6B6C]">
                        <p>{booking.property_address}, {booking.property_area}</p>
                        <p>Client: {booking.client_name} • {booking.client_phone}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                        <Camera size={18} />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && handlePhotoUpload(booking.id, e.target.files[0], 'completion')}
                          disabled={uploadingPhoto}
                        />
                      </label>
                      <button
                        data-testid={`complete-job-${booking.id}`}
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={18} />
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Completed Today */}
        {completedJobs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Recently Completed
            </h2>
            <div className="grid gap-4">
              {completedJobs.slice(0, 5).map(booking => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-2xl border border-[#E5E0D8] p-4 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#0A2A2B]">{booking.service_name}</h3>
                      <p className="text-sm text-[#4A6B6C]">{booking.property_area}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium status-completed">
                      <CheckCircle size={14} className="inline mr-1" />
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
};

export default TeamDashboard;
