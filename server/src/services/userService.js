const bcrypt = require('bcrypt');
const User = require('../models/userModel');

module.exports = {
  async register({ email, password, name }) {
    const existing = await User.findByEmail(email);
    if (existing) throw new Error('Email already in use');
    const password_hash = await bcrypt.hash(password, 10);
    return User.create({ email, password_hash, name });
  },

  async validateCredentials(email, password) {
    const user = await User.findByEmail(email);
    if (!user) return { error: 'Пользователь не найден' };
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return { error: 'Неверный пароль' };
    return user;
  },

  async getById(id) {
    return User.findById(id);
  }
};
