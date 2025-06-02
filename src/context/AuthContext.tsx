import React, {useEffect, useState, createContext, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi, api } from '../services/api';

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'ROLE_DONOR' | 'ROLE_NGO';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'ROLE_DONOR' | 'ROLE_NGO') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth state changed:', { user, isAuthenticated });
  }, [user, isAuthenticated]);

  // Initialize auth state from localStorage
  const initializeAuth = useCallback(() => {
    const storedAuth = localStorage.getItem('auth');
    const token = localStorage.getItem('token');

    if (storedAuth && token) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth.user) {
          // Ensure all required fields are present
          const user: User = {
            id: parsedAuth.user.id || 0,
            name: parsedAuth.user.name,
            email: parsedAuth.user.email,
            role: parsedAuth.user.role
          };

          setUser(user);
          setIsAuthenticated(true);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Initialized auth from localStorage:', { user, token });
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        // Clear invalid auth data
        localStorage.removeItem('auth');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      console.log('Login API response:', response);

      const {
        user: userData,
        token
      } = response;

      setUser(userData);
      setIsAuthenticated(true);

      // Store auth data and token
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: userData,
        role: userData.role
      }));

      localStorage.setItem('token', token);
      toast.success('Login successful!');

      // Redirect based on role
      if (userData.role === 'ROLE_DONOR') {
        navigate('/donor/dashboard');
      } else {
        navigate('/ngo/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: 'ROLE_DONOR' | 'ROLE_NGO') => {
    try {
      const response = await authApi.register(name, email, password, role);
      console.log('AuthContext register response:', response);

      const {
        user: userData,
        token
      } = response;

      const user: User = {
        id: 0,
        name: userData?.name || name,
        email: userData?.email || email,
        role: userData?.role || role
      };


      console.log("Current user..." +user);

      setUser(user);
      setIsAuthenticated(true);

      // Store auth data and token
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: user,
        role: user.role
      }));

      localStorage.setItem('token', token);

      // Set the default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      console.log('Auth state after registration:', {
        isAuthenticated: true,
        user: user
      });

      toast.success('Registration successful!');

      // Redirect based on role
      if (role === 'ROLE_DONOR') {
        navigate('/donor/dashboard');
      } else {
        navigate('/ngo/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    navigate('/');
    toast.success('Logged out successfully');
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated,
    login,
    register,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};