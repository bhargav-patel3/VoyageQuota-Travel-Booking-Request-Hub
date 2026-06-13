import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  User, 
  Send, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Search,
  ChevronRight,
  Database
} from 'lucide-react';
import { API_BASE_URL } from './config';

function App() {
  // Form State
  const [formData, setFormData] = useState({
    passenger_names: '',
    from_location: '',
    to_location: '',
    travel_date: '',
    special_notes: ''
  });

  // Data & Loading States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Health & Environment States
  const [health, setHealth] = useState({
    status: 'CHECKING',
    server: 'UNKNOWN',
    database: 'UNKNOWN',
    error: null
  });
  
  // Notification State
  const [notification, setNotification] = useState({ type: null, message: '' });

  // Fetch all bookings from the backend
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`);
      const result = await response.json();
      if (result.success) {
        setBookings(result.data);
      } else {
        showNotification('error', result.message || 'Failed to fetch bookings.');
      }
    } catch (err) {
      console.error(err);
      showNotification(
        'error', 
        'Could not connect to the backend API. Please verify the backend service is running and CORS is enabled.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Check backend and DB health
  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      if (response.ok && data.status === 'UP') {
        setHealth({
          status: 'UP',
          server: 'OK',
          database: 'CONNECTED',
          error: null
        });
      } else {
        setHealth({
          status: 'DEGRADED',
          server: 'OK',
          database: 'DISCONNECTED',
          error: data.error || 'Database connection failure'
        });
      }
    } catch (err) {
      setHealth({
        status: 'DOWN',
        server: 'OFFLINE',
        database: 'OFFLINE',
        error: 'Backend API unreachable'
      });
    }
  };

  // Run on mount
  useEffect(() => {
    checkHealth();
    fetchBookings();
    
    // Auto-refresh health status every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Show status notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: '' });
    }, 6000);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.passenger_names || !formData.from_location || !formData.to_location || !formData.travel_date) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification('success', 'Travel booking request submitted successfully!');
        // Reset form
        setFormData({
          passenger_names: '',
          from_location: '',
          to_location: '',
          travel_date: '',
          special_notes: ''
        });
        // Refresh list
        fetchBookings();
        // Refresh health status
        checkHealth();
      } else {
        showNotification('error', result.message || 'Failed to submit request.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Network error: Failed to reach the backend to submit booking.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase();
    return (
      booking.passenger_names.toLowerCase().includes(query) ||
      booking.from_location.toLowerCase().includes(query) ||
      booking.to_location.toLowerCase().includes(query) ||
      (booking.special_notes && booking.special_notes.toLowerCase().includes(query))
    );
  });

  // Format Date utility
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Keep date exact to input without timezone shifts
    });
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app-container">
      {/* Background Glowing Ambient Orbs */}
      <div className="bg-glow-container">
        <div className="glow-orb orb-pink"></div>
        <div className="glow-orb orb-purple"></div>
        <div className="glow-orb orb-indigo"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
          }}>
            <Plane size={24} color="#fff" style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="neon-text-gradient">VoyageQuota</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '-2px' }}>
              Travel Booking Dispatch
            </p>
          </div>
        </div>

        {/* Health Check Indicators for DevOps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={() => { checkHealth(); fetchBookings(); }} 
            className="glass-card"
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Force refresh status"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Activity size={14} color={health.status === 'UP' ? '#34d399' : health.status === 'DEGRADED' ? '#fbbf24' : '#f87171'} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {health.status === 'UP' && <span style={{ color: '#34d399' }}>API: ONLINE</span>}
              {health.status === 'DEGRADED' && <span style={{ color: '#fbbf24' }}>DB: OFFLINE</span>}
              {health.status === 'DOWN' && <span style={{ color: '#f87171' }}>API: OFFLINE</span>}
            </span>
            <span 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: health.status === 'UP' ? '#10b981' : health.status === 'DEGRADED' ? '#f59e0b' : '#ef4444',
                boxShadow: health.status === 'UP' ? '0 0 10px #10b981' : health.status === 'DEGRADED' ? '0 0 10px #f59e0b' : '0 0 10px #ef4444',
                display: 'inline-block'
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="main-content">
        {/* Left Column: Form Section */}
        <section className="glass-panel fade-in-up" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', height: 'fit-content' }}>
          <div>
            <div className="neon-badge" style={{ marginBottom: '12px' }}>
              <Sparkles size={12} />
              NEW DISPATCH
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Request Travel Quota</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Submit a passenger route booking proposal. Data commits immediately to the core MySQL service pool.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="glass-label" htmlFor="passenger_names">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Passenger Names <span style={{ color: 'hsl(var(--color-primary))' }}>*</span>
                </span>
              </label>
              <input
                id="passenger_names"
                type="text"
                name="passenger_names"
                value={formData.passenger_names}
                onChange={handleInputChange}
                className="glass-input"
                placeholder="e.g. John Doe, Jane Doe"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="glass-label" htmlFor="from_location">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> Departure (From) <span style={{ color: 'hsl(var(--color-primary))' }}>*</span>
                  </span>
                </label>
                <input
                  id="from_location"
                  type="text"
                  name="from_location"
                  value={formData.from_location}
                  onChange={handleInputChange}
                  className="glass-input"
                  placeholder="e.g. London, UK"
                  required
                />
              </div>

              <div>
                <label className="glass-label" htmlFor="to_location">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> Arrival (To) <span style={{ color: 'hsl(var(--color-primary))' }}>*</span>
                  </span>
                </label>
                <input
                  id="to_location"
                  type="text"
                  name="to_location"
                  value={formData.to_location}
                  onChange={handleInputChange}
                  className="glass-input"
                  placeholder="e.g. Tokyo, JP"
                  required
                />
              </div>
            </div>

            <div>
              <label className="glass-label" htmlFor="travel_date">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Travel Date <span style={{ color: 'hsl(var(--color-primary))' }}>*</span>
                </span>
              </label>
              <input
                id="travel_date"
                type="date"
                name="travel_date"
                value={formData.travel_date}
                onChange={handleInputChange}
                className="glass-input"
                required
              />
            </div>

            <div>
              <label className="glass-label" htmlFor="special_notes">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Special Requests / Notes
                </span>
              </label>
              <textarea
                id="special_notes"
                name="special_notes"
                value={formData.special_notes}
                onChange={handleInputChange}
                className="glass-input"
                style={{ minHeight: '90px', resize: 'vertical' }}
                placeholder="Dietary requirements, seat preferences, hotel bookings..."
              />
            </div>

            {/* Notification Banner inside Form */}
            {notification.message && (
              <div 
                className="fade-in-up"
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: notification.type === 'success' ? '#34d399' : '#f87171'
                }}
              >
                {notification.type === 'success' ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <span>{notification.message}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitLoading || health.status === 'DOWN'}
              style={{ marginTop: '10px' }}
            >
              {submitLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Dispatch Request
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column: Listing Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* List Search & Controls Bar */}
          <div className="glass-panel fade-in-up" style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} className="neon-text-gradient" />
              Booking Database Query
              <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--text-muted))' }}>
                {filteredBookings.length} Total
              </span>
            </h3>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="Filter bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '38px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Bookings Queue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div className="glass-panel" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <RefreshCw size={32} className="animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Querying active booking requests...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                <AlertTriangle size={32} style={{ color: 'rgba(255,255,255,0.25)', margin: '0 auto 16px auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>No Travel Bookings Found</h4>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>
                  {searchQuery 
                    ? 'No records match your filter criteria. Try searching for a different name or location.' 
                    : 'The database is currently empty or unreachable. Submit a route request on the left panel to register your first booking.'}
                </p>
                {health.status !== 'UP' && (
                  <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'inline-block',
                    fontSize: '0.8rem',
                    color: '#f87171'
                  }}>
                    Database Status: Offline. Check configuration or run DB migrations first.
                  </div>
                )}
              </div>
            ) : (
              // Booking Cards
              filteredBookings.map((booking, index) => (
                <div 
                  key={booking.id || index}
                  className="glass-panel glass-card fade-in-up"
                  style={{ 
                    padding: '24px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px',
                    animationDelay: `${index * 0.08}s` // Cascade stagger animation
                  }}
                >
                  {/* Card Header: Route & ID */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{booking.from_location}</span>
                      <ChevronRight size={14} style={{ color: 'hsl(var(--color-primary))' }} />
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'hsl(var(--color-primary))' }}>{booking.to_location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="neon-badge">
                        VQ-{String(booking.id).padStart(4, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Info Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span className="glass-label" style={{ marginBottom: '4px', fontSize: '0.75rem' }}>Passengers</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                        <User size={14} style={{ color: 'hsl(var(--color-secondary))' }} />
                        {booking.passenger_names}
                      </div>
                    </div>
                    <div>
                      <span className="glass-label" style={{ marginBottom: '4px', fontSize: '0.75rem' }}>Travel Date</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Calendar size={14} style={{ color: 'hsl(var(--color-secondary))' }} />
                        {formatDate(booking.travel_date)}
                      </div>
                    </div>
                  </div>

                  {/* Special Notes (if available) */}
                  {booking.special_notes && (
                    <div style={{ 
                      padding: '12px 16px', 
                      background: 'rgba(0,0,0,0.15)', 
                      borderRadius: '10px', 
                      fontSize: '0.85rem',
                      borderLeft: '2px solid hsl(var(--color-secondary))',
                      color: 'rgba(255,255,255,0.85)'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-secondary))', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Special instructions</div>
                      {booking.special_notes}
                    </div>
                  )}

                  {/* Card Footer: Commit Timestamp */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                    Committed to DB: {formatTimestamp(booking.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
          VoyageQuota &copy; {new Date().getFullYear()} - Professional DevOps Practice Repository
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '16px', 
          fontSize: '0.75rem', 
          color: 'rgba(255,255,255,0.35)',
          flexWrap: 'wrap'
        }}>
          <span>Stack: <strong style={{ color: '#fff' }}>React (Vite)</strong> + <strong style={{ color: '#fff' }}>Node.js</strong> + <strong style={{ color: '#fff' }}>MySQL</strong></span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}></span>
          <span>Target Endpoints: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: 'hsl(var(--color-primary))' }}>{API_BASE_URL}</code></span>
        </div>
      </footer>
    </div>
  );
}

export default App;
