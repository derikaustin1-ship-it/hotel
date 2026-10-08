import React, { useState, useEffect } from 'react';
import { roomApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { StatusBadge, ErrorMessage } from '../../components/StatusBadge';
import { 
  BedDouble, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Eye, 
  X, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';

const AdminRoomsPage = () => {
  const { success, error: toastError } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); // null = Add mode, object = Edit mode
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Room Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Deluxe');
  const [pricePerNight, setPricePerNight] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [beds, setBeds] = useState('1');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [formError, setFormError] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roomApi.getAllRooms();
      if (res.success && res.data) {
        setRooms(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setRoomType('Deluxe');
    setPricePerNight('');
    setCapacity('2');
    setBeds('1');
    setDescription('');
    setFacilities('Free Wi-Fi, Air Conditioning, TV, Room Service, Breakfast, Parking');
    setImageUrl('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80');
    setStatus('AVAILABLE');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setPricePerNight(String(room.pricePerNight));
    setCapacity(String(room.capacity));
    setBeds(String(room.beds));
    setDescription(room.description || '');
    setFacilities(room.facilities || '');
    setImageUrl(room.imageUrl || '');
    setStatus(room.status || 'AVAILABLE');
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!roomNumber.trim() || !roomType.trim() || !pricePerNight) {
      setFormError('Room Number, Room Type, and Price per Night are required.');
      return;
    }

    if (parseFloat(pricePerNight) <= 0) {
      setFormError('Price per night must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        roomNumber: roomNumber.trim(),
        roomType: roomType.trim(),
        pricePerNight: parseFloat(pricePerNight),
        capacity: parseInt(capacity, 10),
        beds: parseInt(beds, 10),
        description: description.trim(),
        facilities: facilities.trim(),
        imageUrl: imageUrl.trim(),
        status,
      };

      if (editingRoom) {
        const res = await roomApi.updateRoom(editingRoom.id, payload);
        if (res.success) {
          success('Room updated successfully!');
          setModalOpen(false);
          fetchRooms();
        }
      } else {
        const res = await roomApi.createRoom(payload);
        if (res.success) {
          success('Room created successfully!');
          setModalOpen(false);
          fetchRooms();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    setDeleting(true);
    try {
      const res = await roomApi.deleteRoom(roomToDelete.id);
      if (res.success) {
        success('Room removed successfully!');
        setDeleteModalOpen(false);
        setRoomToDelete(null);
        fetchRooms();
      }
    } catch (err) {
      toastError(err.message || 'Failed to delete room');
    } finally {
      setDeleting(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || r.roomType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: 'var(--primary-gold)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Inventory Management
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--navy-900)', marginTop: '4px' }}>
              Rooms & Suites Directory
            </h1>
          </div>

          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} /> Add New Room
          </button>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchRooms} />}

        {/* Filter / Search Bar */}
        <div className="card" style={{ padding: '18px 24px', backgroundColor: '#ffffff', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by room number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--slate-600)' }}>Filter:</span>
              <select
                className="form-control"
                style={{ width: '180px' }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Room Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Executive Suite">Executive Suite</option>
                <option value="Presidential Suite">Presidential Suite</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="card" style={{ padding: '0', backgroundColor: '#ffffff' }}>
          {loading ? (
            <LoadingSpinner message="Loading room directory..." />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Room #</th>
                    <th>Type & Preview</th>
                    <th>Tariff Rate</th>
                    <th>Capacity</th>
                    <th>Beds</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <tr key={room.id}>
                        <td>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                            #{room.roomNumber}
                          </strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=100&q=80'}
                              alt={room.roomType}
                              style={{ width: '48px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong style={{ color: 'var(--slate-900)' }}>{room.roomType}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                {room.facilities ? room.facilities.split(',').slice(0, 2).join(', ') : 'Standard Amenities'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--navy-900)' }}>
                            ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}> / night</span>
                        </td>
                        <td>{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</td>
                        <td>{room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}</td>
                        <td>
                          <StatusBadge status={room.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => openEditModal(room)}
                              className="btn btn-outline-slate btn-sm"
                              title="Edit Room"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(room)}
                              className="btn btn-danger btn-sm"
                              title="Delete Room"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
                        No rooms match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Room Modal */}
        {modalOpen && (
          <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--navy-900)' }}>
                    {editingRoom ? `Edit Room #${editingRoom.roomNumber}` : 'Add New Hotel Room'}
                  </h3>
                  <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                    <X size={20} />
                  </button>
                </div>

                {formError && (
                  <div style={{ backgroundColor: '#fff1f2', color: '#e11d48', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '16px' }}>
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSaveRoom}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Room Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 101, 204, 501"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Room Type *</label>
                      <select
                        className="form-control"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        required
                      >
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Executive Suite">Executive Suite</option>
                        <option value="Presidential Suite">Presidential Suite</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price per Night (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="e.g. 3500.00"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Operational Status *</label>
                      <select
                        className="form-control"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Guest Capacity *</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-control"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Number of Beds *</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        className="form-control"
                        value={beds}
                        onChange={(e) => setBeds(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Image URL (Unsplash or direct URL)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Facilities / Inclusions (Comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Free Wi-Fi, Air Conditioning, TV, Room Service, Breakfast, Parking"
                        value={facilities}
                        onChange={(e) => setFacilities(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label className="form-label">Detailed Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Describe room furnishings, view, and unique features..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="button"
                      className="btn btn-outline-slate"
                      onClick={() => setModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving Room...' : (editingRoom ? 'Update Room' : 'Create Room')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Room"
          message={`Are you sure you want to permanently remove Room #${roomToDelete?.roomNumber} (${roomToDelete?.roomType})? This action cannot be undone.`}
          confirmText="Yes, Delete Room"
          cancelText="Cancel"
          isDanger={true}
          loading={deleting}
          onConfirm={confirmDeleteRoom}
          onCancel={() => {
            setDeleteModalOpen(false);
            setRoomToDelete(null);
          }}
        />
      </main>
    </div>
  );
};

export default AdminRoomsPage;
