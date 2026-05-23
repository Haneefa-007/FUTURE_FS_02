import React, { createContext, useState, useEffect } from 'react';
// Demo authentication context – no backend calls

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Simplified token validation – no backend verification needed
  useEffect(() => {
    // Load stored token and user on mount for demo auth persistence
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored demo user', e);
      }
    }
    // Token already loaded from state initialization above
    setLoading(false);
  }, []);

  // Demo login – accepts any credentials and stores a fake user in localStorage
  const login = (emailOrUsername, password) => {
    const fakeUser = {
      username: emailOrUsername,
      email: emailOrUsername.includes('@') ? emailOrUsername : '',
      _id: 'demo-id'
    };
    // Store dummy token and user info
    const fakeToken = 'demo-token';
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('demoUser', JSON.stringify(fakeUser));
    setToken(fakeToken);
    setUser(fakeUser);
    return { success: true };
  };

  // Demo logout – clears localStorage and resets state
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demoUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
