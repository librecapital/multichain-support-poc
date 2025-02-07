"use client";

import "@/app/wallet-connect-setup/evm-setup";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAptosWallet } from "@/hooks/use-aptos-wallet";

import { useEvmWallet } from '@/hooks/use-evm-wallet';
import { useKeplrWallet } from "@/hooks/use-keplr-wallet";
import { useNearWallet } from "@/hooks/use-near-wallet";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { useSuiWallet } from "@/hooks/use-sui-wallet";
import { Send, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';

const chains = [
  { id: 'ethereum', name: 'Ethereum/IMX' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'near', name: 'NEAR' },
  { id: 'aptos', name: 'Aptos' },
  { id: 'injective', name: 'Injective' },
  { id: 'sui', name: 'Sui' },
  { id: 'mantra', name: 'Mantra' },
  { id: 'solana', name: 'Solana' },
  { id: 'avalanche', name: 'Avalanche' }
];

export default function Home() {
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [isInstalled, setIsInstalled] = useState(false);
  // TODO: 1. Connect wallet
  // TODO: 2. Show USDC balance (or any other token)
  // TODO: 3. Submit transaction signing with the wallet
  const {
    isEvmLoading, evmBalance, evmAddress, isEvmConnected,
    open, handleEvmPay, disconnectEvm
  } = useEvmWallet();

  const {
    isSolanaLoading, solanaBalance, solanaAddress, isSolanaConnected, solanaManager,
    handleSolanaPay, connectSolana, disconnectSolana
  } = useSolanaWallet();

  const {
    isKeplrLoading, keplrBalance, keplrAddress, isKeplrConnected,
    handleKeplrPay, connectKeplr, disconnectKeplr, keplrToken
  } = useKeplrWallet();

  const {
    suiAddress, connectSui, disconnectSui, isSuiConnected, suiBalance, handleSuiPay, isSuiLoading, isSuiWalletInstalled
  } = useSuiWallet();

  const {
    connectAptos, disconnectAptos, aptosAddress, aptosConnected, aptosBalance, handleAptosPay, isAptosLoading
  } = useAptosWallet();

  const {
    connectNear, disconnectNear, isNearConnected, nearAddress, nearBalance, handleNearPay, nearWallet
  } = useNearWallet();

  const {
    isConnected, handleConnect, handleDisconnect, address, balance, handlePay, tokenName, isWalletInstalled, downloadWalletLink,
  } = useMemo(() => {
    switch (selectedChain) {
      case "ethereum": return {
        handlePay: () => handleEvmPay(),
        balance: evmBalance,
        address: evmAddress,
        isConnected: isEvmConnected,
        handleConnect: () => open(1),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: !!global?.window?.ethereum,
        downloadWalletLink: "https://metamask.io/",
      };
      case "polygon": return {
        handlePay: () => handleEvmPay(),
        balance: evmBalance,
        address: evmAddress,
        isConnected: isEvmConnected,
        handleConnect: () => open(137),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: !!global?.window?.ethereum,
        downloadWalletLink: "https://metamask.io/",
      };
      case "solana": return {
        handlePay: () => handleSolanaPay(),
        balance: solanaBalance,
        address: solanaAddress,
        isConnected: isSolanaConnected,
        handleConnect: connectSolana,
        handleDisconnect: disconnectSolana,
        tokenName: "USDC",
        isWalletInstalled: !!solanaManager,
        downloadWalletLink: "https://www.phantom.com/",
      };
      case "mantra": return {
        handlePay: () => handleKeplrPay(),
        balance: keplrBalance,
        address: keplrAddress,
        isConnected: isKeplrConnected,
        handleConnect: () => connectKeplr("mantra-dukong-1", "https://rpc.dukong.mantrachain.io", "uom"),
        handleDisconnect: disconnectKeplr,
        tokenName: keplrToken,
        isWalletInstalled: !!(global?.window as any)?.keplr,
        downloadWalletLink: "https://www.keplr.app/get",
      };
      case "injective": return {
        handlePay: () => handleKeplrPay(),
        balance: keplrBalance,
        address: keplrAddress,
        isConnected: isKeplrConnected,
        handleConnect: () => connectKeplr("injective-888", "https://testnet.sentry.tm.injective.network:443", "inj"),
        handleDisconnect: disconnectKeplr,
        tokenName: keplrToken,
        isWalletInstalled: !!(global?.window as any)?.keplr,
        downloadWalletLink: "https://www.keplr.app/get",
      };
      case "sui": return {
        handlePay: () => handleSuiPay(),
        balance: suiBalance,
        address: suiAddress,
        isConnected: isSuiConnected,
        handleConnect: connectSui,
        handleDisconnect: disconnectSui,
        tokenName: "USDC",
        isWalletInstalled: isSuiWalletInstalled,
        downloadWalletLink: "https://suiwallet.com/",
      };
      case "near": return {
        handlePay: () => handleNearPay(),
        balance: nearBalance,
        address: nearAddress,
        isConnected: isNearConnected,
        handleConnect: connectNear,
        handleDisconnect: disconnectNear,
        tokenName: "USDC",
        isWalletInstalled: !!nearWallet,
        downloadWalletLink: "https://www.mynearwallet.com/",
      };
      case "aptos": return {
        handlePay: () => handleAptosPay(),
        balance: aptosBalance,
        address: aptosAddress,
        isConnected: aptosConnected,
        handleConnect: connectAptos,
        handleDisconnect: disconnectAptos,
        tokenName: "USDC",
        isWalletInstalled: !!(global?.window as any)?.aptos,
        downloadWalletLink: "https://petra.app",
      };
      case "avalanche": return {
        handlePay: () => handleEvmPay(),
        balance: evmBalance,
        address: evmAddress,
        isConnected: isEvmConnected,
        handleConnect: () => open(43113),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: !!global?.window?.ethereum,
        downloadWalletLink: "https://metamask.io/",
      };
      default: return {};
    }
  }, [
    selectedChain,
    evmBalance,
    evmAddress,
    isEvmConnected,
    disconnectEvm,
    solanaBalance,
    solanaAddress,
    isSolanaConnected,
    connectSolana,
    disconnectSolana,
    keplrBalance,
    keplrAddress,
    isKeplrConnected,
    disconnectKeplr,
    keplrToken,
    handleEvmPay,
    open,
    handleSolanaPay,
    handleKeplrPay,
    connectKeplr,
    solanaManager,
    handleSuiPay,
    suiBalance,
    suiAddress,
    isSuiConnected,
    connectSui,
    disconnectSui,
    isSuiWalletInstalled,
    aptosAddress,
    aptosConnected,
    connectAptos,
    disconnectAptos,
    aptosBalance,
    handleAptosPay,
    isAptosLoading,
    connectNear,
    disconnectNear,
    isNearConnected,
    nearAddress,
    nearBalance,
    handleNearPay,
    nearWallet
  ]);

  useEffect(() => {
    setIsInstalled(isWalletInstalled ?? false);
  }, [isWalletInstalled])

  const handleChainChange = async (newChain: string) => {
    if (handleDisconnect) {
      await handleDisconnect();
    }
    setSelectedChain(newChain);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Multi-Chain Wallet Connector</h1>

          <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Select value={selectedChain} onValueChange={handleChainChange}>
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

              {!handleConnect
                ? <div className="w-full bg-red-600 p-2">Chain not supported yet</div>
                : isInstalled
                  ? <Button
                    onClick={handleConnect}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {isConnected ? 'Connected' : 'Connect Wallet'}
                  </Button>
                  : <div className="w-full bg-red-600 hover:bg-red-700 p-2">Wallet not found - <a href={downloadWalletLink} target="_blank" className="font-bold">get it at {downloadWalletLink}</a></div>
              }

              {isConnected && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-300">Connected Address</p>
                    <p className="font-mono text-sm">{address}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-300">{tokenName} Balance</p>
                    <p className="text-xl font-bold">
                      {balance} {tokenName}
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
                    Disconnect
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