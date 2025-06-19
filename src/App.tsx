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
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

console.log('App.tsx: Component loaded');

const queryClient = new QueryClient();

function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = 'https://api.mainnet-beta.solana.com';
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

const App = () => {
  console.log('App.tsx: App component rendering');
  
  return (
    <Providers>
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
    </Providers>
  );
};

console.log('App.tsx: App component defined');

export default App;
