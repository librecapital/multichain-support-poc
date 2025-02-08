import { useState, useEffect, useCallback } from 'react';
import * as nearAPI from 'near-api-js';

const {
    connect,
    keyStores,
    WalletConnection,
    utils: { format: { formatNearAmount, parseNearAmount } }
} = nearAPI;

type NetworkType = 'testnet' | 'mainnet';

// NEAR network configuration
const NETWORK_CONFIG = {
    testnet: {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org'
    },
    mainnet: {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org'
    }
};

// NEAR USD Token contract
const NEAR_USD_TOKEN: Record<NetworkType, string> = {
    testnet: 'usdt.fakes.testnet',
    mainnet: 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near'
};

interface NearWalletConfig {
    network?: NetworkType;
    appName?: string;
}

export const useNearWallet = ({ network = 'testnet', appName = 'your-app-name' }: NearWalletConfig = {}) => {
    const [wallet, setWallet] = useState<nearAPI.WalletConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const initializeWallet = useCallback(async () => {
        try {
            const config = {
                keyStore: new keyStores.BrowserLocalStorageKeyStore(),
                nodeUrl: NETWORK_CONFIG[network].nodeUrl,
                walletUrl: NETWORK_CONFIG[network].walletUrl,
                helperUrl: NETWORK_CONFIG[network].helperUrl,
                networkId: network,
                headers: {}
            };

            const near = await connect(config);
            const walletConnection = new WalletConnection(near, appName);
            setWallet(walletConnection);

            if (walletConnection.isSignedIn()) {
                setIsConnected(true);
                setAddress(walletConnection.getAccountId());
                await checkBalance(walletConnection);
            }
        } catch (error) {
            console.error('Failed to initialize NEAR wallet:', error);
        }
    }, [appName, network]);

    useEffect(() => {
        initializeWallet();
    }, [initializeWallet, network]);

    const checkBalance = async (walletConnection: nearAPI.WalletConnection) => {
        try {
            const account = walletConnection.account();
            const accountBalance = await account.getAccountBalance();
            setBalance(formatNearAmount(accountBalance.available));
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const connectWallet = async () => {
        if (!wallet) return;

        try {
            // Redirects user to NEAR wallet to approve the connection
            await wallet.requestSignIn({
                contractId: NEAR_USD_TOKEN[network],
                methodNames: ['ft_transfer', 'ft_balance_of'],
                successUrl: `${window.location.origin}/success`,
                failureUrl: `${window.location.origin}/failure`,
                keyType: 'ed25519' // Required keyType parameter
            });
        } catch (error) {
            console.error('Failed to connect to NEAR wallet:', error);
        }
    };

    const disconnect = () => {
        if (!wallet) return;

        wallet.signOut();
        setIsConnected(false);
        setAddress(null);
        setBalance(null);
    };

    const handlePayment = async (recipientId: string, amount: string): Promise<string | undefined> => {
        if (!wallet || !isConnected) return;

        try {
            setIsLoading(true);
            const account = wallet.account();

            // Create transaction for token transfer
            const result = await account.functionCall({
                contractId: NEAR_USD_TOKEN[network],
                methodName: 'ft_transfer',
                args: {
                    receiver_id: recipientId,
                    amount: parseNearAmount(amount)
                },
                attachedDeposit: BigInt('1') // Required for storage deposit
            });

            return result.transaction.hash;
        } catch (error) {
            console.error('Transfer failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        address,
        balance,
        isLoading,
        isConnected,
        handlePayment,
        disconnect,
        connect: connectWallet
    };
};