import { ReownKitProvider } from '@reown/walletkit/react';
import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { createPublicClient, http } from 'viem';

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http()
  }),
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <ReownKitProvider>
        {children}
      </ReownKitProvider>
    </WagmiConfig>
  );
} 