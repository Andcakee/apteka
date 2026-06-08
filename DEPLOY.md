# 🚀 Развертывание на Render.com

## Шаг 1: Подготовка GitHub репозитория

1. Если ещё нет GitHub аккаунта - создай на https://github.com
2. Загрузи проект на GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ТВО_ЛОГИН/apteka-pois.git
git push -u origin main
```

## Шаг 2: Развертывание на Render

1. Зайди на https://render.com
2. Нажми "New +" → "Web Service"
3. Выбери "Deploy an existing Git repository"
4. Вставь URL твоего GitHub репозитория
5. Выбери "Connect" и авторизуйся через GitHub
6. Заполни параметры:
   - **Name:** apteka-pois (или как хочешь)
   - **Branch:** main
   - **Runtime:** Node
   - **Build Command:** `npm install --prefix server`
   - **Start Command:** `npm start --prefix server`
   - **Plan:** Free

7. Нажми "Create Web Service"

## Шаг 3: Переменные окружения

В Render (во вкладке Environment):
- `NODE_ENV` = `production`
- `PORT` = `3000`
- `OPENROUTER_API_KEY` = твой ключ от OpenRouter
- `OPENROUTER_MODEL` = `anthropic/claude-3-haiku`
- `JWT_SECRET` = случайная строка (любая)
- `SQLITE_FILE` = `../database/sqlite/prod.db`

## Шаг 4: Готово! 🎉

После развертывания ты получишь URL вроде:
```
https://apteka-pois.onrender.com
```

Это твой сайт!

## Обновления

Каждый раз когда захочешь обновить сайт:
```bash
git add .
git commit -m "Описание изменений"
git push
```

Render автоматически перезагрузит приложение.

## Важно!

- ✅ Не забудь добавить `.env` в `.gitignore`
- ✅ API ключ вставь в переменные окружения Render, а не в код
- ✅ SQLite база данных будет создана автоматически
