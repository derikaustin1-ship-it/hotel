package com.hotelbooking.repository;

import com.hotelbooking.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
    boolean existsByRoomNumberAndIdNot(String roomNumber, Long id);

    List<Room> findByStatus(String status);

    @Query("SELECT r FROM Room r WHERE " +
           "(:roomType IS NULL OR LOWER(r.roomType) = LOWER(:roomType)) AND " +
           "(:minPrice IS NULL OR r.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR r.pricePerNight <= :maxPrice) AND " +
           "(:capacity IS NULL OR r.capacity >= :capacity) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Room> filterRooms(
            @Param("roomType") String roomType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("capacity") Integer capacity,
            @Param("status") String status
    );

    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' AND " +
           "(:roomType IS NULL OR LOWER(r.roomType) = LOWER(:roomType)) AND " +
           "(:capacity IS NULL OR r.capacity >= :capacity) AND " +
           "r.id NOT IN (" +
           "  SELECT b.room.id FROM Booking b " +
           "  WHERE b.checkInDate < :checkOutDate " +
           "    AND b.checkOutDate > :checkInDate " +
           "    AND b.status != com.hotelbooking.model.BookingStatus.CANCELLED" +
           ")")
    List<Room> findAvailableRooms(
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("roomType") String roomType,
            @Param("capacity") Integer capacity
    );

    long countByStatus(String status);
}
