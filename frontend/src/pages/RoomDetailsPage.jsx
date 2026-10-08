import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage, StatusBadge } from '../components/StatusBadge';
import { 
  Users, 
  Bed, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  CreditCard,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Car,
  UtensilsCrossed
} from 'lucide-react';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick booking date fields
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 2);
    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(future.toISOString().split('T')[0]);

    const fetchRoom = async () => {
      try {
        const res = await roomApi.getRoomById(id);
        if (res.success && res.data) {
          setRoom(res.data);
          setGuests(String(Math.min(2, res.data.capacity)));
        } else {
          setError('Room not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading room details..." fullScreen />;
  if (error || !room) return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <ErrorMessage message={error || 'Room not found'} onRetry={() => window.location.reload()} />
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/rooms" className="btn btn-outline-slate">
          <ArrowLeft size={16} /> Back to Rooms List
        </Link>
      </div>
    </div>
  );

  const isAvailable = room.status === 'AVAILABLE';
  const facilitiesList = room.facilities 
    ? room.facilities.split(',').map((f) => f.trim()) 
    : ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Room Service', 'Complimentary Breakfast', 'Valet Parking'];

  const handleProceedToBooking = () => {
    navigate(`/book?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '30px 0 80px 0' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link to="/rooms" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--slate-600)', fontWeight: '600', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to Rooms Catalog
          </Link>
        </div>

        {/* Room Title Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--primary-gold)', fontWeight: '700', letterSpacing: '0.1em', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                Room #{room.roomNumber}
              </span>
              <StatusBadge status={room.status} />
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--navy-900)' }}>
              {room.roomType} Luxury Suite
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
              Tariff Rate
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>/ night</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Details & Side Booking Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'flex-start'
        }}>
          {/* Left / Center Column: Gallery & Details */}
          <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Main Image */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', height: '420px' }}>
              <img
                src={room.imageUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'}
                alt={room.roomType}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Room Specs Highlights */}
            <div className="card" style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '20px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--primary-gold-light)', padding: '10px', borderRadius: '8px', color: 'var(--primary-gold)' }}>
                  <Users size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '600' }}>Max Capacity</div>
                  <div style={{ fontWeight: '700', color: 'var(--navy-900)', fontSize: '1.05rem' }}>{room.capacity} Guests</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--primary-gold-light)', padding: '10px', borderRadius: '8px', color: 'var(--primary-gold)' }}>
                  <Bed size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '600' }}>Bed Setup</div>
                  <div style={{ fontWeight: '700', color: 'var(--navy-900)', fontSize: '1.05rem' }}>{room.beds} {room.beds === 1 ? 'King Bed' : 'Beds'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--primary-gold-light)', padding: '10px', borderRadius: '8px', color: 'var(--primary-gold)' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: '600' }}>Housekeeping</div>
                  <div style={{ fontWeight: '700', color: 'var(--navy-900)', fontSize: '1.05rem' }}>Twice Daily</div>
                </div>
              </div>
            </div>

            {/* Room Description */}
            <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', marginBottom: '14px', fontWeight: '700' }}>
                About This Room
              </h3>
              <p style={{ color: 'var(--slate-700)', fontSize: '1rem', lineHeight: '1.8' }}>
                {room.description || 'Step into an oasis of comfort and serenity. Featuring plush custom bedding, floor-to-ceiling soundproof windows, high-speed Wi-Fi, ambient mood lighting, and modern bath fixtures with bespoke amenities.'}
              </p>
            </div>

            {/* Facilities & Amenities */}
            <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', marginBottom: '18px', fontWeight: '700' }}>
                Room Facilities & Inclusions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
              }}>
                {facilitiesList.map((facility, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)', fontSize: '0.95rem' }}>
                    <div style={{
                      backgroundColor: 'var(--emerald-50)',
                      color: 'var(--emerald-600)',
                      padding: '4px',
                      borderRadius: '50%',
                      display: 'flex'
                    }}>
                      <Check size={14} />
                    </div>
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Policies */}
            <div className="card" style={{ padding: '24px', backgroundColor: 'var(--slate-100)', border: 'none' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '12px', fontWeight: '700' }}>
                Stay Policies & Guidelines
              </h4>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: 'var(--slate-600)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
                <li>Complimentary cancellation up to 24 hours prior to check-in.</li>
                <li>Valid government-issued photo ID required at front desk.</li>
                <li>Non-smoking inside all suites (designated outdoor terraces available).</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Quick Booking Card */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xl)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: '18px', fontWeight: '700' }}>
                Reserve Your Stay
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--primary-gold)" /> Check-in Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--primary-gold)" /> Check-out Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} color="var(--primary-gold)" /> Guests
                  </label>
                  <select
                    className="form-control"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleProceedToBooking}
                disabled={!isAvailable}
                className={`btn btn-lg ${isAvailable ? 'btn-primary' : 'btn-outline-slate'}`}
                style={{ width: '100%', marginBottom: '14px' }}
              >
                {isAvailable ? 'Book Now' : 'Currently Unavailable'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--emerald-600)" />
                <span>Instant Confirmation • No Pre-payment Penalty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
