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
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
}

// Create a default context with safe fallback values
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  login: async () => ({ id: 0, username: '', email: '' }),
  register: async () => ({ id: 0, username: '', email: '' }),
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

  // Debug: Check current user state
  console.log('[AuthProvider] Current user state:', { user });

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    console.log('[AuthProvider] Initializing from localStorage:', { storedUser });
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('[AuthProvider] Found stored user:', parsedUser);
        
        // Use functional update to ensure we're working with the latest state
        setUser(currentUser => {
          console.log('[AuthProvider] Setting initial user from localStorage. Current:', currentUser, 'New:', parsedUser);
          return parsedUser;
        });
      } catch (err) {
        console.error('[AuthProvider] Failed to parse stored user data', err);
        localStorage.removeItem('mockUser'); // Clean up invalid data
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    console.log('[AuthProvider] Login attempt:', { username: credentials.username });
    setIsLoading(true);
    setError(null);

    try {
      // Simple validation
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      // Create a mock user (In a real app, this would be from an API)
      const newUser: User = {
        id: 1,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
      };

      console.log('[AuthProvider] User created:', newUser);
      
      // Save user to localStorage for persistence immediately
      localStorage.setItem('mockUser', JSON.stringify(newUser));
      console.log('[AuthProvider] User saved to localStorage');
      
      // Directly set the user state 
      setUser(newUser);
      console.log('[AuthProvider] Direct user state update with:', newUser);
      
      // Make sure we update the React state before showing toasts
      await new Promise(resolve => setTimeout(resolve, 0));

      toast({
        title: 'Login successful',
        description: `Welcome back, ${newUser.username}!`,
      });
      
      // Return the user for immediate access in login function
      return newUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log in';
      setError(message);
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
      throw err; // Re-throw so calling code knows login failed
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
      const newUser: User = {
        id: 1,
        username: data.username,
        email: data.email,
      };

      // Save user to localStorage for persistence immediately
      localStorage.setItem('mockUser', JSON.stringify(newUser));
      console.log('[AuthProvider] User saved to localStorage during registration');
      
      // Directly set the user state
      setUser(newUser);
      console.log('[AuthProvider] Direct user state update during registration with:', newUser);

      // Make sure we update the React state before showing toasts
      await new Promise(resolve => setTimeout(resolve, 0));

      toast({
        title: 'Registration successful',
        description: `Welcome, ${newUser.username}!`,
      });
      
      // Return the user for immediate access in register function
      return newUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      setError(message);
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
      throw err; // Re-throw so calling code knows registration failed
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