import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Lock, LogIn, Sparkles, ArrowLeft } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN') {
        setErrorMsg('Access denied. This account does not possess administrative privileges.');
        return;
      }
      success(`Welcome to Admin Management Portal, ${user.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminFill = () => {
    setEmail('admin@hotel.com');
    setPassword('Admin@123');
  };

  return (
    <div style={{
      minHeight: '82vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--navy-900)',
      color: '#ffffff',
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid rgba(197, 155, 39, 0.4)',
      }}>
        {/* Brand / Admin Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'var(--navy-900)',
            color: 'var(--primary-gold)',
            padding: '12px',
            borderRadius: '50%',
            display: 'inline-flex',
            marginBottom: '12px',
            border: '2px solid var(--primary-gold)',
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--navy-900)' }}>
            Admin Portal Access
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', marginTop: '4px' }}>
            Authorized hotel management and staff only
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#e11d48',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Security Key / Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', marginTop: '10px', marginBottom: '16px' }}
          >
            <LogIn size={18} /> {loading ? 'Authorizing...' : 'Enter Admin Console'}
          </button>
        </form>

        {/* Development Demo Credentials Box */}
        <div style={{
          backgroundColor: 'var(--slate-50)',
          border: '1px dashed var(--primary-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: '8px' }}>
            <strong>Demo Admin Account:</strong> admin@hotel.com / Admin@123
          </div>
          <button
            type="button"
            onClick={handleDemoAdminFill}
            className="btn btn-outline-gold btn-sm"
            style={{ width: '100%' }}
          >
            <Sparkles size={14} /> Auto-fill Admin Credentials
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.88rem' }}>
          <Link to="/" style={{ color: 'var(--slate-600)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
