# apteka3 — Backend structure

Короткое описание структуры папок для сервера проекта `apteka3`.

Структура:

- `server/` — корень backend-приложения
  - `src/` — исходники
    - `controllers/` — логика обработки запросов
    - `routes/` — маршруты (API)
    - `models/` — модели данных / ORM
    - `services/` — бизнес-логика, работа с внешними сервисами
    - `middleware/` — Express middleware
    - `config/` — конфигурации (db, env, constants)
    - `utils/` — утилиты
  - `db/` — миграции и семена
    - `migrations/`
    - `seeds/`
  - `public/` — статические файлы (js, css)
  - `scripts/` — скрипты сборки/миграций
  - `tests/` — тесты
  - `logs/` — логи

Дополнительно:
- `client-js/` — общие JS-модули для фронтенда (если хотите отделить от `public`)
- `database/` — файлы локальной БД (например SQLite)

Дальше можно выбрать стек: `Node.js + Express` + `Postgres`/`SQLite` или `Python + FastAPI`.

Как начать (рекомендация для Node.js):

1. Открыть `server/` и выполнить `npm init -y` и установить `express` + `dotenv`.
2. Создать `src/index.js` с простым сервером и маршрутами.
3. Подключить миграции и схему БД.

Auth & frontend notes:

- JWT auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`.
- Profile endpoint (auth required): `GET /api/profile`.
- Cart endpoints accept authenticated user via Bearer token; if no token provided, they still accept `userId` in body/params for testing.
- Simple client scripts provided in `server/public/js/`:
  - `products.js` — загружает `/api/products` и добавляет в корзину (по умолчанию userId=1)
  - `auth.js` — помощь для регистрации, логина и запросов с токеном (использует `localStorage`)
