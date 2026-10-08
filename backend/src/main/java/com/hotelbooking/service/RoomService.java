package com.hotelbooking.service;

import com.hotelbooking.dto.RoomDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    List<RoomDto> getAllRooms(String roomType, BigDecimal minPrice, BigDecimal maxPrice, Integer capacity, String status);
    List<RoomDto> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate, String roomType, Integer guests);
    RoomDto getRoomById(Long id);
    RoomDto createRoom(RoomDto roomDto);
    RoomDto updateRoom(Long id, RoomDto roomDto);
    void deleteRoom(Long id);
    boolean isRoomAvailableForDates(Long roomId, LocalDate checkInDate, LocalDate checkOutDate);
}
