#!/usr/bin/env node
const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');

// Настройка программы
program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17')
  .version('1.0.0');

// Если аргументов нет, показываем справку (Задание 1)
if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

// ==========================================
// ЗАДАНИЕ 1: Базовые команды
// ==========================================
program
  .command('greet <name>')
  .description('поприветствовать пользователя')
  .action((name) => {
    console.log(chalk.green(`Привет, ${name}! Добро пожаловать в CLI-приложение группы ББМО-01-23.`));
    process.exit(0);
  });

program
  .command('info')
  .description('вывести информацию о группе')
  .action(() => {
    console.log(`Группа: ББМО-01-23`);
    console.log(`Студент: Евдокимов В.Е.`);
    console.log(`Лабораторная работа: №17`);
    console.log(`Дата: ${new Date().toLocaleDateString('ru-RU')}`);
    process.exit(0);
  });

// ==========================================
// ЗАДАНИЕ 2 и 4: Commander + Chalk + Ora (generate)
// ==========================================
program
  .command('generate')
  .description('сгенерировать отчёт')
  .option('-t, --type <type>', 'тип отчёта (html, pdf, json, csv)', 'html')
  .option('-o, --output <path>', 'путь для сохранения', './output.txt')
  .option('-f, --force', 'перезаписать существующий файл')
  .option('--dry-run', 'показать что будет сделано без выполнения')
  .option('-v, --verbose', 'подробный вывод')
  .action((options) => {
    const validTypes = ['html', 'pdf', 'json', 'csv'];
    if (!validTypes.includes(options.type)) {
      console.error(chalk.red(`Ошибка: недопустимый тип отчёта "${options.type}". Допустимые: ${validTypes.join(', ')}`));
      process.exit(1); // Код возврата 1 при ошибке
    }

    if (options.verbose) {
      console.log(chalk.blue('[VERBOSE] Запуск генерации отчёта...'));
      console.log(chalk.blue(`[VERBOSE] Тип отчёта: ${options.type}`));
      console.log(chalk.blue(`[VERBOSE] Путь сохранения: ${options.output}`));
    }

    if (options.dryRun) {
      console.log(chalk.yellow(`[DRY-RUN] Будет сгенерирован отчёт типа: ${options.type}`));
      console.log(chalk.yellow(`[DRY-RUN] Файл будет сохранён в: ${options.output}`));
      console.log(chalk.yellow('[DRY-RUN] Действия не выполнены (режим проверки)'));
      process.exit(0);
    }

    // Спиннер (Задание 4)
    const spinner = ora('Генерация отчёта...').start();
    setTimeout(() => {
      spinner.succeed('Отчёт успешно сгенерирован!');
      console.log(chalk.green(`Результат сохранён: ${options.output}`));
      process.exit(0);
    }, 1500);
  });

// ==========================================
// ЗАДАНИЕ 3: Inquirer (интерактивный режим)
// ==========================================
program
  .command('init')
  .description('инициализация проекта')
  .option('--name <name>', 'название проекта')
  .option('--type <type>', 'тип проекта')
  .option('--no-interactive', 'отключить интерактивный режим')
  .action(async (options) => {
    // Проверка неинтерактивного режима
    if (options.interactive === false || !process.stdin.isTTY) {
      if (!options.name || !options.type) {
        console.error(chalk.red('Ошибка: в неинтерактивном режиме необходимо указать --name и --type'));
        process.exit(1);
      }
    }

    let name = options.name || 'my-project';
    let type = options.type || 'Web-приложение';
    let extras = [];
    let useGit = false;

    // Интерактивный диалог, если не переданы все флаги и это TTY
    if (options.interactive !== false && process.stdin.isTTY && (!options.name || !options.type)) {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Введите название проекта:', default: 'my-project' },
        { type: 'list', name: 'type', message: 'Выберите тип проекта:', choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис'] },
        { type: 'checkbox', name: 'extras', message: 'Выберите дополнительные опции:', choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest'] },
        { type: 'confirm', name: 'useGit', message: 'Использовать Git?', default: true },
        { type: 'password', name: 'token', message: 'Введите токен доступа:', mask: '*' }
      ]);
      name = answers.name;
      type = answers.type;
      extras = answers.extras;
      useGit = answers.useGit;
    }

    // Прогресс-бар (Задание 4)
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(100, 0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 100));
      progressBar.update(i);
    }
    progressBar.stop();

    console.log(chalk.green(`\n✓ Проект "${name}" успешно инициализирован!`));
    console.log(chalk.blue(`Тип: ${type}`));
    if (extras.length > 0) console.log(chalk.blue(`Опции: ${extras.join(', ')}`));
    console.log(chalk.blue(`Git: ${useGit ? 'да' : 'нет'}`));
    process.exit(0);
  });

// ==========================================
// ЗАДАНИЕ 5: Глобальная обработка ошибок
// ==========================================
process.on('uncaughtException', (err) => {
  console.error(chalk.red(`\n✖ Критическая ошибка: ${err.message}`));
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack); // Детальный трейс в dev
  } else {
    console.error(chalk.yellow('Проверьте права доступа или наличие конфигурационных файлов.')); // Кратко в prod
  }
  process.exit(1);
});

program.parse(process.argv);