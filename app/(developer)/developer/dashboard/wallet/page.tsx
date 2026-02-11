"use client";

import { useXrplWallet } from "@/lib/xrpl";
import { MyWallet } from "@/components/wallet/my-wallet";
import { DeveloperHeader } from "@/components/developer/developer-header";

export default function DeveloperWalletPage() {
    const { isConnected } = useXrplWallet();

    return (
        <div className="space-y-6">
            <DeveloperHeader title="My Wallet" />
            <MyWallet />
        </div>
    );
}
