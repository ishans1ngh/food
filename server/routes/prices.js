import express from 'express';
import PriceHistory from '../models/PriceHistory.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock API data for different platforms
const mockPlatformAPIs = {
  Amazon: {
    baseUrl: 'https://api.amazon.com/products',
    logo: '🛒',
    color: '#FF9900'
  },
  BigBasket: {
    baseUrl: 'https://api.bigbasket.com/products',
    logo: '🛍️',
    color: '#84C341'
  },
  JioMart: {
    baseUrl: 'https://api.jiomart.com/products',
    logo: '🏪',
    color: '#0066CC'
  },
  Blinkit: {
    baseUrl: 'https://api.blinkit.com/products',
    logo: '⚡',
    color: '#F8CA00'
  },
  Flipkart: {
    baseUrl: 'https://api.flipkart.com/products',
    logo: '📦',
    color: '#2874F0'
  },
  Zepto: {
    baseUrl: 'https://api.zepto.com/products',
    logo: '🚀',
    color: '#6C5CE7'
  },
  'Swiggy Instamart': {
    baseUrl: 'https://api.swiggy.com/instamart',
    logo: '🍽️',
    color: '#FC8019'
  }
};

// Generate realistic mock price data
const generateMockPriceData = (itemId, itemName, basePrice = 50) => {
  const platforms = Object.keys(mockPlatformAPIs);
  const priceData = [];

  platforms.forEach(platform => {
    const priceVariation = (Math.random() - 0.5) * 0.4; // ±20% variation
    const price = Math.round((basePrice * (1 + priceVariation)) * 100) / 100;
    const hasDiscount = Math.random() > 0.6;
    const discount = hasDiscount ? Math.round(Math.random() * 25) + 5 : 0;
    const originalPrice = hasDiscount ? Math.round((price / (1 - discount / 100)) * 100) / 100 : price;
    
    priceData.push({
      itemId,
      itemName,
      platform,
      price,
      originalPrice: hasDiscount ? originalPrice : undefined,
      discount: hasDiscount ? discount : undefined,
      availability: Math.random() > 0.1, // 90% availability
      inStock: Math.random() > 0.05, // 95% in stock
      deliveryTime: ['Same day', '1-2 days', '2-3 days', '3-5 days'][Math.floor(Math.random() * 4)],
      productUrl: `${mockPlatformAPIs[platform].baseUrl}/${itemId}`,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      reviewCount: Math.floor(Math.random() * 1000) + 50,
      logo: mockPlatformAPIs[platform].logo,
      color: mockPlatformAPIs[platform].color
    });
  });

  return priceData.sort((a, b) => a.price - b.price);
};

// Get real-time prices for a single item
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { itemName, basePrice } = req.query;

    // In a real implementation, you would make actual API calls here
    // For now, we'll generate mock data and optionally save to database
    const priceData = generateMockPriceData(
      itemId, 
      itemName || 'Unknown Item', 
      parseFloat(basePrice) || 50
    );

    // Save to price history (optional - for analytics)
    if (req.query.save === 'true') {
      try {
        await PriceHistory.insertMany(priceData);
      } catch (saveError) {
        console.warn('Failed to save price history:', saveError.message);
      }
    }

    res.json({
      itemId,
      itemName: itemName || 'Unknown Item',
      timestamp: new Date().toISOString(),
      platforms: priceData,
      bestDeal: priceData[0], // Already sorted by price
      summary: {
        lowestPrice: priceData[0]?.price,
        highestPrice: priceData[priceData.length - 1]?.price,
        averagePrice: Math.round((priceData.reduce((sum, p) => sum + p.price, 0) / priceData.length) * 100) / 100,
        availablePlatforms: priceData.filter(p => p.availability && p.inStock).length
      }
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch prices', error: error.message });
  }
});

// Get prices for multiple items (bulk comparison)
router.post('/compare', async (req, res) => {
  try {
    const { items } = req.body; // Array of { itemId, itemName, basePrice, quantity }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const comparisons = [];
    const platformTotals = {};

    for (const item of items) {
      const priceData = generateMockPriceData(
        item.itemId,
        item.itemName,
        item.basePrice || 50
      );

      // Calculate totals for each platform
      priceData.forEach(platform => {
        if (platform.availability && platform.inStock) {
          const totalPrice = platform.price * (item.quantity || 1);
          
          if (!platformTotals[platform.platform]) {
            platformTotals[platform.platform] = {
              platform: platform.platform,
              total: 0,
              items: 0,
              logo: platform.logo,
              color: platform.color
            };
          }
          
          platformTotals[platform.platform].total += totalPrice;
          platformTotals[platform.platform].items += (item.quantity || 1);
        }
      });

      comparisons.push({
        item,
        platforms: priceData,
        bestDeal: priceData[0]
      });
    }

    // Sort platform totals by price
    const sortedPlatformTotals = Object.values(platformTotals)
      .map(p => ({ ...p, total: Math.round(p.total * 100) / 100 }))
      .sort((a, b) => a.total - b.total);

    res.json({
      timestamp: new Date().toISOString(),
      itemCount: items.length,
      comparisons,
      platformTotals: sortedPlatformTotals,
      bestOverallPlatform: sortedPlatformTotals[0],
      totalSavings: sortedPlatformTotals.length > 1 ? 
        Math.round((sortedPlatformTotals[sortedPlatformTotals.length - 1].total - sortedPlatformTotals[0].total) * 100) / 100 : 0
    });
  } catch (error) {
    console.error('Bulk comparison error:', error);
    res.status(500).json({ message: 'Failed to compare prices', error: error.message });
  }
});

// Get price history for an item
router.get('/history/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const history = await PriceHistory.find({
      itemId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Group by platform for easier charting
    const platformHistory = {};
    history.forEach(record => {
      if (!platformHistory[record.platform]) {
        platformHistory[record.platform] = [];
      }
      platformHistory[record.platform].push({
        price: record.price,
        date: record.createdAt,
        availability: record.availability,
        inStock: record.inStock
      });
    });

    res.json({
      itemId,
      period: `${days} days`,
      platformHistory,
      totalRecords: history.length
    });
  } catch (error) {
    console.error('Price history error:', error);
    res.status(500).json({ message: 'Failed to fetch price history' });
  }
});

// Save item to user's watchlist
router.post('/watchlist', authenticateToken, async (req, res) => {
  try {
    const { itemId, itemName, targetPrice } = req.body;
    const user = req.user;

    // Check if item already in watchlist
    const existingItem = user.savedItems.find(item => item.itemId === itemId);
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in watchlist' });
    }

    user.savedItems.push({
      itemId,
      name: itemName,
      targetPrice,
      createdAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Item added to watchlist',
      watchlistCount: user.savedItems.length
    });
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({ message: 'Failed to add item to watchlist' });
  }
});

export default router;