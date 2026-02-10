"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { XrplPrivateKeyProvider } from "@web3auth/xrpl-provider";
import { WEB3AUTH_CLIENT_ID, getChainConfig, WEB3AUTH_NETWORK_CONFIG } from "./config";
import { walletService, type WalletData } from "@/lib/api/wallet";

interface XrplWalletContextType {
  // Connection state
  isConnected: boolean;
  isInitialized: boolean;
  isConnecting: boolean;

  // Wallet data
  address: string | null;
  walletData: WalletData | null;

  // Actions
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;

  // XRPL operations
  getAccounts: () => Promise<string[]>;
  getBalance: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  signAndSendTransaction: (tx: object) => Promise<string>;

  // Provider access
  provider: IProvider | null;
}

const XrplWalletContext = createContext<XrplWalletContextType | undefined>(undefined);

let web3authInstance: Web3Auth | null = null;

export function XrplWalletProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);

  // Initialize Web3Auth
  useEffect(() => {
    const init = async () => {
      try {
        if (!WEB3AUTH_CLIENT_ID) {
          console.warn("Web3Auth Client ID not configured");
          setIsInitialized(true);
          return;
        }

        const chainConfig = getChainConfig();

        const xrplProvider = new XrplPrivateKeyProvider({
          config: {
            chainConfig: {
              chainNamespace: CHAIN_NAMESPACES.OTHER,
              chainId: chainConfig.chainId,
              rpcTarget: chainConfig.rpcTarget,
              displayName: chainConfig.displayName,
              blockExplorerUrl: chainConfig.blockExplorerUrl,
              ticker: chainConfig.ticker,
              tickerName: chainConfig.tickerName,
            },
          },
        });

        const web3auth = new Web3Auth({
          clientId: WEB3AUTH_CLIENT_ID,
          web3AuthNetwork: WEB3AUTH_NETWORK_CONFIG,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          privateKeyProvider: xrplProvider as any,
          uiConfig: {
            appName: "Libelit",
            mode: "light",
            loginMethodsOrder: ["google", "apple", "email_passwordless"],
            primaryButton: "socialLogin",
          },
        });

        await web3auth.init();
        web3authInstance = web3auth;

        // Check if already connected
        if (web3auth.connected && web3auth.provider) {
          setProvider(web3auth.provider);
          const accounts = await web3auth.provider.request({
            method: "xrpl_getAccounts",
          }) as string[] | null;
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Web3Auth:", error);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // Fetch wallet data from backend when address changes
  useEffect(() => {
    const fetchWalletData = async () => {
      const response = await walletService.getWallet();
      if (response.data?.success && response.data.data) {
        setWalletData(response.data.data);
        setAddress(response.data.data.xrpl_address);
      }
    };

    // Only fetch if we have auth token
    if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
      fetchWalletData();
    }
  }, []);

  const connect = useCallback(async (): Promise<string | null> => {
    if (!web3authInstance) {
      console.error("Web3Auth not initialized");
      return null;
    }

    try {
      setIsConnecting(true);
      const web3authProvider = await web3authInstance.connect();

      if (!web3authProvider) {
        throw new Error("Failed to connect to Web3Auth");
      }

      setProvider(web3authProvider);

      // Get the XRPL address
      const accounts = await web3authProvider.request({
        method: "xrpl_getAccounts",
      }) as string[] | null;

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from provider");
      }

      const xrplAddress = accounts[0];
      setAddress(xrplAddress);

      // Store wallet in backend
      const response = await walletService.createWallet({
        xrpl_address: xrplAddress,
        label: "Primary Wallet",
      });

      if (response.data?.success && response.data.data) {
        setWalletData(response.data.data);
      }

      return xrplAddress;
    } catch (error) {
      console.error("Failed to connect:", error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!web3authInstance) return;

    try {
      await web3authInstance.logout();
      setProvider(null);
      setAddress(null);
      // Note: We don't delete wallet from backend on disconnect
      // The wallet address is still valid and can be reconnected
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, []);

  const getAccounts = useCallback(async (): Promise<string[]> => {
    if (!provider) return [];

    try {
      const accounts = await provider.request({
        method: "xrpl_getAccounts",
      }) as string[] | null;
      return accounts || [];
    } catch (error) {
      console.error("Failed to get accounts:", error);
      return [];
    }
  }, [provider]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!provider || !address) return "0";

    try {
      const balance = await provider.request({
        method: "xrpl_getBalance",
      }) as string | null;
      return balance || "0";
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  }, [provider, address]);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!provider) throw new Error("Provider not connected");

      const result = await provider.request({
        method: "xrpl_signMessage",
        params: { message },
      }) as { signature: string } | null;

      return result?.signature || "";
    },
    [provider]
  );

  const signAndSendTransaction = useCallback(
    async (transaction: object): Promise<string> => {
      if (!provider) throw new Error("Provider not connected");

      const result = await provider.request({
        method: "xrpl_submitTransaction",
        params: { transaction },
      }) as { hash: string } | null;

      return result?.hash || "";
    },
    [provider]
  );

  const value: XrplWalletContextType = {
    isConnected: !!address && !!walletData,
    isInitialized,
    isConnecting,
    address,
    walletData,
    connect,
    disconnect,
    getAccounts,
    getBalance,
    signMessage,
    signAndSendTransaction,
    provider,
  };

  return <XrplWalletContext.Provider value={value}>{children}</XrplWalletContext.Provider>;
}

export function useXrplWallet() {
  const context = useContext(XrplWalletContext);
  if (context === undefined) {
    throw new Error("useXrplWallet must be used within an XrplWalletProvider");
  }
  return context;
}
