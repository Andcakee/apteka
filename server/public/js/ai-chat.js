class ChatConsultant {
    constructor() {
        this.messagesContainer = document.getElementById('messages');
        this.inputField = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.suggestedButtons = document.querySelectorAll('.suggest-btn');

        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Обработчик для предложенных вопросов
        this.suggestedButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.sendMessage(btn.textContent);
            });
        });
    }

    showWelcomeMessage() {
        this.addMessage(
            'Здравствуйте! 👋 Я - виртуальный консультант аптеки. Расскажите мне о ваших симптомах, и я помогу вам найти подходящие препараты. Имейте в виду, что я консультант, а не доктор - при серьёзных проблемах обратитесь к врачу.',
            'bot'
        );
    }

    async sendMessage(text = null) {
        const message = text || this.inputField.value.trim();

        if (!message) {
            alert('Пожалуйста, введите ваш вопрос');
            return;
        }

        // Добавляем сообщение пользователя
        this.addMessage(message, 'user');
        this.inputField.value = '';
        this.inputField.focus();

        // Отключаем кнопку отправки
        this.sendBtn.disabled = true;

        // Показываем индикатор загрузки
        this.addMessage('⏳ Фармацевт думает...', 'loading');

        try {
            const response = await fetch('/api/ai/consult', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            // Удаляем сообщение о загрузке
            this.removeLastMessage();

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            const data = await response.json();
            this.addMessage(data.response, 'bot');
        } catch (error) {
            // Удаляем сообщение о загрузке
            this.removeLastMessage();

            console.error('Error:', error);
            this.addMessage(
                `❌ Ошибка: ${error.message}\n\nПожалуйста, попробуйте позже или обратитесь в поддержку.`,
                'error'
            );
        } finally {
            this.sendBtn.disabled = false;
            this.inputField.focus();
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);

        // Прокручиваем к последнему сообщению
        this.scrollToBottom();
    }

    removeLastMessage() {
        const lastMessage = this.messagesContainer.lastChild;
        if (lastMessage) {
            lastMessage.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Инициализируем чат когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    new ChatConsultant();
});
