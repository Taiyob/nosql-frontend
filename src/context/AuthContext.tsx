import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { type User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        setIsLoading(true);
        try {
          const response = await api.get('/users/me');
          if (response.data.success) {
            setUser(response.data.data);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('accessToken', newToken);
    setIsLoading(true); // Set synchronously to prevent redirect race
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
