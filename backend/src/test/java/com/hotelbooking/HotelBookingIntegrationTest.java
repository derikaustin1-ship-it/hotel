package com.hotelbooking;

import com.hotelbooking.dto.*;
import com.hotelbooking.exception.BookingUnavailableException;
import com.hotelbooking.exception.DuplicateRoomException;
import com.hotelbooking.exception.ResourceNotFoundException;
import com.hotelbooking.model.BookingStatus;
import com.hotelbooking.model.Role;
import com.hotelbooking.service.BookingService;
import com.hotelbooking.service.RoomService;
import com.hotelbooking.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class HotelBookingIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private BookingService bookingService;

    private String testUserEmail = "testuser@example.com";

    @BeforeEach
    void setUp() {
        RegisterRequest registerReq = new RegisterRequest(
                "Test User",
                testUserEmail,
                "+1234567890",
                "Password123!",
                "Password123!"
        );
        try {
            userService.register(registerReq);
        } catch (Exception e) {
            // Already registered or initialized
        }
    }

    @Test
    @DisplayName("Test 1: User Registration and Login")
    void testUserRegistrationAndLogin() {
        // Register unique new user
        String email = "alex.rivera@example.com";
        RegisterRequest registerReq = new RegisterRequest(
                "Alex Rivera",
                email,
                "+1987654321",
                "SecurePass@123",
                "SecurePass@123"
        );
        AuthResponse regResponse = userService.register(registerReq);

        assertNotNull(regResponse);
        assertNotNull(regResponse.getToken());
        assertEquals("Alex Rivera", regResponse.getName());
        assertEquals(email, regResponse.getEmail());
        assertEquals(Role.CUSTOMER, regResponse.getRole());

        // Login with correct credentials
        AuthRequest loginReq = new AuthRequest(email, "SecurePass@123");
        AuthResponse loginResponse = userService.login(loginReq);
        assertNotNull(loginResponse);
        assertNotNull(loginResponse.getToken());
        assertEquals(email, loginResponse.getEmail());

        // Login with bad password should fail
        AuthRequest badLogin = new AuthRequest(email, "WrongPassword");
        assertThrows(BadCredentialsException.class, () -> userService.login(badLogin));
    }

    @Test
    @DisplayName("Test 2: Room Creation and Retrieval")
    void testRoomCreationAndRetrieval() {
        RoomDto newRoom = new RoomDto();
        newRoom.setRoomNumber("999");
        newRoom.setRoomType("Penthouse");
        newRoom.setPricePerNight(BigDecimal.valueOf(12000.00));
        newRoom.setCapacity(4);
        newRoom.setBeds(2);
        newRoom.setDescription("Luxury top floor suite with private terrace.");
        newRoom.setFacilities("Free Wi-Fi, Air Conditioning, Jacuzzi");
        newRoom.setImageUrl("https://example.com/room999.jpg");
        newRoom.setStatus("AVAILABLE");

        RoomDto created = roomService.createRoom(newRoom);
        assertNotNull(created.getId());
        assertEquals("999", created.getRoomNumber());

        // Duplicate room number check
        assertThrows(DuplicateRoomException.class, () -> roomService.createRoom(newRoom));

        // Retrieve by ID
        RoomDto fetched = roomService.getRoomById(created.getId());
        assertEquals("Penthouse", fetched.getRoomType());
        assertEquals(0, BigDecimal.valueOf(12000.00).compareTo(fetched.getPricePerNight()));
    }

    @Test
    @DisplayName("Test 3: Booking Creation, Availability, and Price Calculation")
    void testBookingCreationAndPricing() {
        // Find an available room
        List<RoomDto> rooms = roomService.getAllRooms(null, null, null, null, "AVAILABLE");
        assertFalse(rooms.isEmpty());
        RoomDto room = rooms.get(0);

        LocalDate checkIn = LocalDate.now().plusDays(40);
        LocalDate checkOut = LocalDate.now().plusDays(43); // 3 nights

        BookingRequest bookingReq = new BookingRequest(
                room.getId(),
                checkIn,
                checkOut,
                1,
                "Need quiet room on upper floor",
                "CARD"
        );

        BookingResponseDto booking = bookingService.createBooking(testUserEmail, bookingReq);

        assertNotNull(booking);
        assertNotNull(booking.getBookingReference());
        assertEquals(3, booking.getNumberOfNights());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());

        // Verify calculations: 3 nights * price
        BigDecimal expectedSubtotal = room.getPricePerNight().multiply(BigDecimal.valueOf(3));
        BigDecimal expectedTax = expectedSubtotal.multiply(BigDecimal.valueOf(0.10));
        BigDecimal expectedTotal = expectedSubtotal.add(expectedTax);

        assertEquals(0, expectedSubtotal.compareTo(booking.getSubtotal()));
        assertEquals(0, expectedTax.compareTo(booking.getTax()));
        assertEquals(0, expectedTotal.compareTo(booking.getTotalAmount()));
    }

    @Test
    @DisplayName("Test 4: Overlapping Booking Rejection (Strict Conflict Detection)")
    void testOverlappingBookingRejection() {
        List<RoomDto> rooms = roomService.getAllRooms(null, null, null, null, "AVAILABLE");
        RoomDto room = rooms.get(0);

        LocalDate checkIn = LocalDate.now().plusDays(50);
        LocalDate checkOut = LocalDate.now().plusDays(55);

        // First booking: days 50 to 55
        BookingRequest booking1 = new BookingRequest(room.getId(), checkIn, checkOut, 1, null, "CARD");
        bookingService.createBooking(testUserEmail, booking1);

        // Attempt overlapping booking 1: Exact same dates (50 to 55)
        BookingRequest overlapExact = new BookingRequest(room.getId(), checkIn, checkOut, 1, null, "CARD");
        assertThrows(BookingUnavailableException.class, () -> bookingService.createBooking(testUserEmail, overlapExact));

        // Attempt overlapping booking 2: Partial overlap inside (51 to 53)
        BookingRequest overlapInside = new BookingRequest(room.getId(), checkIn.plusDays(1), checkOut.minusDays(2), 1, null, "CARD");
        assertThrows(BookingUnavailableException.class, () -> bookingService.createBooking(testUserEmail, overlapInside));

        // Attempt overlapping booking 3: Overlap start (48 to 52)
        BookingRequest overlapStart = new BookingRequest(room.getId(), checkIn.minusDays(2), checkIn.plusDays(2), 1, null, "CARD");
        assertThrows(BookingUnavailableException.class, () -> bookingService.createBooking(testUserEmail, overlapStart));

        // Attempt overlapping booking 4: Overlap end (53 to 58)
        BookingRequest overlapEnd = new BookingRequest(room.getId(), checkOut.minusDays(2), checkOut.plusDays(3), 1, null, "CARD");
        assertThrows(BookingUnavailableException.class, () -> bookingService.createBooking(testUserEmail, overlapEnd));

        // Non-overlapping booking: Immediately after (55 to 58) should SUCCEED
        BookingRequest nonOverlap = new BookingRequest(room.getId(), checkOut, checkOut.plusDays(3), 1, null, "CARD");
        BookingResponseDto nonOverlapSuccess = bookingService.createBooking(testUserEmail, nonOverlap);
        assertNotNull(nonOverlapSuccess);
    }

    @Test
    @DisplayName("Test 5: Booking Cancellation and Availability Release")
    void testBookingCancellationAndAvailabilityRelease() {
        List<RoomDto> rooms = roomService.getAllRooms(null, null, null, null, "AVAILABLE");
        RoomDto room = rooms.get(0);

        LocalDate checkIn = LocalDate.now().plusDays(70);
        LocalDate checkOut = LocalDate.now().plusDays(75);

        BookingRequest req = new BookingRequest(room.getId(), checkIn, checkOut, 1, null, "CARD");
        BookingResponseDto booking = bookingService.createBooking(testUserEmail, req);

        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());

        // Cancel the booking
        BookingResponseDto cancelled = bookingService.cancelBooking(booking.getId(), testUserEmail);
        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());

        // Now the same dates should be AVAILABLE again for booking
        BookingRequest rebookReq = new BookingRequest(room.getId(), checkIn, checkOut, 1, "Rebooking after cancellation", "CARD");
        BookingResponseDto rebooked = bookingService.createBooking(testUserEmail, rebookReq);
        assertNotNull(rebooked);
        assertEquals(BookingStatus.CONFIRMED, rebooked.getStatus());
    }
}
