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
    metadata: commonMetadata,
    networks: [mainnet, polygon, avalancheFuji],
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    defaultNetwork: mainnet, // Used for the Coinbase SDK
    features: {
        analytics: false // Optional - defaults to your Cloud configuration
    }
});

