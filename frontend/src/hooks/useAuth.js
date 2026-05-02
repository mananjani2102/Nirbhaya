import { useState, useEffect } from 'react';
import { MOCK_USER } from '../utils/constants';

// TODO: Add actual API calls for authentication
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for token
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(MOCK_USER);
                }
            } catch (e) {
                console.error("Error parsing user from localStorage:", e);
                setUser(MOCK_USER);
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock login
        console.log("Logging in", email, password); // just to silence linter
        localStorage.setItem('authToken', 'mock-jwt-token');
        setUser(MOCK_USER);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return { user, login, logout, loading, isAuthenticated: !!user };
};

