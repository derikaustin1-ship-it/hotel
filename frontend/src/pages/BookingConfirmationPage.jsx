import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage, StatusBadge } from '../components/StatusBadge';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  BedDouble, 
  Printer, 
  ArrowRight, 
  Hotel,
  ShieldCheck,
  CheckCircle2,
  Receipt
} from 'lucide-react';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          const res = await bookingApi.getBookingById(id);
          if (res.success && res.data) {
            setBooking(res.data);
          } else {
            setError('Booking details could not be retrieved.');
          }
        } catch (err) {
          setError(err.message || 'Failed to load booking');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Generating reservation invoice..." fullScreen />;
  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <ErrorMessage message={error || 'Booking not found'} />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/my-bookings" className="btn btn-primary">
            Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '40px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Success Header Banner */}
        <div style={{
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--slate-200)',
          marginBottom: '30px',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--emerald-50)',
            color: 'var(--emerald-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.12)'
          }}>
            <CheckCircle size={44} />
          </div>

          <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Reservation Successful
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginTop: '4px', marginBottom: '8px' }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 16px auto' }}>
            Thank you, <strong>{booking.customerName}</strong>. Your luxury stay at Grand Luxe Hotel & Suites has been reserved.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--slate-100)',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.92rem',
          }}>
            <span style={{ color: 'var(--slate-500)', fontWeight: '600' }}>Booking Reference:</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--navy-900)', fontSize: '1.05rem' }}>{booking.bookingReference}</strong>
          </div>
        </div>

        {/* Printable Reservation Receipt Card */}
        <div className="card" style={{ padding: '36px', backgroundColor: '#ffffff', marginBottom: '30px' }} id="booking-receipt">
          {/* Header of Receipt */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid var(--slate-100)',
            paddingBottom: '20px',
            marginBottom: '26px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--primary-gold)',
                color: '#ffffff',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex'
              }}>
                <Hotel size={22} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                  GRAND LUXE HOTEL & SUITES
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  742 Ocean Royale Blvd • +1 (800) 589-3200
                </div>
              </div>
            </div>

            <div>
              <StatusBadge status={booking.status} />
            </div>
          </div>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            marginBottom: '30px',
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>
                Guest Details
              </span>
              <div style={{ fontWeight: '700', color: 'var(--navy-900)', fontSize: '1rem', marginTop: '4px' }}>
                {booking.customerName}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>{booking.customerEmail}</div>
              {booking.customerPhone && <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>{booking.customerPhone}</div>}
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>
                Room Reserved
              </span>
              <div style={{ fontWeight: '700', color: 'var(--navy-900)', fontSize: '1rem', marginTop: '4px' }}>
                {booking.roomType} Suite (Room #{booking.roomNumber})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'} • ₹{Number(booking.roomPricePerNight).toLocaleString('en-IN')}/night
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>
                Check-in / Check-out
              </span>
              <div style={{ fontWeight: '700', color: 'var(--navy-900)', fontSize: '1rem', marginTop: '4px' }}>
                {booking.checkInDate} to {booking.checkOutDate}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                Total Duration: <strong>{booking.numberOfNights} {booking.numberOfNights === 1 ? 'Night' : 'Nights'}</strong>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div style={{
              backgroundColor: 'var(--slate-50)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              color: 'var(--slate-700)',
              marginBottom: '26px',
              border: '1px solid var(--slate-200)',
            }}>
              <strong>Special Instructions:</strong> {booking.specialRequests}
            </div>
          )}

          {/* Financial Breakdown */}
          <div style={{
            borderTop: '1px solid var(--slate-200)',
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--slate-600)' }}>
              <span>Room Tariff ({booking.numberOfNights} Nights @ ₹{Number(booking.roomPricePerNight).toLocaleString('en-IN')}):</span>
              <span>₹{Number(booking.subtotal).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--slate-600)' }}>
              <span>Applicable Taxes & GST (10%):</span>
              <span>₹{Number(booking.tax).toLocaleString('en-IN')}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderTop: '2px solid var(--slate-200)',
              paddingTop: '14px',
              marginTop: '6px',
            }}>
              <span style={{ fontWeight: '800', color: 'var(--navy-900)', fontSize: '1.15rem' }}>
                Total Paid:
              </span>
              <span style={{ fontWeight: '800', color: 'var(--navy-900)', fontSize: '1.75rem' }}>
                ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--emerald-600)', marginTop: '4px', fontWeight: '600' }}>
              <span>Payment Status:</span>
              <span>Simulated Payment Verified ({booking.paymentMethod} • Ref: {booking.transactionReference})</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={handlePrint} className="btn btn-outline-slate">
            <Printer size={16} /> Print Receipt
          </button>
          <Link to="/my-bookings" className="btn btn-primary">
            View My Bookings <ArrowRight size={16} />
          </Link>
          <Link to="/rooms" className="btn btn-secondary">
            Book Another Room
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
