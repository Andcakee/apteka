// Проверяем, авторизован ли пользователь и является ли фармацевтом
function checkPharmacistAccess() {
    if (!window.auth.isLoggedIn()) {
        window.location.href = 'auth.html';
        return false;
    }
    if (!window.auth.isPharmacist()) {
        window.auth.showToast('У вас нет доступа к панели фармацевта', 'error');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        return false;
    }
    return true;
}

let allOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!checkPharmacistAccess()) return;

    // Обработчик логаута
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        window.auth.logout();
    });

    // Переключение табов
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            // Загружаем данные при переключении на вкладку
            if (tabName === 'all-orders' || tabName === 'pending-orders' || tabName === 'processing-orders' || tabName === 'completed-orders') {
                loadOrders();
            } else if (tabName === 'statistics') {
                updateStatistics();
            }
        });
    });

    // Обработчик поиска
    document.getElementById('search-orders').addEventListener('input', filterOrders);

    // Загрузить заказы при открытии страницы
    loadOrders();
});

async function loadOrders() {
    try {
        const response = await fetch('/api/orders', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.auth.logout();
                return;
            }
            throw new Error('Failed to load orders');
        }

        allOrders = await response.json();
        
        // Сортируем заказы по дате (новые сверху)
        allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        displayOrders();
        updateStatistics();
    } catch (err) {
        console.error('Ошибка загрузки заказов:', err);
        document.getElementById('error-msg').textContent = 'Ошибка при загрузке заказов: ' + err.message;
        document.getElementById('error-msg').classList.add('show');
    }
}

function displayOrders() {
    const allOrdersList = document.getElementById('orders-list');
    const pendingList = document.getElementById('pending-list');
    const processingList = document.getElementById('processing-list');
    const completedList = document.getElementById('completed-list');

    // Очищаем таблицы
    allOrdersList.innerHTML = '';
    pendingList.innerHTML = '';
    processingList.innerHTML = '';
    completedList.innerHTML = '';

    if (allOrders.length === 0) {
        allOrdersList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Нет заказов</td></tr>';
        pendingList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Нет заказов в ожидании</td></tr>';
        processingList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Нет заказов в обработке</td></tr>';
        completedList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Нет выполненных заказов</td></tr>';
        return;
    }

    allOrders.forEach(order => {
        const row = createOrderRow(order, true);
        allOrdersList.appendChild(row);

        if (order.status === 'pending') {
            const pendingRow = createOrderRow(order, false);
            pendingList.appendChild(pendingRow);
        } else if (order.status === 'processing') {
            const processingRow = createOrderRow(order, false);
            processingList.appendChild(processingRow);
        } else if (order.status === 'completed') {
            const completedRow = createOrderRow(order, false);
            completedList.appendChild(completedRow);
        }
    });
}

function createOrderRow(order, showStatus = true) {
    const row = document.createElement('tr');
    const date = new Date(order.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusBadge = `<span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span>`;

    if (showStatus) {
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.name || order.email}</td>
            <td>${date}</td>
            <td>${order.total} ₽</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="showOrderDetails(${order.id})">Просмотр</button>
            </td>
        `;
    } else {
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.name || order.email}</td>
            <td>${date}</td>
            <td>${order.total} ₽</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="showOrderDetails(${order.id})">Просмотр</button>
            </td>
        `;
    }

    return row;
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'В ожидании',
        'processing': 'В обработке',
        'completed': 'Выполнено',
        'cancelled': 'Отменено'
    };
    return labels[status] || status;
}

function filterOrders() {
    const searchTerm = document.getElementById('search-orders').value.toLowerCase();
    const allOrdersList = document.getElementById('orders-list');
    
    allOrdersList.querySelectorAll('tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function showOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('order-modal');
    const modalBody = document.getElementById('modal-body');

    const date = new Date(order.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusBadge = `<span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span>`;

    let itemsHtml = `<div style="display: flex; flex-direction: column; gap: 15px;">`;

    // Отображаем товары заказа с фото
    if (order.items && order.items.length > 0) {
        console.log('Товары в заказе:', order.items);
        order.items.forEach(item => {
            const itemSum = (item.price * item.quantity).toFixed(2);
            console.log('Товар:', item.title, 'Фото:', item.image);
            itemsHtml += `
                <div style="display: flex; gap: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px; background: #f9f9f9;">
                    <div style="flex-shrink: 0;">
                        <img src="${item.image || 'https://via.placeholder.com/100?text=Товар'}" alt="${item.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;">
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0; color: #2a7fba;">${item.title || 'Товар #' + item.product_id}</h4>
                        <p style="margin: 5px 0; color: #666;">Количество: <strong>${item.quantity}</strong></p>
                        <p style="margin: 5px 0; color: #666;">Цена за единицу: <strong>${item.price} ₽</strong></p>
                        <p style="margin: 5px 0; color: #333; font-weight: bold;">Итого: ${itemSum} ₽</p>
                    </div>
                </div>
            `;
        });
    } else {
        console.log('Нет товаров в заказе или items не загружены');
    }

    itemsHtml += `</div>`;

    modalBody.innerHTML = `
        <div class="order-details">
            <div class="order-details-item">
                <strong>Номер заказа:</strong> #${order.id}
            </div>
            <div class="order-details-item">
                <strong>Клиент:</strong> ${order.name || order.email}
            </div>
            <div class="order-details-item">
                <strong>Email:</strong> ${order.email}
            </div>
            <div class="order-details-item">
                <strong>Дата заказа:</strong> ${date}
            </div>
            <div class="order-details-item">
                <strong>Статус:</strong> ${statusBadge}
            </div>
            <div class="order-details-item">
                <strong>Примечания:</strong> ${order.notes || '-'}
            </div>
        </div>

        <h3 style="margin-top: 20px; color: #2a7fba;">Товары в заказе</h3>
        ${itemsHtml}

        <div style="margin-top: 20px; text-align: right; padding: 20px; background: #f0f0f0; border-radius: 5px;">
            <h3 style="color: #2a7fba;">Итого: ${order.total} ₽</h3>
        </div>

        <div style="margin-top: 20px;">
            <label for="status-select" style="display: block; margin-bottom: 10px; font-weight: bold;">
                Изменить статус:
            </label>
            <div style="display: flex; gap: 10px;">
                <select id="status-select" class="status-select">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>В ожидании</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Выполнено</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменено</option>
                </select>
                <button class="btn btn-success" onclick="updateOrderStatus(${orderId})">Сохранить</button>
            </div>
        </div>
    `;

    modal.classList.add('show');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.remove('show');
}

async function updateOrderStatus(orderId) {
    const status = document.getElementById('status-select').value;
    
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            window.auth.showToast('Статус заказа обновлён', 'success');
            closeOrderModal();
            loadOrders();
        } else {
            window.auth.showToast('Ошибка при обновлении статуса', 'error');
        }
    } catch (err) {
        window.auth.showToast('Ошибка подключения: ' + err.message, 'error');
    }
}

function updateStatistics() {
    const stats = {
        total: allOrders.length,
        pending: 0,
        processing: 0,
        completed: 0,
        totalValue: 0
    };

    allOrders.forEach(order => {
        stats.totalValue += parseFloat(order.total) || 0;
        if (order.status === 'pending') stats.pending++;
        else if (order.status === 'processing') stats.processing++;
        else if (order.status === 'completed') stats.completed++;
    });

    const avgOrder = stats.total > 0 ? (stats.totalValue / stats.total).toFixed(2) : 0;

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-processing').textContent = stats.processing;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-total-value').textContent = stats.totalValue.toFixed(2) + ' ₽';
    document.getElementById('stat-avg-order').textContent = avgOrder + ' ₽';
}

// Закрыть модальное окно при клике вне его
document.addEventListener('click', function(event) {
    const modal = document.getElementById('order-modal');
    if (event.target === modal) {
        closeOrderModal();
    }
});
