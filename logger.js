const fs = require('fs');
const path = require('path');

function setupLogger(app) {
    const logFile = path.join(__dirname, 'logs.txt');

    function writeLog(eventName, data) {
        const timestamp = new Date().toLocaleString('ru-RU');
        const logMessage = `[${timestamp}] ${eventName}: ${JSON.stringify(data)}\n`;
        
        fs.appendFile(logFile, logMessage, (err) => {
            if (err) {
                console.error('Ошибка записи в лог:', err);
            }
        });
    }

    app.on('server:started', (port) => {
        writeLog('server:started', { port: port });
    });

    app.on('request:received', (requestInfo) => {
        writeLog('request:received', requestInfo);
    });

    app.on('server:stopped', () => {
        writeLog('server:stopped', {});
    });

    console.log('Логгер подключен');
}

module.exports = {
    setupLogger
};