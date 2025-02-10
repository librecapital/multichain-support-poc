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
    excludeWalletIds: ["a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393", "6adb6082c909901b9e7189af3a4a0223102cd6f8d5c39e39f3d49acb92b578bb"],
    features: {
        analytics: false,
        socials: false,
        allWallets: false,
        email: false,
    }
});

