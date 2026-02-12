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

  // Single unified initialization: load local wallet + backend data before marking as initialized
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // If auth is loading, wait
      if (isAuthLoading) return;

      // If no user, reset state
      if (!user) {
        setAddress(null);
        setWalletData(null);
        setIsInitialized(true);
        return;
      }

      // 1. Check local storage first
      let resolvedAddress: string | null = null;
      const localWallet = walletManager.loadWallet(user.id.toString());
      if (localWallet) {
        resolvedAddress = localWallet.address;
      }

      // 2. Fetch backend wallet data (if authenticated)
      if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
        try {
          const response = await walletService.getWallet();
          if (cancelled) return;

          if (response.data?.success && response.data.data) {
            setWalletData(response.data.data);

            // If no local wallet but backend has one, use backend address
            if (!resolvedAddress) {
              resolvedAddress = response.data.data.xrpl_address;
            }

            // Restore wallet from seed if backend has it but local storage doesn't
            if (response.data.data.seed) {
              const currentLocal = walletManager.loadWallet(user.id.toString());
              if (!currentLocal || currentLocal.address !== response.data.data.xrpl_address) {
                console.log("Restoring wallet from backed-up seed...");
                const restored = walletManager.restoreWallet(user.id.toString(), response.data.data.seed);
                if (restored) {
                  console.log("Wallet restored successfully");
                  resolvedAddress = restored.address;
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch wallet data from backend:", error);
        }
      }

      if (cancelled) return;

      // 3. Set final state once — no intermediate renders
      setAddress(resolvedAddress);
      setIsInitialized(true);
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading]);

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
        throw new Error("Passkeys are not supported on this device. Ensure you are using HTTPS or localhost.");
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

      // 3. Store wallet in backend
      let response = await walletService.createWallet({
        xrpl_address: wallet.address,
        seed: wallet.seed, // Send seed to backend for recovery
        label: "Primary Wallet",
      });

      // Handle 409 Conflict (User already has a wallet but lost local seed)
      if (response.status === 409) {
        console.log("Wallet conflict detected. Deleting old wallet to reset...");
        const deleteResponse = await walletService.deleteWallet();

        if (deleteResponse.data?.success) {
          // Retry creation
          response = await walletService.createWallet({
            xrpl_address: wallet.address,
            seed: wallet.seed,
            label: "Primary Wallet",
          });
        } else {
          console.error("Failed to delete old wallet:", deleteResponse.error);
          throw new Error("Failed to reset wallet. Please contact support.");
        }
      }

      if (response.data?.success && response.data.data) {
        setWalletData(response.data.data);
      }

      setAddress(wallet.address);
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
