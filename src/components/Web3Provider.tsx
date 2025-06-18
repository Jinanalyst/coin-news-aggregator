'use client';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Get projectId from environment variable
const projectId = '6d9c2691c2bda3cd52c1bd5e36f59075';

// Configure metadata for your app
const metadata = {
  name: "Coin News Aggregator",
  description: "A crypto news aggregation platform",
  url: "https://coin-news-aggregator.com",
  icons: ["https://coin-news-aggregator.com/favicon.png"]
};

// Set up queryClient
const queryClient = new QueryClient();

// Configure wagmi client
const chains = [mainnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
} 