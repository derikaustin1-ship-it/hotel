import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, customerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('hotel_auth_token');
    const savedUser = localStorage.getItem('hotel_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('hotel_auth_token');
        localStorage.removeItem('hotel_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      const authData = response.data;
      const userInfo = {
        id: authData.id,
        name: authData.name,
        email: authData.email,
        phone: authData.phone,
        role: authData.role,
      };

      setToken(authData.token);
      setUser(userInfo);

      localStorage.setItem('hotel_auth_token', authData.token);
      localStorage.setItem('hotel_auth_user', JSON.stringify(userInfo));

      return userInfo;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (formData) => {
    const response = await authApi.register(formData);
    if (response.success && response.data) {
      const authData = response.data;
      const userInfo = {
        id: authData.id,
        name: authData.name,
        email: authData.email,
        phone: authData.phone,
        role: authData.role,
      };

      setToken(authData.token);
      setUser(userInfo);

      localStorage.setItem('hotel_auth_token', authData.token);
      localStorage.setItem('hotel_auth_user', JSON.stringify(userInfo));

      return userInfo;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hotel_auth_token');
    localStorage.removeItem('hotel_auth_user');
  };

  const updateProfile = async (profileData) => {
    const response = await customerApi.updateMyProfile(profileData);
    if (response.success && response.data) {
      const updated = {
        ...user,
        name: response.data.name,
        phone: response.data.phone,
      };
      setUser(updated);
      localStorage.setItem('hotel_auth_user', JSON.stringify(updated));
      return response.data;
    }
    throw new Error(response.message || 'Failed to update profile');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
