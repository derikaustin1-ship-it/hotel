import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Hotel, 
  Menu, 
  X, 
  User, 
  Calendar, 
  LogOut, 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--primary-gold)' : 'var(--slate-200)',
    fontWeight: isActive ? '700' : '500',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'color var(--transition-fast)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  return (
    <header style={{
      backgroundColor: 'var(--navy-900)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-gold) 0%, #a67c1e 100%)',
            color: '#ffffff',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <Hotel size={26} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.35rem',
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '0.05em',
              lineHeight: 1.1,
            }}>
              GRAND LUXE
            </div>
            <div style={{
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              color: 'var(--primary-gold)',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              Hotel & Suites
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-nav">
          {!isAdmin ? (
            <>
              <NavLink to="/" style={navLinkStyle}>Home</NavLink>
              <NavLink to="/rooms" style={navLinkStyle}>Rooms & Suites</NavLink>
              <NavLink to="/about" style={navLinkStyle}>About Us</NavLink>
              <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/admin/dashboard" style={navLinkStyle}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
              <NavLink to="/admin/rooms" style={navLinkStyle}>
                <BedDouble size={18} /> Rooms
              </NavLink>
              <NavLink to="/admin/bookings" style={navLinkStyle}>
                <Calendar size={18} /> Bookings
              </NavLink>
              <NavLink to="/admin/customers" style={navLinkStyle}>
                <Users size={18} /> Customers
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Action / Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }} className="desktop-nav">
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.82rem'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name.split(' ')[0]}</span>
                {isAdmin && <span className="badge badge-confirmed" style={{ fontSize: '0.65rem' }}>Admin</span>}
                <ChevronDown size={16} />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '210px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--slate-200)',
                    padding: '8px 0',
                    zIndex: 200,
                  }}
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--slate-100)' }}>
                    <div style={{ fontWeight: '700', color: 'var(--slate-800)', fontSize: '0.92rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
                  </div>

                  {!isAdmin && (
                    <>
                      <Link to="/my-bookings" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'var(--slate-700)',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}>
                        <Calendar size={16} color="var(--primary-gold)" /> My Bookings
                      </Link>
                      <Link to="/profile" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'var(--slate-700)',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}>
                        <User size={16} color="var(--primary-gold)" /> My Profile
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      color: 'var(--rose-500)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderTop: '1px solid var(--slate-100)',
                    }}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline-white btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
              <Link to="/admin/login" style={{ color: 'var(--slate-400)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }} title="Admin Portal">
                <ShieldCheck size={16} /> Admin
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '6px'
          }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--navy-900)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {!isAdmin ? (
            <>
              <NavLink to="/" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Home</NavLink>
              <NavLink to="/rooms" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Rooms & Suites</NavLink>
              <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>About Us</NavLink>
              <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Contact</NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/my-bookings" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                    <Calendar size={18} /> My Bookings
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                    <User size={18} /> My Profile
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
              <NavLink to="/admin/rooms" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                <BedDouble size={18} /> Room Management
              </NavLink>
              <NavLink to="/admin/bookings" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                <Calendar size={18} /> All Bookings
              </NavLink>
              <NavLink to="/admin/customers" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                <Users size={18} /> Customers
              </NavLink>
            </>
          )}

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px', marginTop: '6px' }}>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ width: '100%' }}
              >
                <LogOut size={16} /> Log Out ({user.name})
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline-white" style={{ width: '100%' }}>
                  Customer Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                  Create Account
                </Link>
                <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                  Admin Portal Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
