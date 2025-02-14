import { useEffect, useState } from "react";

import { KeplrManager } from "@/classes/keplr-manager";
import { INJECTIVE_ADDRESS_REGEX, MANTRA_ADDRESS_REGEX } from "@/app/config";

export const useKeplrWallet = () => {
    const [keplrManager, setKeplrManager] = useState<KeplrManager | null>(null);
    const [keplrAddress, setKeplrAddress] = useState<string | null>(null);
    const [keplrBalance, setKeplrBalance] = useState<number | null>(null);
    const [isKeplrLoading, setIsKeplrLoading] = useState(false);
    const [keplrToken, setKeplrToken] = useState<string | null>(null);
    const [isKeplrConnected, setIsKeplrConnected] = useState<boolean>(false);
    const [isKeplrInstalled, setIsKeplrInstalled] = useState<boolean>(false);

    const connectKeplr = async (chain: string, rpc: string, token: string) => {
        if (!isKeplrInstalled) return;
        const km = await KeplrManager.create(chain, rpc);
        const address = await km?.connectWallet();
        if (!address) {
            throw Error("No address found");
        }
        setKeplrManager(km);
        setKeplrAddress(address);
        setKeplrToken(token);
        setIsKeplrConnected(true);
    };

    useEffect(() => {
        const checkKeplrInstallation = () => {
            const isInstalled = typeof window !== 'undefined' &&
                (global?.window as unknown as { keplr?: unknown })?.keplr !== undefined;
            setIsKeplrInstalled(!!isInstalled);
        };

        checkKeplrInstallation();
    }, []);

    const disconnectKeplr = async () => {
        await keplrManager?.disconnectWallet();
        setKeplrAddress(null);
        setKeplrManager(null);
        setKeplrBalance(null);
        setIsKeplrLoading(false);
        setKeplrToken(null);
        setIsKeplrConnected(false);
    };

    useEffect(() => {
        if (!isKeplrConnected || !keplrAddress || !keplrManager || !keplrToken) return;

        const handleGetBalance = async () => {
            const balance = await keplrManager.getBalance(keplrAddress, keplrToken);
            setKeplrBalance(balance);
        };

        handleGetBalance();

    }, [isKeplrConnected, keplrManager, keplrAddress, keplrToken]);

    const handleKeplrPay = async (beneficiaryAddress: string): Promise<string | undefined> => {
        if (!keplrAddress || !keplrToken || (!INJECTIVE_ADDRESS_REGEX.test(beneficiaryAddress) && !MANTRA_ADDRESS_REGEX.test(beneficiaryAddress))) return;

        setIsKeplrLoading(true);

        try {
            return keplrManager?.createTransaction(
                keplrAddress,
                keplrAddress,
                keplrToken,
                Number("20")
            );

        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            setIsKeplrLoading(false);
        }
    };

    const signMessage = async (message: string): Promise<{ signature: string; pubKey: string }> => {
        if (!keplrManager) {
            throw new Error("Keplr manager not initialized");
        }
        return await keplrManager.signMessage(message);
    };

    return {
        isKeplrInstalled,
        keplrManager,
        isKeplrLoading,
        keplrBalance,
        keplrAddress,
        isKeplrConnected,
        handleKeplrPay,
        signMessage,
        connectKeplr,
        disconnectKeplr,
        keplrToken
    };
};
