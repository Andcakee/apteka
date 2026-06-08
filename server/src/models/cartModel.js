const knex = require('../../db/knex');

const CartModel = {
  async findOrCreateCartByUser(userId) {
    let cart = await knex('carts').where({ user_id: userId }).first();
    if (!cart) {
      const [id] = await knex('carts').insert({ user_id: userId });
      cart = await knex('carts').where({ id }).first();
    }
    return cart;
  },

  async getCartWithItemsByUser(userId) {
    const cart = await knex('carts').where({ user_id: userId }).first();
    if (!cart) return { cart: null, items: [] };

    const items = await knex('cart_items as ci')
      .join('products as p', 'ci.product_id', 'p.id')
      .select('ci.id as cart_item_id', 'p.id as product_id', 'p.title', 'p.price', 'p.image', 'ci.quantity')
      .where('ci.cart_id', cart.id);

    return { cart, items };
  },

  async addOrUpdateItem(userId, productId, quantity = 1) {
    const cart = await this.findOrCreateCartByUser(userId);
    const existing = await knex('cart_items').where({ cart_id: cart.id, product_id: productId }).first();
    if (existing) {
      const newQty = existing.quantity + quantity;
      await knex('cart_items').where({ id: existing.id }).update({ quantity: newQty });
      return knex('cart_items').where({ id: existing.id }).first();
    }
    const [id] = await knex('cart_items').insert({ cart_id: cart.id, product_id: productId, quantity });
    return knex('cart_items').where({ id }).first();
  },

  async removeItem(userId, productId) {
    const cart = await knex('carts').where({ user_id: userId }).first();
    if (!cart) return 0;
    return knex('cart_items').where({ cart_id: cart.id, product_id: productId }).del();
  },

  async clearCart(userId) {
    const cart = await knex('carts').where({ user_id: userId }).first();
    if (!cart) return 0;
    return knex('cart_items').where({ cart_id: cart.id }).del();
  }
};

module.exports = CartModel;
