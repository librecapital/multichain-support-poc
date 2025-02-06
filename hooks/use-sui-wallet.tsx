import { useEffect, useState } from "react";

import { useConnectWallet, useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useWallets } from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export const useSuiWallet = () => {
    const wallets = useWallets();
    const connectWallet = useConnectWallet();
    const disconnectWallet = useDisconnectWallet();
    const currentAccount = useCurrentAccount();
    const signAndExecuteTransaction = useSignAndExecuteTransaction();
    const client = new SuiClient({ url: getFullnodeUrl('devnet') });
    const coin = "0x2::sui::SUI";

    const [suiAddress, setSuiAddress] = useState<string | null>(null);
    const [suiBalance, setSuiBalance] = useState<number | null>(null);
    const [isSuiConnected, setIsSuiConnected] = useState<boolean>(false);
    const [isSuiLoading, setIsSuiLoading] = useState(false);
    const [isSuiWalletInstalled, setIsSuiWalletInstalled] = useState(true);

    const connectSui = async () => {
        const walletSui = wallets.find(wallet => wallet.name === "Sui Wallet");
        if (!walletSui) {
            setIsSuiWalletInstalled(false);
            return;
        }
        await connectWallet.mutateAsync({ wallet: walletSui });
        setIsSuiWalletInstalled(true);
        setIsSuiConnected(true);
    };

    useEffect(() => {
        const address = currentAccount?.address;
        if (!isSuiConnected || !address) return;
        const handleGetBalance = async () => {
            const balance = (await client.getBalance({ owner: address, coinType: coin }))?.totalBalance;
            if (!balance) {
                throw Error("No balance found");
            }
            const coinMetadata = await client.getCoinMetadata({ coinType: coin });
            if (!coinMetadata?.decimals) {
                throw Error("No decimals defined");
            }
            setSuiBalance(Number(balance) / Math.pow(10, coinMetadata?.decimals));
        };
        handleGetBalance();
        setSuiAddress(address);
    }, [isSuiConnected]);

    const disconnectSui = async () => {
        disconnectWallet.mutate();
        setSuiAddress(null);
        setIsSuiConnected(false);
        setSuiBalance(null);
    };

    const handleSuiPay = async (): Promise<string | undefined> => {
        if (!suiAddress) return;
        setIsSuiLoading(true);
        try {
            const tx = new Transaction();
            const coins = await client.getCoins({
                owner: suiAddress,
                coinType: coin
            });
            const objectId = coins?.data?.at(0)?.coinObjectId;
            if (!objectId) {
                throw Error("No object id defined");
            }
            const [coinsToSend] = tx.splitCoins(objectId, [0]);
            tx.transferObjects([coinsToSend], suiAddress);
            await signAndExecuteTransaction.mutateAsync({ transaction: tx });
        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            setIsSuiLoading(false);
        }
    };

    return {
        suiAddress,
        connectSui,
        disconnectSui,
        isSuiConnected,
        suiBalance,
        handleSuiPay,
        isSuiLoading,
        isSuiWalletInstalled
    };
};
