import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--slate-50)',
    }}>
      <div style={{ maxWidth: '500px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-gold-light)',
          color: 'var(--primary-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}>
          <Hotel size={36} />
        </div>
        <h1 style={{ fontSize: '4rem', color: 'var(--navy-900)', lineHeight: 1, marginBottom: '12px' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--slate-800)', marginBottom: '12px' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--slate-600)', marginBottom: '28px' }}>
          The luxury accommodation or page you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
