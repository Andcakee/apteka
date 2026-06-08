const Order = require('../models/orderModel');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.all();
    // Загружаем товары для каждого заказа
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const fullOrder = await Order.getOrderWithItems(order.id);
        return fullOrder;
      })
    );
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.getOrderWithItems(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findByUserId(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, notes, total } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    let calculatedTotal = total || 0;
    const orderData = {
      user_id: req.user.id,
      notes: notes || '',
      status: 'pending',
      total: calculatedTotal
    };

    const order = await Order.create(orderData);

    for (const item of items) {
      await Order.addItem(order.id, item.product_id, item.quantity, item.price);
      if (!total) {
        calculatedTotal += item.price * item.quantity;
      }
    }

    if (!total) {
      await Order.update(order.id, { total: calculatedTotal });
    }
    
    const fullOrder = await Order.getOrderWithItems(order.id);
    res.status(201).json(fullOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.update(id, { status });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const fullOrder = await Order.getOrderWithItems(id);
    res.json(fullOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
