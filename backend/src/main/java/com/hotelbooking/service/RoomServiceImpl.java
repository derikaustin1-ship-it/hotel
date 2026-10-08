package com.hotelbooking.service;

import com.hotelbooking.dto.RoomDto;
import com.hotelbooking.exception.BadRequestException;
import com.hotelbooking.exception.DuplicateRoomException;
import com.hotelbooking.exception.ResourceNotFoundException;
import com.hotelbooking.model.Booking;
import com.hotelbooking.model.BookingStatus;
import com.hotelbooking.model.Room;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomServiceImpl(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDto> getAllRooms(String roomType, BigDecimal minPrice, BigDecimal maxPrice, Integer capacity, String status) {
        String typeParam = (roomType != null && !roomType.trim().isEmpty() && !"ALL".equalsIgnoreCase(roomType.trim()))
                ? roomType.trim() : null;
        String statusParam = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim()))
                ? status.trim() : null;

        return roomRepository.filterRooms(typeParam, minPrice, maxPrice, capacity, statusParam)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDto> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate, String roomType, Integer guests) {
        if (checkInDate == null || checkOutDate == null) {
            throw new BadRequestException("Check-in and Check-out dates are required");
        }
        if (!checkOutDate.isAfter(checkInDate)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }

        String typeParam = (roomType != null && !roomType.trim().isEmpty() && !"ALL".equalsIgnoreCase(roomType.trim()))
                ? roomType.trim() : null;

        return roomRepository.findAvailableRooms(checkInDate, checkOutDate, typeParam, guests)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDto getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapToDto(room);
    }

    @Override
    public RoomDto createRoom(RoomDto roomDto) {
        if (roomRepository.existsByRoomNumber(roomDto.getRoomNumber().trim())) {
            throw new DuplicateRoomException("Room number already exists: " + roomDto.getRoomNumber());
        }

        Room room = new Room();
        room.setRoomNumber(roomDto.getRoomNumber().trim());
        room.setRoomType(roomDto.getRoomType().trim());
        room.setPricePerNight(roomDto.getPricePerNight());
        room.setCapacity(roomDto.getCapacity());
        room.setBeds(roomDto.getBeds());
        room.setDescription(roomDto.getDescription());
        room.setFacilities(roomDto.getFacilities());
        room.setImageUrl(roomDto.getImageUrl());
        room.setStatus(roomDto.getStatus() != null ? roomDto.getStatus().toUpperCase() : "AVAILABLE");

        Room saved = roomRepository.save(room);
        return mapToDto(saved);
    }

    @Override
    public RoomDto updateRoom(Long id, RoomDto roomDto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        if (roomRepository.existsByRoomNumberAndIdNot(roomDto.getRoomNumber().trim(), id)) {
            throw new DuplicateRoomException("Room number already in use by another room: " + roomDto.getRoomNumber());
        }

        room.setRoomNumber(roomDto.getRoomNumber().trim());
        room.setRoomType(roomDto.getRoomType().trim());
        room.setPricePerNight(roomDto.getPricePerNight());
        room.setCapacity(roomDto.getCapacity());
        room.setBeds(roomDto.getBeds());
        room.setDescription(roomDto.getDescription());
        room.setFacilities(roomDto.getFacilities());
        room.setImageUrl(roomDto.getImageUrl());
        if (roomDto.getStatus() != null) {
            room.setStatus(roomDto.getStatus().toUpperCase());
        }

        Room updated = roomRepository.save(room);
        return mapToDto(updated);
    }

    @Override
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        roomRepository.delete(room);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRoomAvailableForDates(Long roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        if (!"AVAILABLE".equalsIgnoreCase(room.getStatus())) {
            return false;
        }

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                roomId,
                checkInDate,
                checkOutDate,
                BookingStatus.CANCELLED
        );

        return overlappingBookings.isEmpty();
    }

    private RoomDto mapToDto(Room room) {
        return new RoomDto(
                room.getId(),
                room.getRoomNumber(),
                room.getRoomType(),
                room.getPricePerNight(),
                room.getCapacity(),
                room.getBeds(),
                room.getDescription(),
                room.getFacilities(),
                room.getImageUrl(),
                room.getStatus(),
                room.getCreatedAt()
        );
    }
}
