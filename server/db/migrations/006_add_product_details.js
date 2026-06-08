exports.up = function(knex) {
  return knex.schema.table('products', function(table) {
    table.text('benefits').nullable(); // JSON array
    table.text('usage').nullable();
    table.text('contraindications').nullable();
    table.text('storage').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('products', function(table) {
    table.dropColumn('benefits');
    table.dropColumn('usage');
    table.dropColumn('contraindications');
    table.dropColumn('storage');
  });
};
