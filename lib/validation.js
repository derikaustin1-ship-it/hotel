/**
 * Server-side Input Validation & Sanitization
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Escapes HTML characters to prevent XSS in email and display templates
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Gets today's date string in YYYY-MM-DD format based on local/IST time
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates booking creation request
 * @param {Object} data
 * @param {Object} roomRecord - Room record from database
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateBookingRequest(data, roomRecord) {
  const errors = {};

  // Customer Name
  if (!data.customerName || typeof data.customerName !== 'string' || data.customerName.trim().length < 2) {
    errors.customerName = 'Customer full name must be at least 2 characters long';
  } else if (data.customerName.trim().length > 100) {
    errors.customerName = 'Customer name cannot exceed 100 characters';
  }

  // Customer Email
  if (!data.customerEmail || typeof data.customerEmail !== 'string' || !EMAIL_REGEX.test(data.customerEmail.trim())) {
    errors.customerEmail = 'A valid customer email address is required';
  }

  // Customer Phone
  if (!data.customerPhone || typeof data.customerPhone !== 'string' || data.customerPhone.trim().length < 7) {
    errors.customerPhone = 'A valid contact phone number is required (min 7 digits)';
  } else if (data.customerPhone.trim().length > 25) {
    errors.customerPhone = 'Phone number is too long';
  }

  // Check-In Date
  if (!data.checkInDate || !DATE_REGEX.test(data.checkInDate)) {
    errors.checkInDate = 'A valid check-in date (YYYY-MM-DD) is required';
  }

  // Check-Out Date
  if (!data.checkOutDate || !DATE_REGEX.test(data.checkOutDate)) {
    errors.checkOutDate = 'A valid check-out date (YYYY-MM-DD) is required';
  }

  // Date Logic
  if (data.checkInDate && data.checkOutDate && DATE_REGEX.test(data.checkInDate) && DATE_REGEX.test(data.checkOutDate)) {
    const today = getTodayDateString();
    if (data.checkInDate < today) {
      errors.checkInDate = 'Check-in date cannot be in the past';
    }
    if (data.checkOutDate <= data.checkInDate) {
      errors.checkOutDate = 'Check-out date must be strictly after the check-in date';
    }
  }

  // Room verification
  if (!roomRecord) {
    errors.roomId = 'Selected room does not exist or is inactive';
  } else {
    if (roomRecord.status !== 'AVAILABLE') {
      errors.roomId = `Room #${roomRecord.room_number || roomRecord.id} is currently under maintenance and cannot be booked`;
    }

    // Guest Count vs Capacity
    const guests = parseInt(data.guests, 10);
    if (isNaN(guests) || guests < 1) {
      errors.guests = 'Number of guests must be at least 1';
    } else if (guests > (roomRecord.capacity || 10)) {
      errors.guests = `Selected room accommodates a maximum of ${roomRecord.capacity} guests`;
    }
  }

  // Payment Method
  const validMethods = ['CARD', 'UPI', 'CASH', 'NET_BANKING'];
  if (data.paymentMethod && !validMethods.includes(String(data.paymentMethod).toUpperCase())) {
    errors.paymentMethod = 'Invalid payment method selected';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
