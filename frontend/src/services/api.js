import axios from 'axios';

// Base API instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotel_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data and handle errors gracefully
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.message) {
        message = data.message;
      } else if (data.validationErrors) {
        message = Object.values(data.validationErrors).join(', ');
      } else if (data.error) {
        message = data.error;
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Rooms Services
export const roomApi = {
  getAllRooms: (params) => api.get('/rooms', { params }),
  getAvailableRooms: (params) => api.get('/rooms/available', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Booking Services
export const bookingApi = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  getAllBookings: () => api.get('/bookings'),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
};

// Customer Profile & Admin Customer Services
export const customerApi = {
  getMyProfile: () => api.get('/customers/profile'),
  updateMyProfile: (data) => api.put('/customers/profile', data),
  getAllCustomers: () => api.get('/customers'),
  getCustomerById: (id) => api.get(`/customers/${id}`),
};

// Admin Services
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
};

export default api;
