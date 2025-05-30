import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ApiKeyInput from "./components/APIKeyInput";

const queryClient = new QueryClient();

const PROVIDERS = [
  { label: "OpenAI", value: "openai" },
  { label: "Gemini", value: "gemini" },
];

const App = () => {
  const [provider, setProvider] = useState<string>("openai");
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Check if API key exists for selected provider
    const keyName = provider === "openai" ? "openai_api_key" : "gemini_api_key";
    const apiKey = localStorage.getItem(keyName);
    setHasApiKey(!!apiKey);
    setIsChecking(false);
  }, [provider]);

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
            <div className="w-full max-w-md space-y-6">
              <div className="mb-4">
                <label className="block font-medium mb-2">Select AI Provider:</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                >
                  {PROVIDERS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <ApiKeyInput provider={provider} onKeySaved={handleApiKeySaved} />
            </div>
          </div>
        ) : (
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index provider={provider} />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;