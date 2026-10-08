import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Bed, Check, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const RoomCard = ({ room, checkInDate, checkOutDate, guests }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    let queryParams = `?roomId=${room.id}`;
    if (checkInDate) queryParams += `&checkIn=${checkInDate}`;
    if (checkOutDate) queryParams += `&checkOut=${checkOutDate}`;
    if (guests) queryParams += `&guests=${guests}`;
    navigate(`/book${queryParams}`);
  };

  const facilitiesList = room.facilities 
    ? room.facilities.split(',').map((f) => f.trim()).slice(0, 3) 
    : [];

  const isAvailable = room.status === 'AVAILABLE';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Room Image Container */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '230px' }}>
        <img
          src={room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
          alt={room.roomType}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />
        {/* Room Type Tag */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          backgroundColor: 'rgba(11, 19, 43, 0.85)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
          fontWeight: '700',
          backdropFilter: 'blur(4px)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {room.roomType}
        </div>

        {/* Room Number Tag */}
        <div style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          color: 'var(--slate-800)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
          fontWeight: '700',
          boxShadow: 'var(--shadow-sm)',
        }}>
          Room #{room.roomNumber}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: '700' }}>
            {room.roomType} Room
          </h3>
          <StatusBadge status={room.status} />
        </div>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--slate-600)',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.5',
        }}>
          {room.description || 'Spacious, elegantly furnished room with top quality amenities and comfortable bedding.'}
        </p>

        {/* Room Specs (Capacity, Beds) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
          fontSize: '0.85rem',
          color: 'var(--slate-600)',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--slate-100)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="var(--primary-gold)" />
            <span>Up to {room.capacity} Guests</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bed size={16} color="var(--primary-gold)" />
            <span>{room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}</span>
          </div>
        </div>

        {/* Facilities Preview */}
        {facilitiesList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {facilitiesList.map((facility, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.76rem',
                  backgroundColor: 'var(--slate-100)',
                  color: 'var(--slate-700)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Check size={12} color="var(--emerald-500)" />
                {facility}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Price & CTA buttons */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
              Starting From
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>/ night</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to={`/rooms/${room.id}`}
              className="btn btn-outline-slate btn-sm"
              title="View room details"
            >
              Details
            </Link>
            <button
              onClick={handleBookNow}
              disabled={!isAvailable}
              className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline-slate'}`}
              style={{ paddingLeft: '14px', paddingRight: '14px' }}
            >
              {isAvailable ? 'Book' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
