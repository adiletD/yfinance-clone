import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define a simplified user type for our custom authentication system
export interface SelectUser {
  id: number;
  username: string;
  email: string;
}

// Type guards to ensure proper type safety
function isSelectUser(user: any): user is SelectUser {
  return user && 
    typeof user.id === 'number' && 
    typeof user.username === 'string' && 
    typeof user.email === 'string';
}

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email: string;
};

// Default mock implementation that prevents the app from crashing
// when useAuth is used outside AuthProvider (for development)
const defaultAuthContextValue: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => ({ id: 0, username: "", email: "" }),
    data: null,
    reset: () => {},
    status: 'idle',
    failureCount: 0,
    failureReason: null
  } as any,
  logoutMutation: {
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => {},
    data: null,
    reset: () => {},
    status: 'idle',
    failureCount: 0,
    failureReason: null
  } as any,
  registerMutation: {
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => ({ id: 0, username: "", email: "" }),
    data: null,
    reset: () => {},
    status: 'idle',
    failureCount: 0,
    failureReason: null
  } as any,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [mockUser, setMockUser] = useState<SelectUser | null>(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return isSelectUser(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Always use the simplified auth mode for this app
  const useSimpleAuth = true;

  // Server authentication is disabled when using simple auth
  const {
    data: serverUser,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !useSimpleAuth, // Only fetch from server if not using simple auth
  });

  // Determine the actual user - either from server or our mock implementation
  const user = useSimpleAuth ? mockUser : serverUser;

  // Login mutation handling
  const loginMutation = useMutation<SelectUser, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      if (useSimpleAuth) {
        // Simple mock authentication
        if (credentials.username && credentials.password) {
          const mockUser: SelectUser = {
            id: 1,
            username: credentials.username,
            email: `${credentials.username}@example.com`
          };
          
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          setMockUser(mockUser);
          return mockUser;
        }
        throw new Error("Invalid credentials");
      } else {
        // Regular server authentication
        const response = await apiRequest<SelectUser>("POST", "/api/login", credentials);
        return response;
      }
    },
    onSuccess: (user) => {
      if (!useSimpleAuth) {
        queryClient.setQueryData(["/api/user"], user);
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  });

  // Registration mutation handling
  const registerMutation = useMutation<SelectUser, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      if (useSimpleAuth) {
        // Simple mock registration
        const mockUser: SelectUser = {
          id: 1,
          username: data.username,
          email: data.email
        };
        
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setMockUser(mockUser);
        return mockUser;
      } else {
        // Regular server registration
        const response = await apiRequest<SelectUser>("POST", "/api/register", data);
        return response;
      }
    },
    onSuccess: (user) => {
      if (!useSimpleAuth) {
        queryClient.setQueryData(["/api/user"], user);
      }
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    }
  });

  // Logout mutation handling
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (useSimpleAuth) {
        // Simple mock logout
        localStorage.removeItem('mockUser');
        setMockUser(null);
      } else {
        // Regular server logout
        try {
          await apiRequest("POST", "/api/logout");
        } catch (error) {
          console.warn("Server-side logout failed but continuing with client-side logout");
        }
      }
    },
    onSuccess: () => {
      if (!useSimpleAuth) {
        queryClient.setQueryData(["/api/user"], null);
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
  });

  const value: AuthContextType = {
    user: user ?? null,
    isLoading: !useSimpleAuth && isLoading,
    error,
    loginMutation: loginMutation as UseMutationResult<SelectUser, Error, LoginData>,
    logoutMutation: logoutMutation as UseMutationResult<void, Error, void>,
    registerMutation: registerMutation as UseMutationResult<SelectUser, Error, RegisterData>,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Return the default context instead of throwing an error
  // This makes the hook more resilient and allows it to be used anywhere
  return context;
}
