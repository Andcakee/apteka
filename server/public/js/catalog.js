// catalog.js - Логика каталога для фильтрации, сортировки и пагинации

class Catalog {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 12; // 3 строки × 4 товара
        this.totalPages = 5;
        this.allProducts = [];
        this.filteredProducts = [];
        this.selectedCategories = [];
        this.stockFilter = 'all';
        this.priceMin = 0;
        this.priceMax = 10000;
        this.sortBy = 'name';
        this.searchQuery = '';
    }

    async init() {
        await this.loadProducts();
        this.setupFilters();
        this.render();
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                this.allProducts = await response.json();
                this.filteredProducts = [...this.allProducts];
                // Пересчитываем количество страниц
                this.totalPages = Math.ceil(this.allProducts.length / this.itemsPerPage) || 1;
            } else {
                console.error('Ошибка загрузки товаров');
                // Fallback на products-data.js если доступен
                if (typeof products !== 'undefined') {
                    this.allProducts = products;
                    this.filteredProducts = [...products];
                    this.totalPages = Math.ceil(this.allProducts.length / this.itemsPerPage) || 1;
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            // Fallback на products-data.js если доступен
            if (typeof products !== 'undefined') {
                this.allProducts = products;
                this.filteredProducts = [...products];
                this.totalPages = Math.ceil(this.allProducts.length / this.itemsPerPage) || 1;
            }
        }
    }

    setupFilters() {
        // Обработчики к категориям с чекбоксами
        const categories = [
            { id: 'cat_all', value: '' },
            { id: 'cat_vitamins', value: 'Витамины' },
            { id: 'cat_painkillers', value: 'Обезболивающие' },
            { id: 'cat_cold', value: 'От простуды' },
            { id: 'cat_allergy', value: 'Аллергия' },
            { id: 'cat_gastro', value: 'Гастро' }
        ];

        categories.forEach(cat => {
            const el = document.getElementById(cat.id);
            if (el) {
                el.addEventListener('change', () => {
                    if (cat.id === 'cat_all') {
                        // Если выбран "все категории", снимаем остальные
                        if (el.checked) {
                            categories.forEach(c => {
                                if (c.id !== 'cat_all') {
                                    document.getElementById(c.id).checked = false;
                                }
                            });
                            this.selectedCategories = [];
                        }
                    } else {
                        // Если выбрана конкретная категория, убираем "все"
                        if (el.checked) {
                            document.getElementById('cat_all').checked = false;
                            this.selectedCategories.push(cat.value);
                        } else {
                            this.selectedCategories = this.selectedCategories.filter(c => c !== cat.value);
                        }
                    }
                    // Применяем фильтры и обновляем отображение
                    this.applyFilters();
                });
            }
        });

        // Радиокнопки для наличия
        const stockFilters = [
            { id: 'stock_all', value: 'all' },
            { id: 'stock_available', value: 'available' },
            { id: 'stock_low', value: 'low' }
        ];

        stockFilters.forEach(sf => {
            const el = document.getElementById(sf.id);
            if (el) {
                el.addEventListener('change', () => {
                    if (el.checked) {
                        this.stockFilter = sf.value;
                        // Применяем фильтры и обновляем отображение
                        this.applyFilters();
                    }
                });
            }
        });

        // Цена
        const priceMinEl = document.getElementById('priceMin');
        const priceMaxEl = document.getElementById('priceMax');
        if (priceMinEl) priceMinEl.addEventListener('input', () => {
            this.priceMin = parseInt(priceMinEl.value) || 0;
            // Применяем фильтры и обновляем отображение
            this.applyFilters();
        });
        if (priceMaxEl) priceMaxEl.addEventListener('input', () => {
            this.priceMax = parseInt(priceMaxEl.value) || 10000;
            // Применяем фильтры и обновляем отображение
            this.applyFilters();
        });

        // Поиск
        const searchEl = document.getElementById('searchInput');
        if (searchEl) {
            searchEl.addEventListener('input', () => {
                this.searchQuery = searchEl.value.toLowerCase();
                this.currentPage = 1; // Сбрасываем на первую страницу
                this.applyFilters();
            });
        }

        // Сортировка
        const sortEl = document.getElementById('sortSelect');
        if (sortEl) {
            sortEl.addEventListener('change', () => {
                this.sortBy = sortEl.value;
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        // Фильтруем товары
        this.filteredProducts = this.allProducts.filter(product => {
            // По поиску
            if (this.searchQuery) {
                const matchesSearch = (product.title && product.title.toLowerCase().includes(this.searchQuery)) ||
                                    (product.name && product.name.toLowerCase().includes(this.searchQuery)) ||
                                    (product.description && product.description.toLowerCase().includes(this.searchQuery));
                if (!matchesSearch) {
                    return false;
                }
            }

            // По категориям
            if (this.selectedCategories.length > 0) {
                if (!this.selectedCategories.includes(product.category)) {
                    return false;
                }
            }

            // По цене
            if (product.price < this.priceMin || product.price > this.priceMax) {
                return false;
            }

            // По наличию
            if (this.stockFilter === 'available' && product.stock <= 0) {
                return false;
            }
            if (this.stockFilter === 'low' && product.stock >= 30) {
                return false;
            }

            return true;
        });

        // Сортируем
        this.sortProducts();

        // Результаты
        const totalCount = this.filteredProducts.length;
        document.getElementById('totalCount').textContent = totalCount;

        this.totalPages = Math.ceil(totalCount / this.itemsPerPage) || 1;
        if (this.currentPage > this.totalPages) {
            this.currentPage = 1;
        }

        this.render();
    }

    sortProducts() {
        switch (this.sortBy) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'price_asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'stock':
                this.filteredProducts.sort((a, b) => b.stock - a.stock);
                break;
        }
    }

    render() {
        this.renderProducts();
        this.renderPagination();
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const noProducts = document.getElementById('noProducts');

        if (this.filteredProducts.length === 0) {
            grid.style.display = 'none';
            noProducts.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noProducts.style.display = 'none';

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(start, end);

        grid.innerHTML = pageProducts.map(product => this.createProductCard(product)).join('');

        // Привязка кнопок открыть карточку товара (клик на карточку)
        const productCards = grid.querySelectorAll('.product-card');
        productCards.forEach((card, idx) => {
            const product = pageProducts[idx];
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Если клик не на кнопке "В корзину", открываем карточку
                if (e.target.className !== 'add-to-cart') {
                    openProductCard(product);
                }
            });
        });

        // Привязка кнопок добавить в корзину
        const addBtns = grid.querySelectorAll('.add-to-cart');
        addBtns.forEach((btn) => {
            const productId = parseInt(btn.dataset.productId, 10);
            const product = pageProducts.find(p => p.id === productId);
            if (!product) return;
            btn.textContent = product.stock > 0 ? 'В корзину' : 'Нет в наличии';
            btn.disabled = product.stock <= 0;

            btn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Чтобы не открывалась карточка
                if (product.stock > 0) {
                    const productName = product.title || product.name || '';
                    await addToCartProduct(product.id, productName);
                }
            });
        });
    }

    createProductCard(product) {
        const stockClass = product.stock <= 0 ? 'out' : product.stock < 30 ? 'low' : '';
        const stockText = product.stock > 0 ? `${product.stock} шт` : 'Нет в наличии';
        const imageUrl = product.image || product.imageUrl || '';
        const name = product.title || product.name || '';
        const category = product.category || 'Товар';

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="placeholder" style="display:none;">
                        <i class="fas fa-pill"></i>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${category}</div>
                    <div class="product-name">${name}</div>
                    <div class="product-footer">
                        <div class="product-price">${product.price} ₽</div>
                        <div class="product-stock ${stockClass}">${stockText}</div>
                    </div>
                    <button class="add-to-cart" data-product-id="${product.id}">В корзину</button>
                </div>
            </div>
        `;
    }

    renderPagination() {
        const paginationEl = document.getElementById('pagination');
        let html = '';

        // Предыдущая
        if (this.currentPage > 1) {
            html += `<button onclick="catalog.goToPage(${this.currentPage - 1})">←</button>`;
        }

        // Номера страниц
        for (let i = 1; i <= this.totalPages; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            html += `<button class="${activeClass}" onclick="catalog.goToPage(${i})">${i}</button>`;
        }

        // Следующая
        if (this.currentPage < this.totalPages) {
            html += `<button onclick="catalog.goToPage(${this.currentPage + 1})">→</button>`;
        }

        paginationEl.innerHTML = html;
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

// Функция для открытия карточки товара
function openProductCard(product) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalProductContent');
    
    const stockText = product.stock > 0 ? `${product.stock} шт в наличии` : 'Нет в наличии';
    const stockClass = product.stock <= 0 ? 'out' : product.stock < 30 ? 'low' : '';
    const imageUrl = product.image || product.imageUrl || '';
    const name = product.title || product.name || '';
    const category = product.category || 'Товар';
    const description = product.description || 'Нет описания';
    const usage = product.usage || 'По инструкции';
    const contraindications = product.contraindications || 'Индивидуальная непереносимость';
    const storage = product.storage || 'При комнатной температуре';
    
    let benefits = product.benefits;
    if (typeof benefits === 'string') {
        try {
            benefits = JSON.parse(benefits);
        } catch (e) {
            benefits = [benefits];
        }
    }
    
    let benefitsHtml = '';
    if (benefits && Array.isArray(benefits) && benefits.length > 0) {
        benefitsHtml = `<ul class="benefits-list">${benefits.map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join('')}</ul>`;
    }
    
    modalContent.innerHTML = `
        <div class="modal-grid">
            <div class="modal-image">
                <img src="${imageUrl}" alt="${name}" onerror="this.style.display='none'; this.parentElement.querySelector('.placeholder-img').style.display='flex';" style="width:100%; height:400px; object-fit:cover; border-radius:12px;">
                <div class="placeholder-img" style="display:none;"><i class="fas fa-pill"></i></div>
            </div>
            
            <div class="modal-info">
                <h2>${name}</h2>
                <div class="modal-category">${category}</div>
                
                <div class="modal-price-section">
                    <div class="modal-price">${product.price} ₽</div>
                    <div class="modal-stock ${stockClass}">${stockText}</div>
                </div>
                
                <div class="modal-description">
                    <p><strong>Описание:</strong> ${description}</p>
                </div>
                
                ${benefitsHtml ? `<div class="modal-benefits"><strong>Преимущества:</strong>${benefitsHtml}</div>` : ''}
                
                <div class="modal-details">
                    <div class="detail-item">
                        <strong>Способ применения:</strong>
                        <p>${usage}</p>
                    </div>
                    <div class="detail-item">
                        <strong>Противопоказания:</strong>
                        <p>${contraindications}</p>
                    </div>
                    <div class="detail-item">
                        <strong>Условия хранения:</strong>
                        <p>${storage}</p>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-add-to-cart" data-product-id="${product.id}" data-product-name="${encodeURIComponent(name)}" ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const addBtn = modalContent.querySelector('.btn-add-to-cart');
    if (addBtn && !addBtn.disabled) {
        addBtn.addEventListener('click', async () => {
            const productId = parseInt(addBtn.dataset.productId, 10);
            const productName = decodeURIComponent(addBtn.dataset.productName || '');
            await addToCartFromModal(productId, productName);
        });
    }

    modal.style.display = 'flex';
}

// Функция для закрытия карточки
function closeProductCard() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

// Функция для добавления в корзину из карточки товара
async function addToCartFromModal(productId, productName) {
    await addToCartProduct(productId, productName, true);
}

async function addToCartProduct(productId, productName, closeModalOnSuccess = false) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Пожалуйста, войдите в аккаунт или зарегистрируйтесь чтобы добавить товар в корзину', 'warning');
        return;
    }
    
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        const body = { productId, quantity: 1 };
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            showToast(`"${productName}" добавлен в корзину`, 'success');
            if (window.auth && window.auth.fetchCartCount) {
                window.auth.fetchCartCount();
            }
            if (closeModalOnSuccess) {
                closeProductCard();
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            showToast(errorData.error || 'Ошибка при добавлении товара', 'error');
        }
    } catch (err) {
        console.error('Ошибка:', err);
        showToast('Ошибка при добавлении товара', 'error');
    }
}

// Закрытие модального окна при клике на пустую область
window.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeProductCard();
    }
});

// Закрытие модального окна при нажатии Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('productModal');
        if (modal && modal.style.display === 'flex') {
            closeProductCard();
        }
    }
});

// Инициализируем каталог
let catalog;
document.addEventListener('DOMContentLoaded', async () => {
    catalog = new Catalog();
    await catalog.init();
});

// Глобальная функция для фильтров
function applyFilters() {
    if (catalog) {
        catalog.applyFilters();
    }
}

function applySorting() {
    if (catalog) {
        catalog.applyFilters();
    }
}
