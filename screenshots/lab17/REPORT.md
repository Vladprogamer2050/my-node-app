# ЛР №17 — CLI-приложение (commander, inquirer, chalk, ora, cli-progress)

Скриншоты сделаны при реальном запуске `cli.js` в консоли Windows (Node.js v24.20.0).

## Файлы

| Файл | Что показано |
|---|---|
| `lab17-help.png` | `node cli.js --help` — список команд и опций |
| `lab17-basic.png` | `node cli.js greet "Vitaliy"` и `node cli.js info` — базовые команды (Задание 1) |
| `lab17-generate.png` | `node cli.js generate --type json --output report.json --verbose` — options, verbose, спиннер `ora` (Задания 2, 4) |
| `lab17-errors.png` | `node cli.js generate --type xml` — валидация, красный текст ошибки, код возврата `1` |
| `lab17-init.png` | `node cli.js init --name my-node-app --type CLI-utility --no-interactive` — прогресс-бар `cli-progress` (Задание 4) |

## Важное исправление

В исходном PR стояли ESM-версии пакетов (`chalk@6`, `ora@9`, `inquirer@14`), а `cli.js` написан
под CommonJS (`require('chalk')`). Из-за этого любая команда падала с ошибкой:

```
TypeError: chalk.red is not a function
```

Поэтому зависимости приведены к CJS-версиям, под которые написан код:

```json
"chalk": "^4.1.2",
"ora": "^5.4.1",
"inquirer": "^8.2.6",
"cli-progress": "^3.12.0",
"commander": "^12.1.0"
```

Второе исправление: `generate` раньше только печатал «Результат сохранён», но файл не создавал.
Теперь отчёт реально записывается на диск (`json`, `csv`, `html`; для `pdf` — текстовый отчёт,
так как без внешних библиотек PDF не собрать), а флаг `--force` реально разрешает перезапись
(без него при существующем файле выводится ошибка и код возврата `1`).

## Команды для воспроизведения

```bash
node cli.js --help
node cli.js greet "Vitaliy"
node cli.js info
node cli.js generate --type json --output report.json --verbose
node cli.js generate --type xml          # error + exit code 1
node cli.js init --name my-node-app --type CLI-utility --no-interactive
node cli.js init                          # интерактивный режим (inquirer)
```
