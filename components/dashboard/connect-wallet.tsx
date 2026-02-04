"use client";

import { Button } from "@/components/ui/button";

export function ConnectWallet() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Please connect your wallet</h2>
        <p className="text-sm text-foreground">
          In order to see your investments you need to connect your digital wallet.
        </p>
      </div>
      <Button className="bg-black text-white shrink-0 px-6 cursor-pointer rounded-full p-6">
        Connect Wallet
      </Button>
    </div>
  );
}
