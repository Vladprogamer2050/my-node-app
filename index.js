const http = require('http');

// ВЫЧИСЛЯЕМ ПО ПРОСТОМУ
function calculatePi(decimals) {
    let pi = 3.0;
    let sign = 1;
    for (let i = 1; i <= 1000000; i++) {
        let denominator = (2 * i) * (2 * i + 1) * (2 * i + 2);
        pi += sign * (4 / denominator);
        sign = -sign;
    }
    return pi.toFixed(decimals);
}

// ЧЕТО МОЕ
const studentName = "Евдокимов В.Е.";
const studentGroup = "478";
const journalNumber = 7;

// ВЫЧИСЛЕНИЯ ТИПА
const calculatedPi = calculatePi(journalNumber);

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    
    const htmlResponse = `
        <h1>${studentName}</h1>
        <h2>Группа: ${studentGroup}</h2>
        <h2>Число Пи (до ${journalNumber} знака): ${calculatedPi}</h2>
    `;
    
    res.end(htmlResponse);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});