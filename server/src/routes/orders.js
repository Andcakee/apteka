const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middleware/auth');

// GET: Все заказы (только для фармацевта и админа)
router.get('/', authenticate, requireRole('pharmacist'), async (req, res) => {
  return orderController.getAllOrders(req, res);
});

// GET: Заказ по ID с деталями
router.get('/:id', authenticate, async (req, res) => {
  return orderController.getOrderById(req, res);
});

// GET: Мои заказы (для авторизованного пользователя)
router.get('/user/my-orders', authenticate, async (req, res) => {
  return orderController.getUserOrders(req, res);
});

// POST: Создать новый заказ
router.post('/', authenticate, async (req, res) => {
  return orderController.createOrder(req, res);
});

// PATCH: Обновить статус заказа (только для фармацевта и админа)
router.patch('/:id/status', authenticate, requireRole('pharmacist'), async (req, res) => {
  return orderController.updateOrderStatus(req, res);
});

module.exports = router;
