// task2.js
const fs = require('fs').promises;
const path = require('path');

const VARIANT = 7;
const BASE_DIR = path.join(__dirname, `project_${VARIANT}`);

async function createDirWithInfo(dirPath, description) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        const infoPath = path.join(dirPath, 'info.txt');
        await fs.writeFile(infoPath, `Назначение папки: ${description}`, 'utf-8');
    } catch (error) {
        console.error(`Ошибка создания ${dirPath}:`, error.message);
    }
}

async function printTree(dir, prefix = '') {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            console.log(prefix + (entry.isDirectory() ? '📁 ' : '📄 ') + entry.name);
            if (entry.isDirectory()) {
                await printTree(path.join(dir, entry.name), prefix + '   ');
            }
        }
    } catch (error) {
    }
}

async function task2() {
    try {
        console.log("🚀 Начало Задания 2...\n");

        const dirsToCreate = [
            { path: 'src/modules', desc: 'Исходный код модулей' },
            { path: 'src/components', desc: 'UI компоненты' },
            { path: 'src/utils', desc: 'Вспомогательные функции' },
            { path: 'data/input', desc: 'Входные данные' },
            { path: 'data/output', desc: 'Выходные данные' },
            { path: 'temp', desc: 'Временные файлы' },
            { path: 'src/components/1', desc: 'Компонент 1 (нечетный вариант)' },
            { path: 'src/components/2', desc: 'Компонент 2 (нечетный вариант)' },
            { path: 'src/components/3', desc: 'Компонент 3 (нечетный вариант)' }
        ];

        for (const item of dirsToCreate) {
            await createDirWithInfo(path.join(BASE_DIR, item.path), item.desc);
        }

        console.log("📂 Исходная структура:");
        await printTree(BASE_DIR);
        console.log("\n");

        const oldTempPath = path.join(BASE_DIR, 'temp');
        const newTempPath = path.join(BASE_DIR, 'data', 'temp');
        await fs.rename(oldTempPath, newTempPath);

        const oldOutputPath = path.join(BASE_DIR, 'data', 'output');
        const newResultsPath = path.join(BASE_DIR, 'data', 'results');
        await fs.rename(oldOutputPath, newResultsPath);

        await fs.rm(newTempPath, { recursive: true, force: true });

        console.log("Обновленная структура:");
        await printTree(BASE_DIR);
        console.log("Задание 2 выполнено успешно!");

    } catch (error) {
        console.error(`Ошибка в Задании 2: ${error.message}`);
    }
}

if (require.main === module) {
    task2();
}

module.exports = task2;