package com.hotelbooking.service;

import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.model.BookingStatus;

import java.util.List;

public interface BookingService {
    BookingResponseDto createBooking(String userEmail, BookingRequest request);
    List<BookingResponseDto> getMyBookings(String userEmail);
    BookingResponseDto getBookingById(Long id, String currentUserEmail);
    BookingResponseDto cancelBooking(Long id, String currentUserEmail);
    List<BookingResponseDto> getAllBookings();
    BookingResponseDto updateBookingStatus(Long id, BookingStatus status);
    void deleteBooking(Long id);
}
