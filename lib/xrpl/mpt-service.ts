import { Client, Wallet, encodeMPTokenMetadata, decodeMPTokenMetadata, MPTokenIssuanceCreateFlags } from 'xrpl';
import { XRPL_NETWORK } from './config';

const NETWORKS = {
    mainnet: "wss://xrplcluster.com",
    testnet: "wss://s.altnet.rippletest.net:51233",
    devnet: "wss://s.devnet.rippletest.net:51233",
};

export interface MPTMetadata {
    ticker: string;
    name: string;
    desc: string;
    icon?: string;
    asset_class: 'rwa' | 'memes' | 'wrapped' | 'gaming' | 'defi' | 'other';
    asset_subclass?: string;
    issuer_name?: string;
    uris?: Array<{
        uri: string;
        category: string;
        title: string;
    }>;
    additional_info?: Record<string, any>;
}

export interface CreateMPTParams {
    wallet: Wallet;
    metadata: MPTMetadata;
    maximumAmount: string;
    assetScale?: number;
    transferFee?: number;
}

export interface MPTIssuanceResult {
    success: boolean;
    transactionHash?: string;
    mptIssuanceID?: string;
    error?: string;
}

export const mptService = {
    /**
     * Create a new MPToken issuance on XRPL
     */
    async createMPTokenIssuance(params: CreateMPTParams): Promise<MPTIssuanceResult> {
        const { wallet, metadata, maximumAmount, assetScale = 4, transferFee = 0 } = params;

        const client = new Client(NETWORKS[XRPL_NETWORK as keyof typeof NETWORKS]);

        try {
            await client.connect();
            console.log('Connected to XRPL network:', XRPL_NETWORK);

            // Encode metadata according to XLS-89 standard
            const mptMetadataHex = encodeMPTokenMetadata(metadata as any);
            console.log('Encoded MPT metadata:', mptMetadataHex);

            // Prepare MPTokenIssuanceCreate transaction
            const mptIssuanceCreate = {
                TransactionType: 'MPTokenIssuanceCreate',
                Account: wallet.address,
                AssetScale: assetScale,
                MaximumAmount: maximumAmount,
                TransferFee: transferFee,
                Flags: MPTokenIssuanceCreateFlags.tfMPTCanTransfer | MPTokenIssuanceCreateFlags.tfMPTCanTrade,
                MPTokenMetadata: mptMetadataHex
            };

            console.log('Submitting MPTokenIssuanceCreate transaction...');

            // Submit and wait for validation
            const submitResponse = await client.submitAndWait(mptIssuanceCreate as any, {
                wallet,
                autofill: true
            });

            console.log('Transaction result:', submitResponse.result);

            // Check if transaction was successful
            if (submitResponse.result.meta && typeof submitResponse.result.meta !== 'string') {
                const resultMeta = submitResponse.result.meta as any;

                if (resultMeta.TransactionResult === "tesSUCCESS") {
                    // Extract MPTokenIssuanceID from the created ledger entry
                    let mptIssuanceID: string | undefined;

                    if (resultMeta.CreatedNode) {
                        const createdNodes = Array.isArray(resultMeta.CreatedNode)
                            ? resultMeta.CreatedNode
                            : [resultMeta.CreatedNode];

                        for (const node of createdNodes) {
                            if (node.CreatedNode?.LedgerEntryType === 'MPTokenIssuance') {
                                mptIssuanceID = node.CreatedNode.LedgerIndex;
                                break;
                            }
                        }
                    }

                    return {
                        success: true,
                        transactionHash: submitResponse.result.hash,
                        mptIssuanceID
                    };
                } else {
                    return {
                        success: false,
                        error: `Transaction failed: ${resultMeta.TransactionResult}`
                    };
                }
            }

            return {
                success: false,
                error: 'Unable to determine transaction result'
            };

        } catch (error) {
            console.error('Error creating MPToken issuance:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        } finally {
            await client.disconnect();
        }
    },

    /**
     * Get MPToken balance for an address
     */
    async getMPTokenBalance(address: string, mptIssuanceID: string): Promise<string> {
        const client = new Client(NETWORKS[XRPL_NETWORK as keyof typeof NETWORKS]);

        try {
            await client.connect();

            // Query account's MPToken objects
            const response = await client.request({
                command: 'account_objects',
                account: address,
                type: 'mptoken' as any
            }) as any;

            const mpTokens = response.result.account_objects || [];
            const token = mpTokens.find((obj: any) => obj.MPTokenIssuanceID === mptIssuanceID);

            return token?.MPTAmount || '0';
        } catch (error) {
            console.error('Error fetching MPToken balance:', error);
            return '0';
        } finally {
            await client.disconnect();
        }
    },

    /**
     * Get all MPToken issuances created by an address
     */
    async getMPTokenIssuances(address: string): Promise<any[]> {
        const client = new Client(NETWORKS[XRPL_NETWORK as keyof typeof NETWORKS]);

        try {
            await client.connect();

            // Query account's MPTokenIssuance objects
            const response = await client.request({
                command: 'account_objects',
                account: address,
                type: 'mptokenissuance' as any
            }) as any;

            const issuances = response.result.account_objects || [];

            // Decode metadata for each issuance
            return issuances.map((issuance: any) => {
                let metadata = null;
                if (issuance.MPTokenMetadata) {
                    try {
                        // Import decodeMPTokenMetadata dynamically
                        // const { decodeMPTokenMetadata } = require('xrpl'); // Already imported at the top
                        metadata = decodeMPTokenMetadata(issuance.MPTokenMetadata);
                    } catch (error) {
                        console.error('Error decoding metadata:', error);
                    }
                }

                return {
                    id: issuance.index,
                    sequence: issuance.Sequence,
                    maxAmount: issuance.MaximumAmount,
                    outstandingAmount: issuance.OutstandingAmount || '0',
                    assetScale: issuance.AssetScale,
                    transferFee: issuance.TransferFee,
                    metadata,
                    flags: issuance.Flags,
                    rawData: issuance
                };
            });
        } catch (error) {
            console.error('Error fetching MPToken issuances:', error);
            return [];
        } finally {
            await client.disconnect();
        }
    },

    /**
     * Create metadata for a project tokenization
     */
    createProjectMetadata(projectTitle: string, projectId: number, amount: string): MPTMetadata {
        return {
            ticker: 'LIBELIT',
            name: `${projectTitle} - Development Token`,
            desc: `Fractional ownership token for ${projectTitle}. Represents ${amount} units of project equity.`,
            asset_class: 'rwa',
            asset_subclass: 'real_estate_development',
            issuer_name: 'Libelit Platform',
            uris: [
                {
                    uri: `https://libelit.com/projects/${projectId}`,
                    category: 'website',
                    title: 'Project Details'
                }
            ],
            additional_info: {
                project_id: projectId.toString(),
                platform: 'Libelit',
                token_type: 'development_equity'
            }
        };
    }
};
