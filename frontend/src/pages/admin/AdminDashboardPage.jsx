import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { AdminSidebar, DashboardCard } from '../../components/AdminSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { StatusBadge, ErrorMessage } from '../../components/StatusBadge';
import { 
  BedDouble, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrative dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Management Console
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--navy-900)', marginTop: '4px' }}>
              Operations & Performance Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/rooms" className="btn btn-primary btn-sm">
              <BedDouble size={16} /> Manage Rooms
            </Link>
            <Link to="/admin/bookings" className="btn btn-secondary btn-sm">
              <Calendar size={16} /> View Bookings
            </Link>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchDashboard} />}

        {loading ? (
          <LoadingSpinner message="Calculating real-time hotel metrics..." />
        ) : stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Top Stat Cards (4 Columns) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '20px',
            }}>
              <DashboardCard
                title="Total Revenue"
                value={`₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
                subtitle="From confirmed bookings"
                icon={DollarSign}
                color="var(--emerald-600)"
                trend="+18%"
              />

              <DashboardCard
                title="Total Bookings"
                value={stats.totalBookings}
                subtitle={`${stats.confirmedBookings} Confirmed • ${stats.pendingBookings} Pending`}
                icon={Calendar}
                color="var(--blue-500)"
              />

              <DashboardCard
                title="Room Occupancy"
                value={`${stats.occupiedRooms} / ${stats.totalRooms}`}
                subtitle={`${stats.availableRooms} Available for reservation`}
                icon={BedDouble}
                color="var(--primary-gold)"
              />

              <DashboardCard
                title="Registered Guests"
                value={stats.totalCustomers}
                subtitle="Verified customer accounts"
                icon={Users}
                color="var(--slate-700)"
              />
            </div>

            {/* Middle Section: Distribution Visuals */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}>
              {/* Room Inventory Distribution */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '18px', fontWeight: '700' }}>
                  Room Inventory Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {stats.roomTypeDistribution && Object.entries(stats.roomTypeDistribution).map(([type, count]) => {
                    const percentage = stats.totalRooms ? Math.round((count / stats.totalRooms) * 100) : 0;
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--slate-700)' }}>{type} Suite</span>
                          <span style={{ color: 'var(--slate-500)' }}>{count} Rooms ({percentage}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--primary-gold)', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Status Distribution */}
              <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '18px', fontWeight: '700' }}>
                  Booking Status Distribution
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--emerald-50)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--emerald-600)', fontWeight: '700', textTransform: 'uppercase' }}>Confirmed</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--emerald-600)', marginTop: '4px' }}>{stats.confirmedBookings}</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--amber-50)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--amber-500)', fontWeight: '700', textTransform: 'uppercase' }}>Pending</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--amber-500)', marginTop: '4px' }}>{stats.pendingBookings}</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--blue-50)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--blue-500)', fontWeight: '700', textTransform: 'uppercase' }}>Completed</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--blue-500)', marginTop: '4px' }}>{stats.completedBookings}</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--rose-50)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--rose-500)', fontWeight: '700', textTransform: 'uppercase' }}>Cancelled</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--rose-500)', marginTop: '4px' }}>{stats.cancelledBookings}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: '700' }}>
                  Recent Guest Reservations
                </h3>
                <Link to="/admin/bookings" style={{ color: 'var(--primary-gold)', fontSize: '0.88rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View All Bookings <ArrowRight size={14} />
                </Link>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Guest Name</th>
                      <th>Room</th>
                      <th>Stay Dates</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings && stats.recentBookings.length > 0 ? (
                      stats.recentBookings.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--navy-900)' }}>
                            {b.bookingReference}
                          </td>
                          <td>
                            <strong>{b.customerName}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{b.customerEmail}</div>
                          </td>
                          <td>
                            {b.roomType} (Room #{b.roomNumber})
                          </td>
                          <td>
                            {b.checkInDate} → {b.checkOutDate}
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{b.numberOfNights} Nights • {b.guests} Guests</div>
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--navy-900)' }}>
                            ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--slate-500)' }}>
                          No reservations recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
