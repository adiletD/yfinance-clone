import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Define a simplified user type
export interface User {
  id: number;
  username: string;
  email: string;
}

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

// Create a default context with safe fallback values
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
};

// Create the auth context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user data', err);
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simple validation
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      // Create a mock user (In a real app, this would be from an API)
      const user: User = {
        id: 1,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
      };

      // Save user to localStorage for persistence
      localStorage.setItem('mockUser', JSON.stringify(user));
      setUser(user);

      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.username}!`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log in';
      setError(message);
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simple validation
      if (!data.username || !data.email || !data.password) {
        throw new Error('Username, email, and password are required');
      }

      // Password strength check
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create a mock user (In a real app, this would be from an API)
      const user: User = {
        id: 1,
        username: data.username,
        email: data.email,
      };

      // Save user to localStorage for persistence
      localStorage.setItem('mockUser', JSON.stringify(user));
      setUser(user);

      toast({
        title: 'Registration successful',
        description: `Welcome, ${user.username}!`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      setError(message);
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('mockUser');
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  // Create the context value
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth hook
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}