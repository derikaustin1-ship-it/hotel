-- ===================================================================
-- GRAND LUXE HOTEL & SUITES — SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Database: PostgreSQL (Supabase)
-- Includes: Tables, Constraints, Indexes, RLS Policies, Seed Data
-- ===================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_name VARCHAR(100) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    description TEXT,
    price_per_night NUMERIC(10, 2) NOT NULL CHECK (price_per_night > 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    beds INTEGER NOT NULL CHECK (beds > 0),
    facilities TEXT,
    image_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'MAINTENANCE')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Users Table (Customer & Admin Accounts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    room_name VARCHAR(100) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0),
    price_per_night NUMERIC(10, 2) NOT NULL CHECK (price_per_night >= 0),
    number_of_nights INTEGER NOT NULL CHECK (number_of_nights > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    tax_amount NUMERIC(10, 2) NOT NULL CHECK (tax_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    special_requests TEXT,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CARD',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
    transaction_reference VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')),
    notification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (notification_status IN ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
    notification_error TEXT,
    notification_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_dates_order CHECK (check_out > check_in)
);

-- 5. Safe Date-Range Exclusion Constraint (PostgreSQL GIST)
-- Prevents overlapping active bookings for the same room at the database engine level!
-- Half-open interval [check_in, check_out) ensures check-out date is not blocked for next guest.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_bookings'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT no_overlapping_bookings
        EXCLUDE USING gist (
            room_id WITH =,
            daterange(check_in, check_out, '[)') WITH &&
        )
        WHERE (status != 'CANCELLED');
    END IF;
END $$;

-- 6. Notification Queue / Outbox Table (for Reliability & Retries)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    recipient_email VARCHAR(150) NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'OWNER_NOTIFICATION',
    subject TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,
    resend_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_active_status ON rooms (is_active, status);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms (room_number);
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates ON bookings (room_id, check_in, check_out) WHERE status != 'CANCELLED';
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings (booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking ON notification_logs (booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs (status);

-- 8. Row Level Security (RLS) Configuration
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Clean drop existing policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "Public can view active rooms" ON rooms;
DROP POLICY IF EXISTS "Service role full access rooms" ON rooms;
DROP POLICY IF EXISTS "Service role full access users" ON users;
DROP POLICY IF EXISTS "Service role full access bookings" ON bookings;
DROP POLICY IF EXISTS "Service role full access notification_logs" ON notification_logs;

-- Policies: Public visitors can only view active rooms
CREATE POLICY "Public can view active rooms"
    ON rooms FOR SELECT
    USING (is_active = true);

-- Note: All booking creation, updates, and customer data lookups are performed
-- server-side using the SUPABASE_SERVICE_ROLE_KEY which securely bypasses RLS.
-- Anonymous browser visitors cannot select or modify any customer bookings directly.

-- 9. Automatic Timestamp Trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS set_rooms_updated_at ON rooms;
CREATE TRIGGER set_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON bookings;
CREATE TRIGGER set_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- 10. Seed Initial Rooms Inventory (12 Luxury Rooms)
INSERT INTO rooms (room_number, room_name, room_type, price_per_night, capacity, beds, description, facilities, image_url, status, is_active)
VALUES
('101', 'Cozy Single Sanctuary', 'Single', 1800.00, 1, 1,
 'A cozy and elegant sanctuary designed for solo travelers. Features soundproof windows, high-speed Wi-Fi, and an ergonomic workspace.',
 'Free Wi-Fi, Air Conditioning, TV, Room Service, Breakfast, Work Desk',
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('102', 'Minimalist Urban Single', 'Single', 1950.00, 1, 1,
 'Modern minimalist single room with city views, premium bedding, and a boutique Italian marble bathroom.',
 'Free Wi-Fi, Air Conditioning, TV, Mini Bar, Breakfast, Work Desk',
 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('103', 'Economic Single Chamber', 'Single', 1750.00, 1, 1,
 'Comfortable economic single room for business professionals on the go. Currently undergoing scheduled refinement.',
 'Free Wi-Fi, Air Conditioning, TV, Room Service, Breakfast',
 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'MAINTENANCE', true),

('201', 'Classic Courtyard Double', 'Double', 2800.00, 2, 1,
 'Comfortable double room with a king plush bed, warm ambient lighting, and panoramic garden courtyard views.',
 'Free Wi-Fi, Air Conditioning, Smart TV, Room Service, Breakfast, Tea/Coffee Maker',
 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('202', 'Grand Balcony Double', 'Double', 3100.00, 2, 2,
 'Spacious twin double room with two queen beds, private balcony, and state-of-the-art climate control.',
 'Free Wi-Fi, Air Conditioning, Smart TV, Balcony, Mini Bar, Breakfast, Room Service',
 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('203', 'Organic Timber Double', 'Double', 2900.00, 2, 1,
 'Stylishly designed double room featuring hardwood flooring and warm organic textiles.',
 'Free Wi-Fi, Air Conditioning, Smart TV, Breakfast, Mini Bar',
 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('301', 'Royal Marble Deluxe', 'Deluxe', 4500.00, 3, 2,
 'Elevate your experience in our luxury Deluxe room featuring high ceilings, bespoke furniture, and deep-soaking bathtub.',
 'Free Wi-Fi, Air Conditioning, 55-inch OLED TV, Bathtub, Mini Fridge, 24/7 Room Service, Gourmet Breakfast, Swimming Pool Access',
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('302', 'Ocean Panorama Deluxe', 'Deluxe', 4800.00, 3, 2,
 'Deluxe ocean-facing room with private sitting area, espresso machine, and luxury organic toiletries.',
 'Free Wi-Fi, Air Conditioning, 55-inch OLED TV, Bathtub, Espresso Machine, Gourmet Breakfast, Ocean View, Parking',
 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('401', 'Grand Master Jacuzzi Suite', 'Suite', 7500.00, 4, 2,
 'Grand master suite featuring a separate living room, dining area, king bed, and private jacuzzi.',
 'Free Wi-Fi, Air Conditioning, 2x Smart TVs, Private Jacuzzi, Dining Table, Mini Bar, 24/7 Butler Service, Buffet Breakfast, Free Airport Pickup',
 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('402', 'Skyline Panorama Suite', 'Suite', 8200.00, 4, 2,
 'Corner executive suite offering 270-degree skyline views, luxury walk-in wardrobe, and premium sound system.',
 'Free Wi-Fi, Air Conditioning, Skyline View, Jacuzzi, Walk-in Closet, Butler Service, Luxury Breakfast, Pool Access, Valet Parking',
 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('501', 'Diplomatic Terrace Suite', 'Executive Suite', 11500.00, 4, 2,
 'Top-tier executive suite tailored for discerning travelers and diplomats. Features personal butler, private conference room, and terrace.',
 'High-Speed Wi-Fi, Climate Control, Private Terrace, Jacuzzi, Conference Nook, Chef-curated Breakfast, VIP Lounge Access, Valet Parking',
 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true),

('502', 'Presidential Palace Suite', 'Presidential Suite', 18500.00, 6, 3,
 'The pinnacle of opulence. Spanning 1800 sq ft, with private elevator access, baby grand piano, private infinity dip pool, and dedicated staff.',
 'Ultra-fast Wi-Fi, Private Dip Pool, Grand Piano, 24/7 Dedicated Butler, Champagne on Arrival, Michelin Star In-room Dining, Limousine Transfer',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'AVAILABLE', true)

ON CONFLICT (room_number) DO UPDATE SET
    room_name = EXCLUDED.room_name,
    room_type = EXCLUDED.room_type,
    price_per_night = EXCLUDED.price_per_night,
    capacity = EXCLUDED.capacity,
    beds = EXCLUDED.beds,
    description = EXCLUDED.description,
    facilities = EXCLUDED.facilities,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active;

-- 11. Seed Default Admin Account (admin@hotel.com / Admin@123)
INSERT INTO users (name, email, phone, password_hash, role)
VALUES
('Grand Luxe Administrator', 'admin@hotel.com', '+1 (800) 589-3200',
 '$2a$10$Wq078FGhQCxZ8t318xb/W.kxrv8v4QWAs0p/Il0CQw7L15Zg1UX5y',
 'ADMIN')
ON CONFLICT (email) DO NOTHING;
