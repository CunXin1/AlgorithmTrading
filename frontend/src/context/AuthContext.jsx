// ------------------------------------------------------------
// AuthContext.jsx
// ------------------------------------------------------------
// Global authentication state management
// Single source of truth for user authentication status
// Uses session-based auth (Django session cookies)
// ------------------------------------------------------------

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authService from "../api/authService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const userData = await authService.getMe();
        if (!cancelled) {
          setUser(userData);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  // Login function - calls authService and updates state
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    // After successful login, fetch user info
    const userData = await authService.getMe();
    setUser(userData);
    return data;
  }, []);

  // Logout function - calls authService and clears state
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Refresh user data (useful after profile updates)
  const refreshUser = useCallback(async () => {
    const userData = await authService.getMe();
    setUser(userData);
    return userData;
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
