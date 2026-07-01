import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
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
  const isLoggingOutRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const login = useCallback((userData: IUser, jwtToken: string, rememberToken?: string, rememberMeFlag: boolean = true) => {
    const storage = rememberMeFlag ? localStorage : sessionStorage;
    const otherStorage = rememberMeFlag ? sessionStorage : localStorage;

    try {
      otherStorage.removeItem('user');
      otherStorage.removeItem('token');
      otherStorage.removeItem('remember_token');
      otherStorage.removeItem('remember_me_flag');

      storage.setItem('user', JSON.stringify(userData));
      storage.setItem('token', jwtToken);
      if (rememberToken) {
        storage.setItem('remember_token', rememberToken);
      }
      storage.setItem('remember_me_flag', rememberMeFlag ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to write to storage:', e);
    }

    setIsAuthenticated(true);
    setUser(userData);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;
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
      localStorage.removeItem('remember_token');
      localStorage.removeItem('remember_me_flag');

      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('remember_token');
      sessionStorage.removeItem('remember_me_flag');

      localStorage.setItem('logout_intentional', 'true');
    } catch (e) {
      console.error('Failed to clear storage:', e);
      setError('Failed to clear local data.');
    }

    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setIsLoggingOut(false);
    isLoggingOutRef.current = false;
  }, [backendUrl]);

  const loadUserFromStorage = useCallback(async () => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const userData: IUser = JSON.parse(storedUser);
        const decodedToken: any = jwtDecode(storedToken);

        // If access token is completely expired, log out.
        // Since token is now valid for 365 days, this is just a safety check.
        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn('Access token expired.');
          logout();
        } else {
          setIsAuthenticated(true);
          setUser(userData);
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to parse user data or decode token from storage:', e);
        setError('Failed to load user data. Logging out.');
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Sync profile details silently on mount to refresh stale data (e.g. uploaded avatars)
  useEffect(() => {
    const syncLatestProfile = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const rememberMeFlag = localStorage.getItem('remember_me_flag') === 'true' || sessionStorage.getItem('remember_me_flag') === 'true';
      if (storedToken && isAuthenticated) {
        try {
          const res = await axios.get(`${backendUrl}/api/auth/getme`, {
            headers: { Authorization: `Bearer ${storedToken}` },
            withCredentials: true
          });
          if (res.data.success) {
            setUser(res.data.user);
            const storage = rememberMeFlag ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('AuthContext: silent profile sync failed:', err);
        }
      }
    };
    syncLatestProfile();
  }, [isAuthenticated, backendUrl]);

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