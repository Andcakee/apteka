exports.up = function(knex) {
  return knex.schema.table('products', function(table) {
    table.string('category').defaultTo('Другое');
  });
};

exports.down = function(knex) {
  return knex.schema.table('products', function(table) {
    table.dropColumn('category');
  });
};
