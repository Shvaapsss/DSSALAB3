# Лабораторная работа №3 — Аутентификация и авторизация в Node.js (JWT)

## 1. Назначение работы
Цель лабораторной работы — освоить:
- принципы аутентификации пользователей;
- принципы авторизации и разграничения прав доступа;
- защиту REST API с помощью JWT (JSON Web Token);
- использование ролей пользователей (user / admin);
- работу с паролями и их безопасное хранение.

Проект представляет собой REST API для управления задачами (ToDo), в который добавлена система пользователей, JWT-аутентификация и ролевая авторизация.

---

## 2. Используемые технологии
- Node.js
- Express.js
- PostgreSQL
- bcrypt — хеширование паролей
- jsonwebtoken — создание и проверка JWT
- dotenv — переменные окружения
- pg — работа с PostgreSQL

---

## 3. Структура проекта

```
todo-jwt-lab/
│
├── server.js
├── db.js
├── seed.js
├── .env.example
├── package.json
├── migrations/
│   └── init.sql
│
├── controllers/
│   ├── auth.controller.js
│   ├── todos.controller.js
│   └── categories.controller.js
│
├── middlewares/
│   ├── auth.middleware.js
│   └── role.middleware.js
│
├── routes/
│   ├── auth.routes.js
│   ├── todos.routes.js
│   ├── categories.routes.js
│   └── users.routes.js
│
└── README.md
```

---

## 4. Структура базы данных

### Таблица users
- `id` — уникальный идентификатор;
- `username` — уникальное имя пользователя;
- `email` — уникальный email;
- `password` — хешированный пароль с использованием bcrypt;
- `role` — роль пользователя (user / admin);
- `created_at` и `updated_at` — даты создания и обновления.

### Таблица categories
- Хранит категории задач. Доступ к CRUD операциям — только для администратора.

### Таблица todos
- `user_id` — внешний ключ на таблицу users (владелец задачи);
- Каждая задача привязана к пользователю, что позволяет реализовать разграничение доступа.

---

## 5. Запуск проекта

1. Установите зависимости:
```bash
npm install
```
2. Скопируйте `.env.example` в `.env` и заполните данные.
3. Создайте таблицы в базе данных с помощью `migrations/init.sql` или через сидер:
```bash
npm run seed
```
4. Запустите сервер:
```bash
npm start
```

---

## 6. Реализация аутентификации

### Регистрация
- **Маршрут:** `POST /api/auth/register`
- Проверяется уникальность `username` и `email`.
- Пароль хешируется через bcrypt:
```js
const hash = await bcrypt.hash(password, 10);
```
- Создаётся запись в таблице users.
- Ответ содержит id, username, email, role, created_at.

### Вход
- **Маршрут:** `POST /api/auth/login`
- Находится пользователь по email, проверяется пароль:
```js
const ok = await bcrypt.compare(password, user.password);
```
- Генерируется JWT токен с payload:
```js
const payload = { userId: user.id, username: user.username, role: user.role };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
```
- Токен возвращается клиенту.

### Проверка токена (профиль)
- **Маршрут:** `GET /api/auth/profile`
- Middleware `authenticate` извлекает токен из заголовка Authorization:
```js
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = payload;
```
- Если токен валиден — возвращается информация о пользователе; иначе 401 Unauthorized.

---

## 7. Реализация авторизации

### Проверка роли администратора
```js
const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
};
```

### Проверка владельца ресурса или администратора
```js
const isOwnerOrAdmin = async (req, res, next) => {
  const { rows } = await pool.query('SELECT user_id FROM todos WHERE id=$1', [req.params.id]);
  if (req.user.role === 'admin' || req.user.userId === rows[0].user_id) return next();
  return res.status(403).json({ message: 'Forbidden' });
};
```

---

## 8. Логика работы API

### ToDos
- `GET /api/todos`: user видит только свои задачи, admin — все.
- `POST /api/todos`: создание задачи пользователем.
- `PUT /api/todos/:id` и `DELETE /api/todos/:id`: доступны только владельцу или admin.

### Categories
- CRUD доступен только для admin, middleware `isAdmin` блокирует остальных.

### Users
- `GET /api/users` — admin видит список всех пользователей.

---

## 9. Контрольные вопросы

### 9.1 Что такое JWT и как он работает?
JWT (JSON Web Token) — это компактный и безопасный способ передачи информации между клиентом и сервером. Структура токена:
1. Header — алгоритм подписи, тип токена.
2. Payload — данные пользователя (userId, username, role).
3. Signature — подпись токена, создаётся с использованием секретного ключа.

JWT используется для аутентификации без хранения состояния на сервере (stateless). Сервер проверяет подпись токена и извлекает данные пользователя.

Пример создания токена:
```js
const token = jwt.sign({ userId: 1, username: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
```
Проверка:
```js
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

### 9.2 Как реализовать безопасное хранение паролей пользователей?
- Никогда не хранить пароли в открытом виде.
- Использовать bcrypt с солью:
```js
const hash = await bcrypt.hash(password, 10);
```
- При проверке пароля использовать `bcrypt.compare`.
- Таким образом, даже при утечке базы данных пароли остаются защищёнными.

### 9.3 В чём разница между аутентификацией и авторизацией?
- **Аутентификация** — проверка личности пользователя (login, пароль, токен).
- **Авторизация** — проверка прав доступа к ресурсам (роли, права, middleware).
- Пример: JWT используется для аутентификации, middleware `isAdmin` для авторизации.

### 9.4 Преимущества и недостатки использования Passport.js
**Преимущества:**
- Поддержка множества стратегий (JWT, OAuth, Local и др.).
- Удобная интеграция с Express.
- Стандартизованная архитектура middleware.

**Недостатки:**
- Для простых проектов может быть избыточен.
- Добавляет дополнительный слой абстракции.
- Требуется изучение специфики стратегии и её конфигурации.

---

## 10. Демонстрация работы

1. Seed создаёт двух пользователей:
   - admin@example.com / AdminPass123
   - user@example.com / UserPass123

2. Тестовые сценарии:
   - `user` создаёт задачу: успешно
   - `user` пытается удалить чужую задачу: 403 Forbidden
   - `admin` изменяет или удаляет любую задачу: успешно
   - `admin` управляет категориями: успешно

3. Токены используются через заголовок Authorization: `Bearer <TOKEN>`.

---

## 11. Вывод

В лабораторной работе реализованы:
- регистрация и вход пользователей;
- безопасное хранение паролей через bcrypt;
- JWT-аутентификация и проверка токена;
- ролевой доступ к ресурсам через middleware;
- примеры работы для пользователей и администраторов.

Проект демонстрирует реальные подходы к аутентификации и авторизации в современных backend-приложениях на Node.js.

