import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const AuthContext = createContext(null);

// Define the base URL for our backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// --- Axios Interceptors ---
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        // Always get the latest token from localStorage
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.token) {
                    config.headers.Authorization = `Bearer ${parsedUser.token}`;
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
            }
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.data || error.message);
        
        // Handle 401 Unauthorized errors globally - but don't redirect during logout
        if (error.response?.status === 401) {
            const isLogoutInProgress = sessionStorage.getItem('loggingOut');
            
            if (!isLogoutInProgress && window.location.pathname !== '/login') {
                // Clear auth data
                localStorage.removeItem('userInfo');
                delete axiosInstance.defaults.headers.common['Authorization'];
                
                // Redirect to login
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Use queryClient with error handling
    let queryClient;
    try {
        queryClient = useQueryClient();
    } catch (error) {
        console.warn('QueryClient not available:', error.message);
    }

    // Check for a logged-in user in localStorage on initial app load
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserInfo(parsedUser);
                // Set the auth token for all subsequent API requests
                if (parsedUser.token) {
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('userInfo');
            }
        }
        setLoading(false);
    }, []);

    // Unified signup function for all roles
    const signup = async (formData) => {
        try {
            await axiosInstance.post('users/register', formData);
            // On successful registration, redirect to login
        } catch (error) {
            console.error("Registration failed:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Server Error');
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('users/login', { email, password });
            if (response.data) {
                // Store user info
                localStorage.setItem('userInfo', JSON.stringify(response.data));
                setUserInfo(response.data);
                
                // Set auth header
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                // Role-Based Redirection Logic
                const { role } = response.data;
                if (role === 'CentralAdmin') {
                    navigate('/admin/dashboard');
                } else if (role === 'StateOfficer') {
                    navigate('/state/dashboard');
                } else if (role === 'ExecutingAgency') {
                    navigate('/agency/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Server Error');
        }
    };

    const logout = () => {
        // Set flag to prevent 401 interceptor from interfering
        sessionStorage.setItem('loggingOut', 'true');
        
        // Cancel all ongoing queries
        if (queryClient) {
            queryClient.cancelQueries();
        }
        
        // Clear user state FIRST
        setUserInfo(null);
        
        // Clear localStorage
        localStorage.removeItem('userInfo');
        
        // Remove auth header
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        // Clear React Query cache
        if (queryClient) {
            queryClient.clear();
        }
        
        // Remove logout flag
        sessionStorage.removeItem('loggingOut');
        
        // Use window.location for hard redirect to prevent query refetching
        window.location.href = '/login';
    };

    const value = {
        userInfo,
        isAuth: !!userInfo,
        loading,
        login,
        signup,
        logout,
    };

    // Render children only after checking for stored user
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook to easily access auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export the configured axios instance for use in other parts of the app
export { axiosInstance };