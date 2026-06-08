const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    if (search && search.trim()) {
      const products = await productService.search(search);
      res.json(products);
    } else {
      const products = await productService.list();
      res.json(products);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await productService.get(parseInt(req.params.id, 10));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST: Добавить новый товар (только для админов)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { title, price, stock, image, description, category, benefits, usage, contraindications, storage } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ error: 'title and price required' });
    }
    const product = await productService.create({ 
      title, 
      price: parseFloat(price), 
      stock: parseInt(stock) || 0, 
      image, 
      description,
      category,
      benefits: benefits ? JSON.stringify(benefits) : null,
      usage,
      contraindications,
      storage
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Удалить товар (только для админов)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await productService.remove(id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
