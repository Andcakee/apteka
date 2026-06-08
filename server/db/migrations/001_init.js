exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('password_hash');
      table.string('name');
      table.timestamps(true, true);
    })
    .createTable('products', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.decimal('price', 10, 2).notNullable().defaultTo(0);
      table.string('image');
      table.integer('stock').defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('carts', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
    })
    .createTable('cart_items', function(table) {
      table.increments('id').primary();
      table.integer('cart_id').unsigned().references('id').inTable('carts').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products');
      table.integer('quantity').unsigned().defaultTo(1);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('cart_items')
    .dropTableIfExists('carts')
    .dropTableIfExists('products')
    .dropTableIfExists('users');
};
