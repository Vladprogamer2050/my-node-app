const os = require('os');
const fs = require('fs');
const path = require('path');

const GROUP = 'ББМО-01-23';
const LOG_FILE = path.join(__dirname, 'monitor.log');
let warningsCount = 0;

// Функция расчёта загрузки CPU
function getCPUUsage() {
    const cpus1 = os.cpus();
    return new Promise(resolve => {
        setTimeout(() => {
            const cpus2 = os.cpus();
            let idleDiff = 0;
            let totalDiff = 0;
            
            for (let i = 0; i < cpus1.length; i++) {
                const cpu1 = cpus1[i].times;
                const cpu2 = cpus2[i].times;
                
                const idle1 = cpu1.idle;
                const total1 = Object.values(cpu1).reduce((a, b) => a + b, 0);
                
                const idle2 = cpu2.idle;
                const total2 = Object.values(cpu2).reduce((a, b) => a + b, 0);
                
                idleDiff += (idle2 - idle1);
                totalDiff += (total2 - total1);
            }
            
            const usage = totalDiff === 0 ? 0 : 100 - (idleDiff / totalDiff * 100);
            resolve(usage);
        }, 500); // Замер с интервалом 500мс
    });
}

async function monitor() {
    console.log(`Мониторинг (группа ${GROUP}). Ctrl+C для выхода.`);
    
    const interval = setInterval(async () => {
        const cpuUsage = await getCPUUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const freePercent = (freeMem / totalMem) * 100;
        const freeGB = (freeMem / (1024 ** 3)).toFixed(2);

        let status = '';
        let logMsg = '';

        // Адаптивное поведение и логирование
        if (cpuUsage > 80 || freePercent < 10) {
            status = '⚠⚠';
            logMsg = `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] [${GROUP}] Критическое предупреждение: CPU ${cpuUsage.toFixed(1)}%, RAM свободно ${freePercent.toFixed(1)}%`;
            warningsCount++;
        } else if (cpuUsage > 50 || freePercent < 20) {
            status = '⚠';
            logMsg = `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] [${GROUP}] Предупреждение: CPU ${cpuUsage.toFixed(1)}%, RAM свободно ${freePercent.toFixed(1)}%`;
            warningsCount++;
        }

        if (logMsg) {
            fs.appendFileSync(LOG_FILE, logMsg + '\n');
        }

        // Перерисовка через \r
        process.stdout.write(`\rCPU: ${cpuUsage.toFixed(1)}% | RAM: ${(100 - freePercent).toFixed(1)}% (${freeGB} ГБ свободно) ${status}   `);
    }, 2000);

    // Корректное завершение по Ctrl+C
    process.on('SIGINT', () => {
        clearInterval(interval);
        console.log(`\nМониторинг остановлен. Предупреждений записано: ${warningsCount}`);
        process.exit(0);
    });
}

monitor();