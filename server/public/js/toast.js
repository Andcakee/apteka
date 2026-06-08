// Toast уведомления - красивые всплывающие сообщения

// Создаем контейнер для toast'ов если его еще нет
function initToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

// Функция для показания toast уведомления
function showToast(message, type = 'info', duration = 3000) {
    initToastContainer();
    
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Выбираем цвета в зависимости от типа
    let bgColor, borderColor, icon;
    switch(type) {
        case 'success':
            bgColor = '#4caf50';
            borderColor = '#45a049';
            icon = '✓';
            break;
        case 'error':
            bgColor = '#f44336';
            borderColor = '#da190b';
            icon = '✕';
            break;
        case 'warning':
            bgColor = '#ff9800';
            borderColor = '#e68900';
            icon = '⚠';
            break;
        case 'info':
        default:
            bgColor = '#2a7fba';
            borderColor = '#1a6ea0';
            icon = 'ℹ';
    }
    
    toast.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        font-size: 14px;
        font-weight: 500;
        max-width: 350px;
        word-wrap: break-word;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease-out;
        pointer-events: auto;
        cursor: pointer;
        border-left: 4px solid ${borderColor};
    `;
    
    toast.innerHTML = `
        <span style="font-size: 18px; font-weight: bold; flex-shrink: 0;">${icon}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Закрытие при клике
    toast.addEventListener('click', () => {
        toast.remove();
    });
    
    // Автоматическое закрытие
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
