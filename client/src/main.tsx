import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/use-simple-auth";
import { GuestEstimatesProvider } from "./hooks/use-guest-estimates";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GuestEstimatesProvider>
        <App />
        <Toaster />
      </GuestEstimatesProvider>
    </AuthProvider>
  </QueryClientProvider>
);
