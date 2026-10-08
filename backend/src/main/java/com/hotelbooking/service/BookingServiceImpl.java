package com.hotelbooking.service;

import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.dto.BookingResponseDto;
import org.springframework.security.access.AccessDeniedException;
import com.hotelbooking.exception.BadRequestException;
import com.hotelbooking.exception.BookingUnavailableException;
import com.hotelbooking.exception.ResourceNotFoundException;
import com.hotelbooking.model.*;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.PaymentRepository;
import com.hotelbooking.repository.RoomRepository;
import com.hotelbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Value("${hotel.app.taxPercentage:10.0}")
    private double taxPercentage;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              RoomRepository roomRepository,
                              UserRepository userRepository,
                              PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public BookingResponseDto createBooking(String userEmail, BookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));

        if (!"AVAILABLE".equalsIgnoreCase(room.getStatus())) {
            throw new BookingUnavailableException("Room " + room.getRoomNumber() + " is currently under maintenance or unavailable.");
        }

        LocalDate checkIn = request.getCheckInDate();
        LocalDate checkOut = request.getCheckOutDate();

        if (checkIn == null || checkOut == null) {
            throw new BadRequestException("Check-in and Check-out dates are required");
        }

        if (checkIn.isBefore(LocalDate.now())) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }

        if (!checkOut.isAfter(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }

        if (request.getGuests() == null || request.getGuests() < 1) {
            throw new BadRequestException("At least 1 guest is required");
        }

        if (request.getGuests() > room.getCapacity()) {
            throw new BadRequestException("Selected room can only accommodate up to " + room.getCapacity() + " guests");
        }

        // Strict Overlapping Check
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                room.getId(),
                checkIn,
                checkOut,
                BookingStatus.CANCELLED
        );

        if (!overlapping.isEmpty()) {
            throw new BookingUnavailableException("Room " + room.getRoomNumber() + " is already booked for the selected dates. Please choose different dates or another room.");
        }

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights < 1) {
            nights = 1;
        }

        BigDecimal pricePerNight = room.getPricePerNight();
        BigDecimal subtotal = pricePerNight.multiply(BigDecimal.valueOf(nights)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal taxRate = BigDecimal.valueOf(taxPercentage / 100.0);
        BigDecimal tax = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        String bookingReference = "BK-" + System.currentTimeMillis() % 100000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Booking booking = new Booking();
        booking.setBookingReference(bookingReference);
        booking.setUser(user);
        booking.setRoom(room);
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setGuests(request.getGuests());
        booking.setNumberOfNights((int) nights);
        booking.setSubtotal(subtotal);
        booking.setTax(tax);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setSpecialRequests(request.getSpecialRequests());

        Booking savedBooking = bookingRepository.save(booking);

        // Record simulated payment
        String method = (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty())
                ? request.getPaymentMethod().toUpperCase() : "CARD";
        String txnRef = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(method);
        payment.setPaymentStatus("SUCCESS");
        payment.setTransactionReference(txnRef);
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepository.save(payment);
        savedBooking.setPayment(payment);

        return mapToDto(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return bookingRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDto getBookingById(Long id, String currentUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        if (currentUser.getRole() != Role.ADMIN && !booking.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view this booking");
        }

        return mapToDto(booking);
    }

    @Override
    public BookingResponseDto cancelBooking(Long id, String currentUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        if (currentUser.getRole() != Role.ADMIN && !booking.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        return mapToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDto updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);
        return mapToDto(updated);
    }

    @Override
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        bookingRepository.delete(booking);
    }

    private BookingResponseDto mapToDto(Booking booking) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());

        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getId());
            dto.setCustomerName(booking.getUser().getName());
            dto.setCustomerEmail(booking.getUser().getEmail());
            dto.setCustomerPhone(booking.getUser().getPhone());
        }

        if (booking.getRoom() != null) {
            dto.setRoomId(booking.getRoom().getId());
            dto.setRoomNumber(booking.getRoom().getRoomNumber());
            dto.setRoomType(booking.getRoom().getRoomType());
            dto.setRoomImageUrl(booking.getRoom().getImageUrl());
            dto.setRoomPricePerNight(booking.getRoom().getPricePerNight());
        }

        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setGuests(booking.getGuests());
        dto.setNumberOfNights(booking.getNumberOfNights());
        dto.setSubtotal(booking.getSubtotal());
        dto.setTax(booking.getTax());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setStatus(booking.getStatus());
        dto.setSpecialRequests(booking.getSpecialRequests());
        dto.setCreatedAt(booking.getCreatedAt());

        if (booking.getPayment() != null) {
            dto.setPaymentStatus(booking.getPayment().getPaymentStatus());
            dto.setPaymentMethod(booking.getPayment().getPaymentMethod());
            dto.setTransactionReference(booking.getPayment().getTransactionReference());
        } else {
            dto.setPaymentStatus("SUCCESS");
            dto.setPaymentMethod("CARD");
        }

        return dto;
    }
}
