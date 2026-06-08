const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Удаляем существующие заказы и пользователей (кроме администраторов)
  await knex('order_items').del().catch(() => {});
  await knex('orders').del().catch(() => {});

  // Получаем существующих пользователей
  const existingUsers = await knex('users').select('id').catch(() => []);
  const adminUsers = await knex('users').where('role', 'admin').select('id').catch(() => []);

  // Если нет пользователей, создаем тестовых
  if (existingUsers.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await knex('users').insert([
      {
        id: 1,
        email: 'admin@apteka.ru',
        password_hash: hashedPassword,
        name: 'Администратор',
        role: 'admin'
      },
      {
        id: 2,
        email: 'pharmacist@apteka.ru',
        password_hash: hashedPassword,
        name: 'Фармацевт Иван',
        role: 'pharmacist'
      },
      {
        id: 3,
        email: 'client1@example.com',
        password_hash: hashedPassword,
        name: 'Иван Петров',
        role: 'user'
      },
      {
        id: 4,
        email: 'client2@example.com',
        password_hash: hashedPassword,
        name: 'Мария Сидорова',
        role: 'user'
      },
      {
        id: 5,
        email: 'client3@example.com',
        password_hash: hashedPassword,
        name: 'Петр Иванов',
        role: 'user'
      },
      {
        id: 6,
        email: 'client4@example.com',
        password_hash: hashedPassword,
        name: 'Анна Смирнова',
        role: 'user'
      },
      {
        id: 7,
        email: 'client5@example.com',
        password_hash: hashedPassword,
        name: 'Сергей Волков',
        role: 'user'
      }
    ]);
  }

  // Создаем тестовые заказы
  const now = new Date();
  const orders = [
    {
      id: 1,
      user_id: 3,
      status: 'pending',
      total: 2199,
      notes: 'Срочно нужно',
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      user_id: 4,
      status: 'processing',
      total: 1520,
      notes: 'Доставить после 18:00',
      created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 6 * 60 * 60 * 1000)
    },
    {
      id: 3,
      user_id: 5,
      status: 'completed',
      total: 850,
      notes: '',
      created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      user_id: 6,
      status: 'pending',
      total: 3250,
      notes: 'Требуется консультация фармацевта',
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    },
    {
      id: 5,
      user_id: 7,
      status: 'processing',
      total: 1450,
      notes: '',
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000)
    },
    {
      id: 6,
      user_id: 3,
      status: 'completed',
      total: 2100,
      notes: '',
      created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 48 * 60 * 60 * 1000)
    },
    {
      id: 7,
      user_id: 4,
      status: 'pending',
      total: 899,
      notes: 'Узнать наличие',
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 6 * 60 * 60 * 1000)
    },
    {
      id: 8,
      user_id: 5,
      status: 'processing',
      total: 4200,
      notes: 'Большой заказ',
      created_at: new Date(now.getTime() - 18 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 8 * 60 * 60 * 1000)
    }
  ];

  // Вставляем заказы
  await knex('orders').insert(orders).catch(() => {});

  // Создаем позиции в заказах
  const orderItems = [
    // Заказ 1
    { id: 1, order_id: 1, product_id: 1, quantity: 2, price: 399, created_at: orders[0].created_at, updated_at: orders[0].updated_at },
    { id: 2, order_id: 1, product_id: 5, quantity: 1, price: 1250, created_at: orders[0].created_at, updated_at: orders[0].updated_at },
    { id: 3, order_id: 1, product_id: 12, quantity: 1, price: 450, created_at: orders[0].created_at, updated_at: orders[0].updated_at },
    
    // Заказ 2
    { id: 4, order_id: 2, product_id: 2, quantity: 1, price: 320, created_at: orders[1].created_at, updated_at: orders[1].updated_at },
    { id: 5, order_id: 2, product_id: 3, quantity: 2, price: 280, created_at: orders[1].created_at, updated_at: orders[1].updated_at },
    { id: 6, order_id: 2, product_id: 4, quantity: 2, price: 150, created_at: orders[1].created_at, updated_at: orders[1].updated_at },
    
    // Заказ 3
    { id: 7, order_id: 3, product_id: 6, quantity: 1, price: 320, created_at: orders[2].created_at, updated_at: orders[2].updated_at },
    { id: 8, order_id: 3, product_id: 11, quantity: 1, price: 120, created_at: orders[2].created_at, updated_at: orders[2].updated_at },
    { id: 9, order_id: 3, product_id: 13, quantity: 3, price: 25, created_at: orders[2].created_at, updated_at: orders[2].updated_at },
    
    // Заказ 4
    { id: 10, order_id: 4, product_id: 7, quantity: 1, price: 420, created_at: orders[3].created_at, updated_at: orders[3].updated_at },
    { id: 11, order_id: 4, product_id: 8, quantity: 1, price: 210, created_at: orders[3].created_at, updated_at: orders[3].updated_at },
    { id: 12, order_id: 4, product_id: 9, quantity: 2, price: 350, created_at: orders[3].created_at, updated_at: orders[3].updated_at },
    { id: 13, order_id: 4, product_id: 15, quantity: 1, price: 520, created_at: orders[3].created_at, updated_at: orders[3].updated_at },
    { id: 14, order_id: 4, product_id: 14, quantity: 1, price: 350, created_at: orders[3].created_at, updated_at: orders[3].updated_at },
    
    // Заказ 5
    { id: 15, order_id: 5, product_id: 16, quantity: 1, price: 65, created_at: orders[4].created_at, updated_at: orders[4].updated_at },
    { id: 16, order_id: 5, product_id: 17, quantity: 1, price: 280, created_at: orders[4].created_at, updated_at: orders[4].updated_at },
    { id: 17, order_id: 5, product_id: 18, quantity: 2, price: 50, created_at: orders[4].created_at, updated_at: orders[4].updated_at },
    { id: 18, order_id: 5, product_id: 19, quantity: 1, price: 420, created_at: orders[4].created_at, updated_at: orders[4].updated_at },
    
    // Заказ 6
    { id: 19, order_id: 6, product_id: 10, quantity: 2, price: 180, created_at: orders[5].created_at, updated_at: orders[5].updated_at },
    { id: 20, order_id: 6, product_id: 20, quantity: 1, price: 180, created_at: orders[5].created_at, updated_at: orders[5].updated_at },
    { id: 21, order_id: 6, product_id: 1, quantity: 3, price: 399, created_at: orders[5].created_at, updated_at: orders[5].updated_at },
    
    // Заказ 7
    { id: 22, order_id: 7, product_id: 2, quantity: 2, price: 320, created_at: orders[6].created_at, updated_at: orders[6].updated_at },
    { id: 23, order_id: 7, product_id: 4, quantity: 1, price: 150, created_at: orders[6].created_at, updated_at: orders[6].updated_at },
    
    // Заказ 8
    { id: 24, order_id: 8, product_id: 5, quantity: 2, price: 1250, created_at: orders[7].created_at, updated_at: orders[7].updated_at },
    { id: 25, order_id: 8, product_id: 6, quantity: 2, price: 320, created_at: orders[7].created_at, updated_at: orders[7].updated_at },
    { id: 26, order_id: 8, product_id: 12, quantity: 1, price: 450, created_at: orders[7].created_at, updated_at: orders[7].updated_at }
  ];

  await knex('order_items').insert(orderItems).catch(() => {});
};
