import { APTOS_ADDRESS_REGEX } from "@/app/config";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";

export const useAptosWallet = () => {
    const { account, connected: aptosConnected, signAndSubmitTransaction, signMessage, connect, disconnect } = useWallet();
    const [aptosAddress, setAptosAddress] = useState<string | undefined>(undefined);
    const [aptosBalance, setAptosBalance] = useState<number | null>(null);
    const [isAptosLoading, setIsAptosLoading] = useState<boolean>(false);
    const [isSigningMessage, setIsSigningMessage] = useState<boolean>(false);
    const [isPetraInstalled, setIsPetraInstalled] = useState<boolean>(false);

    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    const coinAddress = "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832"; //USDC

    const connectAptos = async () => {
        if (!isPetraInstalled) return;
        connect("Petra" as WalletName<"Petra">);
    };

    useEffect(() => {
        const address = account?.address;
        if (!aptosConnected || !address) return;
        const handleGetBalance = async () => {
            const coinsData = await aptos.getAccountCoinsData({ accountAddress: address });
            if (!coinsData || coinsData.length === 0) {
                throw Error("No coins found in the account");
            }
            const coin = coinsData.find(coin => coin.asset_type === coinAddress);
            if (!coin) {
                throw Error("No coin found for the given type");
            }
            setAptosBalance(Number(coin.amount) / Math.pow(10, coin.metadata?.decimals ?? 6));
        };
        handleGetBalance();
        setAptosAddress(address);
    }, [aptosConnected]);

    useEffect(() => {
        const checkKeplrInstallation = () => {
            const isInstalled = typeof window !== 'undefined' &&
                (global?.window as unknown as { aptos?: unknown })?.aptos !== undefined;
            setIsPetraInstalled(!!isInstalled);
        };

        checkKeplrInstallation();
    }, []);

    const disconnectAptos = async () => {
        disconnect();
    };

    const handleAptosPay = async (beneficiaryAddress: string): Promise<string | undefined> => {
        if (!aptosAddress || !APTOS_ADDRESS_REGEX.test(beneficiaryAddress)) return;
        setIsAptosLoading(true);
        try {
            await signAndSubmitTransaction({
                sender: aptosAddress,
                data: {
                    function: "0x1::primary_fungible_store::transfer",
                    typeArguments: ["0x1::fungible_asset::Metadata"], // e.g., "0x123::my_token::MyToken"
                    functionArguments: [
                        coinAddress,
                        beneficiaryAddress,
                        1000000
                    ]
                }
            });
        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            setIsAptosLoading(false);
        }
    };

    const handleSignMessage = async (message: string): Promise<string | undefined> => {
        if (!aptosAddress || !message) return;
        setIsSigningMessage(true);
        try {
            const response = await signMessage({
                message: message,
                nonce: crypto.randomUUID()
            });
            return response.signature.toString();
        } catch (error) {
            console.error("Error signing message:", error);
            throw error;
        } finally {
            setIsSigningMessage(false);
        }
    };

    return {
        isPetraInstalled,
        connectAptos,
        disconnectAptos,
        aptosAddress,
        aptosConnected,
        aptosBalance,
        handleAptosPay,
        handleSignMessage,
        isAptosLoading,
        isSigningMessage
    };
};
