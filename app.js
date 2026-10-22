const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super-secret-lab-16-key';

app.use(express.json());

// ==========================================
// ЗАДАНИЕ 3: Middleware (Сжатие, Лимит, Логгер, Ошибки)
// ==========================================

// 1. Сжатие данных
app.use(compression());

// 2. Ограничение скорости (100 запросов в минуту)
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Слишком много запросов, попробуйте позже', status: 429 }
});
app.use(limiter);

// 3. Логирование в консоль и файл
const logFile = path.join(__dirname, 'server.log');
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = `[${new Date().toLocaleString('ru-RU')}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms\n`;
        console.log(logEntry.trim());
        fs.appendFile(logFile, logEntry, (err) => { if (err) console.error('Ошибка записи лога:', err); });
    });
    next();
});

// 4. Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Внутренняя ошибка сервера', status: err.status || 500 });
});

// ==========================================
// ЗАДАНИЕ 5: Генерация 100 тестовых книг
// ==========================================
const titles = ['Война и мир', 'Преступление и наказание', 'Мастер и Маргарита', '1984', 'Гарри Поттер', 'Ведьмак', 'Дюна', 'Автостопом по галактике'];
const authors = ['Л. Толстой', 'Ф. Достоевский', 'М. Булгаков', 'Дж. Оруэлл', 'Дж. Роулинг', 'А. Сапковский', 'Ф. Герберт', 'Д. Адамс'];
const genres = ['роман', 'фантастика', 'фэнтези', 'классика', 'антиутопия'];

let books = [];
for (let i = 1; i <= 100; i++) {
    books.push({
        id: i,
        isbn: `978-5-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-${i}`,
        title: `${titles[Math.floor(Math.random() * titles.length)]} Том ${Math.floor(Math.random() * 3) + 1}`,
        author: authors[Math.floor(Math.random() * authors.length)],
        year: 1800 + Math.floor(Math.random() * 224),
        genre: genres[Math.floor(Math.random() * genres.length)],
        available: Math.random() > 0.3
    });
}
let nextId = 101;

// ==========================================
// ЗАДАНИЕ 1: Базовые HTML маршруты
// ==========================================
app.get('/', (req, res) => {
    res.type('html').send(`
        <h1>Лабораторная работа №16</h1>
        <p><strong>Группа:</strong> ПРОГРАММИСТОВ | <strong>Студент:</strong> Евдокимов В.Е.</p>
        <p><strong>Дата и время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
        <p>Добро пожаловать на сервер Express.js! 🚀</p>
        <h3>Доступные маршруты:</h3>
        <ul>
            <li><a href="/about">/about</a> - О разработчике</li>
            <li><a href="/contacts">/contacts</a> - Контакты</li>
            <li><a href="/api/books">/api/books</a> - API книг (JSON)</li>
        </ul>
    `);
});

app.get('/about', (req, res) => {
    res.type('html').send('<h1>О разработчике</h1><p>Студент: Евдокимов В.Е., Группа: ББМО-01-23. Лабораторная работа по Express.js.</p>');
});

app.get('/contacts', (req, res) => {
    res.type('html').send('<h1>Контакты</h1><p>Email: vladevdokimov165@gmail.com<br>GitHub: Vladprogamer2050</p>');
});

// ==========================================
// ЗАДАНИЯ 2, 4, 5: Продвинутый REST API для книг
// ==========================================

// Вспомогательная функция проверки JWT (для Задания 5)
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) return res.status(403).json({ error: 'Неверный токен' });
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Требуется авторизация (JWT)' });
    }
};

// GET /api/books (с фильтрацией, пагинацией, сортировкой, поиском)
app.get('/api/books', authenticateJWT, (req, res) => {
    let result = [...books];
    const { author, year, yearFrom, yearTo, limit, page, sort, search } = req.query;

    if (author) result = result.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    if (year) result = result.filter(b => b.year === parseInt(year));
    if (yearFrom) result = result.filter(b => b.year >= parseInt(yearFrom));
    if (yearTo) result = result.filter(b => b.year <= parseInt(yearTo));
    if (search) {
        const s = search.toLowerCase();
        result = result.filter(b => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s));
    }

    if (sort) {
        const field = sort.startsWith('-') ? sort.substring(1) : sort;
        const desc = sort.startsWith('-');
        result.sort((a, b) => (a[field] < b[field] ? (desc ? 1 : -1) : (desc ? -1 : 1)));
    }

    const total = result.length;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const paginatedResult = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ total, page: pageNum, limit: limitNum, data: paginatedResult });
});

// GET /api/books/search (альтернативный маршрут из Задания 2)
app.get('/api/books/search', authenticateJWT, (req, res) => {
    const { author } = req.query;
    if (!author) return res.status(400).json({ error: 'Укажите параметр author' });
    const found = books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    res.json(found);
});

// GET /api/books/stats (Статистика)
app.get('/api/books/stats', authenticateJWT, (req, res) => {
    const years = books.map(b => b.year);
    const byAuthor = {};
    const byGenre = {};
    books.forEach(b => {
        byAuthor[b.author] = (byAuthor[b.author] || 0) + 1;
        byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
    });
    res.json({
        total: books.length,
        oldestYear: Math.min(...years),
        newestYear: Math.max(...years),
        byAuthor,
        byGenre
    });
});

// GET /api/books/:id
app.get('/api/books/:id', authenticateJWT, (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    res.json(book);
});

// POST /api/books
app.post('/api/books', authenticateJWT, (req, res) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author || !year) return res.status(400).json({ error: 'Заполните title, author и year', status: 400 });
    
    const duplicate = books.find(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase());
    if (duplicate) return res.status(400).json({ error: 'Такая книга уже существует', status: 400 });

    const newBook = { id: nextId++, isbn: `978-5-NEW-${nextId}`, title, author, year: parseInt(year), genre: genre || 'не указан', available: true };
    books.push(newBook);
    res.status(201).json(newBook);
});

// PUT /api/books/:id
app.put('/api/books/:id', authenticateJWT, (req, res) => {
    const idx = books.findIndex(b => b.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    
    const { title, author, year, genre } = req.body;
    books[idx] = { 
        ...books[idx], 
        ...(title && { title }), 
        ...(author && { author }), 
        ...(year && { year: parseInt(year) }), 
        ...(genre && { genre }) 
    };
    res.json(books[idx]);
});

// DELETE /api/books/:id
app.delete('/api/books/:id', authenticateJWT, (req, res) => {
    const idx = books.findIndex(b => b.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    
    books.splice(idx, 1);
    res.json({ message: 'Книга успешно удалена' });
});

// ==========================================
// ЗАДАНИЕ 3: Тестирование ошибок и Аутентификация
// ==========================================
app.post('/auth/login', (req, res) => {
    // Простая имитация входа для получения токена
    const { email, password } = req.body;
    if (email === 'test@test.com' && password === '123') {
        const token = jwt.sign({ email, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, message: 'Успешный вход' });
    } else {
        res.status(401).json({ error: 'Неверные учетные данные', status: 401 });
    }
});

app.get('/error', (req, res, next) => {
    const err = new Error('Синхронная тестовая ошибка');
    err.status = 500;
    next(err);
});

app.get('/async-error', async (req, res, next) => {
    try {
        throw new Error('Асинхронная тестовая ошибка');
    } catch (err) {
        next(err);
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер Express.js запущен на http://localhost:${PORT}`);
    console.log(`🔑 Для тестов API используйте логин: test@test.com / пароль: 123`);
});