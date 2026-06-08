const Product = require('../models/productModel');

module.exports = {
  async list() {
    return Product.all();
  },
  async get(id) {
    return Product.findById(id);
  },
  async search(query) {
    const searchTerm = `%${query}%`;
    const products = await Product.all();
    return products.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
    );
  },
  async create(data) {
    return Product.create(data);
  },
  async update(id, data) {
    return Product.update(id, data);
  },
  async remove(id) {
    return Product.remove(id);
  }
};
