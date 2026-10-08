package com.hotelbooking.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long maintenanceRooms;

    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long completedBookings;

    private long totalCustomers;
    private BigDecimal totalRevenue;

    private List<BookingResponseDto> recentBookings;
    private Map<String, Long> roomTypeDistribution;
    private Map<String, Long> bookingStatusDistribution;

    public DashboardStatsDto() {}

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(long availableRooms) {
        this.availableRooms = availableRooms;
    }

    public long getOccupiedRooms() {
        return occupiedRooms;
    }

    public void setOccupiedRooms(long occupiedRooms) {
        this.occupiedRooms = occupiedRooms;
    }

    public long getMaintenanceRooms() {
        return maintenanceRooms;
    }

    public void setMaintenanceRooms(long maintenanceRooms) {
        this.maintenanceRooms = maintenanceRooms;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getConfirmedBookings() {
        return confirmedBookings;
    }

    public void setConfirmedBookings(long confirmedBookings) {
        this.confirmedBookings = confirmedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<BookingResponseDto> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<BookingResponseDto> recentBookings) {
        this.recentBookings = recentBookings;
    }

    public Map<String, Long> getRoomTypeDistribution() {
        return roomTypeDistribution;
    }

    public void setRoomTypeDistribution(Map<String, Long> roomTypeDistribution) {
        this.roomTypeDistribution = roomTypeDistribution;
    }

    public Map<String, Long> getBookingStatusDistribution() {
        return bookingStatusDistribution;
    }

    public void setBookingStatusDistribution(Map<String, Long> bookingStatusDistribution) {
        this.bookingStatusDistribution = bookingStatusDistribution;
    }
}
