/**
 * End-to-End HTTP Integration & Smoke Test Suite
 * Tests actual HTTP requests against the live Express server & Supabase database
 */

import http from 'http';
import { app } from '../lib/app.js';

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

let server = null;
let passedCount = 0;
let failedCount = 0;

function logPass(msg) {
  console.log(`  ✅ [PASS] ${msg}`);
  passedCount++;
}

function logFail(msg, err) {
  console.error(`  ❌ [FAIL] ${msg}: ${err}`);
  failedCount++;
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { raw: text };
  }

  return { status: res.status, ok: res.ok, data: json };
}

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(TEST_PORT, () => {
      console.log(`Test server listening on port ${TEST_PORT}`);
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

async function runAllE2ETests() {
  console.log('\n============================================================');
  console.log('🌐 EXECUTING FULL-STACK HTTP E2E VERIFICATION SUITE');
  console.log('============================================================\n');

  await startServer();

  try {
    // 1. Health Check
    console.log('--- 1. System Health Check ---');
    const health = await request('/health');
    if (health.status === 200 && health.data.status === 'ok') {
      logPass('GET /api/health returned 200 OK');
    } else {
      logFail('GET /api/health', JSON.stringify(health.data));
    }

    // 2. Room Endpoints
    console.log('\n--- 2. Rooms API Endpoints ---');
    const rooms = await request('/rooms');
    if (rooms.status === 200 && Array.isArray(rooms.data.data) && rooms.data.data.length >= 12) {
      logPass(`GET /api/rooms returned ${rooms.data.data.length} seeded rooms`);
    } else {
      logFail('GET /api/rooms', JSON.stringify(rooms.data));
    }

    const firstRoom = rooms.data?.data?.[0];
    if (firstRoom) {
      const roomById = await request(`/rooms/${firstRoom.id}`);
      if (roomById.status === 200 && roomById.data.data?.roomNumber === firstRoom.roomNumber) {
        logPass(`GET /api/rooms/:id returned room #${firstRoom.roomNumber}`);
      } else {
        logFail('GET /api/rooms/:id', JSON.stringify(roomById.data));
      }
    }

    // 3. Room Availability Endpoint
    console.log('\n--- 3. Availability Search Endpoint ---');
    const avail = await request('/rooms/available?checkIn=2026-12-01&checkOut=2026-12-05&guests=2');
    if (avail.status === 200 && Array.isArray(avail.data.data)) {
      logPass(`GET /api/rooms/available returned ${avail.data.data.length} available rooms`);
    } else {
      logFail('GET /api/rooms/available', JSON.stringify(avail.data));
    }

    // 4. Authentication Endpoints
    console.log('\n--- 4. Authentication (Register & Login) ---');
    // Admin Login (seeded in schema.sql: admin@hotel.com / admin123)
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@hotel.com', password: 'admin123' }),
    });

    let adminToken = null;
    if (adminLogin.status === 200 && adminLogin.data.data?.token) {
      adminToken = adminLogin.data.data.token;
      logPass(`POST /api/auth/login admin login successful (Role: ${adminLogin.data.data.role})`);
    } else {
      logFail('POST /api/auth/login admin login', JSON.stringify(adminLogin.data));
    }

    // Register a new customer
    const randEmail = `customer_${Date.now()}@example.com`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Customer',
        email: randEmail,
        password: 'password123',
        phone: '+91 9876543210',
      }),
    });

    let customerToken = null;
    let customerId = null;
    if (regRes.status === 201 && regRes.data.data?.token) {
      customerToken = regRes.data.data.token;
      customerId = regRes.data.data.id;
      logPass(`POST /api/auth/register registered customer (${randEmail})`);
    } else {
      logFail('POST /api/auth/register', JSON.stringify(regRes.data));
    }

    // 5. Booking Creation Flow
    console.log('\n--- 5. Booking Creation & Persistence ---');
    const testRoom = firstRoom;
    const randomDays = Math.floor(Math.random() * 500) + 60;
    const d1 = new Date(Date.now() + randomDays * 86400000);
    const d2 = new Date(d1.getTime() + 4 * 86400000);
    const checkIn = d1.toISOString().split('T')[0];
    const checkOut = d2.toISOString().split('T')[0];

    const bookingRes = await request('/bookings', {
      method: 'POST',
      headers: customerToken ? { Authorization: `Bearer ${customerToken}` } : {},
      body: JSON.stringify({
        roomId: testRoom.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: 2,
        customerName: 'Derik Austin',
        customerEmail: 'derikaustin1@gmail.com',
        customerPhone: '+91 9876543210',
        specialRequests: 'Quiet room with late checkout',
        paymentMethod: 'UPI',
      }),
    });

    let createdBooking = null;
    if (bookingRes.status === 201 && bookingRes.data.data?.bookingReference) {
      createdBooking = bookingRes.data.data;
      logPass(`POST /api/bookings created reservation: ${createdBooking.bookingReference}`);
      logPass(`Total calculated by server: ₹${createdBooking.totalAmount} (Nights: ${createdBooking.numberOfNights})`);
    } else {
      logFail('POST /api/bookings', JSON.stringify(bookingRes.data));
    }

    // 6. Overlapping Booking Rejection (Integrity Check)
    console.log('\n--- 6. Overlapping Reservation Conflict Detection ---');
    const overlapIn = new Date(d1.getTime() + 1 * 86400000).toISOString().split('T')[0];
    const overlapOut = new Date(d1.getTime() + 3 * 86400000).toISOString().split('T')[0];

    const overlapRes = await request('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        roomId: testRoom.id,
        checkInDate: overlapIn, // Directly inside the booking created in step 5
        checkOutDate: overlapOut,
        guests: 1,
        customerName: 'Conflict Guest',
        customerEmail: 'conflict@example.com',
        customerPhone: '+91 1234567890',
      }),
    });

    if (overlapRes.status === 409) {
      logPass('POST /api/bookings properly rejected overlapping reservation with 409 Conflict');
    } else {
      logFail('POST /api/bookings overlap rejection', `Expected 409, got ${overlapRes.status}: ${JSON.stringify(overlapRes.data)}`);
    }

    // 7. Booking Retrieval & Invoicing
    if (createdBooking) {
      console.log('\n--- 7. Booking Lookup & Invoicing Endpoints ---');
      const byId = await request(`/bookings/${createdBooking.id}`);
      if (byId.status === 200 && byId.data.data?.bookingReference === createdBooking.bookingReference) {
        logPass(`GET /api/bookings/:id retrieved booking details`);
      } else {
        logFail('GET /api/bookings/:id', JSON.stringify(byId.data));
      }

      const byRef = await request(`/bookings/reference/${createdBooking.bookingReference}`);
      if (byRef.status === 200 && byRef.data.data?.id === createdBooking.id) {
        logPass(`GET /api/bookings/reference/:reference retrieved booking by code`);
      } else {
        logFail('GET /api/bookings/reference/:reference', JSON.stringify(byRef.data));
      }
    }

    // 8. Customer Profile & My Bookings
    if (customerToken) {
      console.log('\n--- 8. Customer Profile & Bookings Management ---');
      const myBookings = await request('/bookings/my', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      if (myBookings.status === 200 && Array.isArray(myBookings.data.data)) {
        logPass(`GET /api/bookings/my returned ${myBookings.data.data.length} customer bookings`);
      } else {
        logFail('GET /api/bookings/my', JSON.stringify(myBookings.data));
      }

      const profile = await request('/customers/profile', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      if (profile.status === 200 && profile.data.data?.name) {
        logPass(`GET /api/customers/profile returned customer profile (${profile.data.data.name})`);
      } else {
        logFail('GET /api/customers/profile', JSON.stringify(profile.data));
      }
    }

    // 9. Admin Dashboard Metrics
    if (adminToken) {
      console.log('\n--- 9. Administrative Dashboard & Management ---');
      const dash = await request('/admin/dashboard', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (dash.status === 200 && dash.data.data?.totalRooms !== undefined) {
        const d = dash.data.data;
        logPass(`GET /api/admin/dashboard returned metrics: ${d.totalBookings} Bookings, ₹${d.totalRevenue} Revenue, ${d.totalRooms} Rooms`);
      } else {
        logFail('GET /api/admin/dashboard', JSON.stringify(dash.data));
      }

      const custs = await request('/admin/customers', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (custs.status === 200 && Array.isArray(custs.data.data)) {
        logPass(`GET /api/admin/customers returned ${custs.data.data.length} registered guests`);
      } else {
        logFail('GET /api/admin/customers', JSON.stringify(custs.data));
      }
    }

  } catch (err) {
    console.error('Unexpected error during E2E test execution:', err);
    failedCount++;
  } finally {
    await stopServer();
  }

  console.log('\n============================================================');
  console.log(`📊 E2E TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllE2ETests();
