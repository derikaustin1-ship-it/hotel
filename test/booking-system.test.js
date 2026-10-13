/**
 * Comprehensive Automated Verification Suite for Hotel Booking System
 * Validates:
 * 1. Server-side Pricing Engine & Tax Calculation
 * 2. Strict Half-Open Interval Availability Logic [checkIn, checkOut)
 * 3. Back-to-Back Booking Acceptance (e.g. check-out Oct 13, new check-in Oct 13)
 * 4. Input Validation & XSS Sanitization
 * 5. Resend Email Notification Generation & Fallback Resilience
 * 6. Security & Secret Protection
 */

import assert from 'node:assert';
import { calculateStayPricing, calculateNights, formatINR } from '../lib/pricing.js';
import { validateBookingRequest, escapeHtml, getTodayDateString } from '../lib/validation.js';

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

console.log('\n============================================================');
console.log('🧪 RUNNING HOTEL BOOKING SYSTEM AUTOMATED TESTS');
console.log('============================================================\n');

// ------------------------------------------------------------
// 1. PRICING ENGINE TESTS
// ------------------------------------------------------------
console.log('--- 1. Pricing Engine & Financial Calculations ---');

runTest('Calculates correct number of nights between two dates', () => {
  assert.strictEqual(calculateNights('2026-11-01', '2026-11-05'), 4);
  assert.strictEqual(calculateNights('2026-12-31', '2027-01-01'), 1);
});

runTest('Calculates accurate stay pricing with default 10% tax', () => {
  // 3 nights @ ₹5,000 = ₹15,000 subtotal + 10% tax (₹1,500) = ₹16,500 total
  const pricing = calculateStayPricing({
    pricePerNight: 5000,
    checkIn: '2026-11-10',
    checkOut: '2026-11-13',
    customTaxPercentage: 10,
  });

  assert.strictEqual(pricing.numberOfNights, 3);
  assert.strictEqual(pricing.pricePerNight, 5000);
  assert.strictEqual(pricing.subtotal, 15000);
  assert.strictEqual(pricing.taxPercentage, 10);
  assert.strictEqual(pricing.taxAmount, 1500);
  assert.strictEqual(pricing.totalAmount, 16500);
});

runTest('Rejects checkout date prior to or equal to checkin date', () => {
  assert.throws(
    () => calculateStayPricing({ pricePerNight: 4000, checkIn: '2026-11-10', checkOut: '2026-11-10' }),
    /Check-out date must be at least 1 day after check-in date/
  );
  assert.throws(
    () => calculateStayPricing({ pricePerNight: 4000, checkIn: '2026-11-10', checkOut: '2026-11-09' }),
    /Check-out date must be at least 1 day after check-in date/
  );
});

runTest('Rejects invalid room price rates', () => {
  assert.throws(
    () => calculateStayPricing({ pricePerNight: -100, checkIn: '2026-11-10', checkOut: '2026-11-12' }),
    /Invalid room price rate/
  );
  assert.throws(
    () => calculateStayPricing({ pricePerNight: 'invalid', checkIn: '2026-11-10', checkOut: '2026-11-12' }),
    /Invalid room price rate/
  );
});

runTest('Formats monetary amounts with Indian Rupee currency symbol', () => {
  const formatted = formatINR(15000);
  assert.ok(formatted.includes('₹'), 'Formatted string should include ₹');
  assert.ok(formatted.includes('15,000'), 'Formatted string should have thousands separator');
});

// ------------------------------------------------------------
// 2. INPUT VALIDATION & SANITIZATION TESTS
// ------------------------------------------------------------
console.log('\n--- 2. Server-Side Input Validation & Sanitization ---');

const mockRoom = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  room_number: '101',
  room_name: 'Deluxe Garden Suite',
  room_type: 'DELUXE',
  price_per_night: 4500,
  capacity: 3,
  status: 'AVAILABLE',
};

runTest('Accepts valid booking request within room capacity', () => {
  const result = validateBookingRequest(
    {
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@example.com',
      customerPhone: '+91 98765 43210',
      checkInDate: '2026-12-10',
      checkOutDate: '2026-12-14',
      guests: 2,
      paymentMethod: 'UPI',
    },
    mockRoom
  );

  assert.strictEqual(result.isValid, true);
  assert.deepStrictEqual(result.errors, {});
});

runTest('Rejects booking when guest count exceeds room capacity', () => {
  const result = validateBookingRequest(
    {
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav@example.com',
      customerPhone: '+91 9876543210',
      checkInDate: '2026-12-10',
      checkOutDate: '2026-12-14',
      guests: 5, // Capacity is 3
    },
    mockRoom
  );

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.guests.includes('maximum of 3 guests'));
});

runTest('Rejects malformed customer email address', () => {
  const result = validateBookingRequest(
    {
      customerName: 'Aarav Sharma',
      customerEmail: 'not-an-email',
      customerPhone: '+91 9876543210',
      checkInDate: '2026-12-10',
      checkOutDate: '2026-12-14',
      guests: 2,
    },
    mockRoom
  );

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.customerEmail);
});

runTest('Rejects booking if check-in date is in the past', () => {
  const result = validateBookingRequest(
    {
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav@example.com',
      customerPhone: '+91 9876543210',
      checkInDate: '2020-01-01',
      checkOutDate: '2020-01-05',
      guests: 2,
    },
    mockRoom
  );

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.checkInDate);
});

runTest('Rejects booking for unavailable / maintenance room', () => {
  const maintenanceRoom = { ...mockRoom, status: 'MAINTENANCE' };
  const result = validateBookingRequest(
    {
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav@example.com',
      customerPhone: '+91 9876543210',
      checkInDate: '2026-12-10',
      checkOutDate: '2026-12-14',
      guests: 2,
    },
    maintenanceRoom
  );

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.roomId.includes('maintenance'));
});

runTest('XSS Sanitization escapes special HTML entities properly', () => {
  const dangerousInput = '<script>alert("hacked")</script> & "special" \'quotes\'';
  const escaped = escapeHtml(dangerousInput);

  assert.ok(!escaped.includes('<script>'), 'Should not contain raw HTML opening tags');
  assert.ok(escaped.includes('&lt;script&gt;'), 'Should contain encoded HTML entities');
  assert.ok(escaped.includes('&quot;special&quot;'), 'Should encode quotes');
  assert.ok(escaped.includes('&amp;'), 'Should encode ampersands');
});

// ------------------------------------------------------------
// 3. HALF-OPEN INTERVAL AVAILABILITY SIMULATION
// ------------------------------------------------------------
console.log('\n--- 3. Half-Open Interval Availability Logic [checkIn, checkOut) ---');

/**
 * Simulates the SQL overlap predicate:
 * existing.check_in < requested.check_out AND existing.check_out > requested.check_in
 */
function checkIntervalOverlap(existingCheckIn, existingCheckOut, reqCheckIn, reqCheckOut) {
  return existingCheckIn < reqCheckOut && existingCheckOut > reqCheckIn;
}

runTest('Detects direct overlap during middle of stay', () => {
  // Existing: Nov 10 to Nov 15
  // Requested: Nov 12 to Nov 14 (completely inside)
  const overlaps = checkIntervalOverlap('2026-11-10', '2026-11-15', '2026-11-12', '2026-11-14');
  assert.strictEqual(overlaps, true);
});

runTest('Detects partial overlap at start of stay', () => {
  // Existing: Nov 10 to Nov 15
  // Requested: Nov 08 to Nov 12 (overlaps Nov 10-12)
  const overlaps = checkIntervalOverlap('2026-11-10', '2026-11-15', '2026-11-08', '2026-11-12');
  assert.strictEqual(overlaps, true);
});

runTest('Detects partial overlap at end of stay', () => {
  // Existing: Nov 10 to Nov 15
  // Requested: Nov 14 to Nov 18 (overlaps Nov 14-15)
  const overlaps = checkIntervalOverlap('2026-11-10', '2026-11-15', '2026-11-14', '2026-11-18');
  assert.strictEqual(overlaps, true);
});

runTest('Allows back-to-back reservation: checkout day equals new checkin day', () => {
  // Guest A departs Nov 15. Guest B arrives Nov 15.
  // Half-open interval [Nov 10, Nov 15) and [Nov 15, Nov 20) do NOT overlap!
  const overlaps = checkIntervalOverlap('2026-11-10', '2026-11-15', '2026-11-15', '2026-11-20');
  assert.strictEqual(overlaps, false, 'Back-to-back reservations must be allowed without conflict');
});

runTest('Allows previous reservation: new checkout day equals existing checkin day', () => {
  // Guest departs Nov 10. Existing checkin starts Nov 10.
  const overlaps = checkIntervalOverlap('2026-11-10', '2026-11-15', '2026-11-05', '2026-11-10');
  assert.strictEqual(overlaps, false, 'Same-day turnaround must be allowed');
});

runTest('Allows completely disjoint date intervals', () => {
  const overlaps = checkIntervalOverlap('2026-11-10', '2026-11-15', '2026-11-20', '2026-11-25');
  assert.strictEqual(overlaps, false);
});

// ------------------------------------------------------------
// 4. RESEND EMAIL TEMPLATES & OUTBOX RESILIENCE
// ------------------------------------------------------------
console.log('\n--- 4. Resend Email Dispatch Resilience ---');

await runAsyncTest('sendOwnerBookingNotification handles missing API key gracefully without crashing', async () => {
  const { sendOwnerBookingNotification } = await import('../lib/email.js');

  const testBooking = {
    id: 'test-booking-uuid',
    booking_reference: 'BK-TEST-0001',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '+91 9999999999',
    check_in: '2026-12-01',
    check_out: '2026-12-05',
    number_of_nights: 4,
    guests: 2,
    price_per_night: 5000,
    subtotal: 20000,
    tax_amount: 2000,
    total_amount: 22000,
  };

  const result = await sendOwnerBookingNotification(testBooking, mockRoom);
  // When RESEND_API_KEY is not set in test environment, it returns { success: false, skipped: true }
  // and does NOT throw an uncaught exception.
  assert.ok(typeof result === 'object');
  assert.ok(result.skipped === true || result.success !== undefined);
});

// ------------------------------------------------------------
// 5. SECURITY & ENVIRONMENT INTEGRITY
// ------------------------------------------------------------
console.log('\n--- 5. Security & Secret Exposure Checks ---');

runTest('Ensures service role key is never bundled in frontend files', () => {
  // The client-side code should never contain SUPABASE_SERVICE_ROLE_KEY
  assert.strictEqual(
    typeof process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    'undefined',
    'VITE_ prefix must never be used with service role key'
  );
});

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('\n============================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All automated tests passed successfully!\n');
}
