// task3.js
const fs = require('fs').promises;
const path = require('path');

const VARIANT = 7;
const REPORT_FILE = path.join(__dirname, `report_${VARIANT}.json`);

function formatSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function scanDirectory(dirPath, stats) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.name === 'node_modules' || entry.name === '.git') {
                continue;
            }

            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                stats.dirCount++;
                await scanDirectory(fullPath, stats);
            } else {
                stats.fileCount++;
                const fileStat = await fs.stat(fullPath);
                stats.totalSize += fileStat.size;

                const ext = path.extname(entry.name).toLowerCase() || 'без расширения';
                if (!stats.extensions[ext]) {
                    stats.extensions[ext] = { count: 0, size: 0 };
                }
                stats.extensions[ext].count++;
                stats.extensions[ext].size += fileStat.size;
                stats.allFiles.push({
                    name: entry.name,
                    path: fullPath,
                    size: fileStat.size
                });
            }
        }
    } catch (error) {
        console.error(`Ошибка сканирования ${dirPath}: ${error.message}`);
    }
}

async function task3(targetDir = __dirname) {
    try {
        console.log(`Анализ директории: ${targetDir}\n`);

        const stats = {
            dirCount: 0,
            fileCount: 0,
            totalSize: 0,
            extensions: {},
            allFiles: []
        };

        await scanDirectory(targetDir, stats);

        const sortedBySizeDesc = [...stats.allFiles].sort((a, b) => b.size - a.size).slice(0, 5);
        const sortedBySizeAsc = [...stats.allFiles].sort((a, b) => a.size - b.size).slice(0, 5);

        console.log(`Общее количество папок: ${stats.dirCount}`);
        console.log(`общее количество файлов: ${stats.fileCount}`);
        console.log(`Общий размер: ${formatSize(stats.totalSize)} (${stats.totalSize.toLocaleString('ru-RU')} байт)\n`);
        console.log("Расширения файлов:");
        for (const [ext, data] of Object.entries(stats.extensions)) {
            console.log(`   ${ext}: ${data.count} файлов (${formatSize(data.size)})`);
        }

        console.log("Топ-5 самых больших файлов:");
        sortedBySizeDesc.forEach((f, i) => console.log(`   ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`));
        console.log("иоп-5 самых маленьких файлов:");
        sortedBySizeAsc.forEach((f, i) => console.log(`   ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`));
        await fs.writeFile(REPORT_FILE, JSON.stringify(stats, null, 2), 'utf-8');
        console.log(`отчет сохранен: report_${VARIANT}.json`);

    } catch (error) {
        console.error(`Ошибка в Задании 3: ${error.message}`);
    }
}

if (require.main === module) {
    const target = process.argv[2] || __dirname;
    task3(target);
}

module.exports = task3;