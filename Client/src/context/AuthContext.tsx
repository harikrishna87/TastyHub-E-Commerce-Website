import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthContextType, IUser } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const login = useCallback((userData: IUser, jwtToken: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
    setIsAuthenticated(true);
    setUser(userData);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { 
        withCredentials: true,
        timeout: 5000
      });
    } catch (err: any) {
      console.error('Server logout failed:', err);
      setError('Logout failed on server. Clearing local data.');
    }

    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
      setError('Failed to clear local data.');
    }

    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setIsLoggingOut(false);
  }, [backendUrl, isLoggingOut]);

  const loadUserFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const userData: IUser = JSON.parse(storedUser);
        const decodedToken: any = jwtDecode(storedToken);

        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn('Token expired. Logging out.');
          logout();
        } else {
          setIsAuthenticated(true);
          setUser(userData);
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to parse user data or decode token from localStorage:', e);
        setError('Failed to load user data. Logging out.');
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    isLoading,
    isLoggingOut,
    error,
  };

  return (
    <>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </>
  );
};

export { AuthContext, AuthProvider };