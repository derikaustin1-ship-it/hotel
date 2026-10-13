/**
 * Server-side Pricing Engine for Grand Luxe Hotel & Suites.
 * Computes strictly verified stay pricing from database room records.
 * Never trusts prices submitted by client browsers.
 */

export function getTaxPercentage() {
  const envTax = process.env.HOTEL_TAX_PERCENTAGE;
  if (envTax && !isNaN(Number(envTax))) {
    return Math.max(0, Number(envTax));
  }
  return 10.0; // Default 10% configurable GST / Hotel tax
}

/**
 * Calculates number of nights between two dates in YYYY-MM-DD format.
 */
export function calculateNights(checkInDateStr, checkOutDateStr) {
  const checkIn = new Date(`${checkInDateStr}T00:00:00Z`);
  const checkOut = new Date(`${checkOutDateStr}T00:00:00Z`);

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Computes stay pricing breakdown.
 * @param {Object} params
 * @param {number|string} params.pricePerNight - Trusted room rate from database
 * @param {string} params.checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} [params.customTaxPercentage] - Optional override
 * @returns {Object} Complete verified pricing breakdown
 */
export function calculateStayPricing({ pricePerNight, checkIn, checkOut, customTaxPercentage }) {
  const rate = Number(pricePerNight);
  if (isNaN(rate) || rate <= 0) {
    throw new Error('Invalid room price rate');
  }

  const nights = calculateNights(checkIn, checkOut);
  if (nights < 1) {
    throw new Error('Check-out date must be at least 1 day after check-in date');
  }

  const subtotal = Math.round(rate * nights * 100) / 100;
  const taxRate = typeof customTaxPercentage === 'number' ? customTaxPercentage : getTaxPercentage();
  const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    pricePerNight: rate,
    numberOfNights: nights,
    taxPercentage: taxRate,
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

/**
 * Formats monetary amounts in Indian Rupees (INR)
 */
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
