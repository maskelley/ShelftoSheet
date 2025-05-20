import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ApiKeyInput from "./components/ApiKeyInput";

const queryClient = new QueryClient();

const App = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Check if API key exists in localStorage
    const apiKey = localStorage.getItem("openai_api_key");
    setHasApiKey(!!apiKey);
    setIsChecking(false);
  }, []);

  // Handle API key saved event
  const handleApiKeySaved = () => {
    setHasApiKey(true);
  };

  if (isChecking) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!hasApiKey ? (
          <div className="flex h-screen w-full items-center justify-center">
            <div className="w-full max-w-md">
              <ApiKeyInput onKeySaved={handleApiKeySaved} />
            </div>
          </div>
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;