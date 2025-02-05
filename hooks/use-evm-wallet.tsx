import { ethers, formatUnits, InterfaceAbi, parseUnits } from "ethers";
import { useEffect, useState } from "react";

import {
    useDisconnect as useEvmDisconnect, useWeb3Modal as useEvmWeb3Modal,
    useWeb3ModalAccount as useEvmWeb3ModalAccount,
    useSwitchNetwork,
    useWeb3ModalProvider
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
const USDC_ADDRESS = {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
}

const getContract = async (walletProvider: ethers.Eip1193Provider, chain: number) => {
    const ethersProvider = new ethers.BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const abi: InterfaceAbi = USDC_ABI;

    return new ethers.Contract(USDC_ADDRESS[chain as keyof typeof USDC_ADDRESS], abi, signer);
};

export const useEvmWallet = () => {
    const { walletProvider } = useWeb3ModalProvider();
    const { address: evmAddress, isConnected: isEvmConnected } = useEvmWeb3ModalAccount();
    const [evmBalance, setEvmBalance] = useState<number | null>(null);
    const { open: openEvmModal } = useEvmWeb3Modal();
    const { switchNetwork } = useSwitchNetwork();
    const { disconnect: disconnectEvm } = useEvmDisconnect();
    const [isEvmLoading, setIsEvmLoading] = useState(false);
    const [chain, setChain] = useState(1);

    useEffect(() => {
        if (!walletProvider) return;

        const checkEnoughBalance = async () => {
            await switchNetwork(chain);
            const contract = await getContract(walletProvider, chain);
            const balance = await contract.balanceOf(evmAddress);
            const formattedBalance = Number(formatUnits(balance, 6));

            setEvmBalance(formattedBalance);
        };

        checkEnoughBalance();
    }, [evmAddress, walletProvider, chain]);

    const handleEvmPay = async (): Promise<string | undefined> => {
        if (!isEvmConnected || !walletProvider) return;

        try {
            setIsEvmLoading(true);
            await switchNetwork(chain);
            const parsedValue = parseUnits("10", 6);
            const contract = await getContract(walletProvider, chain);

            const tx = await contract.transfer(evmAddress, parsedValue);
            const receipt = await tx.wait();

            return receipt.hash as unknown as string;
        } catch (error) {
            console.error("Transfer failed:", error);
        } finally {
            setIsEvmLoading(false);
        }
    };

    const open = async (chain: number) => {
        await openEvmModal();
        setChain(chain);
    }

    return {
        evmAddress,
        evmBalance,
        isEvmLoading,
        isEvmConnected,
        handleEvmPay,
        disconnectEvm,
        open
    };
};
