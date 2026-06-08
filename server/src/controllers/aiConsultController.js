const axios = require('axios');
const https = require('https');

// Создаем HTTPS агент без проверки сертификата (для локального тестирования)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Конфигурация для OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Системный промпт для фармацевта
const SYSTEM_PROMPT = `Ты - опытный фармацевт. Консультируешь пациентов по симптомам.

ПРАВИЛА:
1. Отвечай ПРИМЕРНО 1-5 предложений - подробно но концизно
2. Никаких диагнозов - только рекомендации препаратов
3. При серьезных симптомах - обязательно к врачу
4. Называй конкретные препараты с дозировкой
5. Упомини противопоказания и побочные эффекты
6. Дай практические советы (отдых, питание и т.д.)
7. Будь дружелюбным и понятным

Отвечай на русском языке!`;

async function consult(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(503).json({
        error: 'OpenRouter API не настроен. Проверьте переменную окружения OPENROUTER_API_KEY.',
      });
    }

    // Отправляем запрос к OpenRouter API
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
        },
        httpsAgent: httpsAgent,
        timeout: 30000,
      }
    );

    const botResponse = response.data.choices[0]?.message?.content || '';

    return res.json({ response: botResponse.trim() });
  } catch (error) {
    console.error('AI Consult Error:', error.message);

    if (error.response?.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return res.status(503).json({
        error: 'Ошибка аутентификации OpenRouter. Проверьте API ключ.',
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Не удается подключиться к сервису GigaChat. Проверьте интернет-соединение.',
      });
    }

    if (error.response?.status >= 500) {
      return res.status(503).json({
        error: 'Сервис GigaChat временно недоступен. Попробуйте позже.',
      });
    }

    return res.status(500).json({ error: 'Ошибка при обработке запроса: ' + error.message });
  }
}

module.exports = {
  consult,
};
