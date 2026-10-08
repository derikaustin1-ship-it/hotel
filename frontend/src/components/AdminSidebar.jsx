import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BedDouble, 
  Calendar, 
  Users, 
  LogOut, 
  Hotel,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminSidebar = () => {
  const { logout, user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    success('Admin logged out successfully');
    navigate('/admin/login');
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    color: isActive ? '#ffffff' : 'var(--slate-400)',
    backgroundColor: isActive ? 'rgba(197, 155, 39, 0.2)' : 'transparent',
    borderLeft: isActive ? '4px solid var(--primary-gold)' : '4px solid transparent',
    fontWeight: isActive ? '700' : '500',
    fontSize: '0.92rem',
    transition: 'all 0.2s',
    textDecoration: 'none',
  });

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--primary-gold)',
            color: '#ffffff',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex'
          }}>
            <Hotel size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontWeight: '700', fontSize: '1.05rem' }}>
              GRAND LUXE
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--primary-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Management Portal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <NavLink to="/admin/dashboard" style={linkStyle}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/rooms" style={linkStyle}>
          <BedDouble size={18} />
          <span>Rooms Management</span>
        </NavLink>

        <NavLink to="/admin/bookings" style={linkStyle}>
          <Calendar size={18} />
          <span>Bookings & Requests</span>
        </NavLink>

        <NavLink to="/admin/customers" style={linkStyle}>
          <Users size={18} />
          <span>Guest Directory</span>
        </NavLink>

        <div style={{ margin: '14px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}></div>

        <NavLink to="/" style={linkStyle}>
          <Home size={18} />
          <span>View Public Site</span>
        </NavLink>
      </div>

      {/* Admin User Info & Logout */}
      <div style={{
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>
          Logged in as: <strong style={{ color: '#ffffff' }}>{user?.name || 'Administrator'}</strong>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-danger btn-sm"
          style={{ width: '100%', display: 'flex', gap: '8px' }}
        >
          <LogOut size={16} /> Logout Admin
        </button>
      </div>
    </aside>
  );
};

export const DashboardCard = ({ title, value, subtitle, icon: Icon, color = 'var(--primary-gold)', trend }) => {
  return (
    <div className="card" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '4px' }}>
            {value}
          </h3>
        </div>
        <div style={{
          backgroundColor: `${color}15`,
          color: color,
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {Icon && <Icon size={24} />}
        </div>
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {trend && <span style={{ color: 'var(--emerald-600)', fontWeight: '700' }}>{trend}</span>}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
