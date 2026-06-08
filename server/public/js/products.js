// Простая логика получения списка продуктов и отрисовки в элементе с id="products"
async function fetchProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const container = document.getElementById('products');
  if (!container) return;
  container.innerHTML = products.map(p => `\n    <div class="product">\n      <h3>${p.title}</h3>\n      <p>${p.description}</p>\n      <p>Price: ${p.price}</p>\n      <button data-id="${p.id}" class="add-to-cart">Добавить в корзину</button>\n    </div>\n  `).join('');

  container.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = btn.getAttribute('data-id');
      // Без авторизации добавляем тестовый userId=1
      const body = { userId: 1, productId: parseInt(productId,10), quantity: 1 };
      try {
        const response = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (response.ok) {
          showToast('Товар добавлен в корзину', 'success', 3000);
        } else {
          showToast('Ошибка при добавлении в корзину', 'error', 3000);
        }
      } catch (error) {
        console.error('Ошибка:', error);
        showToast('Ошибка при добавлении в корзину', 'error', 3000);
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', fetchProducts);
