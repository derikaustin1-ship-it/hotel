import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Hotel, UserPlus, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [validationErrors, setValidationErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Full Name is required.';
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (phone.trim().length < 7) {
      errors.phone = 'Please enter a valid contact phone number.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      success('Registration successful. Welcome to Grand Luxe Hotel!');
      navigate('/rooms');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please verify the input.');
    } finally {
      setLoading(false);
    }
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
        maxWidth: '500px',
        width: '100%',
        padding: '36px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-gold) 0%, #a67c1e 100%)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '12px',
            display: 'inline-flex',
            marginBottom: '10px',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <Hotel size={30} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--navy-900)' }}>
            Create Guest Account
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Join Grand Luxe to manage reservations and enjoy bespoke offers
          </p>
        </div>

        {/* Global Error Banner */}
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
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {validationErrors.name && <div className="form-error">{validationErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {validationErrors.email && <div className="form-error">{validationErrors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {validationErrors.phone && <div className="form-error">{validationErrors.phone}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {validationErrors.password && <div className="form-error">{validationErrors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {validationErrors.confirmPassword && <div className="form-error">{validationErrors.confirmPassword}</div>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px', marginBottom: '16px' }}
          >
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
