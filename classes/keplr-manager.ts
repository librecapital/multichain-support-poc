import {
    OfflineSigner
} from "@cosmjs/proto-signing";
import {
    coins,
    GasPrice,
    SigningStargateClient
} from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/provider-extension";
import { AppCurrency } from "@keplr-wallet/types";

export class KeplrManager {
    private keplr: Keplr | undefined;
    private chain: string | undefined;
    private stargateClient: SigningStargateClient | undefined;
    private currencies: AppCurrency[] | undefined;

    private constructor() {
        // Empty constructor
    }

    public static async create(chain: string, rpc: string): Promise<KeplrManager> {
        const instance = new KeplrManager();
        const keplr = await Keplr.getKeplr();
        const chainInfo = (await keplr?.getChainInfoWithoutEndpoints(chain));
        const gasCurrency = chainInfo?.feeCurrencies?.at(0);
        const coinMinimalDenom = gasCurrency?.coinMinimalDenom;
        const gasPrice = gasCurrency?.gasPriceStep?.average;
        const signer = await keplr?.getOfflineSignerAuto(chain);
        const stargateClient = await SigningStargateClient.connectWithSigner(
            rpc,
            signer as OfflineSigner,
            { gasPrice: GasPrice.fromString(`${gasPrice}${coinMinimalDenom}`) }
        );
        await keplr?.enable(chain);
        instance.keplr = keplr;
        instance.currencies = chainInfo?.currencies;
        instance.stargateClient = stargateClient;
        instance.chain = chain;
        return instance;
    }

    public async connectWallet(): Promise<string | undefined> {
        if (!this.chain) {
            throw Error("No chain defined");
        }
        const key = await this.keplr?.getKey(this.chain);
        return key?.bech32Address;
    };

    public async disconnectWallet(): Promise<void> {
        await this.keplr?.disable(this.chain);
    };

    public async getBalance(walletAddress: string, denom: string): Promise<number> {
        const currency = this.currencies?.find(currency => currency.coinMinimalDenom === denom);
        const coin = await this.stargateClient?.getBalance(walletAddress, denom);
        if (!currency?.coinDecimals) {
            throw Error("No decimals defined");
        }
        return Number(coin?.amount) / Math.pow(10, currency.coinDecimals);
    };

    public async createTransaction(
        fromAddress: string,
        toAddress: string,
        denom: string,
        amount: number
    ): Promise<string | undefined> {
        const response = await this.stargateClient?.sendTokens(fromAddress, toAddress, coins(amount, denom), "auto");
        return response?.transactionHash;
    }

    public async signMessage(message: string): Promise<{ signature: string; pubKey: string }> {
        if (!this.chain) {
            throw Error("No chain defined");
        }
        if (!this.keplr) {
            throw Error("Keplr not initialized");
        }
        
        const key = await this.keplr.getKey(this.chain);
        if (!key) {
            throw Error("No key found");
        }

        const signResponse = await this.keplr.signArbitrary(
            this.chain,
            key.bech32Address,
            message
        );

        return {
            signature: signResponse.signature,
            pubKey: signResponse.pub_key.value
        };
    }
}
