# ЛР №15 — сервер на Koa.js

Скриншоты сделаны на реально запущенном сервере (`node app.js`, Koa 3, порт 3000).

## Файлы

| Файл | Что показано |
|---|---|
| `lab15-server-start.png` | `node app.js` — сервер стартовал: `Сервер запущен на http://localhost:3000` |
| `lab15-home.jpg` | `http://localhost:3000/` в браузере — HTML-страница (`<h1>Лабораторная работа №15</h1>`, группа, дата) |
| `lab15-students-api.jpg` | `http://localhost:3000/students?limit=3&sort=-name` — фильтрация/сортировка/пагинация, JSON-ответ |
| `lab15-protected-401.jpg` | `http://localhost:3000/protected` без токена — middleware авторизации вернул `{"error":"Неавторизованный доступ"}` |
| `lab15-crud-curl.png` | CRUD через `curl`: `POST /students` (201), `PUT /students/51`, `GET /students/51`, `DELETE /students/51`, `GET /error` (500 + обработка ошибок) |

## Команды для воспроизведения

```bash
npm install
node app.js
```

```bash
curl -X POST http://localhost:3000/students -H "Content-Type: application/json" -d "{\"name\":\"Test Student\",\"group\":\"BBMO-01-23\",\"course\":2}"
curl -X PUT  http://localhost:3000/students/51 -H "Content-Type: application/json" -d "{\"course\":3}"
curl        http://localhost:3000/students/51
curl -X DELETE http://localhost:3000/students/51
curl        http://localhost:3000/protected     # 401 без заголовка Authorization
curl        http://localhost:3000/error         # 500, ошибка ловится middleware
```

## Результаты (из снимков)

- 50 сгенерированных студентов, `total: 50`, пагинация `limit/offset`, сортировка `sort=-name`
- POST создал студента `id: 51`, PUT изменил `course` на `3`, DELETE вернул `{"message":"Удалено"}`
- `/protected` без `Authorization: Bearer secret-token` → 401
- `/error` → `{"error":"Тестовая ошибка для проверки middleware","status":500}`
- Логирование запросов в консоль работает: `[дата] GET /students?limit=3&sort=-name - 46ms`
