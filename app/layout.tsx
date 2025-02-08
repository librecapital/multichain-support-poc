'use client';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

/*export const metadata: Metadata = {
  title: 'Multi-Chain Wallet',
  description: 'Connect and interact with multiple blockchain networks',
};*/

const queryClient = new QueryClient();
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=0.8, maximum-scale=0.8, minimum-scale=0.8, user-scalable=no"
        />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <AptosWalletAdapterProvider>
            <SuiClientProvider networks={networks} defaultNetwork='testnet'>
              <WalletProvider>
                {children}
              </WalletProvider>
            </SuiClientProvider>
          </AptosWalletAdapterProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}