const express = require('express');
const router = express.Router();

const healthController = require('../controllers/healthController');

router.get('/health', healthController.getHealth);

// Additional API routes
const productsRouter = require('./products');
const cartRouter = require('./cart');
const authRouter = require('./auth');
const profileRouter = require('./profile');
const ordersRouter = require('./orders');
const aiRouter = require('./ai');

router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/orders', ordersRouter);
router.use('/ai', aiRouter);

// TODO: add auth, profile routes

module.exports = router;
