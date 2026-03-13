const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Создание папок
['data', 'uploads'].forEach(dir => {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ============================================
// ФАЙЛЫ ДАННЫХ
// ============================================
const FILES = {
    products: path.join(__dirname, 'data', 'products.json'),
    categories: path.join(__dirname, 'data', 'categories.json'),
    admin: path.join(__dirname, 'data', 'admin.json'),
    orders: path.join(__dirname, 'data', 'orders.json'),
    settings: path.join(__dirname, 'data', 'settings.json'),
    analytics: path.join(__dirname, 'data', 'analytics.json'),
    changelog: path.join(__dirname, 'data', 'changelog.json')
};

function read(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { return Array.isArray(defaultData(file)) ? [] : {}; }
}

function write(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function defaultData(file) {
    return [];
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ДАННЫХ
// ============================================
function init() {
    // Products
    if (!fs.existsSync(FILES.products)) {
        write(FILES.products, [
            {
                id: 1, name: 'Диван «Аристократ»', category: 'Прямые диваны',
                price: 45000, oldPrice: 55000,
                description: 'Элегантный прямой диван с мягкими подушками и прочным каркасом.',
                images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
                modules: ['Подлокотники деревянные', 'Ящик для белья', 'Подушки декоративные'],
                colors: ['Серый', 'Бежевый', 'Синий'],
                dimensions: '220×95×85 см', material: 'Велюр, массив берёзы',
                inStock: true, featured: true, createdAt: new Date().toISOString()
            },
            {
                id: 2, name: 'Диван «Модерн Люкс»', category: 'Угловые диваны',
                price: 68000, oldPrice: 82000,
                description: 'Просторный угловой диван с механизмом трансформации «дельфин».',
                images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800'],
                modules: ['Оттоманка', 'Бар в подлокотнике', 'USB-зарядка'],
                colors: ['Тёмно-серый', 'Коричневый', 'Зелёный'],
                dimensions: '310×180×90 см', material: 'Рогожка, металлокаркас',
                inStock: true, featured: true, createdAt: new Date().toISOString()
            },
            {
                id: 3, name: 'Диван «Скандинавия»', category: 'Прямые диваны',
                price: 38000, oldPrice: null,
                description: 'Лаконичный диван в скандинавском стиле с высокими ножками.',
                images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800'],
                modules: ['Съёмные подушки', 'Съёмный чехол'],
                colors: ['Светло-серый', 'Белый', 'Мятный'],
                dimensions: '200×88×80 см', material: 'Хлопок, дуб',
                inStock: true, featured: false, createdAt: new Date().toISOString()
            },
            {
                id: 4, name: 'Диван «Честер Классик»', category: 'Прямые диваны',
                price: 95000, oldPrice: 110000,
                description: 'Классический Честерфилд с каретной стяжкой. Роскошь и элегантность.',
                images: ['https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800'],
                modules: ['Каретная стяжка', 'Латунные колёсики'],
                colors: ['Тёмно-зелёный', 'Бордовый', 'Коричневый'],
                dimensions: '230×90×78 см', material: 'Натуральная кожа, дуб',
                inStock: true, featured: true, createdAt: new Date().toISOString()
            },
            {
                id: 5, name: 'Диван «Облако»', category: 'Модульные диваны',
                price: 120000, oldPrice: 145000,
                description: 'Модульный диван из 5 секций — собирайте свою конфигурацию.',
                images: ['https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800'],
                modules: ['Угловой модуль', 'Прямой модуль', 'Пуф-модуль', 'Встроенный столик'],
                colors: ['Кремовый', 'Серо-голубой'],
                dimensions: 'Настраиваемый', material: 'Микрофибра, фанера берёзовая',
                inStock: true, featured: true, createdAt: new Date().toISOString()
            },
            {
                id: 6, name: 'Диван «Компакт»', category: 'Малогабаритные диваны',
                price: 25000, oldPrice: 30000,
                description: 'Компактный диван для небольших помещений с механизмом «книжка».',
                images: ['https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800'],
                modules: ['Ящи�� для белья', 'Механизм книжка'],
                colors: ['Серый', 'Бежевый', 'Голубой'],
                dimensions: '155×85×82 см', material: 'Шенилл, ЛДСП',
                inStock: true, featured: false, createdAt: new Date().toISOString()
            }
        ]);
    }

    // Categories
    if (!fs.existsSync(FILES.categories)) {
        write(FILES.categories, [
            { id: 1, name: 'Прямые диваны', icon: '◆' },
            { id: 2, name: 'Угловые диваны', icon: '◆' },
            { id: 3, name: 'Модульные диваны', icon: '◆' },
            { id: 4, name: 'Малогабаритные диваны', icon: '◆' },
            { id: 5, name: 'Диваны-кровати', icon: '◆' }
        ]);
    }

    // Admin
    if (!fs.existsSync(FILES.admin)) {
        write(FILES.admin, { username: 'admin', password: 'alliance2024' });
    }

    // Orders
    if (!fs.existsSync(FILES.orders)) write(FILES.orders, []);

    // Settings
    if (!fs.existsSync(FILES.settings)) {
        write(FILES.settings, {
            // Hero
            heroBadge: 'Премиум качество',
            heroTitle1: 'Создаём',
            heroTitle2: 'пространство',
            heroTitle3: 'вашего комфорта',
            heroSubtitle: 'Дизайнерские диваны от производителя с доставкой по всей России. Качественные материалы, современный дизайн, доступные цены.',
            heroBtn1: 'Смотреть каталог',
            heroBtn2: 'О компании',
            stat1Value: '500', stat1Label: 'Моделей',
            stat2Value: '12', stat2Label: 'Лет опыта',
            stat3Value: '15000', stat3Label: 'Клиентов',

            // Marquee
            marqueeItems: ['Бесплатная доставка', 'Гарантия 5 лет', 'Рассрочка 0%', '500+ моделей', 'Своё производство'],

            // About
            aboutTag: 'О компании',
            aboutTitle: 'Почему выбирают',
            aboutTitleAccent: 'Альянс',
            aboutSubtitle: 'Мы создаём мебель, которая делает ваш дом уютнее',
            aboutCards: [
                { icon: 'fas fa-gem', title: 'Премиум материалы', text: 'Используем только сертифицированные материалы европейского качества' },
                { icon: 'fas fa-truck', title: 'Быстрая доставка', text: 'Доставляем по всей России в течение 3-7 рабочих дней' },
                { icon: 'fas fa-shield-alt', title: 'Гарантия 5 лет', text: 'Расширенная гарантия на все изделия и бесплатный сервис' },
                { icon: 'fas fa-paint-brush', title: 'Индивидуальный дизайн', text: 'Изготовим мебель по вашему проекту с учётом всех пожеланий' }
            ],

            // Catalog
            catalogTag: 'Каталог',
            catalogTitle: 'Наши',
            catalogTitleAccent: 'диваны',
            catalogSubtitle: 'Выберите идеальный диван для вашего интерьера',

            // Features
            featuresTag: 'Преимущества',
            featuresTitle: 'Что нас',
            featuresTitleAccent: 'отличает',
            featureCards: [
                { number: '01', title: 'Собственное производство', text: 'Полный цикл изготовления на собственной фабрике площадью 5000 м2' },
                { number: '02', title: 'Экологичность', text: 'Все материалы проходят сертификацию на экологическую безопасность' },
                { number: '03', title: 'Доступные цены', text: 'Работаем без посредников — цены ниже рыночных на 20-30%' },
                { number: '04', title: '3D-визуализация', text: 'Покажем, как диван будет выглядеть в вашем интерьере до покупки' }
            ],

            // Contact
            contactTag: 'Контакты',
            contactTitle: 'Свяжитесь',
            contactTitleAccent: 'с нами',
            contactAddress: 'г. Москва, ул. Мебельная, д. 15',
            contactPhone: '+7 (999) 123-45-67',
            contactEmail: 'info@alliance-mebel.ru',
            contactSchedule: 'Пн-Пт: 9:00 - 20:00',

            // Footer
            footerText: 'Создаём мебель мечты с 2012 года. Качество, которому доверяют.',
            footerCopyright: '© 2024 Альянс Мебель. Все права защищены.',

            // Social
            socialVk: '#',
            socialTelegram: '#',
            socialWhatsapp: '#',
            socialInstagram: '#',

            // Order email
            orderEmail: 'kcel046@gmail.com',
            gmailAppPassword: '',

            // Checkout form fields
            checkoutFields: {
                name: { label: 'Имя', required: true, enabled: true, placeholder: 'Ваше имя' },
                phone: { label: 'Телефон', required: true, enabled: true, placeholder: '+7 (___) ___-__-__' },
                email: { label: 'Email', required: false, enabled: true, placeholder: 'email@example.com' },
                address: { label: 'Адрес доставки', required: false, enabled: true, placeholder: 'Город, улица, дом' },
                comment: { label: 'Комментарий', required: false, enabled: true, placeholder: 'Пожелания' }
            }
        });
    }

    // Analytics
    if (!fs.existsSync(FILES.analytics)) {
        write(FILES.analytics, {
            totalViews: 0,
            totalVisitors: 0,
            dailyViews: {},
            dailyVisitors: {},
            visitorIPs: {},
            pageViews: {}
        });
    }

    // Changelog
    if (!fs.existsSync(FILES.changelog)) write(FILES.changelog, []);
}

init();

// ============================================
// HELPERS
// ============================================
function nextId(arr) {
    return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

function addLog(action, details) {
    const logs = read(FILES.changelog);
    logs.push({
        id: logs.length + 1,
        action,
        details,
        date: new Date().toISOString()
    });
    // Хранить последние 500 записей
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    write(FILES.changelog, logs);
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// ============================================
// АНАЛИТИКА — трекинг
// ============================================
app.post('/api/track', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const page = req.body.page || '/';
    const d = today();

    const analytics = read(FILES.analytics);

    // Views
    analytics.totalViews = (analytics.totalViews || 0) + 1;
    if (!analytics.dailyViews) analytics.dailyViews = {};
    analytics.dailyViews[d] = (analytics.dailyViews[d] || 0) + 1;

    // Page views
    if (!analytics.pageViews) analytics.pageViews = {};
    analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;

    // Unique visitors (по IP + дате)
    if (!analytics.visitorIPs) analytics.visitorIPs = {};
    if (!analytics.dailyVisitors) analytics.dailyVisitors = {};

    const visitorKey = ip + '_' + d;
    if (!analytics.visitorIPs[visitorKey]) {
        analytics.visitorIPs[visitorKey] = true;
        analytics.totalVisitors = (analytics.totalVisitors || 0) + 1;
        analytics.dailyVisitors[d] = (analytics.dailyVisitors[d] || 0) + 1;
    }

    // Очистка старых IP (> 30 дней)
    const keys = Object.keys(analytics.visitorIPs);
    if (keys.length > 10000) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffStr = cutoff.toISOString().slice(0, 10);
        keys.forEach(k => {
            const datePart = k.split('_').pop();
            if (datePart < cutoffStr) delete analytics.visitorIPs[k];
        });
    }

    write(FILES.analytics, analytics);
    res.json({ ok: true });
});

app.get('/api/analytics', (req, res) => {
    const analytics = read(FILES.analytics);
    // Не отправляем IP клиенту
    const { visitorIPs, ...safe } = analytics;
    res.json(safe);
});

// ============================================
// CHANGELOG
// ============================================
app.get('/api/changelog', (req, res) => {
    const logs = read(FILES.changelog);
    res.json(logs.reverse().slice(0, 100));
});

// ============================================
// SETTINGS
// ============================================
app.get('/api/settings', (req, res) => {
    res.json(read(FILES.settings));
});

app.put('/api/settings', (req, res) => {
    const current = read(FILES.settings);
    const updated = { ...current, ...req.body };
    write(FILES.settings, updated);
    addLog('Настройки обновлены', Object.keys(req.body).join(', '));
    res.json(updated);
});

// ============================================
// ADMIN AUTH
// ============================================
app.post('/api/admin/login', (req, res) => {
    const admin = read(FILES.admin);
    const { username, password } = req.body;
    if (username === admin.username && password === admin.password) {
        addLog('Вход в админку', `Пользователь: ${username}`);
        res.json({ success: true, token: 'alliance-' + Date.now() });
    } else {
        res.status(401).json({ error: 'Неверные данные' });
    }
});

app.put('/api/admin/credentials', (req, res) => {
    const admin = read(FILES.admin);
    const { currentPassword, newUsername, newPassword } = req.body;

    if (currentPassword !== admin.password) {
        return res.status(403).json({ error: 'Неверный текущий пароль' });
    }

    if (newUsername) admin.username = newUsername;
    if (newPassword) admin.password = newPassword;

    write(FILES.admin, admin);
    addLog('Смена учётных данных', `Логин: ${admin.username}`);
    res.json({ success: true, username: admin.username });
});

// ============================================
// PRODUCTS CRUD
// ============================================
app.get('/api/products', (req, res) => res.json(read(FILES.products)));

app.get('/api/products/:id', (req, res) => {
    const p = read(FILES.products).find(x => x.id === +req.params.id);
    p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/products', (req, res) => {
    const arr = read(FILES.products);
    const item = { id: nextId(arr), ...req.body, createdAt: new Date().toISOString() };
    arr.push(item);
    write(FILES.products, arr);
    addLog('Товар добавлен', item.name);
    res.json(item);
});

app.put('/api/products/:id', (req, res) => {
    const arr = read(FILES.products);
    const i = arr.findIndex(x => x.id === +req.params.id);
    if (i === -1) return res.status(404).json({ error: 'Not found' });
    arr[i] = { ...arr[i], ...req.body, id: +req.params.id };
    write(FILES.products, arr);
    addLog('Товар изменён', arr[i].name);
    res.json(arr[i]);
});

app.delete('/api/products/:id', (req, res) => {
    let arr = read(FILES.products);
    const item = arr.find(x => x.id === +req.params.id);
    arr = arr.filter(x => x.id !== +req.params.id);
    write(FILES.products, arr);
    addLog('Товар удалён', item ? item.name : 'ID: ' + req.params.id);
    res.json({ success: true });
});

// ============================================
// CATEGORIES CRUD
// ============================================
app.get('/api/categories', (req, res) => res.json(read(FILES.categories)));

app.post('/api/categories', (req, res) => {
    const arr = read(FILES.categories);
    const item = { id: nextId(arr), ...req.body };
    arr.push(item);
    write(FILES.categories, arr);
    addLog('Категория добавлена', item.name);
    res.json(item);
});

app.put('/api/categories/:id', (req, res) => {
    const arr = read(FILES.categories);
    const i = arr.findIndex(x => x.id === +req.params.id);
    if (i === -1) return res.status(404).json({ error: 'Not found' });
    arr[i] = { ...arr[i], ...req.body, id: +req.params.id };
    write(FILES.categories, arr);
    addLog('Категория изменена', arr[i].name);
    res.json(arr[i]);
});

app.delete('/api/categories/:id', (req, res) => {
    let arr = read(FILES.categories);
    const item = arr.find(x => x.id === +req.params.id);
    arr = arr.filter(x => x.id !== +req.params.id);
    write(FILES.categories, arr);
    addLog('Категория удалена', item ? item.name : '');
    res.json({ success: true });
});

// ============================================
// FILE UPLOAD
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = '/uploads/' + req.file.filename;
    addLog('Файл загружен', req.file.filename);
    res.json({ url });
});

// ============================================
// ORDERS
// ============================================
app.get('/api/orders', (req, res) => res.json(read(FILES.orders)));

app.delete('/api/orders/:index', (req, res) => {
    const arr = read(FILES.orders);
    const idx = +req.params.index;
    if (idx >= 0 && idx < arr.length) {
        const removed = arr.splice(idx, 1);
        write(FILES.orders, arr);
        addLog('Заказ удалён', removed[0]?.name || '');
    }
    res.json({ success: true });
});

app.post('/api/order', async (req, res) => {
    const { name, phone, email, address, comment, items, total } = req.body;
    const settings = read(FILES.settings);

    // Сохраняем заказ
    const orders = read(FILES.orders);
    orders.push({ ...req.body, date: new Date().toISOString(), status: 'new' });
    write(FILES.orders, orders);
    addLog('Новый заказ', `${name}, ${phone}, ${total} ₽`);

    // Email
    let itemsHtml = (items || []).map(it => `
        <tr>
            <td style="padding:8px;border:1px solid #333;">${it.name}</td>
            <td style="padding:8px;border:1px solid #333;text-align:center;">${it.quantity}</td>
            <td style="padding:8px;border:1px solid #333;text-align:right;">${Number(it.price).toLocaleString('ru-RU')} ₽</td>
        </tr>
    `).join('');

    const mailHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e8e4dc;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1a1a28,#0a0a0f);padding:32px;border-bottom:2px solid #c8a55a;">
            <h1 style="margin:0;color:#c8a55a;letter-spacing:4px;">АЛЬЯНС</h1>
            <p style="margin:8px 0 0;color:#9a9a9a;">Новый заказ с сайта</p>
        </div>
        <div style="padding:28px;">
            <h2 style="color:#c8a55a;font-size:16px;">Контактные данные</h2>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Телефон:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email || '—'}</p>
            <p><strong>Адрес:</strong> ${address || '—'}</p>
            ${comment ? `<p><strong>Комментарий:</strong> ${comment}</p>` : ''}
            <h2 style="color:#c8a55a;font-size:16px;margin-top:24px;">Состав заказа</h2>
            <table style="width:100%;border-collapse:collapse;color:#e8e4dc;">
                <thead><tr style="background:#1a1a28;">
                    <th style="padding:8px;text-align:left;">Товар</th>
                    <th style="padding:8px;">Кол-во</th>
                    <th style="padding:8px;text-align:right;">Цена</th>
                </tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top:20px;padding:16px;background:#c8a55a;color:#0a0a0f;border-radius:8px;text-align:center;">
                <strong style="font-size:18px;">Итого: ${Number(total).toLocaleString('ru-RU')} ₽</strong>
            </div>
        </div>
        <div style="padding:16px;text-align:center;color:#555;font-size:12px;border-top:1px solid #1a1a28;">
            ${new Date().toLocaleString('ru-RU')}
        </div>
    </div>`;

    try {
        const orderEmail = settings.orderEmail || 'kcel046@gmail.com';
        const appPass = settings.gmailAppPassword || process.env.GMAIL_APP_PASSWORD;

        if (appPass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: orderEmail, pass: appPass }
            });

            await transporter.sendMail({
                from: `"Альянс Мебель" <${orderEmail}>`,
                to: orderEmail,
                subject: `Новый заказ от ${name} — ${Number(total).toLocaleString('ru-RU')} ₽`,
                html: mailHtml
            });
        }

        res.json({ success: true, message: 'Заявка отправлена' });
    } catch (err) {
        console.error('Email error:', err.message);
        res.json({ success: true, message: 'Заявка сохранена' });
    }
});

// ============================================
// PAGES
// ============================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ============================================
// START
// ============================================
app.listen(PORT, () => {
    console.log(`\n  ✦  АЛЬЯНС — сервер запущен`);
    console.log(`  ✦  http://localhost:${PORT}`);
    console.log(`  ✦  Админка: http://localhost:${PORT}/admin\n`);
});