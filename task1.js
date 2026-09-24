// task1.js
const fs = require('fs').promises;
const path = require('path');

const VARIANT = 7;
const STUDENT_NAME = "Евдокимов В.Е.";
const GROUP = "478";
const FILE_NAME = `student_${VARIANT}.txt`;
const FILE_PATH = path.join(__dirname, FILE_NAME);

async function task1() {
    try {
        const content = [
            `Студент: ${STUDENT_NAME}`,
            `Группа: ${GROUP}`,
            `Вариант: ${VARIANT}`,
            `Дата: ${new Date().toLocaleString('ru-RU')}`,
            "Любимые фильмы:",
            '1. "Интерстеллар" - К. Нолан',
            '2. "Начало" - К. Нолан',
            '3. "Матрица" - Л. и Э. Вачовски',
            '4. "Дюна" - Д. Вильнёв',
            '5. "Бегущий по лезвию 2049" - Д. Вильнёв'
        ];
        
        const linesCount = content.length;
        content.push(`Количество записей: ${linesCount}`);
        const finalContent = content.join('\n');

        await fs.writeFile(FILE_PATH, finalContent, 'utf-8');
        console.log(`Создан файл: ${FILE_NAME}`);

        const readFileContent = await fs.readFile(FILE_PATH, 'utf-8');
        console.log("\nСодержимое файла:");
        console.log("─────────────────────────────────");
        console.log(readFileContent);
        console.log("─────────────────────────────────\n");

    } catch (error) {
        console.error(`Ошибка в Задании 1: ${error.message}`);
    }
}

if (require.main === module) {
    task1();
}

module.exports = task1;