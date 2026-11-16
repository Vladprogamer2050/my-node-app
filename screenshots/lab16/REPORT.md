# ЛР №16 — сервер на Express.js: CRUD, middleware, JWT

Скриншоты сделаны на реально запущенном сервере (`node app.js`, Express 5, порт 3000).

## Файлы

| Файл | Что показано |
|---|---|
| `lab16-server-start.png` | запуск `node app.js` — сервер стартовал, подсказка по тестовому логину |
| `lab16-home.jpg` | `http://localhost:3000/` в браузере — HTML-страница со списком маршрутов |
| `lab16-books-401.jpg` | `http://localhost:3000/api/books` без токена → `{"error":"Требуется авторизация (JWT)"}` |
| `lab16-auth-login.png` | `POST /auth/login`: успешный вход (JWT в ответе), неверный пароль → 401 |
| `lab16-crud.png` | пагинация, `POST` (201), поиск по автору, `PUT`, `DELETE`, `stats` — всё с `Authorization: Bearer <token>` |
| `lab16-errors.png` | `GET /error` (500 + JSON + заголовки rate-limit), `GET /async-error` (500 + JSON) |

## Важное исправление

Обработчик ошибок был зарегистрирован **до** маршрутов:

```js
app.use((err, req, res, next) => { ... });   // строка 43 — до всех app.get/app.post
```

Express ищет error-middleware в порядке регистрации, поэтому она никогда не вызывалась,
и на `/error` отдавалась стандартная HTML-страница Express со стектрейсом и абсолютными путями
(`C:\Users\...\node_modules\router\lib\layer.js`). Обработчик перенесён в конец файла —
теперь оба маршрута возвращают `{"error":"...","status":500}` с `Content-Type: application/json`.

## Команды для воспроизведения

```bash
npm install
node app.js
```

```bash
# авторизация
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
     -d "{\"email\":\"test@test.com\",\"password\":\"123\"}"

# CRUD (подставить токен из ответа выше)
curl "http://localhost:3000/api/books?limit=2" -H "Authorization: Bearer <TOKEN>"
curl -X POST http://localhost:3000/api/books -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" -d "{\"title\":\"Test Book\",\"author\":\"Test Author\",\"year\":2024}"
curl -X PUT http://localhost:3000/api/books/101 -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" -d "{\"genre\":\"devops\"}"
curl -X DELETE http://localhost:3000/api/books/101 -H "Authorization: Bearer <TOKEN>"
curl http://localhost:3000/api/books/stats -H "Authorization: Bearer <TOKEN>"
```

## Результаты (из снимков)

- 100 сгенерированных книг, пагинация `page/limit`, фильтры `author/year/yearFrom/yearTo/search`
- POST создал книгу `id: 101`, поиск `?author=Test` её нашёл, PUT изменил `genre/year`, DELETE вернул `{"message":"Книга успешно удалена"}`
- `/api/books/stats`: `total: 100`, распределение по авторам и жанрам
- `X-RateLimit-Limit: 100` / `X-RateLimit-Remaining` — лимитер реально подключён
- Без токена `/api/books` → 401, с неверным паролем `/auth/login` → 401
- `/error` и `/async-error` → 500 в JSON (после исправления порядка middleware)
