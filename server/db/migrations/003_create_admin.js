exports.up = function(knex) {
  return knex('users')
    .where({ email: 'admin@apteka.ru' })
    .update({ role: 'admin' })
    .then(() => knex('users').where({ email: 'admin@example.com' }).update({ role: 'admin' }));
};

exports.down = function(knex) {
  return knex('users')
    .whereIn('email', ['admin@apteka.ru', 'admin@example.com'])
    .update({ role: 'user' });
};
