import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import BookingCard from '../components/BookingCard';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/StatusBadge';
import { Calendar, BedDouble, ArrowRight, X, FileText, CheckCircle2 } from 'lucide-react';

const MyBookingsPage = () => {
  const { success, error: toastError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // View Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedBookingReceipt, setSelectedBookingReceipt] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingApi.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelClick = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setCancelling(true);
    try {
      const res = await bookingApi.cancelBooking(selectedBookingToCancel.id);
      if (res.success) {
        success('Booking cancelled successfully!');
        setCancelModalOpen(false);
        setSelectedBookingToCancel(null);
        fetchBookings();
      }
    } catch (err) {
      toastError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleViewReceipt = (booking) => {
    setSelectedBookingReceipt(booking);
    setReceiptModalOpen(true);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '30px',
        }}>
          <div>
            <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              My Account
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginTop: '4px' }}>
              My Bookings & Reservations
            </h1>
          </div>
          <Link to="/rooms" className="btn btn-primary">
            <BedDouble size={16} /> Book Another Room
          </Link>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '26px',
          borderBottom: '1px solid var(--slate-200)',
          paddingBottom: '12px',
          overflowX: 'auto',
        }}>
          {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === 'ALL' ? bookings.length : bookings.filter((b) => b.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? 'var(--navy-900)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--slate-600)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                <span style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--slate-200)',
                  color: isActive ? '#ffffff' : 'var(--slate-700)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {error && <ErrorMessage message={error} onRetry={fetchBookings} />}

        {loading ? (
          <LoadingSpinner message="Fetching your reservations..." />
        ) : filteredBookings.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <Calendar size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
              No Reservations Found
            </h3>
            <p style={{ color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto 20px auto' }}>
              {activeTab === 'ALL'
                ? "You haven't placed any room reservations yet. Explore our luxury rooms to plan your stay!"
                : `You don't have any bookings with status ${activeTab}.`}
            </p>
            <Link to="/rooms" className="btn btn-primary">
              Explore Available Rooms <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelClick={handleCancelClick}
                onViewDetails={handleViewReceipt}
              />
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModalOpen}
          title="Cancel Reservation"
          message={`Are you sure you want to cancel booking ${selectedBookingToCancel?.bookingReference}? This room will become available again for other guests.`}
          confirmText="Yes, Cancel Booking"
          cancelText="Keep Booking"
          isDanger={true}
          loading={cancelling}
          onConfirm={handleConfirmCancel}
          onCancel={() => {
            setCancelModalOpen(false);
            setSelectedBookingToCancel(null);
          }}
        />

        {/* Booking Summary / Receipt Modal */}
        {receiptModalOpen && selectedBookingReceipt && (
          <div className="modal-backdrop" onClick={() => setReceiptModalOpen(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--primary-gold)" />
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)' }}>Reservation Summary</h3>
                  </div>
                  <button onClick={() => setReceiptModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Booking Reference</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                    {selectedBookingReceipt.bookingReference}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Room</span>
                    <div style={{ fontWeight: '600' }}>{selectedBookingReceipt.roomType} (Room #{selectedBookingReceipt.roomNumber})</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Guests</span>
                    <div style={{ fontWeight: '600' }}>{selectedBookingReceipt.guests} Guests</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Check-in Date</span>
                    <div style={{ fontWeight: '600' }}>{selectedBookingReceipt.checkInDate}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Check-out Date</span>
                    <div style={{ fontWeight: '600' }}>{selectedBookingReceipt.checkOutDate} ({selectedBookingReceipt.numberOfNights} Nights)</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Subtotal:</span>
                    <span>₹{Number(selectedBookingReceipt.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Tax (10%):</span>
                    <span>₹{Number(selectedBookingReceipt.tax).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.2rem', color: 'var(--navy-900)', borderTop: '1px solid var(--slate-200)', paddingTop: '10px', marginTop: '4px' }}>
                    <span>Total Paid:</span>
                    <span>₹{Number(selectedBookingReceipt.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setReceiptModalOpen(false)} className="btn btn-primary">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
