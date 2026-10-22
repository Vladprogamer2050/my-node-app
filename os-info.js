const os = require('os');
const GROUP = 'ББМО-01-23';

// ================= ЗАДАНИЕ 1: Базовая информация =================
const uptime = os.uptime();
const h = Math.floor(uptime / 3600);
const m = Math.floor((uptime % 3600) / 60);
const s = Math.floor(uptime % 60);
const uptimeStr = `${h} ч ${m} мин ${s} сек`;

let platformName = 'Неизвестная платформа';
if (os.platform() === 'win32') platformName = 'Windows';
else if (os.platform() === 'linux') platformName = 'Linux';
else if (os.platform() === 'darwin') platformName = 'macOS';

console.log(`=== Информация о системе (группа ${GROUP}) ===`);
console.log(`Платформа:      ${os.platform()}`);
console.log(`Тип ОС:         ${os.type()}`);
console.log(`Архитектура:    ${os.arch()}`);
console.log(`Версия ОС:      ${os.release()}`);
console.log(`Имя хоста:      ${os.hostname()}`);
console.log(`Время работы:   ${uptimeStr}`);
console.log(`Вы работаете в ${platformName}\n`);

// ================= ЗАДАНИЕ 2: Процессор и память =================
const cpus = os.cpus();
const avgFreq = Math.round(cpus.reduce((acc, cpu) => acc + cpu.speed, 0) / cpus.length);
const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(2);
const usedMemGB = (totalMemGB - freeMemGB).toFixed(2);
const usedPercent = ((usedMemGB / totalMemGB) * 100).toFixed(1);
const freePercent = 100 - usedPercent;

console.log(`=== Информация о процессоре ===`);
console.log(`Количество логических ядер: ${cpus.length}`);
console.log(`Модель процессора:          ${cpus[0].model}`);
console.log(`Средняя частота:            ${avgFreq} МГц\n`);

console.log(`=== Информация о памяти ===`);
console.log(`Общий объём:                ${totalMemGB} ГБ`);
console.log(`Свободно:                   ${freeMemGB} ГБ`);
console.log(`Использовано:               ${usedMemGB} ГБ (${usedPercent}%)`);
console.log(`Группа:                     ${GROUP}`);
if (freePercent < 20) {
    console.log(`⚠ ВНИМАНИЕ: Свободной памяти меньше 20%!`);
} else {
    console.log(`Память в норме`);
}
console.log(`Средняя загрузка (1, 5, 15 мин): ${os.loadavg().map(v => v.toFixed(2)).join(', ')} ${os.platform() === 'win32' ? '(для Windows значения могут быть неточными)' : ''}\n`);

// ================= ЗАДАНИЕ 3: Сеть и пользователь =================
console.log(`=== Сетевые интерфейсы ===`);
const nets = os.networkInterfaces();
let mainInterface = 'Не определен';
let interfaceCount = 0;

for (const [name, details] of Object.entries(nets)) {
    for (const detail of details) {
        if (detail.family === 'IPv4' && !detail.internal) {
            mainInterface = `${name} (${detail.address})`;
        }
        interfaceCount++;
        // Маскирование MAC-адреса
        const maskedMac = detail.mac.replace(/^(..:..:..:).*/, '$1**:**:**');
        console.log(`Интерфейс: ${name}`);
        console.log(`  IP:      ${detail.address}`);
        console.log(`  MAC:     ${maskedMac}`);
        console.log(`  Внутренний: ${detail.internal ? 'да' : 'нет'}`);
    }
}
console.log(`Всего интерфейсов:        ${interfaceCount}`);
console.log(`Основной интерфейс:       ${mainInterface}\n`);

console.log(`=== Информация о пользователе ===`);
const userInfo = os.userInfo();
console.log(`Имя пользователя:         ${userInfo.username}`);
console.log(`UID:                      ${userInfo.uid}`);
console.log(`GID:                      ${userInfo.gid}`);
console.log(`Домашняя директория:      ${userInfo.homedir}`);
console.log(`Группа:                   ${GROUP}`);
console.log(`Проверка root:            ${userInfo.uid === 0 ? 'да (ВНИМАНИЕ!)' : 'нет'}`);