import {
    Connection, ParsedAccountData, PublicKey, SendOptions, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction,
    TransactionInstruction,
    TransactionSignature
} from "@solana/web3.js";

// Constants for Solana programs
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

type PhantomProvider = {
    isPhantom: boolean;
    connect: () => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: (args: any) => void) => void;
    signAndSendTransaction: (transaction: Transaction, options?: SendOptions) => Promise<{ signature: TransactionSignature }>;
}

declare global {
    interface Window {
        solana?: PhantomProvider;
    }
}

export class SolanaManager {
    private static getSolanaProvider = (): PhantomProvider | null => {
        if (typeof window === "undefined") return null;
        return window.solana?.isPhantom ? window.solana : null;
    };

    private readonly connection: Connection | null = null;
    public static readonly provider: PhantomProvider | null = SolanaManager.getSolanaProvider();;

    private static getSolanaRPCUrl = (network: string) => `https://api.${network}.solana.com`;

    public static listenToWalletChanges(callback: (address: string | null) => void): void {
        SolanaManager.provider?.on("accountChanged", (publicKey: PublicKey | null) => {
            callback(publicKey ? publicKey.toString() : null);
        });
        SolanaManager.provider?.on("disconnect", () => {
            callback(null);
        });
    };

    constructor(network: string) {
        this.connection = new Connection(SolanaManager.getSolanaRPCUrl(network));
    }

    private async findAssociatedTokenAddress(walletAddress: PublicKey, tokenMint: PublicKey): Promise<PublicKey> {
        return (await PublicKey.findProgramAddress(
            [
                walletAddress.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                tokenMint.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        ))[0];
    };

    private createTransferInstruction(
        source: PublicKey,
        destination: PublicKey,
        owner: PublicKey,
        amount: number,
        tokenProgramId: PublicKey = TOKEN_PROGRAM_ID
    ): TransactionInstruction {
        const instructionByte = 3; // 3 is the index for transfer instruction

        const data = new Uint8Array(9) as unknown as Buffer;
        data[0] = instructionByte;
        new DataView(data.buffer).setBigUint64(1, BigInt(amount), true); // true for little-endian

        const keys = [
            { pubkey: source, isSigner: false, isWritable: true },
            { pubkey: destination, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner: true, isWritable: false },
        ];

        return new TransactionInstruction({
            keys,
            programId: tokenProgramId,
            data,
        });
    };

    public async connectWallet(): Promise<string | null> {

        try {
            const resp = await SolanaManager.provider?.connect();
            return resp?.publicKey.toString() ?? null;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    public async disconnectWallet(): Promise<void> {
        await SolanaManager.provider?.disconnect();
    };

    public async getBalance(address: string, tokenAddress: string): Promise<number> {
        try {
            const walletPublicKey = new PublicKey(address);
            const tokenMintPublicKey = new PublicKey(tokenAddress);

            // Find the associated token account
            const associatedTokenAddress = await this.findAssociatedTokenAddress(
                walletPublicKey,
                tokenMintPublicKey
            );

            // Fetch the token account info
            const tokenAccountInfo = await this.connection?.getAccountInfo(associatedTokenAddress);

            if (tokenAccountInfo === null) {
                console.log("No token account found for this wallet and token mint");
                return 0;
            }

            // The balance is stored in the first 8 bytes of the account data
            const balance = tokenAccountInfo?.data.readBigUInt64LE(64);

            // Get the token's decimals
            const tokenMintInfo = await this.connection?.getParsedAccountInfo(tokenMintPublicKey);
            const tokenDecimals = (tokenMintInfo?.value?.data as any).parsed.info.decimals;

            // Convert from raw units to token amount
            return Number(balance) / Math.pow(10, tokenDecimals);
        } catch (error) {
            console.error("Errore nel recupero del balance:", error);
            throw error;
        }
    };

    public async createTransaction(
        fromPubkeyAddress: string, toPubkeyAddress: string, tokenMintAddress: string,
        amount: number
    ): Promise<string | undefined> {
        if (!this.connection || !SolanaManager.provider) return;

        const fromPubkey = new PublicKey(fromPubkeyAddress);
        const toPubkey = new PublicKey(toPubkeyAddress);
        const tokenMint = new PublicKey(tokenMintAddress);

        // Find the associated token accounts for sender and recipient
        const fromTokenAccount = await this.findAssociatedTokenAddress(fromPubkey, tokenMint);
        const toTokenAccount = await this.findAssociatedTokenAddress(toPubkey, tokenMint);

        // Check if the recipient's token account exists
        const recipientAccount = await this.connection.getAccountInfo(toTokenAccount);

        let transaction = new Transaction();

        // If the recipient's token account doesn't exist, create it
        if (recipientAccount === null) {
            transaction.add(
                SystemProgram.createAccount({
                    fromPubkey: fromPubkey,
                    newAccountPubkey: toTokenAccount,
                    space: 165,
                    lamports: await this.connection.getMinimumBalanceForRentExemption(165),
                    programId: TOKEN_PROGRAM_ID,
                }),
                SystemProgram.transfer({
                    fromPubkey: fromPubkey,
                    toPubkey: toTokenAccount,
                    lamports: await this.connection.getMinimumBalanceForRentExemption(165),
                }),
                new TransactionInstruction({
                    keys: [
                        { pubkey: toTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: toPubkey, isSigner: false, isWritable: false },
                        { pubkey: tokenMint, isSigner: false, isWritable: false },
                        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
                    ],
                    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
                    data: Buffer.alloc(0),
                })
            );
        }

        // Get the token's decimals
        const tokenMintInfo = await this.connection.getParsedAccountInfo(new PublicKey(tokenMintAddress));
        const tokenDecimals = (tokenMintInfo.value?.data as ParsedAccountData).parsed.info.decimals;

        const USDCAmount = amount * Math.pow(10, tokenDecimals);

        // Add the token transfer instruction
        const transferInstruction = this.createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromPubkey,
            USDCAmount // Assuming amount is in USDC
        );
        transaction.add(transferInstruction);

        // Get a recent blockhash
        const { blockhash } = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        // Set the paying account as the fee payer
        transaction.feePayer = fromPubkey;

        // Sign and send the transaction
        const { signature } = await SolanaManager.provider.signAndSendTransaction(transaction);
        const { value: confirmation } = await this.connection.confirmTransaction(signature, "confirmed");
        if (confirmation.err) throw "Confirmation error";

        console.log("Transaction sent successfully. Signature:", signature);
        return signature;
    }
}
