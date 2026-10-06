import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

// Helper to check if a JWT token is expired client-side
const isTokenExpired = (token) => {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return true;
        // Decode base64url
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const { exp } = JSON.parse(jsonPayload);
        // exp is in seconds, Date.now() is in milliseconds
        return exp ? Date.now() >= exp * 1000 : false;
    } catch {
        return true; // Treat malformed tokens as expired
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in when the app boots up
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('trust_echo_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                
                // Verify token exists and is not expired
                if (parsedUser?.token && !isTokenExpired(parsedUser.token)) {
                    setUser(parsedUser);
                } else {
                    // Clear expired or invalid user session automatically
                    localStorage.removeItem('trust_echo_user');
                }
            }
        } catch (error) {
            // FIX: If localStorage data is corrupted JSON, catch it
            // and wipe it cleanly so the app doesn't crash on boot.
            console.error('Failed to parse authentication state from storage:', error);
            localStorage.removeItem('trust_echo_user');
        } finally {
            setLoading(false);
        }
    }, []);

    // FIX: Synchronize auth state changes across multiple browser tabs
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'trust_echo_user') {
                if (!event.newValue) {
                    setUser(null); // Logged out in another tab
                } else {
                    try {
                        const parsed = JSON.parse(event.newValue);
                        if (parsed?.token && !isTokenExpired(parsed.token)) {
                            setUser(parsed);
                        } else {
                            setUser(null);
                            localStorage.removeItem('trust_echo_user');
                        }
                    } catch {
                        setUser(null);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Login function
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('trust_echo_user', JSON.stringify(userData));
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('trust_echo_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy consumption of auth state
export const useAuth = () => useContext(AuthContext);