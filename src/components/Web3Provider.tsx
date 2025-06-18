'use client';

import { WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Get projectId from https://cloud.reown.com
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

// Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet],
});

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet],
  metadata,
  features: {
    analytics: true
  }
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
} 