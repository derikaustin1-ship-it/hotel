import { getSupabase } from './supabase.js';

/**
 * Checks whether a room is available for a requested half-open date interval [checkIn, checkOut).
 * Overlap condition:
 *   existing_check_in < requestedCheckOut
 *   AND
 *   existing_check_out > requestedCheckIn
 *   AND
 *   status != 'CANCELLED'
 * 
 * @param {string} roomId - UUID of room
 * @param {string} checkIn - YYYY-MM-DD
 * @param {string} checkOut - YYYY-MM-DD
 * @returns {Promise<{ available: boolean, conflictingBookings: Array }>}
 */
export async function checkRoomAvailability(roomId, checkIn, checkOut) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Database client not configured');
  }

  const { data: overlapping, error } = await supabase
    .from('bookings')
    .select('id, booking_reference, check_in, check_out, status')
    .eq('room_id', roomId)
    .neq('status', 'CANCELLED')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  if (error) {
    throw new Error(`Database error checking availability: ${error.message}`);
  }

  const isAvailable = !overlapping || overlapping.length === 0;

  return {
    available: isAvailable,
    conflictingBookings: overlapping || [],
  };
}

/**
 * Finds all active rooms available for a requested date range and capacity.
 * 
 * @param {Object} params
 * @param {string} params.checkIn - YYYY-MM-DD
 * @param {string} params.checkOut - YYYY-MM-DD
 * @param {number} [params.guests]
 * @param {string} [params.roomType]
 * @returns {Promise<Array>} List of available rooms
 */
export async function findAvailableRooms({ checkIn, checkOut, guests, roomType }) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Database client not configured');
  }

  // 1. Fetch all active and available rooms
  let query = supabase
    .from('rooms')
    .select('*')
    .eq('is_active', true)
    .eq('status', 'AVAILABLE');

  if (roomType && roomType !== 'ALL') {
    query = query.ilike('room_type', roomType);
  }

  if (guests && Number(guests) > 0) {
    query = query.gte('capacity', Number(guests));
  }

  const { data: rooms, error: roomsError } = await query;
  if (roomsError) {
    throw new Error(`Failed to query rooms: ${roomsError.message}`);
  }

  if (!rooms || rooms.length === 0) {
    return [];
  }

  // 2. Fetch all conflicting active bookings across the date interval
  const { data: overlappingBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('room_id')
    .neq('status', 'CANCELLED')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  if (bookingsError) {
    throw new Error(`Failed to check overlapping reservations: ${bookingsError.message}`);
  }

  const bookedRoomIds = new Set((overlappingBookings || []).map((b) => b.room_id));

  // 3. Filter out rooms that have conflicts
  return rooms.filter((room) => !bookedRoomIds.has(room.id));
}
