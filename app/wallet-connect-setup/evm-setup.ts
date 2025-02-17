import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { avalancheFuji, mainnet, polygon } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';

// Get projectId from https://cloud.walletconnect.com
const projectId = "c8e79bc1b0f5689eebafc4f97b12dd5d";

const commonMetadata = {
    name: "Libre",
    description: "Libre Capital",
    url: "https://app.librecapital.com", // Origin must match your domain & subdomain
    icons: ["https://avatars.mywebsite.com/"],
};

createAppKit({
    projectId: projectId,
    adapters: [new EthersAdapter()],
    metadata: commonMetadata,
    networks: [mainnet, polygon, avalancheFuji],
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    defaultNetwork: mainnet,
    allWallets: 'HIDE',
    enableWalletGuide: false,
    includeWalletIds: ["c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa"],
    features: {
        analytics: false,
        socials: false,
        allWallets: false,
        email: false,
    }
});

