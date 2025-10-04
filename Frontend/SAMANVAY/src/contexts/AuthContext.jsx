import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

// Define the base URL for our backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// --- Axios Interceptors for Debugging ---
// This is a great practice for seeing API requests and responses in the console.
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
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
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const navigate = useNavigate();

    // Check for a logged-in user in localStorage on initial app load
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserInfo(parsedUser);
            // Set the auth token for all subsequent API requests
            if (parsedUser.token) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            }
        }
        setLoading(false);
    }, []);

    // Unified signup function for all roles
    const signup = async (formData) => {
        try {
            // We expect the backend to handle the data and NOT log the user in.
            await axiosInstance.post('users/register', formData);
            // On successful registration, we don't log them in.
            // We just inform them and redirect to the login page.
        } catch (error) {
            console.error("Registration failed:", error.response?.data?.message || error.message);
            // Re-throw the error so the UI component can handle it (e.g., show an alert)
            throw new Error(error.response?.data?.message || 'Server Error');
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('users/login', { email, password });
            if (response.data) {
                localStorage.setItem('userInfo', JSON.stringify(response.data));
                setUserInfo(response.data);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                // --- Role-Based Redirection Logic ---
                const { role } = response.data;
                if (role === 'CentralAdmin') {
                    navigate('/admin/dashboard');
                } else if (role === 'StateOfficer') {
                    navigate('/state/dashboard');
                } else if (role === 'ExecutingAgency') {
                    navigate('/agency/dashboard');
                } else {
                    navigate('/'); // Fallback
                }
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Server Error');
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        delete axiosInstance.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    const value = {
        userInfo,
        isAuth: !!userInfo,
        loading,
        login,
        signup,
        logout,
    };

    // Render children only after checking for stored user, to prevent UI flicker
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook to easily access auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Export the configured axios instance for use in other parts of the app
export { axiosInstance };