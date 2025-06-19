import React, { useState, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

const SOLANA_RECEIVER = 'DXMH7DLXRMHqpwSESmJ918uFhFQSxzvKEb7CA1ZDj1a2';
const ETH_RECEIVER = '0x96f70D59dcBC510c5f018786Bf176EeAD3B80727';
const SOLANA_FEE = 0.01;
const ETH_FEE = 0.001;
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export function PayToPostDialog({ onSuccess }: { onSuccess: () => void }) {
  const [chain, setChain] = useState<'sol' | 'eth' | null>(null);
  const [status, setStatus] = useState('');
  const [paying, setPaying] = useState(false);
  // Solana
  const { publicKey, sendTransaction, connected } = useSolanaWallet();
  // Ethereum
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { sendTransaction: sendEthTx } = useSendTransaction();

  const handleSolanaPay = useCallback(async () => {
    if (!publicKey || !connected) {
      setStatus('Please connect your Solana wallet.');
      return;
    }
    setPaying(true);
    try {
      const lamports = Math.floor(SOLANA_FEE * 1e9);
      const connection = new Connection(SOLANA_RPC);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(SOLANA_RECEIVER),
          lamports,
        })
      );
      setStatus('Awaiting wallet approval...');
      const signature = await sendTransaction(tx, connection);
      setStatus('Payment sent! Signature: ' + signature);
      onSuccess();
    } catch (e: any) {
      setStatus('Error: ' + (e.message || e.toString()));
    }
    setPaying(false);
  }, [publicKey, connected, sendTransaction, onSuccess]);

  const handleEthPay = useCallback(async () => {
    if (!ethConnected) {
      setStatus('Connect your Ethereum wallet.');
      return;
    }
    setPaying(true);
    try {
      setStatus('Awaiting wallet approval...');
      await sendEthTx({
        to: ETH_RECEIVER,
        value: parseEther(ETH_FEE.toString()),
      });
      setStatus('Payment sent!');
      onSuccess();
    } catch (e: any) {
      setStatus('Error: ' + (e.message || e.toString()));
    }
    setPaying(false);
  }, [ethConnected, sendEthTx, onSuccess]);

  return (
    <div style={{ padding: 24, minWidth: 320 }}>
      <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>Pay Membership Fee</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setChain('sol')} style={{ padding: 8, background: chain === 'sol' ? '#6366f1' : '#eee', color: chain === 'sol' ? '#fff' : '#222', borderRadius: 6 }}>Pay with Solana</button>
        <button onClick={() => setChain('eth')} style={{ padding: 8, background: chain === 'eth' ? '#6366f1' : '#eee', color: chain === 'eth' ? '#fff' : '#222', borderRadius: 6 }}>Pay with Ethereum</button>
      </div>
      {chain === 'sol' && (
        <button onClick={handleSolanaPay} disabled={paying || !connected} style={{ padding: 10, width: '100%', background: '#16a34a', color: '#fff', borderRadius: 6, marginBottom: 8 }}>
          {paying ? 'Paying...' : `Pay ${SOLANA_FEE} SOL`}
        </button>
      )}
      {chain === 'eth' && (
        <button onClick={handleEthPay} disabled={paying || !ethConnected} style={{ padding: 10, width: '100%', background: '#f59e42', color: '#fff', borderRadius: 6, marginBottom: 8 }}>
          {paying ? 'Paying...' : `Pay ${ETH_FEE} ETH`}
        </button>
      )}
      {status && <div style={{ fontSize: 14, marginTop: 8 }}>{status}</div>}
    </div>
  );
} 