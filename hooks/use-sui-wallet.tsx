import { useEffect, useState } from "react";

import { useConnectWallet, useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useSuiClient, useWallets } from "@mysten/dapp-kit";
import { CoinStruct } from "@mysten/sui/client";
import { Inputs, Transaction } from "@mysten/sui/transactions";
import { SUI_ADDRESS_REGEX } from "@/app/config";

export const useSuiWallet = () => {
    const wallets = useWallets();
    const connectWallet = useConnectWallet();
    const disconnectWallet = useDisconnectWallet();
    const currentAccount = useCurrentAccount();
    const signAndExecuteTransaction = useSignAndExecuteTransaction();
    const client = useSuiClient();
    const sui_default_coin: string = "0x2::sui::SUI";
    const coin: string = "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";
    const amount = 1;

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

    const handleSuiPay = async (beneficiaryAddress: string): Promise<string | undefined> => {
        if (!suiAddress || !SUI_ADDRESS_REGEX.test(beneficiaryAddress)) return;
        setIsSuiLoading(true);
        try {
            const tx = await buildTransaction();
            if (!tx) {
                throw Error("Error while building transaction");
            }
            await signAndExecuteTransaction.mutateAsync({ transaction: tx });
        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            setIsSuiLoading(false);
        }
    };

    async function buildTransaction(): Promise<Transaction | undefined> {
        if (!suiAddress) throw Error("No address set");
        const tx = new Transaction();
        if (coin === sui_default_coin) {
            // If sui token the following logic should be applied
            const [coin] = tx.splitCoins(tx.gas, [amount]);
            tx.transferObjects([coin], suiAddress);
            return tx;
        }
        // If custom owned token
        const coins = await retrieveAllCoins();
        if (!coins || coins.length === 0) throw Error("No coins found");
        const primaryCoin = retrieveOwnedCoinObject(coins[0], tx);
        if (coins.length > 1) {
            // Merge additional coins if they exist
            const coinsToMerge = coins
                .slice(1)
                .map(coin => retrieveOwnedCoinObject(coin, tx));
            tx.mergeCoins(
                primaryCoin,
                coinsToMerge
            );
        }
        const [splitCoin] = tx.splitCoins(primaryCoin, [amount]);
        tx.transferObjects([splitCoin], suiAddress);
        return tx;
    }

    async function retrieveAllCoins() {
        if (!suiAddress) throw Error("No address set");
        let allCoins: CoinStruct[] = [];
        let hasNextPage = true;
        let nextCursor: string | null | undefined;
        for (; hasNextPage;) {
            const response = await client.getCoins({
                owner: suiAddress,
                coinType: coin,
                cursor: nextCursor,
            });
            allCoins = allCoins.concat(response.data);
            hasNextPage = response.hasNextPage;
            nextCursor = response.nextCursor;
        }
        return allCoins;
    }

    function retrieveOwnedCoinObject(coin: CoinStruct, tx: Transaction) {
        return tx.object(Inputs.ObjectRef({ digest: coin.digest, objectId: coin.coinObjectId, version: coin.version }));
    }

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
