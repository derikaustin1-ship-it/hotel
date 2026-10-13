import dotenv from 'dotenv';
import { app } from './lib/app.js';
import { isSupabaseConfigured } from './lib/supabase.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`
============================================================
🏨 GRAND LUXE HOTEL & SUITES — BACKEND SERVER RUNNING
============================================================
📡 Local API Server:      http://localhost:${PORT}/api
🩺 Health Check:         http://localhost:${PORT}/api/health
🛏️ Rooms Endpoint:       http://localhost:${PORT}/api/rooms
📅 Bookings Endpoint:    http://localhost:${PORT}/api/bookings
📊 Admin Dashboard:      http://localhost:${PORT}/api/admin/dashboard

🔒 Supabase Database:    ${isSupabaseConfigured() ? '✅ Connected' : '⚠️ Missing credentials (Check .env)'}
✉️  Resend Email Service: ${process.env.RESEND_API_KEY ? '✅ Configured' : '⚠️ Missing API key (Check .env)'}
📧 Owner Notification:   ${process.env.HOTEL_NOTIFICATION_EMAIL || '⚠️ Not configured (Check .env)'}
============================================================
`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.close(() => process.exit(0));
});
