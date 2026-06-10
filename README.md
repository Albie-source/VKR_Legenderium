# Легендариум

Интерактивная образовательная платформа фольклора народов России — выпускная
квалификационная работа. Пользователи изучают легенды, сказания и обряды
разных регионов через библиотеку материалов, интерактивную карту, квесты
(викторины, мемо, поиск предметов) и образовательные маршруты (цели) с
коллекционными наградами.

## Стек

- [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions)
- React 19, TypeScript, Tailwind CSS 4
- PostgreSQL + [Prisma 7](https://www.prisma.io/)
- Leaflet / react-leaflet — интерактивная карта
- Zod — валидация форм и server actions
- Playwright — e2e-тесты, Vitest — юнит-тесты

## Требования

- Node.js 20+
- PostgreSQL 14+

## Быстрый старт (локальная разработка)

1. Установите зависимости:

   ```bash
   npm ci
   ```

2. Создайте базу данных PostgreSQL и скопируйте пример переменных окружения:

   ```bash
   cp .env.example .env
   ```

   Отредактируйте `.env`:
   - `DATABASE_URL` — строка подключения к вашей базе.
   - `SESSION_SECRET` — случайная строка не короче 32 символов
     (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   - Остальные переменные (TTS, email) опциональны — без них приложение
     работает, но плеер озвучки и письма сброса пароля будут отключены.

3. Примените миграции и заполните базу демонстрационными данными:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

   Сид создаёт двух пользователей:
   - Администратор: `admin@legendarium.ru` / `admin123`
   - Обычный пользователь: `user@legendarium.ru` / `user123`

4. Запустите дев-сервер:

   ```bash
   npm run dev
   ```

   Откройте [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Полный список с описанием — в [`.env.example`](.env.example).

| Переменная | Обязательна | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | да | строка подключения к PostgreSQL |
| `SESSION_SECRET` | да (в production) | секрет для подписи cookie сессии |
| `NEXT_PUBLIC_APP_URL` | нет | базовый URL приложения (sitemap, письма) |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` | нет | синтез речи через ElevenLabs |
| `YANDEX_TTS_API_KEY` | нет | синтез речи через Yandex SpeechKit (фолбэк) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | нет | отправка писем сброса пароля |

## Скрипты

| Команда | Назначение |
| --- | --- |
| `npm run dev` | запуск дев-сервера |
| `npm run build` | продакшен-сборка |
| `npm run start` | запуск собранного приложения |
| `npm run lint` | ESLint |
| `npm run typecheck` | проверка типов TypeScript |
| `npm run test:unit` | юнит-тесты (Vitest) |
| `npm run test:e2e` | e2e-тесты (Playwright, требует собранное приложение и заполненную БД) |
| `npm run test:e2e:ui` | e2e-тесты в UI-режиме Playwright |

## Тесты

Юнит-тесты (`tests/`) покрывают валидационные схемы (`lib/schemas.ts`) и
логику проверки ответов на интерактивные задания (`lib/taskAnswers.ts`).

E2e-тесты (`e2e/`) запускаются против собранного приложения с заполненной
сидом базой данных:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run build
npm run test:e2e
```

CI (`.github/workflows/ci.yml`) на каждый push и pull request прогоняет
lint, проверку типов, юнит- и e2e-тесты.

## Развёртывание

Подробная пошаговая инструкция по развёртыванию на VPS — в
[`DEPLOY.md`](DEPLOY.md).

## Структура проекта

- `app/` — страницы и API-роуты (App Router)
  - `app/library`, `app/map`, `app/quests`, `app/goals`, `app/materials` — публичные разделы
  - `app/profile` — личный кабинет (избранное, прогресс, попытки, коллекция, архив)
  - `app/admin` — административная панель (материалы, задания, цели, справочники)
  - `app/api` — загрузка файлов и синтез речи
- `components/` — переиспользуемые React-компоненты
- `lib/` — авторизация, доступ к БД, схемы валидации, бизнес-логика
- `prisma/` — схема БД, миграции, сид с демонстрационными данными
- `e2e/`, `tests/` — e2e- и юнит-тесты
