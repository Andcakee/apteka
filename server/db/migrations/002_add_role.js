exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.enum('role', ['user', 'admin', 'pharmacist']).defaultTo('user').after('name');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('role');
  });
};
