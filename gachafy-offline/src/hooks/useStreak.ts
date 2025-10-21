import { useGachaFi } from '@/contexts/GachaFiContext';

export const useStreak = () => {
  const { streak, markTodayComplete } = useGachaFi();

  return {
    streak: streak.current,
    isTodayDone: streak.isTodayDone,
    streakMultiplier: streak.streakMultiplier,
    markTodayComplete,
  };
};