import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { StatusBadge, ErrorMessage } from '../../components/StatusBadge';
import { 
  Calendar, 
  Search, 
  CheckCircle, 
  XCircle, 
  CheckCheck, 
  Eye, 
  FileText, 
  X,
  CreditCard,
  User,
  BedDouble
} from 'lucide-react';

const AdminBookingsPage = () => {
  const { success, error: toastError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status Change Confirmation Dialog State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingApi.getAllBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const triggerStatusUpdate = (booking, newStatus) => {
    setSelectedBooking(booking);
    setTargetStatus(newStatus);
    setStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedBooking || !targetStatus) return;
    setUpdating(true);
    try {
      const res = await bookingApi.updateBookingStatus(selectedBooking.id, targetStatus);
      if (res.success) {
        success(`Booking ${selectedBooking.bookingReference} marked as ${targetStatus}`);
        setStatusModalOpen(false);
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (err) {
      toastError(err.message || 'Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  const openDetailsModal = (booking) => {
    setViewBooking(booking);
    setDetailsModalOpen(true);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Reservation Desk
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--navy-900)', marginTop: '4px' }}>
              Guest Reservations Management
            </h1>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchBookings} />}

        {/* Filter Bar */}
        <div className="card" style={{ padding: '18px 24px', backgroundColor: '#ffffff', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by reference, guest name, email, or room #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--slate-600)' }}>Status:</span>
              <select
                className="form-control"
                style={{ width: '180px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card" style={{ padding: '0', backgroundColor: '#ffffff' }}>
          {loading ? (
            <LoadingSpinner message="Fetching all hotel bookings..." />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Customer</th>
                    <th>Room</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Manage Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--navy-900)' }}>
                            {b.bookingReference}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {new Date(b.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <strong>{b.customerName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{b.customerEmail}</div>
                        </td>
                        <td>
                          <strong>#{b.roomNumber}</strong> - {b.roomType}
                        </td>
                        <td>
                          <div>{b.checkInDate} → {b.checkOutDate}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                            {b.numberOfNights} Nights • {b.guests} Guests
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--navy-900)' }}>
                            ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <StatusBadge status={b.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => openDetailsModal(b)}
                              className="btn btn-outline-slate btn-sm"
                              title="View Details"
                            >
                              <Eye size={14} /> View
                            </button>

                            {b.status === 'PENDING' && (
                              <button
                                onClick={() => triggerStatusUpdate(b, 'CONFIRMED')}
                                className="btn btn-primary btn-sm"
                                title="Confirm Booking"
                              >
                                <CheckCircle size={14} /> Confirm
                              </button>
                            )}

                            {b.status === 'CONFIRMED' && (
                              <button
                                onClick={() => triggerStatusUpdate(b, 'COMPLETED')}
                                className="btn btn-secondary btn-sm"
                                style={{ backgroundColor: 'var(--blue-500)' }}
                                title="Mark Checked Out / Completed"
                              >
                                <CheckCheck size={14} /> Complete
                              </button>
                            )}

                            {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                              <button
                                onClick={() => triggerStatusUpdate(b, 'CANCELLED')}
                                className="btn btn-danger btn-sm"
                                title="Cancel Booking"
                              >
                                <XCircle size={14} /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
                        No reservations found matching the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Confirmation Modal */}
        <ConfirmationModal
          isOpen={statusModalOpen}
          title={`Update Status to ${targetStatus}`}
          message={`Are you sure you want to change the status of booking reference "${selectedBooking?.bookingReference}" for guest "${selectedBooking?.customerName}" to ${targetStatus}?`}
          confirmText={`Mark as ${targetStatus}`}
          cancelText="Dismiss"
          isDanger={targetStatus === 'CANCELLED'}
          loading={updating}
          onConfirm={confirmStatusUpdate}
          onCancel={() => {
            setStatusModalOpen(false);
            setSelectedBooking(null);
          }}
        />

        {/* Booking Details Modal */}
        {detailsModalOpen && viewBooking && (
          <div className="modal-backdrop" onClick={() => setDetailsModalOpen(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--navy-900)' }}>
                    Reservation Invoice & Details
                  </h3>
                  <button onClick={() => setDetailsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Booking Reference</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      {viewBooking.bookingReference}
                    </div>
                  </div>
                  <StatusBadge status={viewBooking.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Customer</span>
                    <div style={{ fontWeight: '700', color: 'var(--navy-900)' }}>{viewBooking.customerName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>{viewBooking.customerEmail}</div>
                    {viewBooking.customerPhone && <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>{viewBooking.customerPhone}</div>}
                  </div>

                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Room Information</span>
                    <div style={{ fontWeight: '700', color: 'var(--navy-900)' }}>Room #{viewBooking.roomNumber} ({viewBooking.roomType})</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>₹{Number(viewBooking.roomPricePerNight).toLocaleString('en-IN')} / night</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Check-in & Check-out</span>
                    <div style={{ fontWeight: '600' }}>{viewBooking.checkInDate} to {viewBooking.checkOutDate}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>{viewBooking.numberOfNights} Nights • {viewBooking.guests} Guests</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>Payment Status</span>
                    <div style={{ fontWeight: '600', color: 'var(--emerald-600)' }}>{viewBooking.paymentStatus} ({viewBooking.paymentMethod})</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontFamily: 'monospace' }}>Txn: {viewBooking.transactionReference}</div>
                  </div>
                </div>

                {viewBooking.specialRequests && (
                  <div style={{ backgroundColor: 'var(--slate-100)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '18px' }}>
                    <strong>Special Guest Instructions:</strong> "{viewBooking.specialRequests}"
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Subtotal:</span>
                    <span>₹{Number(viewBooking.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Tax (10% GST):</span>
                    <span>₹{Number(viewBooking.tax).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.25rem', color: 'var(--navy-900)', borderTop: '1px solid var(--slate-200)', paddingTop: '10px' }}>
                    <span>Total Amount:</span>
                    <span>₹{Number(viewBooking.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setDetailsModalOpen(false)} className="btn btn-primary">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBookingsPage;
