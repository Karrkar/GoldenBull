let reels = document.querySelectorAll('.reel');
let spinButton = document.getElementById('spin-button');
let stopButton = document.getElementById('stop-button');
let payTable = document.getElementById('pay-table');
let soundButton = document.getElementById('sound-button');
let vibrationButton = document.getElementById('vibration-button');
let betAmountInput = document.getElementById('bet-amount');
let balanceDisplay = document.getElementById('balance');
let depositButton = document.getElementById('deposit-button');
let withdrawButton = document.getElementById('withdraw-button');
let currentBalance = 20;
let isSpinning = false;

// Символы для слот-машины
const symbols = [
    '♥️', // Червы
    '♦️', // Бубны
    '♣️', // Трефы
    '♠️', // Пики
    '7️⃣' // Цифра 7
];

// Функция для запуска слот-машины
function spin() {
    if (isSpinning) return;
    if (currentBalance < parseInt(betAmountInput.value)) {
        alert('Недостаточно средств для ставки!');
        return;
    }
    currentBalance -= parseInt(betAmountInput.value);
    balanceDisplay.innerText = `Баланс: ${currentBalance}`;
    isSpinning = true;
    spinButton.style.display = 'none';
    stopButton.style.display = 'block';
    startSpinning();
}

// Функция для остановки слот-машины
function stop() {
    isSpinning = false;
    spinButton.style.display = 'block';
    stopButton.style.display = 'none';
    checkWinner();
}

// Функция для запуска анимации слот-машины
function startSpinning() {
    reels.forEach(reel => {
        let randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        reel.innerText = randomSymbol;
        setTimeout(() => {
            if (isSpinning) {
                startSpinning();
            }
        }, 100);
    });
}

// Функция для проверки выигрыша
function checkWinner() {
    let symbolsArray = Array.from(reels).map(reel => reel.innerText);
    if (symbolsArray === symbolsArray && symbolsArray === symbolsArray) {
        let winnings = parseInt(betAmountInput.value) * 13;
        currentBalance += winnings;
        balanceDisplay.innerText = `Баланс: ${currentBalance}`;
        alert('Вы выиграли!');
    } else {
        alert('Вы проиграли!');
    }
}

// Функция для пополнения баланса через Telegram Wallet
function depositBalance() {
    Telegram.WebApp.openInvoice({
        chat_id: Telegram.WebApp.initDataUnsafe.user_id,
        title: 'Пополнить баланс',
        description: 'Пополнить баланс вашей слот-машины',
        photo_url: 'https://example.com/photo.jpg',
        provider_token: 'YOUR_PROVIDER_TOKEN',
        start_param: 'start',
        currency: 'USDT',
        prices: [
            { label: '1 USDT', amount: 100 },
            { label: '5 USDT', amount: 500 },
            { label: '10 USDT', amount: 1000 }
        ]
    });
}

// Функция для вывода баланса через Telegram Wallet
function withdrawBalance() {
    if (currentBalance <= 0) {
        alert('Недостаточно средств для вывода!');
        return;
    }
    // Simulate withdrawal process
    currentBalance = 0;
    balanceDisplay.innerText = `Баланс: ${currentBalance}`;
    alert('Баланс выведен!');
}

// Добавьте слушатели событий
spinButton.addEventListener('click', spin);
stopButton.addEventListener('click', stop);
depositButton.addEventListener('click', depositBalance);
withdrawButton.addEventListener('click', withdrawBalance);

// Обработка платежных событий
Telegram.WebApp.onEvent('invoice_closed', (eventData) => {
    if (eventData.status === 'successful') {
        // Обновите баланс пользователя
        currentBalance += eventData.total_amount / 100;
        balanceDisplay.innerText = `Баланс: ${currentBalance}`;
        alert('Баланс пополнен!');
    } else {
        alert('Платеж не удался!');
    }
});

// Адаптируйте код для работы с Telegram Web App SDK
if (Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.onEvent('themeChanged', (eventData) => {
        if (eventData.theme_params) {
            setThemeParams(eventData.theme_params);
        }
    });
}

// Функция для установки темы
function setThemeParams(theme_params) {
    var color;
    for (var key in theme_params) {
        if (color = parseColorToHex(theme_params[key])) {
            themeParams[key] = color;
            setCssProperty(key, color);
            if (key == 'bg_color') {
                var colorScheme = isColorDark(color) ? 'dark' : 'light';
                setCssProperty('color-scheme', colorScheme);
                document.body.classList.toggle('dark', colorScheme === 'dark');
            }
        }
    }
    Utils.sessionStorageSet('themeParams', themeParams);
}

// Функция для установки CSS свойства
function setCssProperty(name, value) {
    var root = document.documentElement;
    if (root && root.style && root.style.setProperty) {
        root.style.setProperty('--tg-' + name, value);
    }
}

// Helper функции
function parseColorToHex(color) {
    if (!color) return null;
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb')) {
        var rgb = color.match(/^rgb$$(\d+),\s*(\d+),\s*(\d+)$$$/);
        return `#${((1 << 24) + (rgb << 16) + (rgb << 8) + rgb).toString(16).slice(1)}`;
    }
    return null;
}

function isColorDark(color) {
    var r = parseInt(color.substring(1, 3), 16);
    var g = parseInt(color.substring(3, 5), 16);
    var b = parseInt(color.substring(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 125;
}

// Обработка события изменения видпортета
function onViewportChanged(eventType, eventData) {
    if (eventData.height) {
        setViewportHeight(eventData);
    }
}

function setViewportHeight(data) {
    if (typeof data !== 'undefined') {
        var height = (data.height - mainButtonHeight) + 'px';
        setCssProperty('viewport-height', height);
        setCssProperty('viewport-stable-height', height);
    }
}