const knex = require('../../db/knex');

const User = {
  async create({ email, password_hash, name }) {
    const [id] = await knex('users').insert({ email, password_hash, name });
    return knex('users').where({ id }).first();
  },
  async findByEmail(email) {
    return knex('users').where({ email }).first();
  },
  async findById(id) {
    return knex('users').where({ id }).first();
  }
};

module.exports = User;
