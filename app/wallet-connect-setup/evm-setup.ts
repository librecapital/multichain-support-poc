import {
    createWeb3Modal,
    defaultConfig as defaultEvmConfig,
} from "@web3modal/ethers/react";

// Get projectId from https://cloud.walletconnect.com
const projectId = "c8e79bc1b0f5689eebafc4f97b12dd5d";

const commonMetadata = {
    name: "Libre",
    description: "Libre Capital",
    url: "https://app.librecapital.com", // Origin must match your domain & subdomain
    icons: ["https://avatars.mywebsite.com/"],
};

const evmChains = [
    {
        chainId: 1,
        name: "Ethereum",
        currency: "ETH",
        explorerUrl: "https://etherscan.io",
        rpcUrl: "https://cloudflare-eth.com",
    },
    {
        chainId: 137,
        name: "Polygon",
        currency: "MATIC",
        explorerUrl: "https://polygonscan.com",
        rpcUrl: "https://polygon-rpc.com"
      }
];

// Create EVM configuration
const evmConfig = defaultEvmConfig({
    metadata: commonMetadata,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: "...", // Used for the Coinbase SDK
    defaultChainId: 1, // Used for the Coinbase SDK
});

createWeb3Modal({
    projectId: projectId,
    chains: [...evmChains] as any,
    ethersConfig: evmConfig,
    enableAnalytics: false,
});

