import React, { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const FEE_ADDRESS = 'DXMH7DLXRMHqpwSESmJ918uFhFQSxzvKEb7CA1ZDj1a2';
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export function TipButton({ recipient }: { recipient: string }) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const handleTip = useCallback(async () => {
    if (!publicKey || !connected) {
      setStatus('Please connect your wallet.');
      return;
    }
    try {
      const lamports = Math.floor(Number(amount) * 1e9);
      if (lamports <= 0) {
        setStatus('Enter a valid amount.');
        return;
      }
      const feeLamports = Math.max(Math.floor(lamports * 0.001), 1); // 0.1% fee, at least 1 lamport
      const authorLamports = lamports - feeLamports;
      const connection = new Connection(SOLANA_RPC);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: authorLamports,
        }),
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(FEE_ADDRESS),
          lamports: feeLamports,
        })
      );
      setStatus('Awaiting wallet approval...');
      const signature = await sendTransaction(tx, connection);
      setStatus('Transaction sent! Signature: ' + signature);
    } catch (e: any) {
      setStatus('Error: ' + (e.message || e.toString()));
    }
  }, [publicKey, connected, amount, recipient, sendTransaction]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="number"
        min="0"
        step="0.000000001"
        placeholder="Amount in SOL"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{ padding: 4 }}
      />
      <button onClick={handleTip} disabled={!connected || !amount} style={{ padding: 8 }}>
        Tip in SOL (0.1% fee)
      </button>
      {status && <div style={{ fontSize: 12 }}>{status}</div>}
    </div>
  );
} 