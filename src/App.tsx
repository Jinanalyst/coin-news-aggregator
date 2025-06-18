import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Web3Provider } from "@/components/Web3Provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Forum from "./pages/Forum";

console.log('App.tsx: Component loaded');

const queryClient = new QueryClient();

const App = () => {
  console.log('App.tsx: App component rendering');
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/forum" element={<Forum />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </Web3Provider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

console.log('App.tsx: App component defined');

export default App;
