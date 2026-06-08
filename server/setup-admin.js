const knex = require('./db/knex');

async function setupAdmin() {
  try {
    // Проверим, есть ли admin
    const admin = await knex('users').where({ email: 'admin@apteka.ru' }).first();
    if (!admin) {
      console.log('Admin не найден. Создание...');
      // Регистрируем админа вручную
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('admin123456', 10);
      await knex('users').insert({
        email: 'admin@apteka.ru',
        name: 'Administrator',
        password_hash: passwordHash,
        role: 'admin'
      });
      console.log('✅ Admin создан: admin@apteka.ru / admin123456');
    } else {
      // Обновляем роль на admin
      await knex('users').where({ email: 'admin@apteka.ru' }).update({ role: 'admin' });
      console.log('✅ Admin обновлён');
    }
    console.log('✅ Setup complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  }
}

setupAdmin();
