import { ethers, formatUnits, InterfaceAbi, parseUnits } from "ethers";
import { useEffect, useState } from "react";

import { useAppKitWallet, Wallet } from "@reown/appkit-wallet-button/react";
import { AppKitNetwork, mainnet } from "@reown/appkit/networks";
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider, useDisconnect } from '@reown/appkit/react';

const USDC_ABI = [
    {
        "constant": true,
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "recipient", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    }
];

// USDC contract addresses
const USDC_ADDRESS = {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    43113: "0x5425890298aed601595a70ab815c96711a31bc65"
}

const getAssetContract = async (walletProvider: ethers.Eip1193Provider, chain: AppKitNetwork) => {
    const ethersProvider = new ethers.BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const abi: InterfaceAbi = USDC_ABI;

    return new ethers.Contract(USDC_ADDRESS[chain.id as keyof typeof USDC_ADDRESS], abi, signer);
};

export const useEvmWallet = () => {
    const { walletProvider } = useAppKitProvider<ethers.Eip1193Provider>('eip155')
    const { address: evmAddress, isConnected: isEvmConnected } = useAppKitAccount();
    const [evmBalance, setEvmBalance] = useState<number | null>(null);
    const { open: openEvmModal } = useAppKit();
    const { switchNetwork } = useAppKitNetwork();
    const { disconnect: disconnectEvm } = useDisconnect();
    const [isEvmLoading, setIsEvmLoading] = useState(false);
    const [chain, setChain] = useState<AppKitNetwork>(mainnet);
    const { isReady, isPending, connect } = useAppKitWallet();

    useEffect(() => {
        if (!walletProvider) return;

        const checkEnoughBalance = async () => {
            switchNetwork(chain);
            const contract = await getAssetContract(walletProvider, chain);
            const balance = await contract.balanceOf(evmAddress);
            const formattedBalance = Number(formatUnits(balance, 6));

            setEvmBalance(formattedBalance);
        };

        checkEnoughBalance();
    }, [evmAddress, walletProvider, chain]);

    const handleEvmPay = async (beneficiaryAddress: `0x${string}`): Promise<string | undefined> => {
        if (!isEvmConnected || !walletProvider) return;

        try {
            setIsEvmLoading(true);
            switchNetwork(chain);
            const parsedValue = parseUnits("0", 6);
            const contract = await getAssetContract(walletProvider, chain);

            const tx = await contract.transfer(beneficiaryAddress, parsedValue);
            const receipt = await tx.wait();

            return receipt.hash as unknown as string;
        } catch (error) {
            console.error("Transfer failed:", error);
        } finally {
            setIsEvmLoading(false);
        }
    };

    const signMessage = async (message: string): Promise<{ signature: string; address: string }> => {
        if (!walletProvider) {
            throw new Error("EVM wallet not initialized");
        }
        if (!evmAddress) {
            throw new Error("Not connected to EVM wallet");
        }

        const ethersProvider = new ethers.BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const signature = await signer.signMessage(message);
        
        return {
            signature,
            address: evmAddress
        };
    };

    const open = async (chain: AppKitNetwork, wallet: Wallet) => {
        //await openEvmModal();
        await connect(wallet);
        setChain(chain);
    }

    return {
        walletProvider,
        evmAddress,
        evmBalance,
        isEvmLoading,
        isEvmConnected,
        handleEvmPay,
        signMessage,
        disconnectEvm,
        open
    };
};
