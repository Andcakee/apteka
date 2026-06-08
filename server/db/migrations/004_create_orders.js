exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['pending', 'processing', 'completed', 'cancelled']).defaultTo('pending');
    table.decimal('total', 10, 2).defaultTo(0);
    table.text('notes');
    table.timestamps(true, true);
  }).createTable('order_items', function(table) {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.integer('quantity').unsigned().defaultTo(1);
    table.decimal('price', 10, 2).defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('order_items')
    .dropTableIfExists('orders');
};
