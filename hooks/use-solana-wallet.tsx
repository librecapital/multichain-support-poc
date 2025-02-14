import { useEffect, useState } from "react";

import { SolanaManager } from "@/classes/solana-manager";
import { SOLANA_ADDRESS_REGEX } from "@/app/config";

// USDC contract addresses
const USDC_ADDRESS = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

//https://spl-token-faucet.com/?token-name=USDC-Dev
const receiverAddress = "8mjHXCG4qarrRsyUbdUZsWxpY2LFbxiYL9EAz7rg6PQc";

export const useSolanaWallet = () => {
    const [solanaManager, setSolanaManager] = useState<SolanaManager | null>(null);
    const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
    const [solanaBalance, setSolanaBalance] = useState<number | null>(null);
    const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
    const [isSolanaLoading, setIsSolanaLoading] = useState(false);

    const isSolanaConnected = !!solanaAddress;

    useEffect(() => {
        const manager = new SolanaManager("devnet");
        setSolanaManager(manager);
    }, []);

    useEffect(() => {
        const checkPhantomInstallation = () => {
            const isInstalled = typeof window !== 'undefined' &&
                (global?.window as unknown as {phantom?: {solana: undefined}})?.phantom?.solana !== undefined;
            setIsPhantomInstalled(!!isInstalled);
        };

        checkPhantomInstallation();
    }, []);

    useEffect(() => {
        SolanaManager.listenToWalletChanges(setSolanaAddress);
    }, []);

    const connectSolana = async () => {
        if (!isPhantomInstalled) return;
        const address = await solanaManager?.connectWallet() ?? null;
        setSolanaAddress(address);
    };

    const disconnectSolana = async () => {
        await solanaManager?.disconnectWallet();
        setSolanaAddress(null);
    };

    useEffect(() => {
        if (!isSolanaConnected || !solanaAddress || !solanaManager) return;

        const handleGetBalance = async () => {
            const balance = await solanaManager.getBalance(solanaAddress, USDC_ADDRESS);
            setSolanaBalance(balance);
        };

        handleGetBalance();

    }, [isSolanaConnected, solanaManager, solanaAddress]);

    const handleSolanaPay = async (beneficiaryAddress: string): Promise<string | undefined> => {
        if (!beneficiaryAddress || !SOLANA_ADDRESS_REGEX.test(beneficiaryAddress)) return;

        setIsSolanaLoading(true);

        try {
            return solanaManager?.createTransaction(
                beneficiaryAddress,
                receiverAddress,
                USDC_ADDRESS,
                Number("10")
            );

        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            setIsSolanaLoading(false);
        }
    };

    const signMessage = async (message: string): Promise<{ signature: string; publicKey: string }> => {
        if (!solanaManager) {
            throw new Error("Solana manager not initialized");
        }
        return await solanaManager.signMessage(message);
    };

    return {
        isPhantomInstalled,
        solanaManager,
        isSolanaLoading,
        solanaBalance,
        solanaAddress,
        isSolanaConnected,
        handleSolanaPay,
        signMessage,
        connectSolana,
        disconnectSolana,
    };
};
