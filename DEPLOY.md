# Развёртывание на VPS (Ubuntu 22.04/24.04)

Пошаговая инструкция для разворачивания «Легендариума» на арендованном
виртуальном сервере. Рассчитана на минимальную конфигурацию: 2 vCPU, 2-4 ГБ RAM,
30-40 ГБ SSD.

Везде ниже `your-domain.ru` — ваш домен (или просто IP сервера, если домена пока нет).

## 1. Первичная настройка сервера

Подключитесь по SSH (данные выдаёт хостинг-провайдер после создания сервера):

```bash
ssh root@<IP сервера>
```

Обновите систему и создайте отдельного пользователя (работать под root постоянно небезопасно):

```bash
apt update && apt upgrade -y
adduser deploy
usermod -aG sudo deploy
su - deploy
```

## 2. Установка зависимостей

### Node.js (через nvm — проще управлять версиями)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
node -v   # должно быть v20.x
```

### PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER legendarium WITH PASSWORD 'СГЕНЕРИРУЙТЕ_СЛОЖНЫЙ_ПАРОЛЬ';"
sudo -u postgres psql -c "CREATE DATABASE legendariumdb OWNER legendarium;"
```

### nginx и certbot (для HTTPS)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### PM2 (менеджер процессов Node.js)

```bash
npm install -g pm2
```

## 3. Клонирование и настройка проекта

```bash
git clone https://github.com/Albie-source/VKR_Legenderium.git
cd VKR_Legenderium
npm ci
```

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
nano .env
```

Заполните реальными значениями:

```ini
DATABASE_URL="postgresql://legendarium:СГЕНЕРИРУЙТЕ_СЛОЖНЫЙ_ПАРОЛЬ@localhost:5432/legendariumdb"

# Сгенерировать: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET="<сгенерированная случайная строка не короче 32 символов>"

YANDEX_TTS_API_KEY="<ваш ключ, если используете озвучку>"
```

## 4. Миграции базы данных и сборка

```bash
npx prisma migrate deploy
# при необходимости заполнить начальными данными:
# npx prisma db seed

npm run build
```

## 5. Запуск через PM2

В репозитории уже есть `ecosystem.config.js`. Запустите приложение:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # выполните команду, которую выведет pm2 startup — это включит автозапуск при перезагрузке сервера
```

Проверить, что приложение работает:

```bash
curl http://localhost:3000
pm2 logs legendarium
```

## 6. nginx как reverse proxy + HTTPS

В репозитории есть пример конфигурации `deploy/nginx.conf.example`. Скопируйте
его на сервер, подставьте свой домен:

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/legendarium
sudo nano /etc/nginx/sites-available/legendarium   # замените your-domain.ru на свой домен
sudo ln -s /etc/nginx/sites-available/legendarium /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Выпустите бесплатный SSL-сертификат Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.ru -d www.your-domain.ru
```

certbot сам пропишет HTTPS в конфиг nginx и настроит автопродление сертификата.

## 7. Открытие портов (firewall)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 8. Обновление приложения после правок в коде

Когда в проект внесены изменения и их нужно выкатить на сервер:

```bash
cd ~/VKR_Legenderium
git pull origin main          # или нужная ветка
npm ci
npx prisma migrate deploy     # если менялась схема БД
npm run build
pm2 restart legendarium
```

## 9. Резервное копирование

Настройте регулярные бэкапы — терять реальные пользовательские данные перед
защитой обидно:

```bash
# дамп базы данных
pg_dump -U legendarium legendariumdb > backup_$(date +%F).sql

# архив загруженных медиафайлов
tar -czf uploads_$(date +%F).tar.gz ~/VKR_Legenderium/public/uploads
```

Можно положить эти команды в cron (`crontab -e`) для автоматического запуска,
например, раз в сутки.

## Чек-лист перед тем как звать комиссию смотреть демо

- [ ] Сайт открывается по HTTPS на вашем домене
- [ ] Регистрация и вход работают
- [ ] Загрузка изображений в админке работает и файлы сохраняются между перезапусками сервера
- [ ] `pm2 status` показывает приложение в статусе `online`
- [ ] `pm2 startup` настроен — приложение поднимется само после перезагрузки сервера
- [ ] Настроены и проверены бэкапы БД и `public/uploads`
