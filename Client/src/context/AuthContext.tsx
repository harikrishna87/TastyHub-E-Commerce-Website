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
      localStorage.setItem('logout_intentional', 'true');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
      setError('Failed to clear local data.');
    }

    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setIsLoggingOut(false);
  }, [backendUrl, isLoggingOut]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await axios.post(`${backendUrl}/api/auth/continue-login`, {}, {
        withCredentials: true,
        timeout: 10000
      });
      if (res.data.success) {
        const { user: newUser, token: newToken } = res.data;
        login(newUser, newToken);
        return newToken;
      }
    } catch (err) {
      console.error('Failed to refresh access token:', err);
    }
    // Only logout if token refresh actually fails (e.g. refresh token expired or invalid)
    logout();
    return null;
  }, [backendUrl, login, logout]);

  const loadUserFromStorage = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const userData: IUser = JSON.parse(storedUser);
        const decodedToken: any = jwtDecode(storedToken);

        // If access token is expired or expiring in less than 30 seconds
        if (decodedToken.exp * 1000 < Date.now() + 30000) {
          console.warn('Access token expired or expiring soon. Attempting silent refresh.');
          const newToken = await refreshAccessToken();
          if (!newToken) {
            setIsLoading(false);
            return;
          }
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
  }, [logout, refreshAccessToken]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Axios response interceptor for automatic token refresh on 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url &&
          !originalRequest.url.includes('/api/auth/login') &&
          !originalRequest.url.includes('/api/auth/register') &&
          !originalRequest.url.includes('/api/auth/continue-login') &&
          !originalRequest.url.includes('/api/auth/logout')
        ) {
          originalRequest._retry = true;
          
          try {
            console.log('Access token expired. Attempting silent token refresh via interceptor...');
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Interceptor token refresh failed:', refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshAccessToken]);

  // Silent background refresh timer to refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    try {
      const decoded: any = jwtDecode(token);
      const delay = decoded.exp * 1000 - Date.now() - 60000; // refresh 1 minute before expiration
      
      if (delay > 0) {
        const timer = setTimeout(() => {
          console.log('Background refreshing token...');
          refreshAccessToken();
        }, delay);
        
        return () => clearTimeout(timer);
      } else {
        refreshAccessToken();
      }
    } catch (e) {
      console.error('Error setting up silent refresh timer:', e);
    }
  }, [isAuthenticated, token, refreshAccessToken]);

  // Sync profile details silently on mount to refresh stale data (e.g. uploaded avatars)
  useEffect(() => {
    const syncLatestProfile = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && isAuthenticated) {
        try {
          const res = await axios.get(`${backendUrl}/api/auth/getme`, {
            headers: { Authorization: `Bearer ${storedToken}` },
            withCredentials: true
          });
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
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