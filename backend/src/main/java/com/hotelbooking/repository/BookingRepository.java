package com.hotelbooking.repository;

import com.hotelbooking.model.Booking;
import com.hotelbooking.model.BookingStatus;
import com.hotelbooking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    List<Booking> findAllByOrderByCreatedAtDesc();

    Optional<Booking> findByBookingReference(String bookingReference);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.checkInDate < :checkOutDate " +
           "AND b.checkOutDate > :checkInDate " +
           "AND b.status != :cancelledStatus")
    List<Booking> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("cancelledStatus") BookingStatus cancelledStatus
    );

    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status IN (com.hotelbooking.model.BookingStatus.CONFIRMED, com.hotelbooking.model.BookingStatus.COMPLETED)")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(DISTINCT b.room.id) FROM Booking b " +
           "WHERE :today >= b.checkInDate AND :today < b.checkOutDate " +
           "AND b.status IN (com.hotelbooking.model.BookingStatus.CONFIRMED, com.hotelbooking.model.BookingStatus.PENDING)")
    long countCurrentlyOccupiedRooms(@Param("today") LocalDate today);

    List<Booking> findTop10ByOrderByCreatedAtDesc();
}
