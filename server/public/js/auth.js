// Добавить CSS для user-menu если его ещё нет
if (!document.getElementById('user-menu-styles')) {
  const style = document.createElement('style');
  style.id = 'user-menu-styles';
  style.textContent = `
    .user-menu-wrapper {
      position: relative;
      display: inline-block;
      margin-left: 15px;
    }
    
    .user-profile-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
    }
    
    .user-profile-btn:hover {
      opacity: 0.8;
    }
    
    .user-menu-dropdown {
      display: none;
      position: absolute;
      right: 0;
      top: 100%;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 200px;
      margin-top: 5px;
    }
    
    .user-menu-dropdown.show {
      display: block;
    }
    
    .user-menu-dropdown a,
    .user-menu-dropdown button {
      display: block;
      width: 100%;
      padding: 10px 15px;
      text-align: left;
      background: none;
      border: none;
      color: #333;
      text-decoration: none !important;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background-color 0.2s;
      border-bottom: none !important;
    }
    
    .user-menu-dropdown a:hover,
    .user-menu-dropdown button:hover {
      background: #f0f0f0;
    }
    
    .user-menu-dropdown button.logout-btn {
      color: #f44336;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
}

// Функция для показа toast-уведомлений
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3';
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
    min-width: 250px;
    font-size: 14px;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Добавить CSS анимации если их ещё нет
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Простой фронтенд для регистрации/логина и сохранения токена в localStorage
async function register(email, password, name) {
  const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
  return res.json();
}

async function login(email, password) {
  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('role', data.role || 'user');
      
      showToast('Успешный вход!', 'success');
      updateCartCountVisibility();
      
      // Редирект после логина
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
      } else {
        window.location.href = 'index.html';
      }
    } else {
      showToast(data.error || 'Ошибка при входе', 'error');
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    showToast('Ошибка подключения', 'error');
    return null;
  }
}

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function fetchProfile() {
  const res = await fetch('/api/profile', { headers: authHeader() });
  if (res.status === 401) return null;
  return res.json();
}

async function addToCartAuth(productId, quantity = 1) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, authHeader());
  const res = await fetch('/api/cart', { method: 'POST', headers, body: JSON.stringify({ productId, quantity }) });
  return res.json();
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('role');
  updateCartCountVisibility();
  window.location.href = 'auth.html';
}

function getRole() {
  return localStorage.getItem('role') || 'user';
}

function isAdmin() {
  return getRole() === 'admin';
}

function isPharmacist() {
  return getRole() === 'pharmacist';
}

async function addToCart(productId, quantity = 1) {
   if (!isLoggedIn()) {
     showToast('Пожалуйста авторизируйтесь чтобы добавить товар в корзину', 'warning', 3000);
     return;
   }
   try {
     const result = await addToCartAuth(productId, quantity);
     if (result && (result.id || result.cart_item_id || result.cart_id)) {
       showToast('Товар добавлен в корзину', 'success', 3000);
       if (window.auth && window.auth.fetchCartCount) {
         window.auth.fetchCartCount();
       }
     } else if (result && result.error) {
       showToast(result.error, 'error', 3000);
     } else {
       showToast('Ошибка при добавлении в корзину', 'error', 3000);
     }
   } catch (error) {
     console.error('Ошибка при добавлении в корзину:', error);
     showToast('Ошибка при добавлении в корзину', 'error', 3000);
   }
}

function handleLogoutBtn() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function handleAuthBtn() {
  const authBtn = document.getElementById('auth-btn');
  const adminBtn = document.getElementById('admin-btn');
  
  if (authBtn) {
    if (isLoggedIn()) {
      // Показываем счетчик при авторизации
      updateCartCountVisibility();
      
      // Если пользователь авторизован - показываем иконку профиля со dropdown меню
      const wrapper = document.createElement('div');
      wrapper.className = 'user-menu-wrapper';
      wrapper.id = 'user-menu-wrapper';
      
      const profileBtn = document.createElement('button');
      profileBtn.className = 'user-profile-btn';
      profileBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
      profileBtn.setAttribute('title', 'Профиль');
      
      const dropdown = document.createElement('div');
      dropdown.className = 'user-menu-dropdown';
      dropdown.id = 'user-menu-dropdown';
      
      let dropdownHTML = `
        <a href="profile.html"><i class="fas fa-user"></i> Мой профиль</a>
      `;
      
      // Добавляем ссылку на панель администратора
      if (isAdmin()) {
        dropdownHTML += `<a href="admin.html"><i class="fas fa-cogs"></i> Админ-панель</a>`;
      }
      
      // Добавляем ссылку на панель фармацевта
      if (isPharmacist()) {
        dropdownHTML += `<a href="pharmacist.html"><i class="fas fa-pills"></i> Панель фармацевта</a>`;
      }
      
      dropdownHTML += `<button class="logout-btn"><i class="fas fa-sign-out-alt"></i> Выход</button>`;
      
      dropdown.innerHTML = dropdownHTML;
      
      wrapper.appendChild(profileBtn);
      wrapper.appendChild(dropdown);
      
      // Заменяем старую кнопку на новую
      authBtn.parentNode.replaceChild(wrapper, authBtn);
      
      // Обработчик для показа/скрытия dropdown
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });
      
      // Обработчик для выхода
      const logoutBtn = dropdown.querySelector('.logout-btn');
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
      
      // Закрываем dropdown при клике вне его
      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    } else {
      // Если пользователь не авторизован - показываем "Войти"
      authBtn.innerHTML = 'Войти';
      authBtn.href = 'auth.html';
      authBtn.id = 'auth-btn';
      authBtn.style.padding = '8px 15px';
      authBtn.style.background = 'white';
      authBtn.style.color = '#2a7fba';
      authBtn.style.borderRadius = '5px';
      authBtn.style.textDecoration = 'none';
      authBtn.style.fontWeight = 'bold';
      // Скрываем счетчик если не авторизован
      updateCartCountVisibility();
    }
  }
}

// Функция для управления видимостью cart-count
function updateCartCountVisibility() {
  const cartCountElements = document.querySelectorAll('.cart-count');
  
  if (isLoggedIn()) {
    // Показываем cart-count для залогиненного пользователя через класс
    cartCountElements.forEach(el => {
      el.classList.add('visible');
    });
    // Загружаем реальное количество товаров в корзине асинхронно
    setTimeout(() => fetchCartCount(), 100);
  } else {
    // Скрываем cart-count для незалогиненного пользователя
    cartCountElements.forEach(el => {
      el.classList.remove('visible');
      el.textContent = '0';
    });
  }
}

// Функция для получения количества товаров в корзине
async function fetchCartCount() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('[Auth] No userId found, skipping cart count fetch');
      return;
    }
    
    const res = await fetch(`/api/cart/${userId}`, { headers: authHeader() });
    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : (data.count || data.items?.length || 0);
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(el => {
        el.textContent = count > 0 ? count : '0';
        el.classList.add('visible');
        console.log('[Auth] Cart count element updated:', count);
      });
      console.log('[Auth] Cart count fetched:', count);
    } else {
      console.error('[Auth] Failed to fetch cart:', res.status);
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Auth] DOMContentLoaded - вызываем handleAuthBtn()');
  handleAuthBtn();
  handleLogoutBtn();
  updateCartCountVisibility();
});

// Также обновляем кнопку, когда страница полностью загружена
window.addEventListener('load', () => {
  console.log('[Auth] Window load - вызываем handleAuthBtn() и fetchCartCount()');
  handleAuthBtn();
  if (isLoggedIn()) {
    fetchCartCount();
  }
});

window.auth = { register, login, fetchProfile, addToCartAuth, isLoggedIn, logout, addToCart, handleAuthBtn, handleLogoutBtn, showToast, getRole, isAdmin, isPharmacist, updateCartCountVisibility, fetchCartCount };
