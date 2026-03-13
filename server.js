// ============================================
// SERVER.JS — Express сервер АЛЬЯНС
// ============================================

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// РАБОТА С ДАННЫМИ
// ============================================

const DATA_FILE = path.join(__dirname, 'data', 'data.json');

function initData() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            products: [],
            modules: [],
            orders: [],
            settings: {
                email: 'kcel046@gmail.com',
                promoBanner: { text: '', active: false },
                fabrics: [
                    { id: 1, name: 'Велюр', price: 0 },
                    { id: 2, name: 'Рогожка', price: 0 },
                    { id: 3, name: 'Экокожа', price: 5000 },
                    { id: 4, name: 'Натуральная кожа', price: 25000 },
                    { id: 5, name: 'Микрофибра', price: 2000 },
                    { id: 6, name: 'Жаккард', price: 3000 },
                    { id: 7, name: 'Флок', price: 1500 },
                    { id: 8, name: 'Шенилл', price: 4000 }
                ],
                colors: [
                    { id: 1, name: 'Серый', hex: '#808080' },
                    { id: 2, name: 'Бежевый', hex: '#F5F5DC' },
                    { id: 3, name: 'Коричневый', hex: '#8B4513' },
                    { id: 4, name: 'Синий', hex: '#4169E1' },
                    { id: 5, name: 'Зелёный', hex: '#2E8B57' },
                    { id: 6, name: 'Белый', hex: '#FFFFFF' },
                    { id: 7, name: 'Чёрный', hex: '#000000' },
                    { id: 8, name: 'Бордовый', hex: '#800020' },
                    { id: 9, name: 'Горчичный', hex: '#FFDB58' }
                ],
                legs: [
                    { id: 1, name: 'Деревянные (бук)', price: 0 },
                    { id: 2, name: 'Металлические хром', price: 2000 },
                    { id: 3, name: 'Металлические чёрные', price: 1500 },
                    { id: 4, name: 'Пластиковые', price: -1000 },
                    { id: 5, name: 'Деревянные (дуб)', price: 3000 }
                ],
                mechanisms: [
                    { id: 1, name: 'Еврокнижка', price: 0 },
                    { id: 2, name: 'Дельфин', price: 3000 },
                    { id: 3, name: 'Аккордеон', price: 5000 },
                    { id: 4, name: 'Пума', price: 4000 },
                    { id: 5, name: 'Пантограф', price: 6000 },
                    { id: 6, name: 'Клик-кляк', price: 2000 },
                    { id: 7, name: 'Без механизма', price: -2000 }
                ],
                fillers: [
                    { id: 1, name: 'ППУ стандарт', price: 0 },
                    { id: 2, name: 'ППУ повышенной плотности', price: 3000 },
                    { id: 3, name: 'Пружинный блок Боннель', price: 5000 },
                    { id: 4, name: 'Независимые пружины', price: 8000 },
                    { id: 5, name: 'Memory Foam', price: 12000 },
                    { id: 6, name: 'Латекс', price: 15000 },
                    { id: 7, name: 'Кокосовая койра', price: 4000 }
                ],
                extras: [
                    { id: 1, name: 'Бельевой ящик', price: 3000 },
                    { id: 2, name: 'USB-зарядка', price: 2500 },
                    { id: 3, name: 'LED подсветка', price: 4000 },
                    { id: 4, name: 'Подстаканники', price: 1500 },
                    { id: 5, name: 'Полка в подлокотнике', price: 2000 },
                    { id: 6, name: 'Регулируемые подголовники', price: 5000 },
                    { id: 7, name: 'Выкатной столик', price: 3500 },
                    { id: 8, name: 'Встроенная акустика', price: 8000 }
                ],
                deliveryZones: [
                    { id: 1, name: 'По городу', price: 0, minOrder: 50000 },
                    { id: 2, name: 'По области (до 50 км)', price: 2000, minOrder: 0 },
                    { id: 3, name: 'По области (50-100 км)', price: 4000, minOrder: 0 },
                    { id: 4, name: 'Межгород (до 500 км)', price: 8000, minOrder: 0 }
                ],
                sizes: {
                    straight: [
                        { id: 1, name: 'Компакт', width: '160-180', depth: '85-90', height: '80-85' },
                        { id: 2, name: 'Стандарт', width: '200-220', depth: '90-95', height: '85' },
                        { id: 3, name: 'Комфорт', width: '230-250', depth: '95-100', height: '85-90' }
                    ],
                    corner: [
                        { id: 1, name: 'Малый', width: '220-250', depth: '150-170', height: '85' },
                        { id: 2, name: 'Средний', width: '270-300', depth: '170-190', height: '85-90' },
                        { id: 3, name: 'Большой', width: '310-350', depth: '190-220', height: '85-90' }
                    ]
                }
            },
            admins: [
                { phone: '79056704413', password: 'admin123' }
            ],
            activity: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Создан файл данных:', DATA_FILE);
    }
}

function getData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error('❌ Ошибка чтения данных:', e);
        return null;
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('❌ Ошибка сохранения:', e);
        return false;
    }
}

initData();

// ============================================
// API ROUTES
// ============================================

// Все данные
app.get('/api/data', (req, res) => {
    const data = getData();
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ error: 'Ошибка загрузки данных' });
    }
});

// === PRODUCTS ===
app.get('/api/products', (req, res) => {
    const data = getData();
    res.json(data?.products || []);
});

app.post('/api/products', (req, res) => {
    const data = getData();
    const product = req.body;
    
    if (product.id) {
        const index = data.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            data.products[index] = product;
        }
    } else {
        product.id = Date.now();
        data.products.push(product);
    }
    
    saveData(data);
    res.json({ success: true, product });
});

app.delete('/api/products/:id', (req, res) => {
    const data = getData();
    const id = parseInt(req.params.id);
    data.products = data.products.filter(p => p.id !== id);
    saveData(data);
    res.json({ success: true });
});

// === MODULES ===
app.get('/api/modules', (req, res) => {
    const data = getData();
    res.json(data?.modules || []);
});

app.post('/api/modules', (req, res) => {
    const data = getData();
    const module = req.body;
    
    if (module.id) {
        const index = data.modules.findIndex(m => m.id === module.id);
        if (index !== -1) {
            data.modules[index] = module;
        }
    } else {
        module.id = Date.now();
        data.modules.push(module);
    }
    
    saveData(data);
    res.json({ success: true, module });
});

app.delete('/api/modules/:id', (req, res) => {
    const data = getData();
    const id = parseInt(req.params.id);
    data.modules = data.modules.filter(m => m.id !== id);
    saveData(data);
    res.json({ success: true });
});

// === ORDERS ===
app.get('/api/orders', (req, res) => {
    const data = getData();
    res.json(data?.orders || []);
});

app.post('/api/orders', async (req, res) => {
    const data = getData();
    const order = req.body;
    order.id = Date.now();
    order.date = new Date().toISOString();
    order.status = 'new';
    
    data.orders.push(order);
    
    // Добавляем активность
    data.activity.unshift({
        text: `Новый заказ #${order.id} от ${order.name}`,
        time: new Date().toISOString()
    });
    
    saveData(data);
    
    // Отправляем email
    try {
        await sendOrderEmail(order, data.settings.email);
        console.log('📧 Email отправлен на:', data.settings.email);
    } catch (e) {
        console.error('❌ Ошибка отправки email:', e.message);
    }
    
    res.json({ success: true, order });
});

app.put('/api/orders/:id', (req, res) => {
    const data = getData();
    const id = parseInt(req.params.id);
    const index = data.orders.findIndex(o => o.id === id);
    
    if (index !== -1) {
        data.orders[index] = { ...data.orders[index], ...req.body };
        saveData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Заказ не найден' });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    const data = getData();
    const id = parseInt(req.params.id);
    data.orders = data.orders.filter(o => o.id !== id);
    saveData(data);
    res.json({ success: true });
});

// === SETTINGS ===
app.get('/api/settings', (req, res) => {
    const data = getData();
    res.json(data?.settings || {});
});

app.post('/api/settings', (req, res) => {
    const data = getData();
    data.settings = { ...data.settings, ...req.body };
    saveData(data);
    res.json({ success: true, settings: data.settings });
});

// Отдельные настройки
const settingsRoutes = ['fabrics', 'colors', 'legs', 'mechanisms', 'fillers', 'extras', 'deliveryZones', 'sizes'];
settingsRoutes.forEach(route => {
    app.post(`/api/settings/${route}`, (req, res) => {
        const data = getData();
        data.settings[route] = req.body;
        saveData(data);
        res.json({ success: true });
    });
});

// === ADMINS ===
app.get('/api/admins', (req, res) => {
    const data = getData();
    res.json(data?.admins || []);
});

app.post('/api/admins', (req, res) => {
    const data = getData();
    data.admins = req.body;
    saveData(data);
    res.json({ success: true });
});

app.post('/api/auth', (req, res) => {
    const data = getData();
    const { phone, password } = req.body;
    
    const normalizedPhone = phone.replace(/\D/g, '').replace(/^8/, '7');
    
    const admin = data.admins.find(a => {
        const adminPhone = a.phone.replace(/\D/g, '').replace(/^8/, '7');
        return adminPhone === normalizedPhone && a.password === password;
    });
    
    if (admin) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Неверные данные' });
    }
});

// === ACTIVITY ===
app.get('/api/activity', (req, res) => {
    const data = getData();
    res.json(data?.activity || []);
});

app.post('/api/activity', (req, res) => {
    const data = getData();
    const activity = {
        text: req.body.text,
        time: new Date().toISOString()
    };
    
    data.activity.unshift(activity);
    if (data.activity.length > 100) {
        data.activity = data.activity.slice(0, 100);
    }
    
    saveData(data);
    res.json({ success: true });
});

// ============================================
// EMAIL SERVICE
// ============================================

async function sendOrderEmail(order, toEmail) {
    // Проверяем наличие SMTP настроек
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('⚠️ SMTP не настроен. Заказ:', order.id);
        console.log('📧 Должно отправиться на:', toEmail);
        return;
    }
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Формируем таблицу товаров
    let itemsHtml = '<table style="width:100%;border-collapse:collapse;margin:20px 0;">';
    itemsHtml += '<tr style="background:#f5f1ec;"><th style="padding:12px;border:1px solid #e4dfd8;text-align:left;">Товар</th><th style="padding:12px;border:1px solid #e4dfd8;text-align:center;">Кол-во</th><th style="padding:12px;border:1px solid #e4dfd8;text-align:right;">Сумма</th></tr>';
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsHtml += `<tr>
                <td style="padding:12px;border:1px solid #e4dfd8;">${item.name}</td>
                <td style="padding:12px;border:1px solid #e4dfd8;text-align:center;">${item.qty}</td>
                <td style="padding:12px;border:1px solid #e4dfd8;text-align:right;font-weight:600;">${(item.price * item.qty).toLocaleString('ru-RU')} ₽</td>
            </tr>`;
        });
    }
    
    itemsHtml += `<tr style="background:#f5f1ec;font-weight:700;">
        <td colspan="2" style="padding:12px;border:1px solid #e4dfd8;">ИТОГО:</td>
        <td style="padding:12px;border:1px solid #e4dfd8;text-align:right;color:#b08d6e;font-size:1.1em;">${order.total.toLocaleString('ru-RU')} ₽</td>
    </tr>`;
    itemsHtml += '</table>';

    const mailOptions = {
        from: `"🛋️ АЛЬЯНС Мебель" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `Новый заказ #${order.id} на ${order.total.toLocaleString('ru-RU')} ₽`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#1a1a1a,#2c2c2c);padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#b08d6e;font-size:28px;">◆ АЛЬЯНС</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;">МЕБЕЛЬ ДЛЯ ЖИЗНИ</p>
                </div>
                
                <!-- Content -->
                <div style="padding:30px;background:#ffffff;border:1px solid #e4dfd8;border-top:none;">
                    <div style="background:#e8f5e9;border-left:4px solid #27ae60;padding:15px 20px;margin-bottom:25px;">
                        <h2 style="margin:0;color:#27ae60;font-size:18px;">✓ Новый заказ #${order.id}</h2>
                    </div>
                    
                    <div style="background:#f5f1ec;padding:20px;border-radius:8px;margin-bottom:25px;">
                        <h3 style="margin:0 0 15px;color:#1a1a1a;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Данные клиента</h3>
                        <p style="margin:8px 0;font-size:15px;"><strong>👤 Имя:</strong> ${order.name}</p>
                        <p style="margin:8px 0;font-size:15px;"><strong>📱 Телефон:</strong> <a href="tel:${order.phone}" style="color:#b08d6e;text-decoration:none;">${order.phone}</a></p>
                        ${order.email ? `<p style="margin:8px 0;font-size:15px;"><strong>✉️ Email:</strong> <a href="mailto:${order.email}" style="color:#b08d6e;text-decoration:none;">${order.email}</a></p>` : ''}
                        ${order.comment ? `<p style="margin:8px 0;font-size:15px;"><strong>💬 Комментарий:</strong> ${order.comment}</p>` : ''}
                    </div>
                    
                    <h3 style="margin:0 0 15px;color:#1a1a1a;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Состав заказа</h3>
                    ${itemsHtml}
                    
                    <div style="text-align:center;margin-top:30px;padding-top:25px;border-top:1px solid #e4dfd8;">
                        <p style="margin:0;color:#7a7a7a;font-size:13px;">
                            Заказ получен: ${new Date(order.date).toLocaleString('ru-RU')}
                        </p>
                        <p style="margin:10px 0 0;color:#b08d6e;font-weight:600;">
                            Свяжитесь с клиентом для подтверждения заказа
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align:center;padding:20px;color:#7a7a7a;font-size:11px;">
                    © ${new Date().getFullYear()} АЛЬЯНС. Мебель для жизни.
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

// Тест email
app.post('/api/test-email', async (req, res) => {
    const data = getData();
    const testOrder = {
        id: 'TEST-' + Date.now(),
        name: 'Тестовый заказ',
        phone: '+7 (999) 123-45-67',
        email: 'test@example.com',
        items: [
            { name: 'Диван Альянс-Премиум', qty: 1, price: 72990 },
            { name: 'Пуф квадратный', qty: 2, price: 7990 }
        ],
        total: 88970,
        date: new Date().toISOString()
    };
    
    try {
        await sendOrderEmail(testOrder, data.settings.email);
        res.json({ success: true, message: '✅ Тестовое письмо отправлено на ' + data.settings.email });
    } catch (e) {
        res.status(500).json({ error: '❌ Ошибка: ' + e.message });
    }
});

// ============================================
// SPA FALLBACK
// ============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// START
// ============================================
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║     🛋️  АЛЬЯНС — Мебель для жизни            ║
║                                               ║
║     Сервер: http://localhost:${PORT}             ║
║     Статус: ✅ Работает                        ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
});