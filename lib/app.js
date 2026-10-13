import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { calculateStayPricing, getTaxPercentage } from './pricing.js';
import { validateBookingRequest } from './validation.js';
import { checkRoomAvailability, findAvailableRooms } from './availability.js';
import { sendOwnerBookingNotification, sendCustomerConfirmationEmail } from './email.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_grand_luxe_jwt_secret_key_2026';

export const app = express();

// Trust proxy for Vercel / reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});

const authBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again in a few minutes.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authBookingLimiter);
app.use('/api/bookings', (req, res, next) => {
  if (req.method === 'POST') {
    return authBookingLimiter(req, res, next);
  }
  next();
});

// Helper: Format database room row
export function formatRoom(row) {
  if (!row) return null;
  const facilities = Array.isArray(row.facilities)
    ? row.facilities
    : (typeof row.facilities === 'string'
      ? row.facilities.split(',').map(s => s.trim()).filter(Boolean)
      : []);

  return {
    id: row.id,
    roomNumber: row.room_number,
    room_number: row.room_number,
    roomName: row.room_name || `${row.room_type} Suite`,
    room_name: row.room_name || `${row.room_type} Suite`,
    roomType: row.room_type,
    room_type: row.room_type,
    description: row.description || '',
    pricePerNight: Number(row.price_per_night),
    price_per_night: Number(row.price_per_night),
    capacity: Number(row.capacity),
    beds: Number(row.beds || 1),
    facilities,
    imageUrl: row.image_url || '',
    image_url: row.image_url || '',
    status: row.status || 'AVAILABLE',
    isActive: row.is_active !== false,
    is_active: row.is_active !== false,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

// Helper: Format database booking row
export function formatBooking(row, room) {
  if (!row) return null;
  const roomData = room || row.rooms || null;
  const roomNum = row.room_number || roomData?.room_number || '';
  const roomTyp = row.room_type || roomData?.room_type || '';
  const roomImg = row.room_image_url || roomData?.image_url || '';
  const roomPpn = row.price_per_night || roomData?.price_per_night || 0;

  return {
    id: row.id,
    bookingReference: row.booking_reference,
    booking_reference: row.booking_reference,
    roomId: row.room_id,
    room_id: row.room_id,
    userId: row.user_id,
    user_id: row.user_id,
    customerName: row.customer_name,
    customer_name: row.customer_name,
    customerEmail: row.customer_email,
    customer_email: row.customer_email,
    customerPhone: row.customer_phone || '',
    customer_phone: row.customer_phone || '',
    checkInDate: row.check_in,
    check_in: row.check_in,
    checkOutDate: row.check_out,
    check_out: row.check_out,
    numberOfNights: Number(row.number_of_nights),
    number_of_nights: Number(row.number_of_nights),
    guests: Number(row.guests),
    roomType: roomTyp,
    room_type: roomTyp,
    roomNumber: roomNum,
    room_number: roomNum,
    roomImageUrl: roomImg,
    room_image_url: roomImg,
    roomPricePerNight: Number(roomPpn),
    pricePerNight: Number(roomPpn),
    price_per_night: Number(roomPpn),
    subtotal: Number(row.subtotal),
    tax: Number(row.tax_amount),
    taxAmount: Number(row.tax_amount),
    tax_amount: Number(row.tax_amount),
    taxPercentage: Number(row.tax_percentage || 10),
    totalAmount: Number(row.total_amount),
    total_amount: Number(row.total_amount),
    status: row.status,
    paymentStatus: row.payment_status,
    payment_status: row.payment_status,
    paymentMethod: row.payment_method || 'CARD',
    payment_method: row.payment_method || 'CARD',
    transactionReference: row.transaction_reference || '',
    transaction_reference: row.transaction_reference || '',
    specialRequests: row.special_requests || '',
    special_requests: row.special_requests || '',
    notificationStatus: row.notification_status || 'PENDING',
    notification_status: row.notification_status || 'PENDING',
    notificationSentAt: row.notification_sent_at || null,
    notification_sent_at: row.notification_sent_at || null,
    notificationError: row.notification_error || null,
    notification_error: row.notification_error || null,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

// Helper: Format database user row
export function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role || 'CUSTOMER',
    createdAt: row.created_at,
    created_at: row.created_at,
  };
}

// Authentication Middlewares
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
    }
    req.user = decoded;
    next();
  });
}

export function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Administrative access required' });
  }
  next();
}

// Generate Booking References
function generateBookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `BK-${timestamp}-${rand}`;
}

function generateTransactionReference() {
  return `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: isSupabaseConfigured() ? 'configured' : 'missing_credentials',
    emailService: Boolean(process.env.RESEND_API_KEY) ? 'configured' : 'missing_api_key',
  });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { name, email, password, phone, role } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters long' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: cleanEmail,
        password_hash: passwordHash,
        phone: phone ? phone.trim() : null,
        role: assignedRole,
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ success: false, message: `Registration failed: ${insertError.message}` });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        role: newUser.role,
        token,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error during registration' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (findError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Support bcrypt comparison (or plain match fallback for local seed if bcrypt fails)
    let passwordMatches = false;
    if (user.password_hash) {
      passwordMatches = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatches && user.password_hash === password) {
        passwordMatches = true;
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        token,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error during login' });
  }
});

// ==========================================
// ROOMS ROUTES
// ==========================================

// GET /api/rooms/available (Must precede /api/rooms/:id)
app.get('/api/rooms/available', async (req, res) => {
  try {
    const { checkIn, checkOut, guests, roomType } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Both checkIn and checkOut dates (YYYY-MM-DD) are required',
      });
    }

    const availableRooms = await findAvailableRooms({
      checkIn: String(checkIn),
      checkOut: String(checkOut),
      guests: guests ? Number(guests) : undefined,
      roomType: roomType ? String(roomType) : undefined,
    });

    res.json({
      success: true,
      data: availableRooms.map(formatRoom),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to check room availability' });
  }
});

// GET /api/rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { type, status, minPrice, maxPrice, capacity } = req.query;
    let query = supabase.from('rooms').select('*').order('room_number', { ascending: true });

    if (type && type !== 'ALL') {
      query = query.ilike('room_type', type);
    }
    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }
    if (minPrice) {
      query = query.gte('price_per_night', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price_per_night', Number(maxPrice));
    }
    if (capacity) {
      query = query.gte('capacity', Number(capacity));
    }

    const { data: rooms, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, message: `Failed to fetch rooms: ${error.message}` });
    }

    res.json({
      success: true,
      data: (rooms || []).map(formatRoom),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/:id
app.get('/api/rooms/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { id } = req.params;
    let query = supabase.from('rooms').select('*');

    // Check if UUID or room_number
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('room_number', id);
    }

    const { data: room, error } = await query.maybeSingle();
    if (error || !room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({
      success: true,
      data: formatRoom(room),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch room' });
  }
});

// POST /api/rooms (Admin only)
app.post('/api/rooms', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const body = req.body;
    const roomNumber = body.roomNumber || body.room_number;
    const roomType = body.roomType || body.room_type || 'Deluxe';
    const roomName = body.roomName || body.room_name || `${roomType} Suite`;
    const price = body.pricePerNight || body.price_per_night;
    const capacity = body.capacity || 2;
    const beds = body.beds || 1;
    const description = body.description || '';
    const facilities = body.facilities || [];
    const imageUrl = body.imageUrl || body.image_url || '';
    const status = body.status || 'AVAILABLE';

    if (!roomNumber || !price) {
      return res.status(400).json({ success: false, message: 'Room number and price are required' });
    }

    const { data: createdRoom, error } = await supabase
      .from('rooms')
      .insert({
        room_number: String(roomNumber).trim(),
        room_name: roomName,
        room_type: roomType,
        price_per_night: Number(price),
        capacity: Number(capacity),
        beds: Number(beds),
        description,
        facilities: Array.isArray(facilities) ? facilities : String(facilities).split(','),
        image_url: imageUrl,
        status,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to create room: ${error.message}` });
    }

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: formatRoom(createdRoom),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create room' });
  }
});

// PUT /api/rooms/:id (Admin only)
app.put('/api/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { id } = req.params;
    const body = req.body;

    const updates = {};
    if (body.roomNumber || body.room_number) updates.room_number = String(body.roomNumber || body.room_number).trim();
    if (body.roomName || body.room_name) updates.room_name = body.roomName || body.room_name;
    if (body.roomType || body.room_type) updates.room_type = body.roomType || body.room_type;
    if (body.pricePerNight !== undefined || body.price_per_night !== undefined) {
      updates.price_per_night = Number(body.pricePerNight !== undefined ? body.pricePerNight : body.price_per_night);
    }
    if (body.capacity !== undefined) updates.capacity = Number(body.capacity);
    if (body.beds !== undefined) updates.beds = Number(body.beds);
    if (body.description !== undefined) updates.description = body.description;
    if (body.facilities !== undefined) {
      updates.facilities = Array.isArray(body.facilities) ? body.facilities : String(body.facilities).split(',');
    }
    if (body.imageUrl !== undefined || body.image_url !== undefined) {
      updates.image_url = body.imageUrl !== undefined ? body.imageUrl : body.image_url;
    }
    if (body.status !== undefined) updates.status = body.status;
    if (body.isActive !== undefined || body.is_active !== undefined) {
      updates.is_active = body.isActive !== undefined ? body.isActive : body.is_active;
    }

    const { data: updatedRoom, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to update room: ${error.message}` });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: formatRoom(updatedRoom),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update room' });
  }
});

// DELETE /api/rooms/:id (Admin only)
app.delete('/api/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { id } = req.params;
    const { error } = await supabase.from('rooms').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to delete room: ${error.message}` });
    }

    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete room' });
  }
});

// ==========================================
// BOOKINGS ROUTES
// ==========================================

// POST /api/bookings (Create booking - allows both guest & authenticated customers)
app.post('/api/bookings', optionalAuthenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const body = req.body || {};
    const roomId = body.roomId || body.room_id;
    const checkIn = body.checkInDate || body.check_in || body.checkIn;
    const checkOut = body.checkOutDate || body.check_out || body.checkOut;
    const guests = body.guests ? parseInt(body.guests, 10) : 1;
    const specialRequests = body.specialRequests || body.special_requests || '';
    const paymentMethod = (body.paymentMethod || body.payment_method || 'CARD').toUpperCase();

    // Determine customer info (use authenticated user if present and fields missing)
    const customerName = body.customerName || body.customer_name || req.user?.name || '';
    const customerEmail = body.customerEmail || body.customer_email || req.user?.email || '';
    const customerPhone = body.customerPhone || body.customer_phone || req.user?.phone || '';

    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    // 1. Fetch Room Record from DB (Single Source of Truth)
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (roomError || !room) {
      return res.status(404).json({ success: false, message: 'Selected room not found' });
    }

    // 2. Validate Request Body
    const validation = validateBookingRequest(
      {
        customerName,
        customerEmail,
        customerPhone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        paymentMethod,
      },
      room
    );

    if (!validation.isValid) {
      const firstErrorMessage = Object.values(validation.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstErrorMessage,
        validationErrors: validation.errors,
      });
    }

    // 3. Strict Half-Open Interval Availability Check
    const availability = await checkRoomAvailability(room.id, checkIn, checkOut);
    if (!availability.available) {
      return res.status(409).json({
        success: false,
        message: 'The room is already booked for the selected dates. Please choose different dates or select another suite.',
      });
    }

    // 4. Server-Side Trusted Price Computation
    const pricing = calculateStayPricing({
      pricePerNight: room.price_per_night,
      checkIn,
      checkOut,
    });

    const bookingRef = generateBookingReference();
    const txnRef = generateTransactionReference();

    // 5. Insert Booking into Persistent Supabase Database
    const bookingPayload = {
      booking_reference: bookingRef,
      room_id: room.id,
      room_name: room.room_name || `${room.room_type} Suite`,
      user_id: req.user?.id || null,
      customer_name: customerName.trim(),
      customer_email: customerEmail.toLowerCase().trim(),
      customer_phone: customerPhone ? customerPhone.trim() : null,
      check_in: checkIn,
      check_out: checkOut,
      number_of_nights: pricing.numberOfNights,
      guests,
      price_per_night: pricing.pricePerNight,
      subtotal: pricing.subtotal,
      tax_percentage: pricing.taxPercentage,
      tax_amount: pricing.taxAmount,
      total_amount: pricing.totalAmount,
      status: 'CONFIRMED',
      payment_status: 'PAID',
      payment_method: paymentMethod,
      transaction_reference: txnRef,
      special_requests: specialRequests ? specialRequests.trim() : null,
      notification_status: 'PENDING',
    };

    const { data: savedBooking, error: insertError } = await supabase
      .from('bookings')
      .insert(bookingPayload)
      .select('*, rooms(*)')
      .single();

    if (insertError) {
      // Check for PostgreSQL exclusion constraint violation (error code 23P01)
      if (insertError.code === '23P01' || insertError.message.includes('overlapping') || insertError.message.includes('exclude')) {
        return res.status(409).json({
          success: false,
          message: 'The room is already booked for the selected dates. Please select alternative dates.',
        });
      }
      return res.status(500).json({
        success: false,
        message: `Database error while saving booking: ${insertError.message}`,
      });
    }

    // Attach room details for email templates and response
    const completeBooking = {
      ...savedBooking,
      room_name: room.room_name,
      room_number: room.room_number,
      room_type: room.room_type,
      room_image_url: room.image_url,
    };

    // 6. Trigger Owner Notification via Resend (Resilient: never blocks/fails the booking)
    try {
      sendOwnerBookingNotification(completeBooking, room).catch((emailErr) => {
        console.error('Asynchronous Resend owner notification error:', emailErr.message);
      });
    } catch (e) {
      console.error('Failed to trigger email notification:', e.message);
    }

    // 7. Optional Customer Confirmation Email
    try {
      sendCustomerConfirmationEmail(completeBooking, room).catch((emailErr) => {
        console.error('Asynchronous customer confirmation email error:', emailErr.message);
      });
    } catch (e) {
      // Non-blocking
    }

    // 8. Return Verified Booking Response
    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: formatBooking(completeBooking, room),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'An error occurred while confirming your reservation',
    });
  }
});

// GET /api/bookings/my (Customer's own bookings)
app.get('/api/bookings/my', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    // Fetch bookings matching user_id OR matching customer_email
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .or(`user_id.eq.${req.user.id},customer_email.eq.${req.user.email}`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to fetch bookings: ${error.message}` });
    }

    res.json({
      success: true,
      data: (bookings || []).map((b) => formatBooking(b, b.rooms)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch customer bookings' });
  }
});

// GET /api/bookings/reference/:reference
app.get('/api/bookings/reference/:reference', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { reference } = req.params;
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('booking_reference', reference.trim())
      .maybeSingle();

    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    res.json({
      success: true,
      data: formatBooking(booking, booking.rooms),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch booking' });
  }
});

// GET /api/bookings/:id
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { id } = req.params;
    let query = supabase.from('bookings').select('*, rooms(*)');

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('booking_reference', id);
    }

    const { data: booking, error } = await query.maybeSingle();
    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: formatBooking(booking, booking.rooms),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch booking' });
  }
});

// PUT /api/bookings/:id/cancel
app.put('/api/bookings/:id/cancel', optionalAuthenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { id } = req.params;
    let query = supabase.from('bookings').select('*, rooms(*)');

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('booking_reference', id);
    }

    const { data: booking, error: fetchError } = await query.maybeSingle();
    if (fetchError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Permission check: if token present, must be owner or admin; if not authenticated, allow reference cancellation
    if (req.user && req.user.role !== 'ADMIN' && booking.user_id && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this booking' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', booking.id)
      .select('*, rooms(*)')
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: `Failed to cancel booking: ${updateError.message}` });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: formatBooking(updated, updated.rooms),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to cancel booking' });
  }
});

// GET /api/bookings (Admin or customer list)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    let query = supabase
      .from('bookings')
      .select('*, rooms(*)')
      .order('created_at', { ascending: false });

    // Non-admin can only see their own bookings
    if (req.user.role !== 'ADMIN') {
      query = query.or(`user_id.eq.${req.user.id},customer_email.eq.${req.user.email}`);
    }

    const { data: bookings, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, message: `Failed to fetch bookings: ${error.message}` });
    }

    res.json({
      success: true,
      data: (bookings || []).map((b) => formatBooking(b, b.rooms)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch bookings' });
  }
});

// PUT /api/bookings/:id/status (Admin only)
app.put('/api/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
    if (!status || !allowedStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
    }

    const { data: updated, error } = await supabase
      .from('bookings')
      .update({ status: status.toUpperCase() })
      .eq('id', id)
      .select('*, rooms(*)')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to update status: ${error.message}` });
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: formatBooking(updated, updated.rooms),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update status' });
  }
});

// POST /api/bookings/:id/retry-email (Admin only: Retry dispatching failed email)
app.post('/api/bookings/:id/retry-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { id } = req.params;
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const result = await sendOwnerBookingNotification(booking, booking.rooms);
    res.json({
      success: result.success,
      message: result.success ? 'Notification email dispatched successfully' : `Email failed: ${result.error}`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to retry notification' });
  }
});

// ==========================================
// ADMIN DASHBOARD & CUSTOMERS
// ==========================================

// GET /api/admin/dashboard
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    // 1. Fetch all bookings
    const { data: allBookings, error: bError } = await supabase
      .from('bookings')
      .select('*');

    if (bError) {
      return res.status(500).json({ success: false, message: `Failed to load dashboard metrics: ${bError.message}` });
    }

    // 2. Fetch all rooms
    const { data: allRooms, error: rError } = await supabase
      .from('rooms')
      .select('*');

    if (rError) {
      return res.status(500).json({ success: false, message: `Failed to load room metrics: ${rError.message}` });
    }

    // 3. Fetch all customers
    const { data: allUsers, error: uError } = await supabase
      .from('users')
      .select('id, role')
      .eq('role', 'CUSTOMER');

    const totalCustomers = (allUsers || []).length;
    const bookings = allBookings || [];
    const rooms = allRooms || [];

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;

    const totalRevenue = bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

    const totalRooms = rooms.length;

    // Occupied rooms today
    const today = new Date().toISOString().split('T')[0];
    const occupiedRoomIds = new Set(
      bookings
        .filter((b) => b.status !== 'CANCELLED' && b.check_in <= today && b.check_out > today)
        .map((b) => b.room_id)
    );
    const occupiedRooms = occupiedRoomIds.size;
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);

    // Distribution by room type
    const roomTypeDistribution = {};
    rooms.forEach((r) => {
      const type = r.room_type || 'Other';
      roomTypeDistribution[type] = (roomTypeDistribution[type] || 0) + 1;
    });

    // Distribution by booking status
    const statusDistribution = {
      CONFIRMED: 0,
      PENDING: 0,
      CHECKED_IN: 0,
      CHECKED_OUT: 0,
      CANCELLED: 0,
    };
    bookings.forEach((b) => {
      if (statusDistribution[b.status] !== undefined) {
        statusDistribution[b.status]++;
      } else {
        statusDistribution[b.status] = 1;
      }
    });

    // Recent 10 bookings
    const { data: recentRaw } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .order('created_at', { ascending: false })
      .limit(10);

    const recentBookings = (recentRaw || []).map((b) => formatBooking(b, b.rooms));

    res.json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalCustomers,
        roomTypeDistribution,
        statusDistribution,
        recentBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to compute dashboard metrics' });
  }
});

// GET /api/admin/customers
app.get('/api/admin/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, created_at')
      .eq('role', 'CUSTOMER')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to fetch customers: ${error.message}` });
    }

    res.json({
      success: true,
      data: (users || []).map(formatUser),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch customers' });
  }
});

// GET /api/customers
app.get('/api/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to fetch customers: ${error.message}` });
    }

    res.json({
      success: true,
      data: (users || []).map(formatUser),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch customers' });
  }
});

// GET /api/customers/profile
app.get('/api/customers/profile', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({
      success: true,
      data: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch profile' });
  }
});

// PUT /api/customers/profile
app.put('/api/customers/profile', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection is not configured' });
    }

    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, phone, role, created_at')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: `Failed to update profile: ${error.message}` });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: formatUser(updated),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update profile' });
  }
});

// Catch-all 404 for unhandled API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
