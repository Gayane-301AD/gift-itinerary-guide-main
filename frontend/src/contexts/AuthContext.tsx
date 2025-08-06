import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  subscription_tier: string;
  subscribed: boolean;
  daily_ai_queries_used: number;
  is_verified: boolean;
  profile_image?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, username: string, fullName: string, phone?: string, date_of_birth?: string, gender?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          const response = await apiClient.getCurrentUser();
          if (response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            await apiClient.logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await apiClient.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    username: string, 
    fullName: string, 
    phone?: string,
    date_of_birth?: string,
    gender?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await apiClient.register({
        email,
        password,
        username,
        full_name: fullName,
        phone,
        date_of_birth,
        gender,
      });
      
      if (response.error) {
        return { error: response.error };
      }
      
      // Registration successful, but user needs to verify email
      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.data) {
        setUser(response.data.user);
      }
      
      return { error: response.error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const response = await apiClient.getCurrentUser();
        if (response.data) {
          console.log('Refreshed user data:', response.data);
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};