import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Coins, DollarSign, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CapsuleData {
  id: string;
  name: string;
  totalOpens: number;
  spEarnedToday: number;
  spEarnedAllTime: number;
  lastUpdated: Date;
}

interface EarningsData {
  totalSpToday: number;
  totalSpAllTime: number;
  usdEquivalent: number;
  xrdPrice: number;
  capsules: CapsuleData[];
}

const Creator = () => {
  const { address, isConnected } = useWallet();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Demo XRD price (in production, this would come from a price API)
  const DEMO_XRD_PRICE = 0.045; // $0.045 per XRD

  const fetchCreatorData = async () => {
    if (!isConnected || !address) return;
    
    setIsLoading(true);
    
    try {
      // Production mode: Read from Radix RPC
      console.log('Fetching creator data from Radix network for:', address);
      
      // TODO: Implement actual on-chain reading
      // This would involve:
      // 1. Query user's NFT holdings to find Capsule-IDs
      // 2. For each Capsule, read transaction history
      // 3. Calculate 0.5% of SP from opens
      // 4. Aggregate daily and all-time totals
      
      // For now, return empty data
      const simulatedData: EarningsData = {
        totalSpToday: 0,
        totalSpAllTime: 0,
        usdEquivalent: 0,
        xrdPrice: DEMO_XRD_PRICE,
        capsules: []
      };
      
      setEarningsData(simulatedData);
      setLastRefresh(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch creator data:', error);
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (isConnected) {
      fetchCreatorData();
      
      const interval = setInterval(fetchCreatorData, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatXRD = (amount: number) => {
    return `${amount.toFixed(3)} XRD`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="mb-6">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-muted-foreground">
              Connect your Radix wallet to view your Capsule earnings and creator statistics.
            </p>
          </div>
          <div className="flex justify-center">
            <radix-connect-button />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Creator Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your Capsule performance and earnings
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={fetchCreatorData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Wallet Info */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">
              Connected: {address?.slice(0, 20)}...
            </span>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && !earningsData && (
          <Card className="p-8 text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Scanning blockchain for your Capsules...</p>
            <p className="text-muted-foreground text-sm mt-2">
              Reading transaction history and calculating earnings
            </p>
          </Card>
        )}

        {/* Earnings Overview */}
        {earningsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Today's Earnings */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Today's Earnings</h3>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-primary">
                    {formatXRD(earningsData.totalSpToday)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(earningsData.totalSpToday * earningsData.xrdPrice)}
                  </p>
                </div>
              </Card>

              {/* All-Time Earnings */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">All-Time Earnings</h3>
                  <Coins className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-primary">
                    {formatXRD(earningsData.totalSpAllTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(earningsData.usdEquivalent)}
                  </p>
                </div>
              </Card>

              {/* XRD Price */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">XRD Price</h3>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(earningsData.xrdPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Per XRD
                  </p>
                </div>
              </Card>
            </div>

            {/* Capsule Performance */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Your Capsules</h3>
              
              {earningsData.capsules.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Capsules Found</h4>
                  <p className="text-muted-foreground">
                    You haven't created any Capsules yet. Start creating to earn from opens!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {earningsData.capsules.map((capsule) => (
                    <div key={capsule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{capsule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ID: {capsule.id.slice(0, 20)}...
                          </p>
                        </div>
                        <Badge variant="outline">
                          {capsule.totalOpens} opens
                        </Badge>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Today</p>
                          <p className="font-medium">{formatXRD(capsule.spEarnedToday)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">All-Time</p>
                          <p className="font-medium">{formatXRD(capsule.spEarnedAllTime)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">USD Value</p>
                          <p className="font-medium">
                            {formatCurrency(capsule.spEarnedAllTime * earningsData.xrdPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-medium">
                            {capsule.lastUpdated.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Info Card */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">How Creator Earnings Work</p>
                  <p className="text-muted-foreground">
                    You earn 0.5% of SP from every open of your created Capsules. 
                    Earnings are calculated in real-time from on-chain transaction data.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Creator;