import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomApi } from '../services/api';
import RoomCard from '../components/RoomCard';
import { SkeletonCard } from '../components/StatusBadge';
import { 
  Wifi, 
  Clock, 
  Utensils, 
  Waves, 
  Car, 
  ConciergeBell, 
  Calendar, 
  Users, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Star
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Panel State
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    // Set default dates (today and 2 days later)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 2);

    setCheckInDate(today.toISOString().split('T')[0]);
    setCheckOutDate(tomorrow.toISOString().split('T')[0]);

    // Fetch featured rooms
    const loadRooms = async () => {
      try {
        const res = await roomApi.getAllRooms({ status: 'AVAILABLE' });
        if (res.success && res.data) {
          // Take top 3 or 4 rooms
          setFeaturedRooms(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load featured rooms', err);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
  };

  const hotelFeatures = [
    { icon: Wifi, title: 'High-Speed Wi-Fi', desc: 'Complimentary gigabit mesh internet across the entire estate.' },
    { icon: Clock, title: '24/7 Reception', desc: 'Round-the-clock front desk and multi-lingual concierge desk.' },
    { icon: ConciergeBell, title: '24/7 Room Service', desc: 'Signature in-room dining from our award-winning master chefs.' },
    { icon: Waves, title: 'Infinity Pool', desc: 'Heated rooftop swimming pool with panoramic skyline views.' },
    { icon: Utensils, title: 'Gourmet Restaurant', desc: 'Fine dining culinary experiences with fresh organic ingredients.' },
    { icon: Car, title: 'Valet Parking', desc: 'Secure covered valet parking and airport limousine transfer service.' },
  ];

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(rgba(11, 19, 43, 0.72), rgba(11, 19, 43, 0.82)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        padding: '60px 20px 100px 20px',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '960px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(197, 155, 39, 0.22)',
            border: '1px solid rgba(197, 155, 39, 0.6)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            color: 'var(--primary-gold)',
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            <Sparkles size={16} /> 5-Star Luxury Experience
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: '800',
            lineHeight: 1.15,
            marginBottom: '20px',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            Find Your Perfect Stay
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
            color: 'var(--slate-200)',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            fontWeight: '400',
            lineHeight: 1.6,
          }}>
            Comfortable rooms, exceptional service and effortless booking.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/rooms" className="btn btn-primary btn-lg">
              Explore Rooms <ArrowRight size={18} />
            </Link>
            <Link to="/rooms" className="btn btn-outline-white btn-lg">
              Book Now
            </Link>
          </div>
        </div>

        {/* 2. SEARCH PANEL OVERLAY */}
        <div style={{
          position: 'absolute',
          bottom: '-45px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '1060px',
          zIndex: 10,
        }}>
          <div className="card" style={{
            padding: '24px 30px',
            boxShadow: 'var(--shadow-xl)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--slate-200)',
          }}>
            <form onSubmit={handleSearch} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              alignItems: 'flex-end',
            }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="var(--primary-gold)" /> Check-in Date
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

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="var(--primary-gold)" /> Check-out Date
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

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} color="var(--primary-gold)" /> Number of Guests
                </label>
                <select
                  className="form-control"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1 Guest (Solo)</option>
                  <option value="2">2 Guests (Couple / Pair)</option>
                  <option value="3">3 Guests (Family)</option>
                  <option value="4">4 Guests (Group)</option>
                  <option value="6">5+ Guests (Executive)</option>
                </select>
              </div>

              <div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
                  <Search size={18} /> Search Available Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Spacer for overlapping search panel */}
      <div style={{ height: '70px' }}></div>

      {/* 3. FEATURED ROOMS SECTION */}
      <section style={{ padding: '70px 0', backgroundColor: 'var(--slate-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ color: 'var(--primary-gold)', fontWeight: '700', letterSpacing: '0.1em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Handcrafted Accommodations
              </span>
              <h2 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginTop: '4px' }}>
                Featured Rooms & Suites
              </h2>
            </div>
            <Link to="/rooms" className="btn btn-outline-slate">
              View All Rooms <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '26px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '26px' }}>
              {featuredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  guests={guests}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOTEL FEATURES / AMENITIES */}
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--slate-200)', borderBottom: '1px solid var(--slate-200)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 50px auto' }}>
            <span style={{ color: 'var(--primary-gold)', fontWeight: '700', letterSpacing: '0.1em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Unrivaled Comfort
            </span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginTop: '4px', marginBottom: '12px' }}>
              Hotel Features & Amenities
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
              Every detail is meticulously curated to provide you with seamless relaxation, world-class dining, and unforgettable comfort.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
          }}>
            {hotelFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '30px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                    border: '1px solid var(--slate-200)',
                  }}
                >
                  <div style={{
                    backgroundColor: 'var(--primary-gold-light)',
                    color: 'var(--primary-gold)',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexShrink: 0,
                  }}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '8px', fontWeight: '700' }}>
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. ABOUT HOTEL SECTION */}
      <section style={{ padding: '90px 0', backgroundColor: 'var(--slate-50)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px',
            alignItems: 'center',
          }}>
            {/* Image Collage */}
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
                alt="Grand Luxe Interior"
                style={{
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '-25px',
                right: '-15px',
                backgroundColor: 'var(--navy-900)',
                color: '#ffffff',
                padding: '20px 24px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ color: 'var(--primary-gold)', fontWeight: '800', fontSize: '2.2rem', lineHeight: 1 }}>
                  25+
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: '1.3' }}>
                  Years of Unmatched<br /><strong>Hospitality Excellence</strong>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div>
              <span style={{ color: 'var(--primary-gold)', fontWeight: '700', letterSpacing: '0.1em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Welcome to Grand Luxe
              </span>
              <h2 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginTop: '6px', marginBottom: '18px' }}>
                Where Timeless Elegance Meets Modern Luxury
              </h2>
              <p style={{ color: 'var(--slate-600)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '16px' }}>
                Nestled in the prime coastal sanctuary of Luxury Bay, Grand Luxe Hotel & Suites has stood as a beacon of refined grandeur, architectural magnificence, and bespoke guest care.
              </p>
              <p style={{ color: 'var(--slate-600)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '28px' }}>
                Whether you visit for a high-level executive summit, an intimate romantic getaway, or a lavish family vacation, our personalized concierge service ensures effortless experiences at every turn.
              </p>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '30px' }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--navy-900)' }}>100%</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Verified Booking Guarantee</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--slate-200)' }}></div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--navy-900)' }}>4.9 / 5</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={14} color="var(--primary-gold)" fill="var(--primary-gold)" /> Guest Satisfaction
                  </div>
                </div>
              </div>

              <Link to="/about" className="btn btn-secondary">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'var(--navy-900)',
        color: '#ffffff',
        textAlign: 'center',
        backgroundImage: 'radial-gradient(circle at center, rgba(197, 155, 39, 0.15) 0%, rgba(11, 19, 43, 0) 70%)',
      }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '14px' }}>
            Ready for a comfortable stay?
          </h2>
          <p style={{ color: 'var(--slate-300)', fontSize: '1.1rem', marginBottom: '32px' }}>
            Secure your preferred luxury room now with instant confirmation and flexible cancellation policies.
          </p>
          <Link to="/rooms" className="btn btn-primary btn-lg">
            Book Your Room <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
