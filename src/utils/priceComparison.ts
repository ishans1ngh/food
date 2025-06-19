import { CartItem, PriceComparisonResult } from '../types';

export const comparePrices = (cartItems: CartItem[]): PriceComparisonResult[] => {
  return cartItems.map(item => {
    const availablePlatforms = item.platformPrices.filter(p => p.availability && p.inStock);
    const cheapestPlatform = availablePlatforms.reduce((cheapest, current) => 
      current.price < cheapest.price ? current : cheapest
    );

    return {
      item,
      cheapestPlatform,
      allPlatforms: item.platformPrices.sort((a, b) => a.price - b.price)
    };
  });
};

export const calculatePlatformTotals = (results: PriceComparisonResult[]) => {
  const platformTotals: { [platform: string]: { total: number; items: number; color: string } } = {};

  results.forEach(result => {
    result.allPlatforms.forEach(platform => {
      if (platform.availability && platform.inStock) {
        const totalForItem = platform.price * result.item.quantity;
        if (!platformTotals[platform.platform]) {
          platformTotals[platform.platform] = { 
            total: 0, 
            items: 0, 
            color: platform.color 
          };
        }
        platformTotals[platform.platform].total += totalForItem;
        platformTotals[platform.platform].items += result.item.quantity;
      }
    });
  });

  return Object.entries(platformTotals)
    .map(([platform, data]) => ({
      platform,
      total: Math.round(data.total * 100) / 100,
      items: data.items,
      color: data.color
    }))
    .sort((a, b) => a.total - b.total);
};

export const getBestDealRecommendation = (results: PriceComparisonResult[]) => {
  const platformSavings: { [platform: string]: number } = {};
  
  results.forEach(result => {
    const cheapestPrice = result.cheapestPlatform.price * result.item.quantity;
    result.allPlatforms.forEach(platform => {
      if (platform.availability && platform.inStock) {
        const platformPrice = platform.price * result.item.quantity;
        const savings = platformPrice - cheapestPrice;
        
        if (!platformSavings[platform.platform]) {
          platformSavings[platform.platform] = 0;
        }
        platformSavings[platform.platform] += savings;
      }
    });
  });

  return Object.entries(platformSavings)
    .map(([platform, savings]) => ({ platform, savings }))
    .sort((a, b) => a.savings - b.savings)[0];
};