import React, { useState, useEffect } from 'react';
import { customerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/StatusBadge';
import { User, Mail, Phone, Calendar, ShieldCheck, Check, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getMyProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone });
      success('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile details..." fullScreen />;

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '40px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '30px' }}>
          <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Account Settings
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginTop: '4px' }}>
            Customer Profile
          </h1>
        </div>

        {error && <ErrorMessage message={error} />}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
        }}>
          {/* Profile Overview Card */}
          <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff', textAlign: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'var(--navy-900)',
              color: 'var(--primary-gold)',
              fontSize: '2.2rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              border: '3px solid var(--primary-gold)',
            }}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: '4px' }}>
              {profile?.name}
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {profile?.email}
            </p>

            <span className="badge badge-confirmed" style={{ marginBottom: '24px' }}>
              Verified Guest
            </span>

            <div style={{
              borderTop: '1px solid var(--slate-100)',
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
              fontSize: '0.88rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                <span>Total Bookings:</span>
                <strong>{profile?.totalBookings || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                <span>Account Role:</span>
                <strong style={{ color: 'var(--primary-gold)' }}>{profile?.role}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                <span>Member Since:</span>
                <strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active'}</strong>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="card" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '20px', fontWeight: '700' }}>
              Edit Personal Information
            </h3>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--slate-100)', cursor: 'not-allowed', color: 'var(--slate-500)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Email cannot be altered once verified.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
