package com.hotelbooking.config;

import com.hotelbooking.model.*;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.PaymentRepository;
import com.hotelbooking.repository.RoomRepository;
import com.hotelbooking.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RoomRepository roomRepository,
                           BookingRepository bookingRepository,
                           PaymentRepository paymentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Database is empty. Seeding initial hotel demo data...");
            seedUsers();
            seedRooms();
            seedBookings();
            logger.info("Demo data seeding completed successfully.");
        }
    }

    private void seedUsers() {
        // Admin Account (Required by specification)
        User admin = new User();
        admin.setName("Grand Luxe Admin");
        admin.setEmail("admin@hotel.com");
        admin.setPhone("+1 (555) 019-2834");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // 5 Demo Customers
        List<User> customers = List.of(
                new User("John Doe", "john@example.com", "+1 (555) 123-4567", passwordEncoder.encode("Customer@123"), Role.CUSTOMER),
                new User("Sarah Jenkins", "sarah@example.com", "+1 (555) 234-5678", passwordEncoder.encode("Customer@123"), Role.CUSTOMER),
                new User("Michael Chang", "michael@example.com", "+1 (555) 345-6789", passwordEncoder.encode("Customer@123"), Role.CUSTOMER),
                new User("Emily Watson", "emily@example.com", "+1 (555) 456-7890", passwordEncoder.encode("Customer@123"), Role.CUSTOMER),
                new User("David Miller", "david@example.com", "+1 (555) 567-8901", passwordEncoder.encode("Customer@123"), Role.CUSTOMER)
        );

        userRepository.saveAll(customers);
    }

    private void seedRooms() {
        List<Room> rooms = new ArrayList<>();

        rooms.add(new Room(
                "101",
                "Single",
                BigDecimal.valueOf(1800.00),
                1,
                1,
                "A cozy and elegant sanctuary designed for solo travelers. Features soundproof windows, high-speed Wi-Fi, and an ergonomic workspace.",
                "Free Wi-Fi, Air Conditioning, TV, Room Service, Breakfast, Work Desk",
                "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "102",
                "Single",
                BigDecimal.valueOf(1950.00),
                1,
                1,
                "Modern minimalist single room with city views, premium bedding, and a boutique Italian marble bathroom.",
                "Free Wi-Fi, Air Conditioning, TV, Mini Bar, Breakfast, Work Desk",
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "201",
                "Double",
                BigDecimal.valueOf(2800.00),
                2,
                1,
                "Comfortable double room with a king plush bed, warm ambient lighting, and panoramic garden courtyard views.",
                "Free Wi-Fi, Air Conditioning, Smart TV, Room Service, Breakfast, Tea/Coffee Maker",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "202",
                "Double",
                BigDecimal.valueOf(3100.00),
                2,
                2,
                "Spacious twin double room with two queen beds, private balcony, and state-of-the-art climate control.",
                "Free Wi-Fi, Air Conditioning, Smart TV, Balcony, Mini Bar, Breakfast, Room Service",
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "301",
                "Deluxe",
                BigDecimal.valueOf(4500.00),
                3,
                2,
                "Elevate your experience in our luxury Deluxe room featuring high ceilings, bespoke furniture, and deep-soaking bathtub.",
                "Free Wi-Fi, Air Conditioning, 55-inch OLED TV, Bathtub, Mini Fridge, 24/7 Room Service, Gourmet Breakfast, Swimming Pool Access",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "302",
                "Deluxe",
                BigDecimal.valueOf(4800.00),
                3,
                2,
                "Deluxe ocean-facing room with private sitting area, espresso machine, and luxury organic toiletries.",
                "Free Wi-Fi, Air Conditioning, 55-inch OLED TV, Bathtub, Espresso Machine, Gourmet Breakfast, Ocean View, Parking",
                "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "401",
                "Suite",
                BigDecimal.valueOf(7500.00),
                4,
                2,
                "Grand master suite featuring a separate living room, dining area, king bed, and private jacuzzi.",
                "Free Wi-Fi, Air Conditioning, 2x Smart TVs, Private Jacuzzi, Dining Table, Mini Bar, 24/7 Butler Service, Buffet Breakfast, Free Airport Pickup",
                "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "402",
                "Suite",
                BigDecimal.valueOf(8200.00),
                4,
                2,
                "Corner executive suite offering 270-degree skyline views, luxury walk-in wardrobe, and premium sound system.",
                "Free Wi-Fi, Air Conditioning, Skyline View, Jacuzzi, Walk-in Closet, Butler Service, Luxury Breakfast, Pool Access, Valet Parking",
                "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "501",
                "Executive Suite",
                BigDecimal.valueOf(11500.00),
                4,
                2,
                "Top-tier executive suite tailored for discerning travelers and diplomats. Features personal butler, private conference room, and terrace.",
                "High-Speed Wi-Fi, Climate Control, Private Terrace, Jacuzzi, Conference Nook, Chef-curated Breakfast, VIP Lounge Access, Valet Parking",
                "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "502",
                "Presidential Suite",
                BigDecimal.valueOf(18500.00),
                6,
                3,
                "The pinnacle of opulence. Spanning 1800 sq ft, with private elevator access, baby grand piano, private infinity dip pool, and dedicated staff.",
                "Ultra-fast Wi-Fi, Private Dip Pool, Grand Piano, 24/7 Dedicated Butler, Champagne on Arrival, Michelin Star In-room Dining, Limousine Transfer",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        rooms.add(new Room(
                "103",
                "Single",
                BigDecimal.valueOf(1750.00),
                1,
                1,
                "Comfortable economic single room for business professionals on the go.",
                "Free Wi-Fi, Air Conditioning, TV, Room Service, Breakfast",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                "MAINTENANCE"
        ));

        rooms.add(new Room(
                "203",
                "Double",
                BigDecimal.valueOf(2900.00),
                2,
                1,
                "Stylishly designed double room featuring hardwood flooring and warm organic textiles.",
                "Free Wi-Fi, Air Conditioning, Smart TV, Breakfast, Mini Bar",
                "https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80",
                "AVAILABLE"
        ));

        roomRepository.saveAll(rooms);
    }

    private void seedBookings() {
        User john = userRepository.findByEmail("john@example.com").orElse(null);
        User sarah = userRepository.findByEmail("sarah@example.com").orElse(null);
        User michael = userRepository.findByEmail("michael@example.com").orElse(null);

        Room room101 = roomRepository.findByRoomNumber("101").orElse(null);
        Room room201 = roomRepository.findByRoomNumber("201").orElse(null);
        Room room301 = roomRepository.findByRoomNumber("301").orElse(null);
        Room room401 = roomRepository.findByRoomNumber("401").orElse(null);

        if (john != null && room201 != null) {
            createSampleBooking(
                    "BK-SAMPLE-001",
                    john,
                    room201,
                    LocalDate.now().plusDays(5),
                    LocalDate.now().plusDays(8),
                    2,
                    BookingStatus.CONFIRMED,
                    "High floor preferred, arriving late evening.",
                    "CARD"
            );
        }

        if (sarah != null && room301 != null) {
            createSampleBooking(
                    "BK-SAMPLE-002",
                    sarah,
                    room301,
                    LocalDate.now().plusDays(10),
                    LocalDate.now().plusDays(14),
                    2,
                    BookingStatus.CONFIRMED,
                    "Anniversary celebration, requesting rose petals on bed.",
                    "UPI"
            );
        }

        if (michael != null && room401 != null) {
            createSampleBooking(
                    "BK-SAMPLE-003",
                    michael,
                    room401,
                    LocalDate.now().minusDays(5),
                    LocalDate.now().minusDays(2),
                    3,
                    BookingStatus.COMPLETED,
                    "Early check-in requested.",
                    "CARD"
            );
        }

        if (john != null && room101 != null) {
            createSampleBooking(
                    "BK-SAMPLE-004",
                    john,
                    room101,
                    LocalDate.now().plusDays(20),
                    LocalDate.now().plusDays(22),
                    1,
                    BookingStatus.PENDING,
                    "Quiet corner room please.",
                    "CARD"
            );
        }
    }

    private void createSampleBooking(String ref, User user, Room room, LocalDate checkIn, LocalDate checkOut, int guests, BookingStatus status, String specialReq, String paymentMethod) {
        int nights = (int) java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal subtotal = room.getPricePerNight().multiply(BigDecimal.valueOf(nights)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        Booking booking = new Booking(ref, user, room, checkIn, checkOut, guests, nights, subtotal, tax, total, status, specialReq);
        Booking saved = bookingRepository.save(booking);

        Payment payment = new Payment(saved, total, paymentMethod, "SUCCESS", "TXN-" + System.currentTimeMillis() % 10000000, LocalDateTime.now());
        paymentRepository.save(payment);
    }
}
