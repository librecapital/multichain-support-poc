export const supportedWallets = {
    metamask: { name: "Metamask", website: "https://metamask.io" },
    keplr: { name: "Keplr", website: "https://www.keplr.app/get" },
    phantom: { name: "Phantom", website: "https://www.phantom.com" },
    myNearWallet: { name: "MyNearWallet", website: "https://www.mynearwallet.com" },
    suiWallet: { name: "Sui Wallet", website: "https://suiwallet.com" },
    petra: { name: "Petra", website: "https://petra.app" },
};

export const supportedChains = [
    { id: 'ethereum', name: 'Ethereum', wallet: supportedWallets.metamask, assets: ["USDC"] },
    { id: 'polygon', name: 'Polygon', wallet: supportedWallets.metamask, assets: ["USDC"] },
    { id: 'avalanche', name: 'Avalanche', wallet: supportedWallets.metamask, assets: ["USDC"] },
    { id: 'mantra', name: 'Mantra', wallet: supportedWallets.keplr, assets: ["USDC"] },
    { id: 'solana', name: 'Solana', wallet: supportedWallets.phantom, assets: ["USDC"] },
    { id: 'injective', name: 'Injective', wallet: supportedWallets.keplr, assets: ["USDC"] },
    { id: 'near', name: 'NEAR', wallet: supportedWallets.myNearWallet, assets: ["USDC"] },
    { id: 'sui', name: 'Sui', wallet: supportedWallets.suiWallet, assets: ["USDC"] },
    { id: 'aptos', name: 'Aptos', wallet: supportedWallets.petra, assets: ["USDC"] },
];

export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
export const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export const MANTRA_ADDRESS_REGEX = /^mantra[a-zA-Z0-9]{39}$/;
export const INJECTIVE_ADDRESS_REGEX = /^inj[a-zA-Z0-9]{39}$/;
export const NEAR_ADDRESS_REGEX = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+\.near$/;
export const SUI_ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}$/;
export const APTOS_ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}$/;
