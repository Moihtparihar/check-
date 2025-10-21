import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { RadixWalletPrompt } from "./RadixWalletPrompt";
import { toast } from "sonner";
import { isStandalone } from "@/utils/pwa";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Radix √ Connect Button - Following Radix DLT branding guidelines
 * Supports both desktop (via browser extension) and mobile (via deep linking)
 * Mobile deep linking automatically opens the Radix Wallet app on the same device
 * Based on: https://www.radixdlt.com/blog/radix-connect-for-mobile-dapps---out-now
 */
export const RadixConnectButton = () => {
  const { address, isConnected, connectWallet, balance, isLoading } = useWallet();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const isMobile = useIsMobile();

const handleConnect = async () => {
  // In installed PWA windows on desktop, browser extensions are unavailable
  if (isStandalone() && !isMobile) {
    toast.info("Open in browser to connect wallet", {
      description: "Extensions are disabled in installed PWAs.",
      duration: 4000,
    });
    try {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    } catch {}
    return;
  }

  try {
    await connectWallet();
    toast.success("Wallet connected!", { duration: 3000 });
  } catch (error: any) {
    // Don't show toast for install errors - show the modal instead
    if (error?.message?.includes('install') || error?.message?.includes('Wallet')) {
      setShowWalletPrompt(true);
    } else {
      // Show toast only for actual connection errors
      toast.error("Connection failed", { description: "Please try again", duration: 4000 });
    }
  }
};

  if (isConnected && address) {
    // Connected state - show wallet info
    return (
      <>
        {showWalletPrompt && <RadixWalletPrompt onDismiss={() => setShowWalletPrompt(false)} />}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
          {/* Radix checkmark logo */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M3 8.5L6.5 12L13 5" stroke="#00C389" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-white/70 font-medium">Connected</span>
            <span className="text-sm text-white font-semibold truncate max-w-[120px]">
              {address.slice(0, 8)}...{address.slice(-6)}
            </span>
            {balance > 0 && (
              <span className="text-xs text-white/70">{balance.toFixed(2)} XRD</span>
            )}
          </div>
        </div>
      </>
    );
  }

  // Not connected state - show connect button with Radix branding
  return (
    <>
      {showWalletPrompt && <RadixWalletPrompt onDismiss={() => setShowWalletPrompt(false)} />}
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className="relative px-5 py-2.5 font-semibold text-white bg-[#00C389] hover:bg-[#00AB7A] border-0 rounded-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Radix checkmark logo */}
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="mr-2 shrink-0">
          <path d="M3 8.5L6.5 12L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{isLoading ? 'Connecting...' : 'Connect'}</span>
      </Button>
    </>
  );
};
