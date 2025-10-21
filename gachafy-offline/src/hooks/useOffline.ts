import { useGachaFi } from '@/contexts/GachaFiContext';

export const useOffline = () => {
  const { offlineQueue } = useGachaFi();

  return {
    isOnline: offlineQueue.isOnline,
    queuedRequests: offlineQueue.queuedRequests,
    queueMintRequest: offlineQueue.queueMintRequest,
    processOfflineQueue: offlineQueue.processOfflineQueue,
    clearQueue: offlineQueue.clearQueue,
  };
};