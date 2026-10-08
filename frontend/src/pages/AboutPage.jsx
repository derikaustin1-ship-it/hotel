import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Award, ShieldCheck, Sparkles, Heart, Users, CheckCircle, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 50px auto' }}>
          <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Our Heritage & Story
          </span>
          <h1 style={{ fontSize: '2.8rem', color: 'var(--navy-900)', marginTop: '4px', marginBottom: '14px' }}>
            About Grand Luxe Hotel & Suites
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            A premier sanctuary of timeless luxury, world-class culinary finesse, and dedicated hospitality designed for travelers seeking pure distinction.
          </p>
        </div>

        {/* Hero Image & Story */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '60px', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}>
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
              alt="Grand Luxe Architecture"
              style={{ width: '100%', height: '100%', minHeight: '360px', objectFit: 'cover' }}
            />
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Est. 2001 • Luxury Bay
              </span>
              <h2 style={{ fontSize: '2rem', color: 'var(--navy-900)', marginTop: '6px', marginBottom: '16px' }}>
                Crafting Unforgettable Experiences
              </h2>
              <p style={{ color: 'var(--slate-600)', lineHeight: '1.8', marginBottom: '16px', fontSize: '0.95rem' }}>
                Grand Luxe was founded with a singular ambition: to create an oasis where modern architectural elegance harmonizes with personalized guest care.
              </p>
              <p style={{ color: 'var(--slate-600)', lineHeight: '1.8', marginBottom: '24px', fontSize: '0.95rem' }}>
                Over the past two decades, our property has welcomed royal dignitaries, global executives, and discerning families from across the globe, earning accolades for service excellence and sustainable luxury practices.
              </p>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)' }}>120+</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>Luxury Suites</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--slate-200)' }}></div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)' }}>98.6%</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>Positive Ratings</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--slate-200)' }}></div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)' }}>24/7</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>Butler Service</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars / Values */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          marginBottom: '60px',
        }}>
          <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
            <div style={{ backgroundColor: 'var(--primary-gold-light)', color: 'var(--primary-gold)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Award size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '10px', fontWeight: '700' }}>
              Excellence in Service
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Our dedicated staff anticipates your desires, providing tailored service from touchdown to departure.
            </p>
          </div>

          <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
            <div style={{ backgroundColor: 'var(--primary-gold-light)', color: 'var(--primary-gold)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Sparkles size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '10px', fontWeight: '700' }}>
              Pristine Sanctuaries
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Every room is sanitized with medical-grade hospital standards, equipped with organic linen and hypoallergenic materials.
            </p>
          </div>

          <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
            <div style={{ backgroundColor: 'var(--primary-gold-light)', color: 'var(--primary-gold)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '10px', fontWeight: '700' }}>
              Seamless Reservations
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              State-of-the-art availability algorithm prevents double-bookings, offering transparent pricing with zero surprise fees.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/rooms" className="btn btn-primary btn-lg">
            Explore Available Suites <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
