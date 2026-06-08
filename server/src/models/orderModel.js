const knex = require('../../db/knex');

const Order = {
  async all() {
    return knex('orders')
      .select('orders.*', 'users.email', 'users.name')
      .join('users', 'orders.user_id', '=', 'users.id')
      .orderBy('orders.created_at', 'desc');
  },
  
  async findById(id) {
    return knex('orders')
      .where({ 'orders.id': id })
      .select('orders.*', 'users.email', 'users.name')
      .join('users', 'orders.user_id', '=', 'users.id')
      .first();
  },
  
  async findByUserId(userId) {
    return knex('orders')
      .where({ user_id: userId })
      .select('orders.*', 'users.email', 'users.name')
      .join('users', 'orders.user_id', '=', 'users.id')
      .orderBy('orders.created_at', 'desc');
  },
  
  async create(data) {
    const [id] = await knex('orders').insert(data);
    return this.findById(id);
  },
  
  async update(id, data) {
    await knex('orders').where({ id }).update(data);
    return this.findById(id);
  },
  
  async remove(id) {
    return knex('orders').where({ id }).del();
  },
  
  async getOrderWithItems(orderId) {
    const order = await this.findById(orderId);
    if (!order) return null;
    
    const items = await knex('order_items')
      .where({ order_id: orderId })
      .select('order_items.*', 'products.title', 'products.image')
      .join('products', 'order_items.product_id', '=', 'products.id');
    
    return { ...order, items };
  },
  
  async addItem(orderId, productId, quantity, price) {
    const [id] = await knex('order_items').insert({
      order_id: orderId,
      product_id: productId,
      quantity,
      price
    });
    return knex('order_items').where({ id }).first();
  }
};

module.exports = Order;
