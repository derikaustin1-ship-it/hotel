import React, { useState, useEffect } from 'react';
import { customerApi } from '../../services/api';
import { AdminSidebar } from '../../components/AdminSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/StatusBadge';
import { Users, Search, User, Mail, Phone, Calendar, Eye, X } from 'lucide-react';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Customer Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.getAllCustomers();
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewCustomer = (cust) => {
    setSelectedCustomer(cust);
    setModalOpen(true);
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Guest Relations
          </span>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--navy-900)', marginTop: '4px' }}>
            Customer & Guest Directory
          </h1>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchCustomers} />}

        {/* Search Bar */}
        <div className="card" style={{ padding: '18px 24px', backgroundColor: '#ffffff', marginBottom: '24px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="card" style={{ padding: '0', backgroundColor: '#ffffff' }}>
          {loading ? (
            <LoadingSpinner message="Fetching guest profiles..." />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Total Bookings</th>
                    <th>Registration Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c) => (
                      <tr key={c.id}>
                        <td style={{ color: 'var(--slate-500)', fontWeight: '600' }}>#{c.id}</td>
                        <td>
                          <strong style={{ color: 'var(--navy-900)' }}>{c.name}</strong>
                        </td>
                        <td>{c.email}</td>
                        <td>{c.phone || <span style={{ color: 'var(--slate-400)' }}>Not provided</span>}</td>
                        <td>
                          <span style={{
                            backgroundColor: 'var(--primary-gold-light)',
                            color: 'var(--primary-gold)',
                            fontWeight: '700',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.82rem',
                          }}>
                            {c.totalBookings} {c.totalBookings === 1 ? 'Stay' : 'Stays'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--slate-600)' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleViewCustomer(c)}
                              className="btn btn-outline-slate btn-sm"
                            >
                              <Eye size={14} /> Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
                        No customers match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {modalOpen && selectedCustomer && (
          <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div style={{ padding: '28px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--navy-900)',
                  color: 'var(--primary-gold)',
                  fontSize: '2rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '-10px auto 14px auto',
                  border: '3px solid var(--primary-gold)'
                }}>
                  {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'G'}
                </div>

                <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)' }}>{selectedCustomer.name}</h3>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '20px' }}>Guest ID #{selectedCustomer.id}</p>

                <div style={{
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--slate-200)',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={16} color="var(--primary-gold)" />
                    <span><strong>Email:</strong> {selectedCustomer.email}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={16} color="var(--primary-gold)" />
                    <span><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={16} color="var(--primary-gold)" />
                    <span><strong>Member Since:</strong> {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'Active'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} color="var(--primary-gold)" />
                    <span><strong>Total Reservations:</strong> {selectedCustomer.totalBookings} bookings</span>
                  </div>
                </div>

                <button onClick={() => setModalOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCustomersPage;
