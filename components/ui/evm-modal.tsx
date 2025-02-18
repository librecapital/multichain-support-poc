import { Wallet } from '@reown/appkit-wallet-button/react';
import { X } from 'lucide-react';

interface EvmModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    open: (wallet: Wallet) => Promise<void>;
}

const EvmModal = ({ isOpen, onOpenChange, open }: EvmModalProps) => {
    if (!isOpen) return null;

    const handleWalletConnect = async (wallet: Wallet) => {
        await open(wallet);
        onOpenChange(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg w-full max-w-sm mx-4 p-4">
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold text-gray-900 mb-6 pr-8">
                    Connect
                </h2>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handleWalletConnect("metamask")}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Metamask
                    </button>
                    <button
                        onClick={() => handleWalletConnect("coinbase")}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Coinbase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvmModal;