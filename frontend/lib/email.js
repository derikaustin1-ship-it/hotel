import { Resend } from 'resend';
import { formatINR } from './pricing.js';
import { escapeHtml } from './validation.js';
import { getSupabase } from './supabase.js';

let resendInstance = null;

function getResendClient() {
  if (resendInstance) {
    return resendInstance;
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  resendInstance = new Resend(apiKey);
  return resendInstance;
}

/**
 * Sends an email notification to the hotel owner about a new booking.
 * 
 * @param {Object} booking - The saved booking record from Supabase
 * @param {Object} [room] - Associated room record
 * @returns {Promise<{ success: boolean, id?: string, error?: string, skipped?: boolean }>}
 */
export async function sendOwnerBookingNotification(booking, room) {
  const resend = getResendClient();
  const ownerEmail = process.env.HOTEL_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Grand Luxe Hotel <onboarding@resend.dev>';

  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY is not configured. Email notification skipped.');
    await recordNotificationLog({
      bookingId: booking.id,
      recipient: ownerEmail || 'unconfigured',
      type: 'OWNER_NOTIFICATION',
      subject: `New Hotel Booking — ${booking.booking_reference}`,
      status: 'SKIPPED',
      error: 'RESEND_API_KEY not configured in environment',
    });
    return { success: false, skipped: true, error: 'RESEND_API_KEY not configured' };
  }

  if (!ownerEmail) {
    console.warn('⚠️ HOTEL_NOTIFICATION_EMAIL is not configured. Email notification skipped.');
    await recordNotificationLog({
      bookingId: booking.id,
      recipient: 'unconfigured',
      type: 'OWNER_NOTIFICATION',
      subject: `New Hotel Booking — ${booking.booking_reference}`,
      status: 'SKIPPED',
      error: 'HOTEL_NOTIFICATION_EMAIL not configured in environment',
    });
    return { success: false, skipped: true, error: 'HOTEL_NOTIFICATION_EMAIL not configured' };
  }

  const subject = `New Hotel Booking — ${booking.booking_reference}`;
  const htmlContent = generateOwnerEmailHtml(booking, room);
  const textContent = generateOwnerEmailText(booking, room);

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Entity-Ref-ID': booking.booking_reference,
      },
    });

    if (response.error) {
      console.error('❌ Resend API returned error:', response.error.message);
      await recordNotificationLog({
        bookingId: booking.id,
        recipient: ownerEmail,
        type: 'OWNER_NOTIFICATION',
        subject,
        status: 'FAILED',
        error: response.error.message,
      });
      return { success: false, error: response.error.message };
    }

    const emailId = response.data?.id;
    console.log(`✅ Owner notification sent via Resend. ID: ${emailId}`);

    await recordNotificationLog({
      bookingId: booking.id,
      recipient: ownerEmail,
      type: 'OWNER_NOTIFICATION',
      subject,
      status: 'SENT',
      resendId: emailId,
    });

    // Update booking notification status in DB
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('bookings')
        .update({
          notification_status: 'SENT',
          notification_sent_at: new Date().toISOString(),
          notification_error: null,
        })
        .eq('id', booking.id);
    }

    return { success: true, id: emailId };
  } catch (err) {
    const errMsg = err?.message || 'Failed to dispatch email';
    console.error('❌ Unexpected error dispatching email via Resend:', errMsg);

    await recordNotificationLog({
      bookingId: booking.id,
      recipient: ownerEmail,
      type: 'OWNER_NOTIFICATION',
      subject,
      status: 'FAILED',
      error: errMsg,
    });

    // Update booking notification status to FAILED in DB
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('bookings')
        .update({
          notification_status: 'FAILED',
          notification_error: errMsg,
        })
        .eq('id', booking.id);
    }

    return { success: false, error: errMsg };
  }
}

/**
 * Optional: Sends a customer reservation confirmation email if enabled.
 */
export async function sendCustomerConfirmationEmail(booking, room) {
  if (process.env.SEND_CUSTOMER_CONFIRMATION !== 'true') {
    return { success: true, skipped: true };
  }

  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Grand Luxe Hotel <onboarding@resend.dev>';
  if (!resend || !booking.customer_email) {
    return { success: false, skipped: true };
  }

  const subject = `Your Reservation Confirmation — ${booking.booking_reference}`;
  const htmlContent = generateCustomerEmailHtml(booking, room);
  const textContent = generateCustomerEmailText(booking, room);

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: [booking.customer_email],
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    await recordNotificationLog({
      bookingId: booking.id,
      recipient: booking.customer_email,
      type: 'CUSTOMER_CONFIRMATION',
      subject,
      status: 'SENT',
      resendId: response.data?.id,
    });

    return { success: true, id: response.data?.id };
  } catch (err) {
    return { success: false, error: err?.message };
  }
}

/**
 * Logs notification activity in Supabase for auditability and retries
 */
async function recordNotificationLog({ bookingId, recipient, type, subject, status, error, resendId }) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('notification_logs').insert({
      booking_id: bookingId,
      recipient_email: recipient,
      notification_type: type,
      subject,
      status,
      attempts: 1,
      last_attempt_at: new Date().toISOString(),
      error_message: error || null,
      resend_id: resendId || null,
    });
  } catch (logErr) {
    console.error('Failed to write to notification_logs table:', logErr.message);
  }
}

/**
 * Generates clean, responsive HTML email for hotel owner.
 */
function generateOwnerEmailHtml(booking, room) {
  const roomName = escapeHtml(booking.room_name || room?.room_name || 'Luxury Suite');
  const custName = escapeHtml(booking.customer_name);
  const custEmail = escapeHtml(booking.customer_email);
  const custPhone = escapeHtml(booking.customer_phone);
  const specialReq = booking.special_requests ? escapeHtml(booking.special_requests) : 'None';
  const priceNight = formatINR(booking.price_per_night);
  const subtotal = formatINR(booking.subtotal);
  const tax = formatINR(booking.tax_amount);
  const total = formatINR(booking.total_amount);
  const createdAtFormatted = new Date(booking.created_at || Date.now()).toUTCString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Hotel Booking — ${escapeHtml(booking.booking_reference)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0b132b; padding: 28px 32px; text-align: center; border-bottom: 3px solid #c59b27;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; color: #ffffff; font-weight: 700;">GRAND LUXE</h1>
              <p style="margin: 4px 0 0 0; color: #c59b27; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">HOTEL & SUITES — OWNER NOTIFICATION</p>
            </td>
          </tr>

          <!-- Notification Introduction -->
          <tr>
            <td style="padding: 28px 32px 10px 32px;">
              <h2 style="margin: 0 0 8px 0; color: #0b132b; font-size: 20px;">A New Booking Has Been Received</h2>
              <p style="margin: 0; color: #64748b; font-size: 14px;">The reservation was successfully verified and saved to Supabase PostgreSQL.</p>
              
              <div style="margin: 20px 0; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px 18px;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Booking Reference</span>
                <div style="font-family: monospace; font-size: 20px; font-weight: 700; color: #0b132b; letter-spacing: 1px; margin-top: 2px;">
                  ${escapeHtml(booking.booking_reference)}
                </div>
              </div>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 10px 32px;">
              <h3 style="margin: 0 0 12px 0; color: #c59b27; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                Customer Details
              </h3>
              <table width="100%" style="font-size: 14px; color: #334155;">
                <tr>
                  <td width="35%" style="padding: 4px 0; color: #64748b;">Full Name:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${custName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Email Address:</td>
                  <td style="padding: 4px 0;"><a href="mailto:${custEmail}" style="color: #0b132b; font-weight: 600; text-decoration: none;">${custEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Phone Number:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${custPhone}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Room & Stay Details -->
          <tr>
            <td style="padding: 16px 32px 10px 32px;">
              <h3 style="margin: 0 0 12px 0; color: #c59b27; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                Room & Booking Details
              </h3>
              <table width="100%" style="font-size: 14px; color: #334155;">
                <tr>
                  <td width="35%" style="padding: 4px 0; color: #64748b;">Room:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${roomName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Price per Night:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${priceNight}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Check-in Date:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${escapeHtml(booking.check_in)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Check-out Date:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${escapeHtml(booking.check_out)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Duration:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${booking.number_of_nights} ${booking.number_of_nights === 1 ? 'Night' : 'Nights'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Guests:</td>
                  <td style="padding: 4px 0; font-weight: 600;">${booking.guests}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Special Requests:</td>
                  <td style="padding: 4px 0; font-style: italic;">${specialReq}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Summary -->
          <tr>
            <td style="padding: 16px 32px;">
              <h3 style="margin: 0 0 12px 0; color: #c59b27; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                Payment Summary
              </h3>
              <table width="100%" style="font-size: 14px; color: #334155; margin-bottom: 12px;">
                <tr>
                  <td width="50%" style="padding: 4px 0; color: #64748b;">Subtotal:</td>
                  <td align="right" style="padding: 4px 0; font-weight: 600;">${subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Tax Amount:</td>
                  <td align="right" style="padding: 4px 0; font-weight: 600;">${tax}</td>
                </tr>
                <tr style="border-top: 2px solid #e2e8f0;">
                  <td style="padding: 10px 0; font-size: 16px; font-weight: 700; color: #0b132b;">Total Amount:</td>
                  <td align="right" style="padding: 10px 0; font-size: 18px; font-weight: 700; color: #0b132b;">${total}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; color: #64748b; font-size: 12px;">Payment Method:</td>
                  <td align="right" style="padding: 2px 0; font-size: 12px; font-weight: 600; color: #059669;">${escapeHtml(booking.payment_method || 'CARD')} (${escapeHtml(booking.payment_status || 'SUCCESS')})</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; color: #64748b; font-size: 12px;">Booking Status:</td>
                  <td align="right" style="padding: 2px 0; font-size: 12px; font-weight: 700; color: #0b132b;">${escapeHtml(booking.status)}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; color: #64748b; font-size: 12px;">Created At:</td>
                  <td align="right" style="padding: 2px 0; font-size: 12px; color: #64748b;">${createdAtFormatted}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">Grand Luxe Hotel & Suites Management System</p>
              <p style="margin: 4px 0 0 0;">Connected to Supabase PostgreSQL & Resend Notification Gateway</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates plain-text version for email clients that do not render HTML.
 */
function generateOwnerEmailText(booking, room) {
  const roomName = booking.room_name || room?.room_name || 'Luxury Suite';
  const specialReq = booking.special_requests || 'None';
  const createdAtFormatted = new Date(booking.created_at || Date.now()).toUTCString();

  return `
HOTEL BOOKING NOTIFICATION

A new booking has been received.

Booking Reference: ${booking.booking_reference}

CUSTOMER DETAILS
Name: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${booking.customer_phone}

ROOM DETAILS
Room: ${roomName}
Price per Night: ${formatINR(booking.price_per_night)}

BOOKING DETAILS
Check-in: ${booking.check_in}
Check-out: ${booking.check_out}
Number of Nights: ${booking.number_of_nights}
Guests: ${booking.guests}

PAYMENT SUMMARY
Subtotal: ${formatINR(booking.subtotal)}
Tax: ${formatINR(booking.tax_amount)}
Total: ${formatINR(booking.total_amount)}
Payment Method: ${booking.payment_method || 'CARD'} (${booking.payment_status || 'SUCCESS'})

Special Requests: ${specialReq}

Booking Status: ${booking.status}
Booking Created: ${createdAtFormatted}
  `.trim();
}

/**
 * Generates customer confirmation email template.
 */
function generateCustomerEmailHtml(booking, room) {
  const roomName = escapeHtml(booking.room_name || room?.room_name || 'Luxury Suite');
  const custName = escapeHtml(booking.customer_name);
  const total = formatINR(booking.total_amount);

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px;">
    <h2 style="color: #0b132b; margin-top: 0;">Reservation Confirmation</h2>
    <p>Dear ${custName},</p>
    <p>Thank you for choosing Grand Luxe Hotel & Suites. Your reservation has been confirmed.</p>
    <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 5px 0;"><strong>Booking Reference:</strong> ${escapeHtml(booking.booking_reference)}</p>
      <p style="margin: 0 0 5px 0;"><strong>Room:</strong> ${roomName}</p>
      <p style="margin: 0 0 5px 0;"><strong>Dates:</strong> ${escapeHtml(booking.check_in)} to ${escapeHtml(booking.check_out)} (${booking.number_of_nights} Nights)</p>
      <p style="margin: 0 0 5px 0;"><strong>Guests:</strong> ${booking.guests}</p>
      <p style="margin: 0;"><strong>Total Amount:</strong> ${total}</p>
    </div>
    <p>We look forward to welcoming you.</p>
    <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Grand Luxe Hotel & Suites • 742 Ocean Royale Blvd</p>
  </div>
</body>
</html>
  `.trim();
}

function generateCustomerEmailText(booking, room) {
  const roomName = booking.room_name || room?.room_name || 'Luxury Suite';
  return `
Reservation Confirmation — Grand Luxe Hotel & Suites

Dear ${booking.customer_name},

Thank you for choosing Grand Luxe Hotel & Suites. Your reservation has been confirmed.

Booking Reference: ${booking.booking_reference}
Room: ${roomName}
Dates: ${booking.check_in} to ${booking.check_out} (${booking.number_of_nights} Nights)
Guests: ${booking.guests}
Total Amount: ${formatINR(booking.total_amount)}
Status: ${booking.status}

We look forward to welcoming you.
  `.trim();
}
