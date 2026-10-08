import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Phone, Mail, MapPin, Send, Clock, MessageSquare } from 'lucide-react';

const ContactPage = () => {
  const { success } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      success('Thank you! Your message has been sent to our concierge desk.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSending(false);
    }, 800);
  };

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '40px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '1050px' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px auto' }}>
          <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Get In Touch
          </span>
          <h1 style={{ fontSize: '2.8rem', color: 'var(--navy-900)', marginTop: '4px', marginBottom: '12px' }}>
            Contact & Concierge Desk
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
            Have a custom accommodation request, event inquiry, or require assistance? Our concierge team is available 24/7.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
        }}>
          {/* Left: Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '30px', backgroundColor: 'var(--navy-900)', color: '#ffffff' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px', color: '#ffffff' }}>
                Concierge Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'rgba(197, 155, 39, 0.2)', color: 'var(--primary-gold)', padding: '10px', borderRadius: '8px' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--slate-200)' }}>Hotel Address</strong>
                    <span style={{ color: 'var(--slate-400)' }}>742 Ocean Royale Boulevard, Luxury Bay, CA 90210</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'rgba(197, 155, 39, 0.2)', color: 'var(--primary-gold)', padding: '10px', borderRadius: '8px' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--slate-200)' }}>Toll-Free Reservations</strong>
                    <span style={{ color: 'var(--slate-400)' }}>+1 (800) 589-3200 / +1 (555) 019-2834</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'rgba(197, 155, 39, 0.2)', color: 'var(--primary-gold)', padding: '10px', borderRadius: '8px' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--slate-200)' }}>Email Inquiries</strong>
                    <span style={{ color: 'var(--slate-400)' }}>concierge@grandluxehotel.com</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'rgba(197, 155, 39, 0.2)', color: 'var(--primary-gold)', padding: '10px', borderRadius: '8px' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--slate-200)' }}>Front Desk Hours</strong>
                    <span style={{ color: 'var(--slate-400)' }}>24 Hours a Day • 7 Days a Week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="card" style={{ padding: '36px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: '20px', fontWeight: '700' }}>
              Send a Direct Message
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Special Event Booking Inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Details *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="How may our concierge team assist you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                <Send size={16} /> {sending ? 'Transmitting Message...' : 'Send Message to Concierge'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
