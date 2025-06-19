import React, { useState } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

const SOLANA_RECEIVER = 'DXMH7DLXRMHqpwSESmJ918uFhFQSxzvKEb7CA1ZDj1a2';
const ETH_RECEIVER = '0x96f70D59dcBC510c5f018786Bf176EeAD3B80727';
const SOLANA_PRICES = { pro: 0.05, premium: 0.2 };
const ETH_PRICES = { pro: 0.005, premium: 0.02 };
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

const plans = [
  {
    key: 'free',
    name: 'Free',
    description: '5 posts per day, no revenue',
    priceSol: 0,
    priceEth: 0,
    duration: 'Daily',
    revenue: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    description: '1 month unlimited posts, earn revenue',
    priceSol: SOLANA_PRICES.pro,
    priceEth: ETH_PRICES.pro,
    duration: '1 Month',
    revenue: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    description: '1 year unlimited posts, earn revenue',
    priceSol: SOLANA_PRICES.premium,
    priceEth: ETH_PRICES.premium,
    duration: '1 Year',
    revenue: true,
  },
];

export function MembershipPlansDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (plan: string) => void }) {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [chain, setChain] = useState<'sol' | 'eth' | null>(null);
  const [status, setStatus] = useState('');
  const [paying, setPaying] = useState(false);
  // Solana
  const { publicKey, sendTransaction, connected } = useSolanaWallet();
  // Ethereum
  const { isConnected: ethConnected } = useAccount();
  const { sendTransaction: sendEthTx } = useSendTransaction();

  const handlePay = async () => {
    if (selectedPlan === 'free') {
      onSuccess('free');
      onClose();
      return;
    }
    setPaying(true);
    setStatus('');
    try {
      if (chain === 'sol') {
        if (!publicKey || !connected) {
          setStatus('Connect your Solana wallet.');
          setPaying(false);
          return;
        }
        const lamports = Math.floor(SOLANA_PRICES[selectedPlan as 'pro' | 'premium'] * 1e9);
        const connection = new Connection(SOLANA_RPC);
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(SOLANA_RECEIVER),
            lamports,
          })
        );
        setStatus('Awaiting wallet approval...');
        await sendTransaction(tx, connection);
        setStatus('Payment sent!');
        onSuccess(selectedPlan);
        onClose();
      } else if (chain === 'eth') {
        if (!ethConnected) {
          setStatus('Connect your Ethereum wallet.');
          setPaying(false);
          return;
        }
        setStatus('Awaiting wallet approval...');
        await sendEthTx({
          to: ETH_RECEIVER,
          value: parseEther(ETH_PRICES[selectedPlan as 'pro' | 'premium'].toString()),
        });
        setStatus('Payment sent!');
        onSuccess(selectedPlan);
        onClose();
      }
    } catch (e: any) {
      setStatus('Error: ' + (e.message || e.toString()));
    }
    setPaying(false);
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Choose Your Plan</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {plans.map(plan => (
            <div key={plan.key} style={{ border: selectedPlan === plan.key ? '2px solid #6366f1' : '1px solid #ddd', borderRadius: 8, padding: 16, background: selectedPlan === plan.key ? '#f5f3ff' : '#fafafa', cursor: 'pointer' }} onClick={() => setSelectedPlan(plan.key)}>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{plan.name}</div>
              <div style={{ fontSize: 14, color: '#555', margin: '4px 0 8px 0' }}>{plan.description}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{plan.duration}{plan.revenue ? ' • Creator Revenue' : ''}</div>
              <div style={{ fontWeight: 500, marginTop: 6 }}>
                {plan.priceSol === 0 ? 'Free' : `${plan.priceSol} SOL / ${plan.priceEth} ETH`}
              </div>
            </div>
          ))}
        </div>
        {selectedPlan !== 'free' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button onClick={() => setChain('sol')} style={{ padding: 8, background: chain === 'sol' ? '#6366f1' : '#eee', color: chain === 'sol' ? '#fff' : '#222', borderRadius: 6 }}>Pay with Solana</button>
            <button onClick={() => setChain('eth')} style={{ padding: 8, background: chain === 'eth' ? '#6366f1' : '#eee', color: chain === 'eth' ? '#fff' : '#222', borderRadius: 6 }}>Pay with Ethereum</button>
          </div>
        )}
        <button
          onClick={handlePay}
          disabled={paying || (selectedPlan !== 'free' && !chain)}
          style={{ padding: 12, width: '100%', background: '#16a34a', color: '#fff', borderRadius: 6, fontWeight: 600, fontSize: 16, marginBottom: 8 }}
        >
          {paying ? 'Processing...' : selectedPlan === 'free' ? 'Continue with Free' : `Pay & Continue`}
        </button>
        {status && <div style={{ fontSize: 14, marginTop: 8, color: status.startsWith('Error') ? 'red' : '#222' }}>{status}</div>}
        <button onClick={onClose} style={{ marginTop: 12, background: 'none', border: 'none', color: '#6366f1', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
} 