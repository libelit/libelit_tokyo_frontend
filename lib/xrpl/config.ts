import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";

// Web3Auth Client ID from dashboard
export const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

// XRPL Network configuration
export const XRPL_NETWORK = process.env.NEXT_PUBLIC_XRPL_NETWORK || "testnet";

// XRPL Chain configurations
export const XRPL_CHAIN_CONFIG = {
  mainnet: {
    chainNamespace: CHAIN_NAMESPACES.OTHER,
    chainId: "0x1",
    rpcTarget: "https://xrplcluster.com",
    displayName: "XRPL Mainnet",
    blockExplorerUrl: "https://livenet.xrpl.org",
    ticker: "XRP",
    tickerName: "XRP",
  },
  testnet: {
    chainNamespace: CHAIN_NAMESPACES.OTHER,
    chainId: "0x2",
    rpcTarget: "https://s.altnet.rippletest.net:51234",
    displayName: "XRPL Testnet",
    blockExplorerUrl: "https://testnet.xrpl.org",
    ticker: "XRP",
    tickerName: "XRP",
  },
  devnet: {
    chainNamespace: CHAIN_NAMESPACES.OTHER,
    chainId: "0x3",
    rpcTarget: "https://s.devnet.rippletest.net:51234",
    displayName: "XRPL Devnet",
    blockExplorerUrl: "https://devnet.xrpl.org",
    ticker: "XRP",
    tickerName: "XRP",
  },
} as const;

// Get current chain config based on environment
export function getChainConfig() {
  return XRPL_CHAIN_CONFIG[XRPL_NETWORK as keyof typeof XRPL_CHAIN_CONFIG] || XRPL_CHAIN_CONFIG.testnet;
}

// Web3Auth network (sapphire_devnet for testing, sapphire_mainnet for production)
export const WEB3AUTH_NETWORK_CONFIG =
  XRPL_NETWORK === "mainnet" ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;
