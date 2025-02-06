import { useEffect, useState } from "react";

import { KeplrManager } from "@/classes/keplr-manager";

export const useKeplrWallet = () => {
    const [keplrManager, setKeplrManager] = useState<KeplrManager | null>(null);
    const [keplrAddress, setKeplrAddress] = useState<string | null>(null);
    const [keplrBalance, setKeplrBalance] = useState<number | null>(null);
    const [isKeplrLoading, setIsKeplrLoading] = useState(false);
    const [keplrToken, setKeplrToken] = useState<string | null>(null);
    const [isKeplrConnected, setIsKeplrConnected] = useState<boolean>(false);

    const connectKeplr = async (chain: string, rpc: string, token: string) => {
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

    const handleKeplrPay = async (): Promise<string | undefined> => {
        if (!keplrAddress || !keplrToken) return;

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

    return {
        isKeplrLoading,
        keplrBalance,
        keplrAddress,
        isKeplrConnected,
        handleKeplrPay,
        connectKeplr,
        disconnectKeplr,
        keplrToken
    };
};
