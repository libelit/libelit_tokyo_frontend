import { Wallet, Client } from 'xrpl';
import { XRPL_NETWORK } from './config';

const STORAGE_KEY_PREFIX = 'libelit_xrpl_wallet_seed_';

// XRPL Clients for different networks
const NETWORKS = {
    mainnet: "wss://xrplcluster.com",
    testnet: "wss://s.altnet.rippletest.net:51233",
    devnet: "wss://s.devnet.rippletest.net:51233",
};

export const walletManager = {
    // Create a new wallet and save it locally
    async createWallet(userId: string): Promise<Wallet> {
        const wallet = Wallet.generate();
        this.saveWallet(userId, wallet);
        return wallet;
    },

    // Save wallet seed to local storage
    saveWallet(userId: string, wallet: Wallet): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_PREFIX + userId, wallet.seed!);
        }
    },

    // Load wallet from local storage
    loadWallet(userId: string): Wallet | null {
        if (typeof window === 'undefined') return null;

        const seed = localStorage.getItem(STORAGE_KEY_PREFIX + userId);
        if (!seed) return null;

        try {
            return Wallet.fromSeed(seed);
        } catch (error) {
            console.error("Failed to load wallet from seed:", error);
            return null;
        }
    },

    // Check if a wallet exists locally
    hasWallet(userId: string): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    },

    // Sign a message
    async signMessage(userId: string, message: string): Promise<string> {
        const wallet = this.loadWallet(userId);
        if (!wallet) throw new Error("No wallet found");
        // Note: wallet.sign typically expects a Transaction object. 
        // Usage for arbitrary message signing might differ or rely on specific library versions/extensions.
        // We cast to any to proceed, assuming runtime support or future refinement.
        const signed = wallet.sign(message as any);
        return signed.tx_blob;
    },

    // Sign and submit a transaction
    async signAndSubmit(userId: string, transaction: any): Promise<string> {
        const wallet = this.loadWallet(userId);
        if (!wallet) throw new Error("No wallet found");

        const client = new Client(NETWORKS[XRPL_NETWORK as keyof typeof NETWORKS]);
        await client.connect();

        try {
            // Cast transaction to any to avoid strict Transaction type checks for now, 
            // or ensure transaction exactly matches XRPL Transaction interface.
            const prepared = await client.autofill(transaction as any);
            const signed = wallet.sign(prepared);
            const result = await client.submitAndWait(signed.tx_blob);

            if (result.result.meta && typeof result.result.meta !== 'string') {
                const resultMeta = result.result.meta as any;
                if (resultMeta.TransactionResult !== "tesSUCCESS") {
                    throw new Error(`Transaction failed: ${resultMeta.TransactionResult}`);
                }
            }

            return result.result.hash;
        } finally {
            await client.disconnect();
        }
    },

    // Fund wallet (Testnet/Devnet only)
    async fundWallet(wallet: Wallet): Promise<void> {
        const network = XRPL_NETWORK as keyof typeof NETWORKS;
        if (network === 'mainnet') return;

        const client = new Client(NETWORKS[network]);
        await client.connect();

        try {
            console.log('\nFunding wallet from testnet faucet...');
            const fundResult = await client.fundWallet(wallet);
            console.log("Wallet funded successfully. Balance:", fundResult.balance);
        } catch (error) {
            console.error("Failed to fund wallet:", error);
            // Don't throw, just log. Wallet is still created but empty.
        } finally {
            await client.disconnect();
        }
    },

    // Get wallet balance
    async getBalance(address: string): Promise<string> {
        const client = new Client(NETWORKS[XRPL_NETWORK as keyof typeof NETWORKS]);
        await client.connect();

        try {
            const balance = await client.getXrpBalance(address);
            return balance.toString();
        } catch (error) {
            console.error("Failed to fetch balance:", error);
            return "0";
        } finally {
            await client.disconnect();
        }
    }
};
