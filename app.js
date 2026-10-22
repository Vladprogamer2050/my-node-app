const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

// Генерация 50 тестовых студентов (Задание 5)
const firstNames = ["Александр", "Дмитрий", "Максим", "Анна", "Мария", "Елена"];
const lastNames = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Петров"];
const groups = ["ББМО-01-23", "ББМО-02-23", "ИВТ-11-22"];

let students = [];
for (let i = 1; i <= 50; i++) {
    students.push({
        id: i,
        name: `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`,
        group: groups[Math.floor(Math.random() * groups.length)],
        course: Math.floor(Math.random() * 4) + 1
    });
}
let nextId = 51;

// Middleware: Логирование (Задание 3)
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    console.log(`[${new Date().toLocaleString('ru-RU')}] ${ctx.method} ${ctx.url} - ${Date.now() - start}ms`);
});

// Middleware: Парсинг JSON
app.use(bodyParser());

// Middleware: Обработка ошибок (Задание 3)
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = { error: err.message || "Внутренняя ошибка сервера", status: ctx.status };
    }
});

// Middleware: Авторизация (Задание 3)
const authMiddleware = async (ctx, next) => {
    if (ctx.headers.authorization !== 'Bearer secret-token') {
        ctx.status = 401;
        ctx.body = { error: "Неавторизованный доступ" };
        return;
    }
    await next();
};

// Задание 1: Базовая HTML страница
router.get('/', async (ctx) => {
    ctx.type = 'html';
    ctx.body = `<h1>Лабораторная работа №15</h1><p>Группа: ПРОГРАММИСТОВ ЛОЛ КЕК ЧЕБУРЕК</p><p>Дата: ${new Date().toLocaleString('ru-RU')}</p><p>Добро пожаловать на сервер Koa.js!</p>`;
});

// Задания 2, 4, 5: CRUD API с фильтрацией, пагинацией и сортировкой
router.get('/students', async (ctx) => {
    let result = [...students];
    if (ctx.query.group) result = result.filter(s => s.group === ctx.query.group);
    if (ctx.query.search) {
        const search = ctx.query.search.toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(search));
    }
    if (ctx.query.sort) {
        const field = ctx.query.sort.startsWith('-') ? ctx.query.sort.substring(1) : ctx.query.sort;
        const desc = ctx.query.sort.startsWith('-');
        result.sort((a, b) => (a[field] < b[field] ? (desc ? 1 : -1) : (desc ? -1 : 1)));
    }
    const total = result.length;
    const limit = parseInt(ctx.query.limit) || 10;
    const offset = parseInt(ctx.query.offset) || 0;
    ctx.body = { total, limit, offset, data: result.slice(offset, offset + limit) };
});

router.get('/students/:id', async (ctx) => {
    const student = students.find(s => s.id === parseInt(ctx.params.id));
    if (!student) { ctx.status = 404; ctx.body = { error: "Не найден" }; return; }
    ctx.body = student;
});

router.post('/students', async (ctx) => {
    const { name, group, course } = ctx.request.body;
    if (!name || !group || !course) { ctx.status = 400; ctx.body = { error: "Заполните все поля" }; return; }
    const newStudent = { id: nextId++, name, group, course: parseInt(course) };
    students.push(newStudent);
    ctx.status = 201;
    ctx.body = newStudent;
});

router.put('/students/:id', async (ctx) => {
    const idx = students.findIndex(s => s.id === parseInt(ctx.params.id));
    if (idx === -1) { ctx.status = 404; ctx.body = { error: "Не найден" }; return; }
    const { name, group, course } = ctx.request.body;
    students[idx] = { ...students[idx], ...(name && { name }), ...(group && { group }), ...(course && { course: parseInt(course) }) };
    ctx.body = students[idx];
});

router.delete('/students/:id', async (ctx) => {
    const idx = students.findIndex(s => s.id === parseInt(ctx.params.id));
    if (idx === -1) { ctx.status = 404; ctx.body = { error: "Не найден" }; return; }
    students.splice(idx, 1);
    ctx.body = { message: "Удалено" };
});

// Тестовые маршруты для Задания 3
router.get('/protected', authMiddleware, async (ctx) => {
    ctx.body = { message: "Доступ разрешен!" };
});

router.get('/error', async (ctx) => {
    throw new Error("Тестовая ошибка для проверки middleware");
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});