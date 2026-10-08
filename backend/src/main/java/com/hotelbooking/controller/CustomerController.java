package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.UserProfileDto;
import com.hotelbooking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final UserService userService;

    public CustomerController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfileDto profile = userService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateCurrentUserProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileDto profileDto
    ) {
        String email = authentication.getName();
        UserProfileDto updated = userService.updateProfile(email, profileDto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully!", updated));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllCustomers() {
        List<UserProfileDto> customers = userService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", customers));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCustomerById(@PathVariable Long id) {
        UserProfileDto customer = userService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success("Customer details retrieved successfully", customer));
    }
}
