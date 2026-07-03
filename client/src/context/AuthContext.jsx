import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in when the app boots up
    useEffect(() => {
        const storedUser = localStorage.getItem('trust_echo_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    } , []);

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