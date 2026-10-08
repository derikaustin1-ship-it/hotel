package com.hotelbooking.service;

import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.DashboardStatsDto;
import com.hotelbooking.model.Booking;
import com.hotelbooking.model.BookingStatus;
import com.hotelbooking.model.Role;
import com.hotelbooking.model.Room;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.RoomRepository;
import com.hotelbooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public AdminServiceImpl(RoomRepository roomRepository,
                            BookingRepository bookingRepository,
                            UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStatistics() {
        DashboardStatsDto stats = new DashboardStatsDto();

        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.countByStatus("AVAILABLE");
        long maintenanceRooms = roomRepository.countByStatus("MAINTENANCE");
        long occupiedRooms = bookingRepository.countCurrentlyOccupiedRooms(LocalDate.now());

        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);

        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();

        stats.setTotalRooms(totalRooms);
        stats.setAvailableRooms(availableRooms);
        stats.setOccupiedRooms(occupiedRooms);
        stats.setMaintenanceRooms(maintenanceRooms);

        stats.setTotalBookings(totalBookings);
        stats.setPendingBookings(pendingBookings);
        stats.setConfirmedBookings(confirmedBookings);
        stats.setCancelledBookings(cancelledBookings);
        stats.setCompletedBookings(completedBookings);

        stats.setTotalCustomers(totalCustomers);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // Room Type distribution
        List<Room> allRooms = roomRepository.findAll();
        Map<String, Long> roomTypeDist = new HashMap<>();
        for (Room r : allRooms) {
            roomTypeDist.put(r.getRoomType(), roomTypeDist.getOrDefault(r.getRoomType(), 0L) + 1);
        }
        stats.setRoomTypeDistribution(roomTypeDist);

        // Booking status distribution
        Map<String, Long> statusDist = new HashMap<>();
        statusDist.put("CONFIRMED", confirmedBookings);
        statusDist.put("PENDING", pendingBookings);
        statusDist.put("CANCELLED", cancelledBookings);
        statusDist.put("COMPLETED", completedBookings);
        stats.setBookingStatusDistribution(statusDist);

        // Recent bookings (top 8)
        List<Booking> recent = bookingRepository.findTop10ByOrderByCreatedAtDesc();
        stats.setRecentBookings(recent.stream().map(this::mapToBookingDto).collect(Collectors.toList()));

        return stats;
    }

    private BookingResponseDto mapToBookingDto(Booking booking) {
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
        }
        return dto;
    }
}
