"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { walletService, type WalletData } from "@/lib/api/wallet";
import { passkeyService } from "./passkey-service";
import { walletManager } from "./wallet-manager";
import { useAuth } from "@/components/auth";

// Define a simpler provider validation interface if needed, or remove IProvider if not strictly used as Web3Auth type
// For now, we'll remove IProvider as it was Web3Auth specific.
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
  fundWallet: () => Promise<void>;

  // XRPL operations
  getAccounts: () => Promise<string[]>;
  getBalance: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  signAndSendTransaction: (tx: object) => Promise<string>;

  // Provider access - Removing Web3Auth provider, exposing walletManager if needed or just null
  provider: null;
}

const XrplWalletContext = createContext<XrplWalletContextType | undefined>(undefined);

export function XrplWalletProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);

  // Initialize and react to user changes
  useEffect(() => {
    const init = async () => {
      // If auth is loading, wait
      if (isAuthLoading) return;

      // If no user, reset state
      if (!user) {
        setAddress(null);
        setWalletData(null);
        setIsInitialized(true); // Initialized as "not connected"
        return;
      }

      // Check if wallet exists locally for this user
      const localWallet = walletManager.loadWallet(user.id.toString());
      if (localWallet) {
        setAddress(localWallet.address);
      } else {
        setAddress(null);
      }
      setIsInitialized(true);
    };

    init();
  }, [user, isAuthLoading]);

  // Fetch wallet data from backend when address changes
  useEffect(() => {
    const fetchWalletData = async () => {
      const response = await walletService.getWallet();
      if (response.data?.success && response.data.data) {
        setWalletData(response.data.data);
        // Ensure address stays synced if backend has it
        if (!address) {
          setAddress(response.data.data.xrpl_address);
        }
      }
    };

    // Only fetch if we have auth token (which is implied if user is present, but good to check)
    if (user && typeof window !== "undefined" && localStorage.getItem("auth_token")) {
      fetchWalletData();
    }
  }, [address, user]);

  const connect = useCallback(async (): Promise<string | null> => {
    if (!user) {
      console.error("Cannot connect wallet: User not authenticated");
      return null;
    }

    try {
      setIsConnecting(true);

      // 1. Passkey Registration / Auth
      const isSupported = await passkeyService.isSupported();
      if (!isSupported) {
        throw new Error("Passkeys are not supported on this device.");
      }

      // Check if we already have a wallet locally for this user
      if (walletManager.hasWallet(user.id.toString())) {
        const authSuccess = await passkeyService.authenticate();
        if (!authSuccess) throw new Error("Passkey authentication failed.");

        const wallet = walletManager.loadWallet(user.id.toString());
        if (wallet) {
          setAddress(wallet.address);
          return wallet.address;
        }
      }

      // If no wallet or forced new setup:
      // We use the user's name or email for passkey registration
      const username = user.email || user.name || "User";
      const regSuccess = await passkeyService.register(username);

      if (!regSuccess) {
        throw new Error("Passkey registration failed.");
      }

      // 2. Create XRPL Wallet
      const wallet = await walletManager.createWallet(user.id.toString());

      // Fund if on testnet (async, don't block UI strictly but good to wait slightly or let it happen in bg)
      // We'll await it so the user sees "Wallet Created" after it's actually usable
      await walletManager.fundWallet(wallet);

      setAddress(wallet.address);

      // 3. Store wallet in backend
      const response = await walletService.createWallet({
        xrpl_address: wallet.address,
        label: "Primary Wallet",
      });

      if (response.data?.success && response.data.data) {
        setWalletData(response.data.data);
      }

      return wallet.address;
    } catch (error) {
      console.error("Failed to connect:", error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  const disconnect = async () => {
    // For local wallet, disconnection just means clearing state
    // We don't delete the seed from local storage (that would be "reset wallet")
    setAddress(null);
    setWalletData(null);
    // Optionally trigger backend logout if needed, but here we just disconnect wallet view
  };

  const fundWallet = async () => {
    if (!user) throw new Error("User not authenticated");
    const wallet = walletManager.loadWallet(user.id.toString());
    if (wallet) {
      await walletManager.fundWallet(wallet);
    }
  };

  const getAccounts = async () => {
    return address ? [address] : [];
  };

  const getBalance = async () => {
    // This would typically involve an XRPL Client call
    // For now we can return '0' or implement actual fetch via Client
    if (address) {
      // Since getBalance only needs address, we can call it directly
      // But walletManager handles client connection
      return walletManager.getBalance(address);
    }
    return "0";
  };

  const signMessage = async (message: string) => {
    if (!user) throw new Error("User not authenticated");
    return walletManager.signMessage(user.id.toString(), message);
  };

  const signAndSendTransaction = async (tx: object) => {
    if (!user) throw new Error("User not authenticated");
    return walletManager.signAndSubmit(user.id.toString(), tx);
  };

  const value: XrplWalletContextType = {
    isConnected: !!address,
    isInitialized,
    isConnecting,
    address,
    walletData,
    connect,
    disconnect,
    fundWallet,
    getAccounts,
    getBalance,
    signMessage,
    signAndSendTransaction,
    provider: null, // Web3Auth provider is removed
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
