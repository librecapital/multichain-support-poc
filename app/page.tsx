"use client";

import "@/app/wallet-connect-setup/evm-setup";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAptosWallet } from "@/hooks/use-aptos-wallet";

import { Input } from "@/components/ui/input";
import WalletManagement from "@/components/ui/wallet-management";
import { useEvmWallet } from '@/hooks/use-evm-wallet';
import { useKeplrWallet } from "@/hooks/use-keplr-wallet";
import { useNearWallet } from "@/hooks/use-near-wallet";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { useSuiWallet } from "@/hooks/use-sui-wallet";
import { avalancheFuji, mainnet, polygon } from '@reown/appkit/networks';
import { Link, Send, Unlink } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { APTOS_ADDRESS_REGEX, ETH_ADDRESS_REGEX, INJECTIVE_ADDRESS_REGEX, MANTRA_ADDRESS_REGEX, NEAR_ADDRESS_REGEX, SOLANA_ADDRESS_REGEX, SUI_ADDRESS_REGEX, supportedChains, supportedWallets } from "./config";
import { SupportedChainsTable } from "./supported-chains-table";

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [selectedAsset, setSelectedAsset] = useState<string>('USDC');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupportedChainsVisible, setIsSupportedChainsVisible] = useState<boolean>(false);
  const [isAddressSupported, setIsAddressSupported] = useState(true);

  const {
    isEvmLoading, evmBalance, evmAddress, isEvmConnected,
    open, handleEvmPay, disconnectEvm
  } = useEvmWallet();

  const {
    isSolanaLoading, solanaBalance, solanaAddress, isSolanaConnected, solanaManager, isPhantomInstalled,
    handleSolanaPay, connectSolana, disconnectSolana
  } = useSolanaWallet();

  const {
    isKeplrLoading, keplrBalance, keplrAddress, isKeplrConnected, isKeplrInstalled,
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
        handleConnect: () => open(mainnet),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: true, // we use wallet connect
        walletInfo: supportedWallets.metamask,
      };
      case "polygon": return {
        handlePay: () => ETH_ADDRESS_REGEX.test(beneficiaryAddress) && handleEvmPay(beneficiaryAddress as `0x${string}`),
        isValidAddress: ETH_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: evmBalance,
        address: evmAddress,
        isLoading: isEvmLoading,
        isConnected: isEvmConnected,
        handleConnect: () => open(polygon),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: true, // we use wallet connect
        walletInfo: supportedWallets.metamask,
      };
      case "avalanche": return {
        handlePay: () => ETH_ADDRESS_REGEX.test(beneficiaryAddress) && handleEvmPay(beneficiaryAddress as `0x${string}`),
        isValidAddress: ETH_ADDRESS_REGEX.test(beneficiaryAddress),
        balance: evmBalance,
        address: evmAddress,
        isLoading: isEvmLoading,
        isConnected: isEvmConnected,
        handleConnect: () => open(avalancheFuji),
        handleDisconnect: disconnectEvm,
        tokenName: "USDC",
        isWalletInstalled: true, // we use wallet connect
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
        isWalletInstalled: isPhantomInstalled,
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
        isWalletInstalled: isKeplrInstalled,
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
        isWalletInstalled: isKeplrInstalled,
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
    <div className="min-h-screen md:bg-gradient-to-b md:from-gray-900 md:to-gray-800 md:text-white text-black">
      <div className="container mx-auto px-4 py-8 w-full">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Libre Gateway PoC</h1>
          <WalletManagement
            selectedChain={selectedChain}
            currentAddress={beneficiaryAddress}
            onAddressChange={setIsAddressSupported}
          />
          <Card className="md:bg-gray-100 md:border-gray-700 md:p-6 mb-6 bg-transparent border-transparent">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-[100px] font-bold">From</div>
                <div className="w-full">
                  <Select value={selectedChain} onValueChange={handleChainChange}>
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
              </div>
              {isInstalled && isConnected
                ? <div className="flex justify-between">
                  <div className="text-sm text-gray-700">Connected Address: <span className="cursor-pointer" onClick={handleConnect}>{address}</span></div>
                  <div className="flex cursor-pointer hover:text-blue-800" onClick={handleDisconnect}><Unlink className="mr-2 h-4 w-4" />Disconnect</div>
                </div>
                : <div className="flex justify-between">
                  <div className="text-sm text-gray-700" >Connected Address: <span className="text-red-600">Not Yet Connected</span></div>
                  <div className="flex cursor-pointer hover:text-blue-800" onClick={handleConnect}><Link className="mr-2 h-4 w-4" />Connect Wallet</div>
                </div>
              }

              {isConnected &&
                <>
                  <div className="flex items-center">
                    <div className="w-[100px] font-bold">Asset</div>
                    <div className="w-full">
                      <Select value={selectedAsset} onValueChange={handleAssetChange}>
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
                  </div>
                  {selectedAsset && isAddressSupported && <p className="text-sm text-gray-700">Balance: {balance} {tokenName}</p>}

                  <div className="flex items-center">
                    <div className="w-[100px] font-bold">Amount</div>
                    <Input type="number" value={amount} onChange={handleAmountChange} min="0" step={0.01} readOnly disabled />
                  </div>
                </>
              }

              {!handleConnect && <div className="w-full text-red-600 p-2">Chain not supported yet</div>}

              {!isInstalled && walletInfo &&
                <div className="w-full bg-red-300 p-2 text-red-800">
                  <p className="font-bold">Wallet not found!</p>
                  <p className="font-mono underline"><a href={walletInfo.website} target="_blank" className="font-bold hover:text-blue-600">Click here to get {walletInfo.name}</a></p>
                </div>
              }

              {isConnected && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-[100px] font-bold">Send To</div>
                    <div className="w-auto">
                      <Select value={selectedChain} onValueChange={handleChainChange} disabled>

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
                    <div className="w-full">
                      <Input value={beneficiaryAddress} onChange={handleBeneficiaryAddressChange} />
                    </div>
                  </div>

                  <Button
                    onClick={handlePay}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!isValidAddress || !balance || !isAddressSupported}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Transaction
                  </Button>
                  <div className="text-red-600 font-bold p-1">
                    {!isValidAddress && <p >Invalid destination address</p>}
                    {!balance && <p>Insufficient balance amount</p>}
                    {!isAddressSupported && <p>Address not supported. Please switch account</p>}
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