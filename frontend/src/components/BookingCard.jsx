import React from 'react';
import { Calendar, Users, DollarSign, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const BookingCard = ({ booking, onCancelClick, onViewDetails }) => {
  const isCancellable = booking.status === 'CONFIRMED' || booking.status === 'PENDING';

  return (
    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar with Reference & Status */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--slate-50)',
        borderBottom: '1px solid var(--slate-200)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Reference:
          </span>
          <span style={{
            fontFamily: 'monospace',
            fontWeight: '700',
            fontSize: '0.95rem',
            color: 'var(--navy-900)',
            backgroundColor: '#ffffff',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid var(--slate-200)',
          }}>
            {booking.bookingReference}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            Booked on {new Date(booking.createdAt).toLocaleDateString()}
          </span>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {/* Room Thumbnail */}
        <div style={{ width: '130px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={booking.roomImageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
            alt={booking.roomType}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Stay & Room Details */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '700' }}>
            {booking.roomType} Suite — Room #{booking.roomNumber}
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.88rem', color: 'var(--slate-600)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--primary-gold)" />
              <span><strong>{booking.checkInDate}</strong> to <strong>{booking.checkOutDate}</strong></span>
              <span style={{ backgroundColor: 'var(--slate-100)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.78rem' }}>
                {booking.numberOfNights} {booking.numberOfNights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="var(--primary-gold)" />
              <span>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
            </div>
          </div>

          {booking.specialRequests && (
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
              <strong>Special Request:</strong> "{booking.specialRequests}"
            </p>
          )}
        </div>

        {/* Pricing Summary */}
        <div style={{
          minWidth: '160px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-end',
          borderLeft: '1px solid var(--slate-100)',
          paddingLeft: '20px',
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '600' }}>
            Total Paid (Inc. Tax)
          </span>
          <span style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--navy-900)' }}>
            ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <CheckCircle2 size={12} /> {booking.paymentMethod} • {booking.paymentStatus}
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#fafbfc',
        borderTop: '1px solid var(--slate-100)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        alignItems: 'center',
      }}>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(booking)}
            className="btn btn-outline-slate btn-sm"
          >
            <FileText size={15} /> Receipt / Summary
          </button>
        )}

        {isCancellable && (
          <button
            onClick={() => onCancelClick(booking)}
            className="btn btn-danger btn-sm"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
