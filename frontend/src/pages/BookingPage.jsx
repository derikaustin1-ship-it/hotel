import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { roomApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/StatusBadge';
import { 
  Calendar, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Info, 
  ArrowLeft, 
  CheckCircle2, 
  Lock,
  Sparkles,
  Smartphone,
  Banknote
} from 'lucide-react';

const TAX_PERCENTAGE = 10; // 10% configurable GST / Hotel tax

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const roomId = searchParams.get('roomId');
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialGuests = searchParams.get('guests') || '2';

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Form Fields
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  // Customer Contact Fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  useEffect(() => {
    // Set default dates if empty
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 2);

    if (!checkInDate) {
      setCheckInDate(today.toISOString().split('T')[0]);
    }
    if (!checkOutDate) {
      setCheckOutDate(future.toISOString().split('T')[0]);
    }

    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }

    // Fetch room details
    const loadRoom = async () => {
      if (!roomId) {
        setFetchError('No room selected for booking');
        setLoading(false);
        return;
      }

      try {
        const res = await roomApi.getRoomById(roomId);
        if (res.success && res.data) {
          setRoom(res.data);
          if (parseInt(guests, 10) > res.data.capacity) {
            setGuests(String(res.data.capacity));
          }
        } else {
          setFetchError('Room not found');
        }
      } catch (err) {
        setFetchError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, user]);

  // Calculations
  const calculateBilling = () => {
    if (!checkInDate || !checkOutDate || !room) {
      return { nights: 0, pricePerNight: 0, subtotal: 0, tax: 0, total: 0 };
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const timeDiff = end.getTime() - start.getTime();
    let nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0 || isNaN(nights)) {
      nights = 1;
    }

    const pricePerNight = Number(room.pricePerNight) || 0;
    const subtotal = pricePerNight * nights;
    const tax = subtotal * (TAX_PERCENTAGE / 100);
    const total = subtotal + tax;

    return {
      nights,
      pricePerNight,
      subtotal,
      tax,
      total,
    };
  };

  const billing = calculateBilling();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toastError('Please log in to complete your reservation.');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toastError('Check-out date must be after check-in date.');
      return;
    }

    if (parseInt(guests, 10) > room.capacity) {
      toastError(`This room accommodates up to ${room.capacity} guests.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        roomId: room.id,
        checkInDate,
        checkOutDate,
        guests: parseInt(guests, 10),
        specialRequests,
        paymentMethod,
      };

      const res = await bookingApi.createBooking(payload);
      if (res.success && res.data) {
        success('Room booked successfully!');
        navigate(`/booking-confirmation/${res.data.id}`, { state: { booking: res.data } });
      }
    } catch (err) {
      toastError(err.message || 'Unable to confirm booking. The room may already be booked for these dates.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing booking details..." fullScreen />;
  if (fetchError || !room) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <ErrorMessage message={fetchError || 'Room selection invalid'} />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/rooms" className="btn btn-primary">
            <ArrowLeft size={16} /> Browse Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '36px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Link to={`/rooms/${room.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--slate-600)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to Room
          </Link>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)' }}>
            Complete Your Reservation
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
            Review your stay details, select payment preference, and receive instant booking confirmation.
          </p>
        </div>

        {/* Not Logged In Warning Banner */}
        {!isAuthenticated && (
          <div style={{
            backgroundColor: 'var(--primary-gold-light)',
            border: '1px solid rgba(197, 155, 39, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--navy-900)' }}>
              <Info size={20} color="var(--primary-gold)" />
              <span>You are booking as a guest. Please login or register to manage your bookings and enjoy member perks.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            alignItems: 'flex-start',
          }}>
            {/* Left Column: Form Details & Guest Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Stay Dates & Guests Selection */}
              <div className="card" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '18px', fontWeight: '700' }}>
                  1. Stay Dates & Guests
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--primary-gold)" /> Check-in Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkInDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--primary-gold)" /> Check-out Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkOutDate}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} color="var(--primary-gold)" /> Number of Guests
                  </label>
                  <select
                    className="form-control"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'} (Max {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Details */}
              <div className="card" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '18px', fontWeight: '700' }}>
                  2. Guest Contact Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                    <label className="form-label">Special Requests (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. High floor, airport pickup, late arrival, quiet room..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '18px', fontWeight: '700' }}>
                  3. Payment Method (Simulated)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  <label style={{
                    border: paymentMethod === 'CARD' ? '2px solid var(--primary-gold)' : '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'CARD' ? 'var(--primary-gold-light)' : '#ffffff',
                    transition: 'all 0.2s',
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      style={{ display: 'none' }}
                    />
                    <CreditCard size={24} color="var(--primary-gold)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy-900)' }}>Credit / Debit</span>
                  </label>

                  <label style={{
                    border: paymentMethod === 'UPI' ? '2px solid var(--primary-gold)' : '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'UPI' ? 'var(--primary-gold-light)' : '#ffffff',
                    transition: 'all 0.2s',
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      style={{ display: 'none' }}
                    />
                    <Smartphone size={24} color="var(--primary-gold)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy-900)' }}>UPI / QR</span>
                  </label>

                  <label style={{
                    border: paymentMethod === 'CASH' ? '2px solid var(--primary-gold)' : '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'CASH' ? 'var(--primary-gold-light)' : '#ffffff',
                    transition: 'all 0.2s',
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={() => setPaymentMethod('CASH')}
                      style={{ display: 'none' }}
                    />
                    <Banknote size={24} color="var(--primary-gold)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy-900)' }}>Pay at Desk</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Room Summary & Live Price Breakdown */}
            <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '0', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xl)' }}>
                {/* Room Preview Box */}
                <div style={{ position: 'relative', height: '160px' }}>
                  <img
                    src={room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                    alt={room.roomType}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(11, 19, 43, 0.85)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                  }}>
                    Room #{room.roomNumber}
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: '700', marginBottom: '6px' }}>
                    {room.roomType} Room
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '18px' }}>
                    Capacity: {room.capacity} Guests • {room.beds} Beds
                  </div>

                  {/* Pricing Breakdown */}
                  <div style={{
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    border: '1px solid var(--slate-200)',
                    marginBottom: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                      <span>Tariff per Night:</span>
                      <span>₹{Number(billing.pricePerNight).toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                      <span>Stay Duration:</span>
                      <span><strong>{billing.nights} {billing.nights === 1 ? 'Night' : 'Nights'}</strong></span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                      <span>Subtotal:</span>
                      <span>₹{Number(billing.subtotal).toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                      <span>Taxes & GST ({TAX_PERCENTAGE}%):</span>
                      <span>₹{Number(billing.tax).toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{
                      borderTop: '1px solid var(--slate-300)',
                      paddingTop: '10px',
                      marginTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}>
                      <span style={{ fontWeight: '800', color: 'var(--navy-900)', fontSize: '1.05rem' }}>Total Payable:</span>
                      <span style={{ fontWeight: '800', color: 'var(--navy-900)', fontSize: '1.6rem' }}>
                        ₹{Number(billing.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: '14px' }}
                  >
                    {submitting ? 'Confirming Reservation...' : 'Confirm & Reserve Now'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Lock size={14} color="var(--emerald-600)" />
                    <span>SSL Encrypted • Strict Availability Checked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
