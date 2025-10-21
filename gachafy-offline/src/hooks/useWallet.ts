import { useGachaFi } from '@/contexts/GachaFiContext';

export const useWallet = () => {
  const { wallet, connectWallet, updateBalance } = useGachaFi();

  return {
    address: wallet.address,
    balance: wallet.balance,
    isConnected: wallet.isConnected,
    isLoading: wallet.isLoading,
    pendingTx: wallet.pendingTx,
    connectWallet,
    updateBalance,
  };
};