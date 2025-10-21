import { useState, useEffect } from "react";
import { offlineQueueDB, type MintRequest } from "@/utils/offlineQueue";
import { useToast } from "@/hooks/use-toast";

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedRequests, setQueuedRequests] = useState<MintRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Service worker message handler
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PROCESS_OFFLINE_QUEUE') {
        processOfflineQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    // Load queued requests on mount
    loadQueuedRequests();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []);

  const loadQueuedRequests = async () => {
    try {
      const requests = await offlineQueueDB.getAllMintRequests();
      setQueuedRequests(requests);
    } catch (error) {
      console.error('Failed to load queued requests:', error);
    }
  };

  const queueMintRequest = async (tier: MintRequest['tier']) => {
    try {
      const nonce = await offlineQueueDB.getNextNonce();
      const request: MintRequest = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tier,
        timestamp: Date.now(),
        nonce,
      };

      await offlineQueueDB.addMintRequest(request);
      await loadQueuedRequests();

      toast({
        title: "Queued",
        description: "Will mint when online",
        variant: "default",
      });

      return request;
    } catch (error) {
      console.error('Failed to queue mint request:', error);
      throw error;
    }
  };

  const processOfflineQueue = async () => {
    if (!isOnline || queuedRequests.length === 0) return;

    toast({
      title: "Processing queue",
      description: `Processing ${queuedRequests.length} queued requests...`,
    });

    for (const request of queuedRequests) {
      try {
        // Simulate API call to mint NFT
        const response = await fetch('/api/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: request.tier,
            nonce: request.nonce,
            timestamp: request.timestamp,
          }),
        });

        if (response.ok) {
          await offlineQueueDB.removeMintRequest(request.id);
          toast({
            title: "Minted successfully",
            description: `${request.tier.name} box processed (nonce: ${request.nonce})`,
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`Failed to process request ${request.id}:`, error);
        toast({
          title: "Mint failed",
          description: `Failed to process ${request.tier.name} box`,
          variant: "destructive",
        });
      }
    }

    await loadQueuedRequests();
  };

  const clearQueue = async () => {
    try {
      await offlineQueueDB.clearAllRequests();
      await loadQueuedRequests();
      toast({
        title: "Queue cleared",
        description: "All queued requests removed",
      });
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  };

  return {
    isOnline,
    queuedRequests,
    queueMintRequest,
    processOfflineQueue,
    clearQueue,
  };
};