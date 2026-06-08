exports.seed = async function(knex) {
  const catalogProducts = require('../../public/js/products-data');

  // Deletes ALL existing entries
  await knex('cart_items').del().catch(() => {});
  await knex('carts').del().catch(() => {});
  await knex('products').del().catch(() => {});
  await knex('users').del().catch(() => {});

  const dbProducts = catalogProducts.map((product) => ({
    id: product.id,
    title: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock || 0,
    image: product.imageUrl || product.image || '',
    category: product.category || 'Другое',
    benefits: product.benefits ? JSON.stringify(product.benefits) : null,
    usage: product.usage || null,
    contraindications: product.contraindications || null,
    storage: product.storage || null
  }));

  await knex('products').insert(dbProducts);
};

