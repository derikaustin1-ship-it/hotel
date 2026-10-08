package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.BookingStatusUpdateRequest;
import com.hotelbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDto>> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BookingResponseDto booking = bookingService.createBooking(userEmail, request);
        return new ResponseEntity<>(ApiResponse.success("Room booked successfully! Booking Reference: " + booking.getBookingReference(), booking), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getMyBookings(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BookingResponseDto> bookings = bookingService.getMyBookings(userEmail);
        return ResponseEntity.ok(ApiResponse.success("My bookings retrieved successfully", bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDto>> getBookingById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BookingResponseDto booking = bookingService.getBookingById(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", booking));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BookingResponseDto booking = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully!", booking));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDto>> deleteOrCancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BookingResponseDto booking = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully!", booking));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getAllBookings() {
        List<BookingResponseDto> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success("All bookings retrieved successfully", bookings));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDto>> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        BookingResponseDto updated = bookingService.updateBookingStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Booking status updated to " + request.getStatus() + " successfully!", updated));
    }
}
