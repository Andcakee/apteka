const knex = require('../../db/knex');

const Product = {
  async all() {
    return knex('products').select('*');
  },
  async findById(id) {
    return knex('products').where({ id }).first();
  },
  async create(data) {
    const [id] = await knex('products').insert(data);
    return this.findById(id);
  },
  async update(id, data) {
    await knex('products').where({ id }).update(data);
    return this.findById(id);
  },
  async remove(id) {
    return knex('products').where({ id }).del();
  }
};

module.exports = Product;
