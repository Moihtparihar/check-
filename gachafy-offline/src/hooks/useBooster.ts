import { useGachaFi } from '@/contexts/GachaFiContext';

export const useBooster = () => {
  const { booster, toggleBooster } = useGachaFi();

  return {
    isActive: booster.isActive,
    cost: booster.cost,
    description: booster.description,
    toggleBooster,
  };
};