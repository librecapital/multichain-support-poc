import { setupWalletSelector, Wallet } from "@near-wallet-selector/core";
import { SignMessageMethod } from "@near-wallet-selector/core/src/lib/wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { connect, Near } from "near-api-js";
import { useEffect, useState } from "react";

export const useNearWallet = () => {
    const [connection, setConnection] = useState<Near | undefined>();
    const [nearWallet, setNearWallet] = useState<Wallet & SignMessageMethod | undefined>();
    const [nearAddress, setNearAddress] = useState<string | undefined>();
    const [isNearConnected, setIsNearConnected] = useState<boolean>(false);
    const [nearBalance, setNearBalance] = useState<number | null>(null);
    const coin = "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af";
    const maxGas = "300000000000000";

    useEffect(() => {
        const setup = async () => {
            const selector = await setupWalletSelector({
                network: "testnet",
                modules: [setupMyNearWallet()],
            });
            const wallet = await selector.wallet("my-near-wallet");
            setNearWallet(wallet);
            const connectionConfig = {
                networkId: "testnet",
                nodeUrl: "https://rpc.testnet.near.org",
            };
            const nearConnection = await connect(connectionConfig);
            setConnection(nearConnection);
        }
        setup();
    }, []);

    const connectNear = async () => {
        if (!nearWallet) {
            throw Error("No wallet found");
        }
        // We can also configure successUrl and failureUrl
        const accounts = await nearWallet.signIn({ contractId: "", accounts: [] });
        if (!accounts || accounts.length == 0) {
            return;
        }
        setNearAddress(accounts[0].accountId);
        setIsNearConnected(true);
    };


    useEffect(() => {
        if (!connection || !nearAddress) return;
        const handleGetBalance = async () => {
            const account = await connection.account(nearAddress);
            // Call the ft_balance_of method on the token contract
            const balance = await account.viewFunction({
                contractId: "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af",
                methodName: 'ft_balance_of',
                args: {
                    account_id: nearAddress
                }
            });
            setNearBalance(Number(balance) / Math.pow(10, 6));
        }
        handleGetBalance();
    }, [isNearConnected]);

    const handleNearPay = async () => {
        if (!nearWallet) {
            throw Error("No wallet configured");
        };
        await nearWallet.signAndSendTransaction({
            receiverId: coin,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "ft_transfer",
                        args: {
                            receiver_id: "test1011.testnet",
                            amount: "1000000"
                        },
                        gas: maxGas, // Prevents out-of-gas errors, since in the end it will only pay for the gas actually used 
                        deposit: "1",  // 1 yoctoNEAR required for ft_transfer
                    },
                },
            ],
        });
    }

    const disconnectNear = async () => {
        if (!nearWallet) {
            throw Error("No wallet configured");
        }
        await nearWallet.signOut();
        setNearAddress(undefined);
        setIsNearConnected(false);
    };

    return {
        connectNear,
        disconnectNear,
        isNearConnected,
        nearAddress,
        nearBalance,
        handleNearPay,
        nearWallet
    };
};
