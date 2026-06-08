const CartModel = require('../models/cartModel');
const Product = require('../models/productModel');

module.exports = {
  async getCart(userId) {
    return CartModel.getCartWithItemsByUser(userId);
  },

  async addItem(userId, productId, quantity = 1) {
    // optional: validate product exists and stock
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    return CartModel.addOrUpdateItem(userId, productId, quantity);
  },

  async removeItem(userId, productId) {
    return CartModel.removeItem(userId, productId);
  },

  async clear(userId) {
    return CartModel.clearCart(userId);
  }
};
