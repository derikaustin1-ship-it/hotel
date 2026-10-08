import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--navy-900)',
      color: 'var(--slate-400)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '60px',
      paddingBottom: '30px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px',
        }}>
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-gold) 0%, #a67c1e 100%)',
                color: '#ffffff',
                padding: '7px',
                borderRadius: '8px',
                display: 'flex',
              }}>
                <Hotel size={22} />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#ffffff', fontWeight: '700' }}>
                GRAND LUXE
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Experience unrivaled luxury, comfort, and hospitality. Designed for discerning guests who expect exceptional quality and unforgettable stays.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--primary-gold)' }}>
              <ShieldCheck size={16} /> 100% Secure & Verified Booking Platform
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '18px', fontWeight: '700' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><Link to="/rooms" style={{ color: 'var(--slate-300)', transition: 'color 0.2s' }}>Luxury Rooms & Suites</Link></li>
              <li><Link to="/about" style={{ color: 'var(--slate-300)', transition: 'color 0.2s' }}>About Grand Luxe</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--slate-300)', transition: 'color 0.2s' }}>Contact & Concierge</Link></li>
              <li><Link to="/my-bookings" style={{ color: 'var(--slate-300)', transition: 'color 0.2s' }}>Manage Bookings</Link></li>
              <li><Link to="/admin/login" style={{ color: 'var(--slate-300)', transition: 'color 0.2s' }}>Staff / Admin Login</Link></li>
            </ul>
          </div>

          {/* Col 3: Amenities */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '18px', fontWeight: '700' }}>
              Hotel Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>24/7 Dedicated Butler Service</li>
              <li>Michelin-Star In-Room Dining</li>
              <li>Infinity Heated Swimming Pool</li>
              <li>Ayurvedic & Luxury Spa Sanctuary</li>
              <li>Valet Parking & Limousine Pickups</li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '18px', fontWeight: '700' }}>
              Contact Concierge
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-300)' }}>
                <MapPin size={18} color="var(--primary-gold)" />
                <span>742 Ocean Royale Boulevard, Luxury Bay</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-300)' }}>
                <Phone size={18} color="var(--primary-gold)" />
                <span>+1 (800) 589-3200</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-300)' }}>
                <Mail size={18} color="var(--primary-gold)" />
                <span>concierge@grandluxehotel.com</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '25px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.85rem',
        }}>
          <div>
            © {new Date().getFullYear()} Grand Luxe Hotel & Suites. Full-Stack Java Spring Boot & React Project.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Crafted with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for College Java & Web Application Demo
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
