"use client";

import "@/app/wallet-connect-setup/evm-setup";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvmWallet } from '@/hooks/use-evm-wallet';
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { Send, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';

const chains = [
  { id: 'ethereum', name: 'Ethereum/IMX' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'near', name: 'NEAR' },
  { id: 'aptos', name: 'Aptos' },
  { id: 'injective', name: 'Injective' },
  { id: 'sui', name: 'Sui' },
  { id: 'mantra', name: 'Mantra' },
  { id: 'solana', name: 'Solana' }
];

export default function Home() {
  const [selectedChain, setSelectedChain] = useState('ethereum');
  // TODO: 1. Connect wallet
  // TODO: 2. Show USDC balance (or any other token)
  // TODO: 3. Submit transaction signing with the wallet
  const {
    isEvmLoading, evmBalance, evmAddress, isEvmConnected,
    openEvmModal, handleEvmPay, disconnectEvm
  } = useEvmWallet();

  const {
    isSolanaLoading, solanaBalance, solanaAddress, isSolanaConnected,
    handleSolanaPay, connectSolana, disconnectSolana
  } = useSolanaWallet();

  const {
    isConnected, handleConnect, handleDisconnect, address, balance, handlePay
  } = useMemo(() => {
    switch (selectedChain) {
      case "ethereum": return {
        handlePay: () => handleEvmPay(),
        balance: evmBalance,
        address: evmAddress,
        isConnected: isEvmConnected,
        handleConnect: () => openEvmModal(),
        handleDisconnect: disconnectEvm,
      };
      case "solana": return {
        handlePay: () => handleSolanaPay(),
        balance: solanaBalance,
        address: solanaAddress,
        isConnected: isSolanaConnected,
        handleConnect: connectSolana,
        handleDisconnect: disconnectSolana
      };
      default: return {};
    }
  }, [
    isEvmLoading, evmBalance, evmAddress, isEvmConnected, handleEvmPay, openEvmModal, disconnectEvm,
    isSolanaLoading, solanaBalance, solanaAddress, isSolanaConnected, handleSolanaPay, connectSolana, disconnectSolana
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Multi-Chain Wallet</h1>

          <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleConnect}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnected ? 'Connected' : 'Connect Wallet'}
              </Button>

              {isConnected && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-300">Connected Address</p>
                    <p className="font-mono text-sm">{address}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-300">USDC Balance</p>
                    <p className="text-xl font-bold">
                      {balance} USDC
                    </p>
                  </div>

                  <Button
                    onClick={handlePay}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Transaction
                  </Button>

                  <Button
                    onClick={handleDisconnect}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Disconnext
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}