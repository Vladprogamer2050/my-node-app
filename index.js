const http = require('http');
const { EventEmitter } = require('events');

class AppServer extends EventEmitter {
    constructor() {
        super();
        this.server = null;
    }

    //ЗАПУСКАЕМ СЕРВЕР
    start(port) {
        this.server = http.createServer((req, res) => {
            this.emit('request:received', {
                url: req.url,
                method: req.method
            });

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>Hello from Event-Driven Server!</h1>');
        });

        this.server.listen(port, () => {
            this.emit('server:started', port);
        });
    }

    //СТОП СЕРВЕР 
    stop() {
        if (this.server) {
            this.server.close(() => {
                this.emit('server:stopped');
            });
        }
    }
}

const app = new AppServer();


app.on('server:started', (port) => {
    console.log(`Сервер запущен на порту ${port}`);
});

app.on('request:received', (requestInfo) => {
    console.log(`Получен запрос: ${requestInfo.method} ${requestInfo.url}`);
});

app.on('server:stopped', () => {
    console.log('Сервер остановлен');
});

const logger = require('./logger');
logger.setupLogger(app);

app.start(3000);

// Эмуляция остановки через 10 секунд
// setTimeout(() => {
//     app.stop();
// }, 10000);