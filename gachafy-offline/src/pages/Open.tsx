import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { useStreak } from "@/hooks/useStreak";
import { useToast } from "@/hooks/use-toast";
import { radixService, shortenTxHash } from "@/lib/radix";
import { Flame, Zap, Gem, Star, Crown, Sparkles } from "lucide-react";
import { NotificationDemo } from "@/components/NotificationDemo";
import { BridgeModal } from "@/components/BridgeModal";
import { Switch } from "@/components/ui/switch";
import { useBooster } from "@/hooks/useBooster";
import { useAudio } from "@/hooks/useAudio";
import AudioControls from "@/components/AudioControls";
import { useWallet } from "@/hooks/useWallet";

interface Tier {
  id: string;
  name: string;
  price: number;
  rarity: "common" | "rare" | "epic";
}

const tiers: Tier[] = [
  { id: "common", name: "Common", price: 8, rarity: "common" },
  { id: "rare", name: "Rare", price: 15, rarity: "rare" },
  { id: "epic", name: "Epic", price: 25, rarity: "epic" },
];

const rarityConfig = {
  common: {
    gradient: "from-slate-300 via-slate-400 to-slate-500",
    glowColor: "rgba(148, 163, 184, 0.6)",
    icon: Gem,
    particles: 12,
    animation: "animate-pulse",
    borderGlow: "shadow-[0_0_20px_rgba(148,163,184,0.5)]",
    cardClass: "glass-card-premium",
    textGradient: "bg-gradient-to-r from-slate-300 to-slate-100",
  },
  rare: {
    gradient: "from-blue-300 via-blue-400 to-purple-500",
    glowColor: "rgba(59, 130, 246, 0.8)",
    icon: Star,
    particles: 16,
    animation: "animate-bounce",
    borderGlow: "shadow-[0_0_25px_rgba(59,130,246,0.7)]",
    cardClass: "glass-card-premium",
    textGradient: "bg-gradient-to-r from-blue-300 to-purple-300",
  },
  epic: {
    gradient: "from-purple-300 via-pink-400 to-red-400",
    glowColor: "rgba(168, 85, 247, 1.0)",
    icon: Crown,
    particles: 20,
    animation: "animate-pulse",
    borderGlow: "shadow-[0_0_30px_rgba(168,85,247,0.9)]",
    cardClass: "glass-card-premium",
    textGradient: "bg-gradient-to-r from-purple-300 to-pink-300",
  },
};

const Open = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOnline, queuedRequests, queueMintRequest } = useOfflineQueue();
  const { streak, isTodayDone, streakMultiplier, markTodayComplete } = useStreak();
  const { isActive: boosterActive, cost: boosterCost, description: boosterDescription, toggleBooster } = useBooster();
  const { playOpenCapsule, playRevealRare, playRevealCommon, playRevealEpic, playButtonClick, playButtonHover, playSuccess, playError } = useAudio();
  const [balance, setBalance] = useState(0); // Live XRD balance
  const [selectedTier, setSelectedTier] = useState<Tier>(tiers[2]); // Default to Epic
  const [startY, setStartY] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [pendingTx, setPendingTx] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [swipeStartY, setSwipeStartY] = useState(0);
  const [swipeStartTime, setSwipeStartTime] = useState(0);

  // Initialize Radix connection
  useEffect(() => {
    const initRadix = async () => {
      try {
        console.log('Initializing Radix service...');
        await radixService.initialize();
        console.log('Radix service initialized');
        // Do not auto-connect on load; wait for explicit user action via Connect button
      } catch (error) {
        console.error('Radix initialization error:', error);
      }
    };
    
    initRadix();
  }, []);

  // Poll balance every 5 seconds
  useEffect(() => {
    if (!isConnected || !walletAddress) return;

    const fetchBalance = async () => {
      try {
        const liveBalance = await radixService.getBalance(walletAddress);
        setBalance(liveBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance(); // Initial fetch
    const interval = setInterval(fetchBalance, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isConnected, walletAddress]);

  // Poll pending transaction status
  useEffect(() => {
    if (!pendingTx) return;

    const checkTxStatus = async () => {
      try {
        const status = await radixService.getTransactionStatus(pendingTx);
        if (status === 'success') {
          navigate("/reveal", { state: { tier: selectedTier, txHash: pendingTx } });
          setPendingTx("");
        } else if (status === 'failed') {
          toast({
            title: "Transaction Failed",
            description: "Not enough XRD or transaction rejected",
            variant: "destructive",
          });
          // Refund the balance
          setBalance(prev => prev + selectedTier.price);
          setPendingTx("");
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
    };

    const interval = setInterval(checkTxStatus, 3000);
    return () => clearInterval(interval);
  }, [pendingTx, selectedTier, navigate, toast]);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      console.log('Manual wallet connection attempt...');
      const result = await radixService.connectWallet();
      console.log('Manual connection result:', result);
      
      if (result?.accounts?.length > 0) {
        setWalletAddress(result.accounts[0].address);
        setIsConnected(true);
        console.log('Successfully connected wallet:', result.accounts[0].address);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${result.accounts[0].address.slice(0, 10)}...`,
        });
      } else {
        console.error('No accounts returned from wallet connection');
        toast({
          title: "Connection Failed", 
          description: "No wallet found. Please install Radix Wallet extension.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Manual wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openBox = async () => {
    playButtonClick();
    
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (balance < selectedTier.price) {
      playError();
      toast({
        title: "Insufficient Funds",
        description: `Not enough XRD. Need ${selectedTier.price + (boosterActive ? boosterCost : 0)} XRD`,
        variant: "destructive",
      });
      return;
    }

    if (!isOnline) {
      // Queue request for offline processing
      await queueMintRequest(selectedTier);
      return;
    }

    try {
      setIsLoading(true);
      playOpenCapsule(selectedTier.rarity); // Play tier-specific opening sound
      
      // Calculate total cost including booster
      const totalCost = selectedTier.price + (boosterActive ? boosterCost : 0);
      // Deduct balance immediately for UX
      setBalance(prev => prev - totalCost);
      
      // Call Radix Stokenet to mint badge NFT with streak multiplier
      const txHash = await radixService.mintGachaBadge(
        walletAddress, 
        selectedTier.id, 
        totalCost * streakMultiplier // Apply streak multiplier to total cost
      );
      
      // Log booster state for future use
      console.log('Mint with booster:', { booster: boosterActive, totalCost });
      
      setPendingTx(txHash);
      
      // Mark today as complete for streak
      if (!isTodayDone) {
        markTodayComplete();
      }
      
      toast({
        title: "Transaction Submitted",
        description: `TX: ${shortenTxHash(txHash)}`,
      });
    } catch (error) {
      console.error('Mint failed:', error);
      // Revert balance on failure
      const totalCost = selectedTier.price + (boosterActive ? boosterCost : 0);
      setBalance(prev => prev + totalCost);
      toast({
        title: "Transaction Failed",
        description: "Failed to submit transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    
    // Swipe up threshold
    if (diff > 50) {
      openBox();
    }
  };

  // Balance pill swipe handlers
  const handleBalanceSwipeStart = (e: React.TouchEvent) => {
    setSwipeStartY(e.touches[0].clientY);
    setSwipeStartTime(Date.now());
  };

  const handleBalanceSwipeEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();
    
    const distance = swipeStartY - endY; // Positive = swipe up
    const duration = endTime - swipeStartTime; // milliseconds
    const velocity = Math.abs(distance) / duration; // pixels per ms
    
    // Convert to m/s (rough approximation: 1 pixel ≈ 0.26mm on typical mobile)
    const velocityMeterPerSecond = velocity * 0.00026 * 1000;
    
    console.log(`Swipe velocity: ${velocityMeterPerSecond.toFixed(2)} m/s`);
    
    // Trigger bridge modal if swipe up velocity > 0.3 m/s
    if (distance > 30 && velocityMeterPerSecond > 0.3) {
      setIsBridgeModalOpen(true);
    }
  };

  const handleBridgeSuccess = (amount: number, txHash: string) => {
    // Update balance with bridged amount
    setBalance(prev => prev + amount);
    setIsBridgeModalOpen(false);
    
    toast({
      title: "Bridge Complete!",
      description: `+${amount.toFixed(3)} XRD added to wallet`,
    });
    
    console.log('Bridge successful - TX Hash:', txHash);
  };

  const totalPrice = selectedTier.price + (boosterActive ? boosterCost : 0);
  const canAfford = balance >= totalPrice;
  const isProcessing = isLoading || !!pendingTx;

  return (
    <main className="min-h-screen bg-background p-4 flex flex-col relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" 
             style={{animation: 'magical-float 6s ease-in-out infinite'}}></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-400/25 to-purple-400/25 rounded-full blur-xl" 
             style={{animation: 'magical-float 8s ease-in-out infinite', animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/15 to-red-400/15 rounded-full blur-lg" 
             style={{animation: 'magical-float 10s ease-in-out infinite', animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-xl" 
             style={{animation: 'magical-float 7s ease-in-out infinite', animationDelay: '1s'}}></div>
      </div>

      {/* Enhanced Top Balance Bar */}
      <div className="flex justify-center mb-8 relative z-10 mt-16">
        <div 
          className="glass-card-premium rounded-full px-8 py-4 flex items-center gap-4 cursor-pointer hover:scale-105 transition-all duration-500 select-none"
          style={{animation: 'glow-pulse 3s ease-in-out infinite'}}
          onTouchStart={handleBalanceSwipeStart}
          onTouchEnd={handleBalanceSwipeEnd}
          title="Swipe up to bridge USDC → XRD"
        >
          <span className="text-xl font-bold gradient-text-holographic font-mono tracking-wider">
            {balance.toFixed(3)} XRD
          </span>
          
          {/* Enhanced Streak Pill */}
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg border border-orange-300/30">
              <Flame size={16} className="animate-pulse text-yellow-200" />
              <span className="text-sm font-bold tracking-wide">Day-{streak}</span>
              <Sparkles size={14} className="animate-pulse text-yellow-200" />
            </div>
          )}
          
          {!isOnline && (
            <span className="text-xs bg-orange-500/80 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              OFFLINE
            </span>
          )}
          {pendingTx && (
            <span className="text-xs bg-blue-500/80 text-white px-3 py-1 rounded-full backdrop-blur-sm font-mono">
              TX: {shortenTxHash(pendingTx)}
            </span>
          )}
          {queuedRequests.length > 0 && (
            <span className="text-xs bg-purple-500/80 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              {queuedRequests.length} queued
            </span>
          )}
        </div>
      </div>

      {/* Tier Cards */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="overflow-x-auto">
          <div className="flex gap-6 px-4 snap-x snap-mandatory justify-center">
            {tiers.map((tier) => {
              const config = rarityConfig[tier.rarity];
              const IconComponent = config.icon;
              const isSelected = selectedTier.id === tier.id;
              
              return (
                <Card
                  key={tier.id}
                  className={cn(
                    "min-w-[160px] h-[200px] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 snap-center relative overflow-hidden group",
                    config.cardClass,
                    "hover:scale-115 hover:-translate-y-3",
                    isSelected 
                      ? `border-primary/70 ${config.borderGlow} transform scale-115 -translate-y-3 border-2` 
                      : "border-white/20 hover:border-primary/60 border"
                  )}
                  onClick={() => {
                    playButtonClick();
                    setSelectedTier(tier);
                  }}
                  onMouseEnter={() => playButtonHover()}
                >
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(config.particles)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute w-1 h-1 bg-white rounded-full opacity-20",
                          isSelected ? "animate-ping" : "group-hover:animate-ping"
                        )}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Enhanced premium card content */}
                  <div className="relative z-10 flex flex-col items-center">
                    {/* Enhanced rarity icon with premium glow */}
                    <div className={cn(
                      "w-28 h-28 rounded-3xl mb-4 relative overflow-hidden flex items-center justify-center border-2 border-white/20",
                      `bg-gradient-to-br ${config.gradient}`,
                      isSelected ? config.animation : `group-hover:${config.animation}`
                    )}>
                      {/* Enhanced inner glow effect */}
                      <div 
                        className="absolute inset-0 rounded-3xl opacity-80"
                        style={{
                          background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 60%)`,
                        }}
                      />
                      
                      {/* Additional glow layer */}
                      <div 
                        className="absolute inset-[-2px] rounded-3xl opacity-40 blur-sm"
                        style={{
                          background: `linear-gradient(45deg, ${config.glowColor}, transparent, ${config.glowColor})`,
                        }}
                      />
                      
                      {/* Enhanced shimmer overlay */}
                      <div className={cn(
                        "absolute inset-0 rounded-3xl",
                        isSelected ? "shimmer" : "group-hover:shimmer"
                      )} />
                      
                      {/* Enhanced icon */}
                      <IconComponent 
                        className={cn(
                          "w-10 h-10 text-white relative z-10 drop-shadow-lg",
                          isSelected ? "animate-pulse" : "group-hover:animate-pulse"
                        )} 
                      />
                      
                      {/* Corner sparkles */}
                      <Sparkles 
                        className={cn(
                          "absolute top-1 right-1 w-4 h-4 text-white/60",
                          isSelected ? "animate-spin" : "group-hover:animate-spin"
                        )}
                      />
                    </div>

                    {/* Enhanced card details */}
                    <div className="text-center">
                      <h3 className={cn(
                        "text-xl font-bold mb-2 uppercase tracking-widest",
                        isSelected 
                          ? `${config.textGradient} bg-clip-text text-transparent scale-110` 
                          : `text-foreground group-hover:${config.textGradient} group-hover:bg-clip-text group-hover:text-transparent group-hover:scale-105`
                      )}>
                        {tier.name}
                      </h3>
                      <p className={cn(
                        "text-base font-mono font-bold tracking-wider",
                        isSelected 
                          ? "text-primary/90 scale-110" 
                          : "text-muted-foreground group-hover:text-primary group-hover:scale-105"
                      )}>
                        {tier.price}{boosterActive && selectedTier.id === tier.id ? ` + ${boosterCost}` : ''} XRD
                      </p>
                    </div>

                    {/* Rarity indicator */}
                    <div className={cn(
                      "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      `bg-gradient-to-r ${config.gradient} text-white shadow-lg`,
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      {tier.rarity}
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Holographic border effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300",
                    "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                    isSelected ? "opacity-100" : "group-hover:opacity-100"
                  )} />
                </Card>
              );
            })}
          </div>
        </div>

        {/* Enhanced Booster Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="glass-card-premium rounded-3xl px-8 py-6 flex items-center gap-6 border border-yellow-400/20 hover:scale-105 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30">
                <Zap className={cn("w-6 h-6 transition-colors animate-pulse", boosterActive ? "text-yellow-400" : "text-muted-foreground")} />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text-gold block">Booster</span>
                <span className="text-sm text-muted-foreground font-medium">{boosterDescription}</span>
              </div>
            </div>
            <Switch 
              checked={boosterActive}
              onCheckedChange={toggleBooster}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-400 data-[state=checked]:to-orange-500 scale-125"
            />
          </div>
        </div>

        {/* Enhanced CTA Button */}
        <div className="mt-12 flex justify-center">
          {!isConnected ? (
            /* Radix Connect Button - supports mobile deep linking */
            <div className="flex flex-col items-center gap-4">
              <div className="transform scale-150">
                <radix-connect-button />
              </div>
              <p className="text-muted-foreground text-sm">
                Connect your Radix wallet to start opening boxes
              </p>
            </div>
          ) : (
            <Button
              size="lg"
              className={cn(
                "holographic-button min-w-[280px] h-20 text-xl font-bold rounded-3xl transition-all duration-500 border-2 border-white/30 backdrop-blur-sm tracking-wider",
                !canAfford && "opacity-50 cursor-not-allowed grayscale"
              )}
              disabled={isProcessing || !canAfford}
              onClick={openBox}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => playButtonHover()}
            >
              {isProcessing ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="tracking-wider">
                    {pendingTx ? 'Processing...' : 'Connecting...'}
                  </span>
                </div>
              ) : !canAfford ? (
                <span className="tracking-wider">Need {(totalPrice - balance).toFixed(3)} XRD</span>
              ) : !isOnline ? (
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="tracking-wider">Queue {selectedTier.name} • {totalPrice} XRD</span>
                  <Sparkles size={20} className="animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="tracking-wider">Open {selectedTier.name} • {totalPrice} XRD</span>
                  <Sparkles size={20} className="animate-pulse" />
                </div>
              )}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        <div className="text-center mt-6 space-y-3 relative z-10">
          <p className="text-muted-foreground text-base">
            {!isConnected 
              ? 'Connect your Radix wallet to start'
              : `Tap or swipe up to ${!isOnline ? 'queue' : 'open'}`
            }
          </p>
          {!isOnline && (
            <p className="text-orange-400 text-sm font-medium">
              Offline mode - requests will be processed when online
            </p>
          )}
          {pendingTx && (
            <p className="text-blue-400 text-sm font-medium">
              Transaction pending on Stokenet...
            </p>
          )}
          {isConnected && walletAddress && (
            <p className="text-green-400 text-sm font-mono">
              Connected: {walletAddress.slice(0, 20)}...
            </p>
          )}
          {!isConnected && (
            <p className="text-yellow-400 text-sm">
              Make sure you have Radix Wallet installed and connected to Stokenet
            </p>
          )}
        </div>
      </div>

      {/* Bridge Modal */}
      <BridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        onSuccess={handleBridgeSuccess}
      />
      
      {/* Audio Controls */}
      <AudioControls />
    </main>
  );
};

export default Open;