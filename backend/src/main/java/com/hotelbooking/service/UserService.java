package com.hotelbooking.service;

import com.hotelbooking.dto.AuthRequest;
import com.hotelbooking.dto.AuthResponse;
import com.hotelbooking.dto.RegisterRequest;
import com.hotelbooking.dto.UserProfileDto;

import java.util.List;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
    UserProfileDto getProfile(String userEmail);
    UserProfileDto updateProfile(String userEmail, UserProfileDto profileDto);
    List<UserProfileDto> getAllCustomers();
    UserProfileDto getCustomerById(Long id);
}
