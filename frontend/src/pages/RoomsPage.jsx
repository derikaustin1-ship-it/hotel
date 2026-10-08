import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomApi } from '../services/api';
import RoomCard from '../components/RoomCard';
import { SkeletonCard, ErrorMessage } from '../components/StatusBadge';
import { Filter, SlidersHorizontal, Calendar, Users, RotateCcw, Search, BedDouble } from 'lucide-react';

const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States initialized from URL params if present
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || 'ALL');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '25000');
  const [capacity, setCapacity] = useState(searchParams.get('guests') || searchParams.get('capacity') || 'ALL');
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      // If dates are provided, use the date availability endpoint
      if (checkInDate && checkOutDate) {
        const params = {
          checkInDate,
          checkOutDate,
          roomType: roomType !== 'ALL' ? roomType : undefined,
          capacity: capacity !== 'ALL' ? parseInt(capacity, 10) : undefined,
        };
        res = await roomApi.getAvailableRooms(params);
      } else {
        const params = {
          roomType: roomType !== 'ALL' ? roomType : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          capacity: capacity !== 'ALL' ? parseInt(capacity, 10) : undefined,
        };
        res = await roomApi.getAllRooms(params);
      }

      if (res.success && res.data) {
        setRooms(res.data);
      } else {
        setRooms([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [roomType, maxPrice, capacity, checkInDate, checkOutDate]);

  const handleResetFilters = () => {
    setRoomType('ALL');
    setMaxPrice('25000');
    setCapacity('ALL');
    setCheckInDate('');
    setCheckOutDate('');
    setSearchParams({});
  };

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: '85vh', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>
          <span style={{ color: 'var(--primary-gold)', fontWeight: '700', letterSpacing: '0.12em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Accommodations
          </span>
          <h1 style={{ fontSize: '2.8rem', color: 'var(--navy-900)', marginTop: '4px', marginBottom: '12px' }}>
            Rooms & Luxury Suites
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem' }}>
            Discover our curated collection of sophisticated spaces tailored for restorative sleep, leisure, and executive productivity.
          </p>
        </div>

        {/* Filter Panel */}
        <div className="card" style={{ padding: '24px', marginBottom: '36px', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--slate-100)',
            paddingBottom: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--navy-900)' }}>
              <SlidersHorizontal size={18} color="var(--primary-gold)" /> Filter & Availability Search
            </div>
            <button
              onClick={handleResetFilters}
              className="btn btn-outline-slate btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
            alignItems: 'flex-end',
          }}>
            {/* Room Type */}
            <div>
              <label className="form-label">Room Type</label>
              <select
                className="form-control"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="ALL">All Room Types</option>
                <option value="Single">Single Room</option>
                <option value="Double">Double Room</option>
                <option value="Deluxe">Deluxe Room</option>
                <option value="Suite">Suite</option>
                <option value="Executive Suite">Executive Suite</option>
                <option value="Presidential Suite">Presidential Suite</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="form-label">Guests Capacity</label>
              <select
                className="form-control"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              >
                <option value="ALL">Any Capacity</option>
                <option value="1">1+ Guest</option>
                <option value="2">2+ Guests</option>
                <option value="3">3+ Guests</option>
                <option value="4">4+ Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>

            {/* Check-in */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--primary-gold)" /> Check-in Date
              </label>
              <input
                type="date"
                className="form-control"
                value={checkInDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--primary-gold)" /> Check-out Date
              </label>
              <input
                type="date"
                className="form-control"
                value={checkOutDate}
                min={checkInDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>

            {/* Max Price Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label">Max Price/Night</label>
                <span style={{ fontWeight: '700', color: 'var(--navy-900)', fontSize: '0.9rem' }}>
                  ₹{Number(maxPrice).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="1500"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary-gold)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            Showing <strong>{rooms.length}</strong> {rooms.length === 1 ? 'room' : 'rooms'} found
            {checkInDate && checkOutDate && <span style={{ color: 'var(--emerald-600)', fontWeight: '600' }}> (Available for {checkInDate} to {checkOutDate})</span>}
          </div>
        </div>

        {/* Room Grid / States */}
        {error && <ErrorMessage message={error} onRetry={fetchRooms} />}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '26px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : rooms.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <BedDouble size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
              No Rooms Match Your Criteria
            </h3>
            <p style={{ color: 'var(--slate-500)', maxWidth: '460px', margin: '0 auto 20px auto' }}>
              Try adjusting your price range, guest count, or selected booking dates to see available rooms.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '26px' }}>
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                guests={capacity !== 'ALL' ? capacity : '2'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
