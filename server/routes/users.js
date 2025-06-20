import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's saved items/watchlist
router.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      watchlist: user.savedItems,
      count: user.savedItems.length
    });
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch watchlist' });
  }
});

// Remove item from watchlist
router.delete('/watchlist/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = req.user;

    user.savedItems = user.savedItems.filter(item => item.itemId !== itemId);
    await user.save();

    res.json({
      message: 'Item removed from watchlist',
      watchlistCount: user.savedItems.length
    });
  } catch (error) {
    console.error('Watchlist removal error:', error);
    res.status(500).json({ message: 'Failed to remove item from watchlist' });
  }
});

export default router;