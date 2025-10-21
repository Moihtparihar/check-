import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { radixService } from '@/lib/radix';
import { oneSignalService } from '@/lib/oneSignal';
import { logger } from '@/lib/logger';

interface Wallet {
  address: string;
  balance: number;
  isConnected: boolean;
  isLoading: boolean;
  pendingTx: string;
}

interface Streak {
  current: number;
  isTodayDone: boolean;
  streakMultiplier: number;
}

interface Booster {
  isActive: boolean;
  cost: number;
  description: string;
}

interface GachaFiContextType {
  // Wallet state
  wallet: Wallet;
  
  // Streak state
  streak: Streak;
  
  // Booster state
  booster: Booster;
  
  // Offline queue state
  offlineQueue: {
    isOnline: boolean;
    queuedRequests: any[];
    queueMintRequest: (tier: any) => Promise<any>;
    processOfflineQueue: () => Promise<void>;
    clearQueue: () => Promise<void>;
  };
  
  // Actions
  connectWallet: () => Promise<void>;
  updateBalance: (amount: number) => void;
  markTodayComplete: () => void;
  toggleBooster: () => void;
}

const GachaFiContext = createContext<GachaFiContextType | undefined>(undefined);

interface GachaFiProviderProps {
  children: ReactNode;
}

export const GachaFiProvider: React.FC<GachaFiProviderProps> = ({ children }) => {
  // Wallet state
  const [wallet, setWallet] = useState<Wallet>({
    address: '',
    balance: 0,
    isConnected: false,
    isLoading: false,
    pendingTx: '',
  });

  // Streak state
  const [streak, setStreak] = useState<Streak>({
    current: 0,
    isTodayDone: false,
    streakMultiplier: 1,
  });

  // Booster state (resets each session)
  const [booster, setBooster] = useState<Booster>({
    isActive: false,
    cost: 5,
    description: "+5 XRD boost",
  });

  // Offline queue
  const offlineQueueHook = useOfflineQueue();

  // Streak bitmap utilities
  const getStreakMap = (): number[] => {
    try {
      const stored = localStorage.getItem('streakMap');
      return stored ? JSON.parse(stored) : [0, 0, 0, 0, 0, 0, 0]; // 7 days
    } catch {
      return [0, 0, 0, 0, 0, 0, 0];
    }
  };

  const setStreakMap = (bitmap: number[]) => {
    localStorage.setItem('streakMap', JSON.stringify(bitmap));
  };

  const getTodayIndex = (): number => {
    const today = new Date();
    return today.getUTCDay(); // 0 = Sunday, 6 = Saturday
  };

  const calculateStreak = (bitmap: number[], todayIndex: number): number => {
    let streakCount = 0;
    
    // Check backwards from today
    for (let i = 0; i < 7; i++) {
      const dayIndex = (todayIndex - i + 7) % 7;
      if (bitmap[dayIndex] === 1) {
        streakCount++;
      } else {
        break; // Streak broken
      }
    }
    
    return Math.min(streakCount, 7); // Max streak is 7 days
  };

  const updateStreakState = () => {
    const bitmap = getStreakMap();
    const todayIndex = getTodayIndex();
    const yesterdayIndex = (todayIndex - 1 + 7) % 7;
    
    const isTodayDone = bitmap[todayIndex] === 1;
    const current = calculateStreak(bitmap, todayIndex);
    
    // Streak multiplier: 1x for days 1-6, 3x for day 7
    const streakMultiplier = current === 7 ? 3 : 1;
    
    setStreak({
      current,
      isTodayDone,
      streakMultiplier,
    });
  };

  // Initialize wallet and streak
  useEffect(() => {
    const initWallet = async () => {
      try {
        logger.info('GachaFi: Initializing Radix wallet connection...', null, 'GachaFiContext');
        await radixService.initialize();
        await oneSignalService.initialize();
        
        // Update streak state on init
        updateStreakState();
        
        // Do not auto-connect; the √ Connect button handles login flow
        logger.info('Waiting for user to connect via √ Connect button', null, 'GachaFiContext');
      } catch (error) {
        logger.error('GachaFi initialization error', error, 'GachaFiContext');
      }
    };

    initWallet();
  }, []);

  // Subscribe to RDT wallet data to reflect connection status in app state
  useEffect(() => {
    const unsubscribe = radixService.onWalletData((walletData: any) => {
      try {
        const address = walletData?.accounts?.[0]?.address ?? '';
        setWallet(prev => ({
          ...prev,
          address,
          isConnected: !!address,
        }));
      } catch (e) {
        logger.warn('Failed parsing wallet data', e as any, 'GachaFiContext');
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Poll balance
  useEffect(() => {
    if (!wallet.isConnected) return;

    const fetchBalance = async () => {
      try {
        const liveBalance = await radixService.getBalance(wallet.address);
        setWallet(prev => ({ ...prev, balance: liveBalance }));
      } catch (error) {
        logger.error('Error fetching balance', error, 'GachaFiContext');
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [wallet.isConnected, wallet.address]);

  // Check booster session reset (no persistence across sessions)
  useEffect(() => {
    // Booster state resets on each new session (component mount)
    setBooster(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  // Actions
  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, isLoading: true }));
    
    try {
      logger.info('Attempting Radix wallet connection...', null, 'GachaFiContext');
      
      const result = await radixService.connectWallet();
      
      if (result?.accounts?.length > 0) {
        const address = result.accounts[0].address;
        logger.info('Successfully connected to Radix wallet', { address }, 'GachaFiContext');
        
        setWallet(prev => ({
          ...prev,
          address,
          isConnected: true,
          isLoading: false,
        }));
        
        // Request push notification permission on first connect
        try {
          const hasPermission = await oneSignalService.isSubscribed();
          if (!hasPermission) {
            await oneSignalService.requestPermission();
          }
        } catch (error) {
          logger.error('Failed to request push permission', error, 'GachaFiContext');
        }
      } else {
        // No wallet extension found or user cancelled
        logger.warn('No Radix wallet found or connection cancelled', null, 'GachaFiContext');
        
        setWallet(prev => ({
          ...prev,
          isLoading: false,
        }));
        
        throw new Error('Please install Radix Wallet browser extension');
      }
    } catch (error) {
      logger.error('Radix wallet connection error', error, 'GachaFiContext');
      
      setWallet(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      // Re-throw to show error to user
      throw error;
    }
  };

  const updateBalance = (amount: number) => {
    setWallet(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance + amount),
    }));
  };

  const markTodayComplete = () => {
    const bitmap = getStreakMap();
    const todayIndex = getTodayIndex();
    
    // Mark today as complete
    bitmap[todayIndex] = 1;
    setStreakMap(bitmap);
    
    // Store last open date for push notification logic
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastOpenDate', todayKey);
    
    // Update streak state
    updateStreakState();
  };

  const toggleBooster = () => {
    setBooster(prev => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const contextValue: GachaFiContextType = {
    wallet,
    streak,
    booster,
    offlineQueue: offlineQueueHook,
    connectWallet,
    updateBalance,
    markTodayComplete,
    toggleBooster,
  };

  return (
    <GachaFiContext.Provider value={contextValue}>
      {children}
    </GachaFiContext.Provider>
  );
};

export const useGachaFi = () => {
  const context = useContext(GachaFiContext);
  if (context === undefined) {
    throw new Error('useGachaFi must be used within a GachaFiProvider');
  }
  return context;
};