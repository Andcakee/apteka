const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');
const { authenticate } = require('../middleware/auth');

// Get cart by userId
router.get('/:userId', authenticate, async (req, res) => {
  try {
    // prefer authenticated user if provided
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const data = await cartService.getCart(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get cart' });
  }
});

// Add item to cart { productId, quantity }
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });
    const item = await cartService.addItem(userId, parseInt(productId, 10), parseInt(quantity || 1, 10));
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add item to cart' });
  }
});

// Remove item from cart { productId }
router.delete('/item', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });
    await cartService.removeItem(userId, parseInt(productId, 10));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to remove item' });
  }
});

// Clear cart for user
router.delete('/clear/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await cartService.clear(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to clear cart' });
  }
});

module.exports = router;
