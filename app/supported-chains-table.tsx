import { supportedChains } from "./config"

import React from 'react';
import { Card } from '@/components/ui/card';

export const SupportedChainsTable = () => {
    return (
        <Card className="w-full max-w-4xl mx-auto overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b">Chain</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b">Wallet</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {Object.values(supportedChains).map((chain) => (
                            <tr key={chain.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-800">{chain.name}</td>
                                <td className="px-6 py-4 text-sm">
                                    {Array.isArray(chain.wallet) ? (
                                        <div className="space-y-1">
                                            {chain.wallet.map((wallet) => (
                                                <a
                                                    key={wallet.name}
                                                    href={wallet.website}
                                                    target="_blank"
                                                    className="block text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {wallet.name}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <a
                                            href={chain.wallet.website}
                                            target="_blank"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {chain.wallet.name}
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export default SupportedChainsTable;