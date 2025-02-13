import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'supportedWallets';

export type SupportedWallets = {
    [key in string]?: string[];
};

export interface WalletManagementProps {
    selectedChain: string;
    currentAddress: string | undefined | null;
    onAddressChange: (isSupported: boolean) => void;
}

const WalletManagement: React.FC<WalletManagementProps> = ({
    selectedChain,
    currentAddress,
    onAddressChange
}) => {
    const [supportedWallets, setSupportedWallets] = useState<SupportedWallets | undefined>(undefined);
    const [newAddress, setNewAddress] = useState<string>('');

    useEffect(() => {
        const savedWallets = localStorage.getItem(STORAGE_KEY);
        if (savedWallets) {
            try {
                const parsed = JSON.parse(savedWallets) as SupportedWallets;
                setSupportedWallets(parsed);
            } catch (e) {
                console.error('Error parsing saved wallets:', e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    useEffect(() => {
        try {
            if (supportedWallets) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(supportedWallets));
            }
        } catch (e) {
            console.error('Error saving wallets:', e);
        }
    }, [supportedWallets]);

    useEffect(() => {
        if (currentAddress && selectedChain) {
            const chainWallets = supportedWallets?.[selectedChain] || [];
            const isSupported = chainWallets.includes(currentAddress.toLowerCase());
            onAddressChange(isSupported);
        }
    }, [currentAddress, selectedChain, supportedWallets, onAddressChange]);

    const addWallet = (): void => {
        if (!newAddress || !selectedChain) return;

        const normalizedAddress = newAddress.toLowerCase();

        setSupportedWallets(prev => ({
            ...prev,
            [selectedChain]: [
                ...(prev?.[selectedChain] || []),
                normalizedAddress
            ]
        }));

        setNewAddress('');
    };

    const removeWallet = (chain: string, address: string): void => {
        setSupportedWallets(prev => ({
            ...prev,
            [chain]: (prev?.[chain] || []).filter(a => a !== address)
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setNewAddress(e.target.value);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    value={newAddress}
                    onChange={handleInputChange}
                    placeholder="Enter wallet address"
                    className="flex-1"
                />
                <Button
                    onClick={addWallet}
                    disabled={!newAddress || !selectedChain}
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Wallet
                </Button>
            </div>

            {selectedChain && supportedWallets && supportedWallets[selectedChain] && supportedWallets[selectedChain].length > 0 && (
                <Card className="p-4">
                    <h3 className="font-bold mb-2">Supported Wallets for {selectedChain}</h3>
                    <div className="space-y-2">
                        {supportedWallets[selectedChain]?.map((address, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="font-mono text-sm">{address}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeWallet(selectedChain, address)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default WalletManagement;