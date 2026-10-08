import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Hotel, Mail, Lock, LogIn, Sparkles, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomerLogin = () => {
    setEmail('john@example.com');
    setPassword('Customer@123');
  };

  return (
    <div style={{
      minHeight: '82vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--slate-50)',
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-gold) 0%, #a67c1e 100%)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '12px',
            display: 'inline-flex',
            marginBottom: '12px',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <Hotel size={30} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--navy-900)' }}>
            Customer Sign In
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Access your reservations and luxury member privileges
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
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px', marginBottom: '16px' }}
          >
            <LogIn size={18} /> {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div style={{
          backgroundColor: 'var(--slate-50)',
          border: '1px dashed var(--slate-300)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          textAlign: 'center',
          marginBottom: '22px',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: '8px' }}>
            College Demo Guest Account:
          </div>
          <button
            type="button"
            onClick={handleDemoCustomerLogin}
            className="btn btn-outline-gold btn-sm"
            style={{ width: '100%' }}
          >
            <Sparkles size={14} /> Auto-fill Demo Credentials (john@example.com)
          </button>
        </div>

        {/* Footer Link to Register */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
            Create Account
          </Link>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '16px' }}>
          Hotel Staff or Admin?{' '}
          <Link to="/admin/login" style={{ color: 'var(--navy-600)', textDecoration: 'underline' }}>
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
