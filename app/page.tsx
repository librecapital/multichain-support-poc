"use client";

import "@/app/wallet-connect-setup/evm-setup";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAptosWallet } from "@/hooks/use-aptos-wallet";

import { Input } from "@/components/ui/input";
import { useEvmWallet } from '@/hooks/use-evm-wallet';
import { useKeplrWallet } from "@/hooks/use-keplr-wallet";
import { useNearWallet } from "@/hooks/use-near-wallet";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { useSuiWallet } from "@/hooks/use-sui-wallet";
import { Link, Send, Unlink } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { APTOS_ADDRESS_REGEX, ETH_ADDRESS_REGEX, INJECTIVE_ADDRESS_REGEX, MANTRA_ADDRESS_REGEX, NEAR_ADDRESS_REGEX, SOLANA_ADDRESS_REGEX, SUI_ADDRESS_REGEX, supportedChains, supportedWallets } from "./config";
import { SupportedChainsTable } from "./supported-chains-table";

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [selectedAsset, setSelectedAsset] = useState<string>('USDC');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupportedChainsVisible, setIsSupportedChainsVisible] = useState<boolean>(false);
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
    isConnected, handleConnect, handleDisconnect, address, balance, handlePay, tokenName, isWalletInstalled, walletInfo, isLoading, isValidAddress,
  } = useMemo(() => {
    switch (selectedChain) {
      case "ethereum": return {
        handlePay: () => ETH_ADDRESS_REGEX.test(beneficiaryAddress) && handleEvmPay(beneficiaryAddress as `0x${string}`),
        isValidAddress: ETH_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: evmBalance,
        address: evmAddress,
        isLoading: isEvmLoading,
        isConnected: isEvmConnected,
        handleConnect: () => open(1),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: !!global?.window?.ethereum,
        walletInfo: supportedWallets.metamask,
      };
      case "polygon": return {
        handlePay: () => ETH_ADDRESS_REGEX.test(beneficiaryAddress) && handleEvmPay(beneficiaryAddress as `0x${string}`),
        isValidAddress: ETH_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: evmBalance,
        address: evmAddress,
        isLoading: isEvmLoading,
        isConnected: isEvmConnected,
        handleConnect: () => open(137),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: !!global?.window?.ethereum,
        walletInfo: supportedWallets.metamask,
      };
      case "avalanche": return {
        handlePay: () => ETH_ADDRESS_REGEX.test(beneficiaryAddress) && handleEvmPay(beneficiaryAddress as `0x${string}`),
        isValidAddress: ETH_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: evmBalance,
        address: evmAddress,
        isLoading: isEvmLoading,
        isConnected: isEvmConnected,
        handleConnect: () => open(43113),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: !!global?.window?.ethereum,
        walletInfo: supportedWallets.metamask,
      };
      case "solana": return {
        handlePay: () => handleSolanaPay(beneficiaryAddress),
        isValidAddress: SOLANA_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: solanaBalance,
        address: solanaAddress,
        isLoading: isSolanaLoading,
        isConnected: isSolanaConnected,
        handleConnect: connectSolana,
        handleDisconnect: disconnectSolana,
        tokenName: "USDC",
        isWalletInstalled: !!solanaManager,
        walletInfo: supportedWallets.phantom,
      };
      case "mantra": return {
        handlePay: () => handleKeplrPay(beneficiaryAddress),
        isValidAddress: MANTRA_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: keplrBalance,
        address: keplrAddress,
        isLoading: isKeplrLoading,
        isConnected: isKeplrConnected,
        handleConnect: () => connectKeplr("mantra-dukong-1", "https://rpc.dukong.mantrachain.io", "uom"),
        handleDisconnect: disconnectKeplr,
        tokenName: keplrToken,
        isWalletInstalled: !!(global?.window as any)?.keplr,
        walletInfo: supportedWallets.keplr,
      };
      case "injective": return {
        handlePay: () => handleKeplrPay(beneficiaryAddress),
        isValidAddress: INJECTIVE_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: keplrBalance,
        address: keplrAddress,
        isLoading: isKeplrLoading,
        isConnected: isKeplrConnected,
        handleConnect: () => connectKeplr("injective-888", "https://testnet.sentry.tm.injective.network:443", "inj"),
        handleDisconnect: disconnectKeplr,
        tokenName: keplrToken,
        isWalletInstalled: !!(global?.window as any)?.keplr,
        walletInfo: supportedWallets.keplr,
      };
      case "sui": return {
        handlePay: () => handleSuiPay(beneficiaryAddress),
        isValidAddress: SUI_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: suiBalance,
        address: suiAddress,
        isLoading: isSuiLoading,
        isConnected: isSuiConnected,
        handleConnect: connectSui,
        handleDisconnect: disconnectSui,
        tokenName: "USDC",
        isWalletInstalled: isSuiWalletInstalled,
        walletInfo: supportedWallets.suiWallet,
      };
      case "near": return {
        handlePay: () => handleNearPay(beneficiaryAddress),
        isValidAddress: NEAR_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: nearBalance,
        address: nearAddress,
        isConnected: isNearConnected,
        handleConnect: connectNear,
        handleDisconnect: disconnectNear,
        tokenName: "USDC",
        isWalletInstalled: !!nearWallet,
        walletInfo: supportedWallets.myNearWallet,
      };
      case "aptos": return {
        handlePay: () => handleAptosPay(beneficiaryAddress),
        isValidAddress: APTOS_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: aptosBalance,
        address: aptosAddress,
        isLoading: isAptosLoading,
        isConnected: aptosConnected,
        handleConnect: connectAptos,
        handleDisconnect: disconnectAptos,
        tokenName: "USDC",
        isWalletInstalled: !!(global?.window as any)?.aptos,
        walletInfo: supportedWallets.petra,
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
    connectNear,
    disconnectNear,
    isNearConnected,
    nearAddress,
    nearBalance,
    handleNearPay,
    nearWallet
  ]);

  const handleBeneficiaryAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBeneficiaryAddress(e.target.value);
  }

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setAmount(isNaN(value) ? 0 : Number(value));
  }

  useEffect(() => {
    setIsInstalled(isWalletInstalled ?? false);
  }, [isWalletInstalled]);

  useEffect(() => {
    setBeneficiaryAddress(address || "");
  }, [isConnected]);

  const handleChainChange = async (newChain: string) => {
    if (handleDisconnect) {
      await handleDisconnect();
    }
    setSelectedChain(newChain);
  };

  const handleAssetChange = async (newChain: string) => {
    if (handleDisconnect) {
      await handleDisconnect();
    }
    setSelectedChain(newChain);
    setBeneficiaryAddress(address || "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 w-full">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Libre Gateway PoC</h1>

          <Card className="bg-gray-100 border-gray-700 p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Select value={selectedChain} onValueChange={handleChainChange}>
                  <div className="w-20 font-bold">Network</div>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedChains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isConnected
                ? <div className="flex justify-between">
                  <div className="text-sm text-gray-700">Connected Address: {address}</div>
                  <div className="flex cursor-pointer hover:text-blue-800" onClick={handleDisconnect}><Unlink className="mr-2 h-4 w-4" />Disconnect</div>
                </div>
                : <div className="flex justify-between">
                  <div className="text-sm text-gray-700" >Connected Address: <span className="text-red-600">Not Yet Connected</span></div>
                  <div className="flex cursor-pointer hover:text-blue-800" onClick={handleConnect}><Link className="mr-2 h-4 w-4" />Connect Wallet</div>
                </div>
              }

              {isConnected &&
                <>
                  <div className="flex items-center space-x-4">
                    <Select value={selectedAsset} onValueChange={handleAssetChange}>
                      <div className="w-20 font-bold">Asset</div>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={"USDC"}>
                          USDC
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedAsset && <p className="text-sm text-gray-700">Balance: {balance} {tokenName}</p>}
                </>
              }

              {!handleConnect && <div className="w-full text-red-600 p-2">Chain not supported yet</div>}

              {!isConnected && !isInstalled && walletInfo && <div className="w-full bg-red-600 hover:bg-red-700 p-2">Wallet not found - <a href={walletInfo.name} target="_blank" className="font-bold">get it at {walletInfo.name}</a></div>}

              {isConnected && (
                <div className="space-y-4">
                  <div className="font-bold">To</div>
                  <Input value={beneficiaryAddress} onChange={handleBeneficiaryAddressChange} />

                  {/* <div>Amount to be Sent</div>
                  <Input type="number" value={amount} onChange={handleAmountChange} min="0" step={0.01} /> */}
                  <Button
                    onClick={handlePay}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!isValidAddress || !balance}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Transaction
                  </Button>
                  <div className="text-red-600 font-bold p-1">
                    {!isValidAddress && <p >Invalid destination address</p>}
                    {!balance && <p>Insufficient balance amount</p>}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="w-full text-center">
            <div
              onClick={() => setIsSupportedChainsVisible(prev => !prev)}
              className="bg-transparent cursor-pointer "
            >
              {isSupportedChainsVisible ? "Hide Supported Chains" : "Show Supported Chains"}
            </div>
            {isSupportedChainsVisible && <SupportedChainsTable />}
          </div>

        </div>
      </div>
    </div>
  );
}