import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowUpDown, ArrowRight, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number, txHash: string) => void;
}

type BridgeStep = 'input' | 'approve' | 'bridge' | 'swap' | 'deposit' | 'success' | 'error';

interface BridgeState {
  step: BridgeStep;
  amount: number;
  txHash: string;
  errorMessage: string;
  hyperlaneProgress: number;
}

export const BridgeModal = ({ isOpen, onClose, onSuccess }: BridgeModalProps) => {
  const { toast } = useToast();
  const [bridgeState, setBridgeState] = useState<BridgeState>({
    step: 'input',
    amount: 0,
    txHash: '',
    errorMessage: '',
    hyperlaneProgress: 0,
  });

  // Demo exchange rates
  const USDC_TO_ZUSDC_RATE = 1; // 1:1
  const ZUSDC_TO_XRD_RATE = 22.22; // 1 zUSDC = 22.22 XRD
  const BRIDGE_FEE = 0.5; // 0.5 USDC fee

  const resetBridge = () => {
    setBridgeState({
      step: 'input',
      amount: 0,
      txHash: '',
      errorMessage: '',
      hyperlaneProgress: 0,
    });
  };

  const simulateHyperlaneProgress = (onComplete: () => void) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress 5-20%
      setBridgeState(prev => ({ ...prev, hyperlaneProgress: Math.min(progress, 100) }));
      
      if (progress >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, 500);
  };

  const startBridge = async () => {
    if (bridgeState.amount <= BRIDGE_FEE) {
      setBridgeState(prev => ({ 
        ...prev, 
        step: 'error',
        errorMessage: `Amount must be greater than ${BRIDGE_FEE} USDC bridge fee`
      }));
      return;
    }

    try {
      // Step 1: Approve USDC
      setBridgeState(prev => ({ ...prev, step: 'approve' }));
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Bridge via Hyperlane
      setBridgeState(prev => ({ ...prev, step: 'bridge' }));
      
      simulateHyperlaneProgress(async () => {
        // Generate demo transaction hash
        const demoTxHash = `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`;
        setBridgeState(prev => ({ ...prev, txHash: demoTxHash }));

        // Step 3: Swap zUSDC to XRD
        setBridgeState(prev => ({ ...prev, step: 'swap' }));
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 4: Deposit to wallet
        setBridgeState(prev => ({ ...prev, step: 'deposit' }));
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 5: Success
        const finalXrdAmount = (bridgeState.amount - BRIDGE_FEE) * ZUSDC_TO_XRD_RATE;
        setBridgeState(prev => ({ ...prev, step: 'success' }));
        
        // Notify parent of success
        setTimeout(() => {
          onSuccess(finalXrdAmount, demoTxHash);
          toast({
            title: "Bridge Successful!",
            description: `Received ${finalXrdAmount.toFixed(3)} XRD in your wallet`,
          });
        }, 1000);
      });

    } catch (error) {
      console.error('Bridge failed:', error);
      setBridgeState(prev => ({ 
        ...prev, 
        step: 'error',
        errorMessage: 'Bridge transaction failed. Please try again.'
      }));
      
      toast({
        title: "Bridge Failed",
        description: "The bridge transaction could not be completed",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    resetBridge();
    onClose();
  };

  const getStepIcon = (step: BridgeStep) => {
    if (bridgeState.step === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    
    const completedSteps = ['approve', 'bridge', 'swap', 'deposit'];
    const currentIndex = completedSteps.indexOf(bridgeState.step);
    const stepIndex = completedSteps.indexOf(step);
    
    if (stepIndex < currentIndex || bridgeState.step === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (stepIndex === currentIndex) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else {
      return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const calculateOutput = () => {
    if (bridgeState.amount <= BRIDGE_FEE) return 0;
    return (bridgeState.amount - BRIDGE_FEE) * ZUSDC_TO_XRD_RATE;
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <ArrowUpDown className="w-6 h-6 text-primary" />
            <div>
              <SheetTitle>Cross-Chain Bridge</SheetTitle>
              <SheetDescription>
                Bridge USDC to XRD via Hyperlane
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Input Step */}
          {bridgeState.step === 'input' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Bridge</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={bridgeState.amount || ''}
                      onChange={(e) => setBridgeState(prev => ({ 
                        ...prev, 
                        amount: parseFloat(e.target.value) || 0 
                      }))}
                      className="pr-16"
                    />
                    <Badge variant="secondary" className="absolute right-3 top-2">
                      USDC
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center p-2">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label>You will receive</Label>
                  <div className="relative">
                    <Input
                      value={calculateOutput().toFixed(3)}
                      readOnly
                      className="pr-16 bg-muted"
                    />
                    <Badge variant="outline" className="absolute right-3 top-2">
                      XRD
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span>Bridge Fee:</span>
                  <span>{BRIDGE_FEE} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span>Exchange Rate:</span>
                  <span>1 USDC = {ZUSDC_TO_XRD_RATE} XRD</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total XRD:</span>
                  <span>{calculateOutput().toFixed(3)} XRD</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={startBridge}
                  disabled={bridgeState.amount <= BRIDGE_FEE}
                  className="flex-1"
                >
                  Start Bridge
                </Button>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          {['approve', 'bridge', 'swap', 'deposit', 'success', 'error'].includes(bridgeState.step) && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {getStepIcon('approve')}
                  <div className="flex-1">
                    <p className="font-medium">Approve USDC</p>
                    <p className="text-sm text-muted-foreground">
                      Authorize Hyperlane to spend your USDC
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {getStepIcon('bridge')}
                  <div className="flex-1">
                    <p className="font-medium">Bridge to Radix</p>
                    <p className="text-sm text-muted-foreground">
                      Cross-chain transfer via Hyperlane protocol
                      {bridgeState.step === 'bridge' && (
                        <span className="ml-2">({bridgeState.hyperlaneProgress.toFixed(0)}%)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {getStepIcon('swap')}
                  <div className="flex-1">
                    <p className="font-medium">Swap zUSDC → XRD</p>
                    <p className="text-sm text-muted-foreground">
                      Convert bridged USDC to native XRD
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {getStepIcon('deposit')}
                  <div className="flex-1">
                    <p className="font-medium">Deposit to Wallet</p>
                    <p className="text-sm text-muted-foreground">
                      Transfer XRD to your connected wallet
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Hash */}
              {bridgeState.txHash && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">Transaction Hash</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {bridgeState.txHash}
                  </p>
                </div>
              )}

              {/* Success State */}
              {bridgeState.step === 'success' && (
                <div className="text-center p-6 space-y-4">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold">Bridge Complete!</h3>
                    <p className="text-muted-foreground">
                      {calculateOutput().toFixed(3)} XRD has been added to your wallet
                    </p>
                  </div>
                  <Button onClick={handleClose} className="w-full">
                    Done
                  </Button>
                </div>
              )}

              {/* Error State */}
              {bridgeState.step === 'error' && (
                <div className="text-center p-6 space-y-4">
                  <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
                  <div>
                    <h3 className="text-lg font-semibold">Bridge Failed</h3>
                    <p className="text-muted-foreground">
                      {bridgeState.errorMessage}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={resetBridge} className="flex-1">
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <ArrowUpDown className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  Powered by Hyperlane
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  Secure cross-chain messaging protocol enabling seamless asset transfers 
                  between Ethereum and Radix networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};