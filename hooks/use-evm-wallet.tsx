import { ethers, formatUnits, InterfaceAbi, parseUnits } from "ethers";
import { useEffect, useState } from "react";

import {
    useDisconnect as useEvmDisconnect, useWeb3Modal as useEvmWeb3Modal,
    useWeb3ModalAccount as useEvmWeb3ModalAccount, useWeb3ModalProvider
} from "@web3modal/ethers/react";

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
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

const getContract = async (walletProvider: ethers.Eip1193Provider) => {
    const ethersProvider = new ethers.BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const abi: InterfaceAbi = USDC_ABI;

    return new ethers.Contract(USDC_ADDRESS, abi, signer);
};

export const useEvmWallet = () => {
    const { walletProvider } = useWeb3ModalProvider();
    const { address: evmAddress, isConnected: isEvmConnected } = useEvmWeb3ModalAccount();

    const [evmBalance, setEvmBalance] = useState<number | null>(null);

    const { open: openEvmModal } = useEvmWeb3Modal();
    const { disconnect: disconnectEvm } = useEvmDisconnect();

    const [isEvmLoading, setIsEvmLoading] = useState(false);

    useEffect(() => {
        if (!walletProvider) return;

        const checkEnoughBalance = async () => {
            const contract = await getContract(walletProvider);
            const balance = await contract.balanceOf(evmAddress);
            const formattedBalance = Number(formatUnits(balance, 6));

            setEvmBalance(formattedBalance);
        };

        checkEnoughBalance();
    }, [evmAddress, walletProvider]);

    const handleEvmPay = async (): Promise<string | undefined> => {
        if (!isEvmConnected || !walletProvider) return;

        try {
            setIsEvmLoading(true);

            const parsedValue = parseUnits("0", 6);
            const contract = await getContract(walletProvider);

            const tx = await contract.transfer(evmAddress, parsedValue);
            const receipt = await tx.wait();

            return receipt.hash as unknown as string;
        } catch (error) {
            console.error("Transfer failed:", error);
        } finally {
            setIsEvmLoading(false);
        }
    };

    return {
        evmAddress,
        evmBalance,
        isEvmLoading,
        isEvmConnected,
        handleEvmPay,
        openEvmModal,
        disconnectEvm,
    };
};
