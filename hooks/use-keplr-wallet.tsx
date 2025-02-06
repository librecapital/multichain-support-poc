import { useEffect, useState } from "react";

import { KeplrManager } from "@/classes/keplr-manager";

export const useKeplrWallet = () => {
    const [keplrManager, setKeplrManager] = useState<KeplrManager | null>(null);
    const [keplrAddress, setKeplrAddress] = useState<string | null>(null);
    const [keplrBalance, setKeplrBalance] = useState<number | null>(null);
    const [isKeplrLoading, setIsKeplrLoading] = useState(false);
    const [keplrToken, setKeplrToken] = useState("uom");

    const isKeplrConnected = !!keplrAddress;

    const connectKeplr = async (chain: string, rpc: string, token: string) => {
        setKeplrManager(await KeplrManager.create(chain, rpc));
        const address = await keplrManager?.connectWallet() ?? null;
        setKeplrAddress(address);
        setKeplrToken(token);
    };

    const disconnectKeplr = async () => {
        await keplrManager?.disconnectWallet();
        setKeplrAddress(null);
    };

    useEffect(() => {
        if (!isKeplrConnected || !keplrAddress || !keplrManager) return;

        const handleGetBalance = async () => {
            const balance = await keplrManager.getBalance(keplrAddress, keplrToken);
            setKeplrBalance(balance);
        };

        handleGetBalance();

    }, [isKeplrConnected, keplrManager, keplrAddress]);

    const handleKeplrPay = async (): Promise<string | undefined> => {
        if (!keplrAddress) return;

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
