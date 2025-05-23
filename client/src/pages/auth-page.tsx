import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-simple-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, LogIn, UserPlus, Mail, Lock, User } from "lucide-react";

// Create a login schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Create a register schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Define form types
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isPending, setIsPending] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    console.log("[AuthPage] useEffect - user state changed:", { user });
    
    if (user) {
      // User is logged in, redirect to home
      console.log("[AuthPage] User detected, redirecting to home");
      setIsPending(false); // Make sure we reset isPending when user state changes
      navigate("/");
    }
  }, [user, navigate]);

  // Initialize login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Initialize register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    console.log("[AuthPage] Login submit:", data);
    setIsPending(true);
    try {
      const loggedInUser = await login(data);
      console.log("[AuthPage] Login successful, returned user:", loggedInUser, "current user state:", { user });
      
      // Force navigation after login is complete - with a small delay to allow the state to update
      setTimeout(() => {
        navigate("/");
        setIsPending(false);
      }, 100);
    } catch (error) {
      // The auth hook will handle error toasts
      console.error("Login error:", error);
      setIsPending(false);
    }
  };

  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    console.log("[AuthPage] Register submit:", data);
    setIsPending(true);
    try {
      const registeredUser = await register(data);
      console.log("[AuthPage] Registration successful, returned user:", registeredUser, "current user state:", { user });
      
      // Force navigation after registration is complete - with a small delay to allow the state to update
      setTimeout(() => {
        navigate("/");
        setIsPending(false);
      }, 100);
    } catch (error) {
      // The auth hook will handle error toasts
      console.error("Registration error:", error);
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto grid min-h-[80vh] place-items-center py-8">
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        {/* Auth Forms */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {activeTab === "login"
                ? "Sign in to access your account"
                : "Enter your information to create an account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:font-bold">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:font-bold">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your username"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPending || isLoading}
                    >
                      {isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Choose a username"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="your.email@example.com"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Create a password"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            At least 6 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPending || isLoading}
                    >
                      {isPending
                        ? "Creating account..."
                        : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <div className="hidden md:flex flex-col justify-center p-6 bg-gray-50 rounded-lg">
          <div className="flex flex-col space-y-6 text-center">
            <div className="mx-auto p-3 rounded-full bg-primary bg-opacity-10">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Yahoo Finance Analysis</h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Get in-depth stock analysis, track market trends, and create your
              own custom estimates to compare with the experts.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-white shadow-sm">
                <h3 className="font-bold text-lg mb-2">Research Analysis</h3>
                <p className="text-sm text-gray-600">
                  Expert recommendations and price targets for any stock
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white shadow-sm">
                <h3 className="font-bold text-lg mb-2">Custom Estimates</h3>
                <p className="text-sm text-gray-600">
                  Create and track your own earnings and growth forecasts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}