import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  House, CalendarBlank, Clock, MapPin, Bell, SignOut, Users, 
  CheckCircle, SpinnerGap, XCircle, CurrencyDollar, 
  UserPlus, Image, Trash, CaretRight, User, Phone, ChartBar
} from '@phosphor-icons/react';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'status-pending' },
  confirmed: { label: 'Confirmed', color: 'status-confirmed' },
  assigned: { label: 'Assigned', color: 'status-assigned' },
  in_progress: { label: 'In Progress', color: 'status-in_progress' },
  completed: { label: 'Completed', color: 'status-completed' },
  cancelled: { label: 'Cancelled', color: 'status-cancelled' }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes, teamsRes, usersRes, galleryRes, notifRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { withCredentials: true }),
        axios.get(`${API}/bookings`, { withCredentials: true }),
        axios.get(`${API}/teams`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
        axios.get(`${API}/gallery`, { withCredentials: true }),
        axios.get(`${API}/notifications`, { withCredentials: true })
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
      setGallery(galleryRes.data);
      setNotifications(notifRes.data);
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

  const handleAssignTeam = async (bookingId, teamId) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/assign?team_id=${teamId}`, {}, { withCredentials: true });
      toast.success('Team assigned successfully');
      fetchData();
      setSelectedBooking(null);
    } catch (err) {
      toast.error('Failed to assign team');
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.')[0]);
      formData.append('category', 'general');
      
      await axios.post(`${API}/gallery/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`${API}/gallery/${imageId}`, { withCredentials: true });
      toast.success('Image deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const pendingBookings = bookings.filter(b => b.status === 'pending');

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
              Admin Dashboard
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                data-testid="admin-notifications-btn"
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
                  {notifications.slice(0, 10).map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-[#E5E0D8] last:border-0 ${!notif.is_read ? 'bg-[#F5E6D3]/30' : ''}`}>
                      <p className="font-medium text-[#0A2A2B] text-sm">{notif.title}</p>
                      <p className="text-[#4A6B6C] text-sm">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="font-medium text-[#0A2A2B] text-sm">{user?.name}</p>
                <p className="text-[#4A6B6C] text-xs">Administrator</p>
              </div>
              <button 
                data-testid="admin-logout-btn"
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-full transition-colors text-[#4A6B6C] hover:text-red-500"
              >
                <SignOut size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBar },
              { id: 'bookings', label: 'Bookings', icon: CalendarBlank },
              { id: 'teams', label: 'Teams', icon: Users },
              { id: 'clients', label: 'Clients', icon: User },
              { id: 'gallery', label: 'Gallery', icon: Image }
            ].map(tab => (
              <button
                key={tab.id}
                data-testid={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-[#0D7377] text-[#0D7377]' 
                    : 'border-transparent text-[#4A6B6C] hover:text-[#0A2A2B]'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-semibold text-[#0A2A2B] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Dashboard Overview
            </h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <p className="text-3xl font-semibold text-[#0D7377]">{stats?.total_bookings || 0}</p>
                <p className="text-sm text-[#4A6B6C]">Total Bookings</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <p className="text-3xl font-semibold text-[#D4AF37]">{stats?.pending_bookings || 0}</p>
                <p className="text-sm text-[#4A6B6C]">Pending</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <p className="text-3xl font-semibold text-green-600">{stats?.completed_bookings || 0}</p>
                <p className="text-sm text-[#4A6B6C]">Completed</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <p className="text-3xl font-semibold text-[#0D7377]">{stats?.total_clients || 0}</p>
                <p className="text-sm text-[#4A6B6C]">Clients</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <p className="text-3xl font-semibold text-[#0D7377]">{stats?.total_teams || 0}</p>
                <p className="text-sm text-[#4A6B6C]">Teams</p>
              </div>
            </div>

            {/* Pending Bookings */}
            <h2 className="text-xl font-semibold text-[#0A2A2B] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Pending Assignments
            </h2>
            {pendingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <p className="text-[#4A6B6C]">All bookings are assigned!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingBookings.slice(0, 5).map(booking => (
                  <div 
                    key={booking.id} 
                    className="bg-white rounded-2xl border border-[#E5E0D8] p-6"
                    data-testid={`admin-booking-${booking.id}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#0A2A2B]">{booking.service_name}</h3>
                        <p className="text-sm text-[#4A6B6C]">
                          {booking.client_name} • {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
                        </p>
                        <p className="text-sm text-[#4A6B6C]">{booking.property_area}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          data-testid={`assign-team-select-${booking.id}`}
                          className="px-4 py-2 rounded-xl border border-[#E5E0D8] bg-white text-sm"
                          onChange={(e) => e.target.value && handleAssignTeam(booking.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Assign Team</option>
                          {teams.filter(t => t.is_active).map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-semibold text-[#0A2A2B] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              All Bookings
            </h1>
            <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5E6D3]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Service</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Client</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Area</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Team</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-[#FAFAF7]">
                        <td className="px-6 py-4 text-sm text-[#0A2A2B]">{booking.service_name}</td>
                        <td className="px-6 py-4 text-sm text-[#4A6B6C]">{booking.client_name}</td>
                        <td className="px-6 py-4 text-sm text-[#4A6B6C]">{new Date(booking.scheduled_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-[#4A6B6C]">{booking.property_area}</td>
                        <td className="px-6 py-4 text-sm text-[#4A6B6C]">{booking.team_name || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[booking.status]?.color || 'status-pending'}`}>
                            {STATUS_CONFIG[booking.status]?.label || booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {booking.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-semibold text-[#0A2A2B] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Cleaning Teams
            </h1>
            <div className="grid gap-4">
              {teams.map(team => (
                <div key={team.id} className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#0A2A2B] text-lg">{team.name}</h3>
                      <p className="text-sm text-[#4A6B6C]">Members: {team.members?.join(', ')}</p>
                      <p className="text-sm text-[#4A6B6C]">Areas: {team.service_areas?.slice(0, 3).join(', ')}{team.service_areas?.length > 3 ? '...' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-[#0D7377]">{team.jobs_completed || 0}</p>
                      <p className="text-sm text-[#4A6B6C]">Jobs Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-semibold text-[#0A2A2B] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Registered Users
            </h1>
            <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5E6D3]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A2A2B]">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {users.map(u => (
                      <tr key={u.email} className="hover:bg-[#FAFAF7]">
                        <td className="px-6 py-4 text-sm text-[#0A2A2B]">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-[#4A6B6C]">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-[#4A6B6C]">{u.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                            u.role === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#4A6B6C]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-[#0A2A2B]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Gallery Management
              </h1>
              <label className="btn-primary flex items-center gap-2 cursor-pointer">
                <Image size={20} />
                {uploadingImage ? 'Uploading...' : 'Add Photo'}
                <input
                  data-testid="gallery-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map(image => (
                <div key={image.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img 
                    src={image.url || `${API}/gallery/${image.id}/download`}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      data-testid={`delete-image-${image.id}`}
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-sm font-medium truncate">{image.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
