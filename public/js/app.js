// ============================================
// APP.JS — Основная логика сайта
// ============================================

// === ДАННЫЕ ПО УМОЛЧАНИЮ ===
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Альянс Классик",
        category: "straight",
        price: 38990,
        oldPrice: 48000,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        description: "Прямой диван с чистыми линиями. Идеальный союз формы и комфорта от АЛЬЯНС",
        badges: ["sale"],
        discount: 19,
        size: "210×92×85 см",
        material: "Велюр",
        sleep: "140×190 см",
        availability: "instock"
    },
    {
        id: 2,
        name: "Альянс Премиум",
        category: "corner",
        price: 72990,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
        description: "Угловой диван премиум-класса с раскладным механизмом и бельевым ящиком",
        badges: ["new"],
        discount: 0,
        size: "285×175×90 см",
        material: "Рогожка",
        sleep: "160×200 см",
        availability: "instock"
    },
    {
        id: 3,
        name: "Альянс Модуль Pro",
        category: "modular",
        price: 94990,
        oldPrice: 115000,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        description: "Модульная система из 6 секций — создайте свою идеальную конфигурацию",
        badges: ["new", "hit"],
        discount: 17,
        size: "Конфигурируемый",
        material: "Велюр/Рогожка",
        sleep: "—",
        availability: "instock"
    },
    {
        id: 4,
        name: "Альянс Лайт",
        category: "straight",
        price: 29990,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800&q=80",
        description: "Компактный прямой диван для небольших пространств. Лёгкий и стильный",
        badges: [],
        discount: 0,
        size: "180×85×80 см",
        material: "Микрофибра",
        sleep: "120×180 см",
        availability: "instock"
    },
    {
        id: 5,
        name: "Альянс Гранд",
        category: "corner",
        price: 89990,
        oldPrice: 105000,
        image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80",
        description: "Роскошный угловой диван с экокожей, USB-зарядкой и подсветкой",
        badges: ["sale", "exclusive"],
        discount: 14,
        size: "310×190×92 см",
        material: "Экокожа",
        sleep: "180×200 см",
        availability: "instock"
    },
    {
        id: 6,
        name: "Альянс Партнёр",
        category: "straight",
        price: 45990,
        oldPrice: 55000,
        image: "https://images.unsplash.com/photo-1491926626787-62db157af940?w=800&q=80",
        description: "Надёжный партнёр для гостиной — диван «еврокнижка»",
        badges: ["sale", "hit"],
        discount: 16,
        size: "230×95×87 см",
        material: "Рогожка",
        sleep: "150×195 см",
        availability: "instock"
    },
    {
        id: 7,
        name: "Альянс Угловой Макс",
        category: "corner",
        price: 79990,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?w=800&q=80",
        description: "Вместительный угловой диван-трансформер со спальным местом 180×200",
        badges: ["new"],
        discount: 0,
        size: "300×180×88 см",
        material: "Велюр",
        sleep: "180×200 см",
        availability: "order"
    },
    {
        id: 8,
        name: "Альянс Модуль Старт",
        category: "modular",
        price: 64990,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80",
        description: "Базовый набор модульной системы: 3 прямых + угловая секция",
        badges: ["new"],
        discount: 0,
        size: "Конфигурируемый",
        material: "Рогожка",
        sleep: "—",
        availability: "instock"
    }
];

const DEFAULT_MODULES = [
    {
        id: 101,
        name: "Прямая секция 100 см",
        type: "straight-section",
        price: 14990,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
        description: "Базовая прямая секция для модульной системы АЛЬЯНС",
        size: "100×90×85 см",
        parentId: "",
        badges: []
    },
    {
        id: 102,
        name: "Прямая секция 80 см",
        type: "straight-section",
        price: 12490,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80",
        description: "Узкая прямая секция для компактных конфигураций",
        size: "80×90×85 см",
        parentId: "",
        badges: ["new"]
    },
    {
        id: 103,
        name: "Угловая секция 90°",
        type: "corner-section",
        price: 16990,
        oldPrice: 19990,
        image: "https://images.unsplash.com/photo-1512212621149-107ffe572d2f?w=600&q=80",
        description: "Угловая секция для соединения модулей под прямым углом",
        size: "90×90×85 см",
        parentId: "",
        badges: ["sale"]
    },
    {
        id: 104,
        name: "Оттоманка с ящиком",
        type: "ottoman",
        price: 18990,
        oldPrice: 22000,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
        description: "Оттоманка с вместительным бельевым ящиком для хранения",
        size: "140×90×45 см",
        parentId: "",
        badges: ["sale"]
    },
    {
        id: 105,
        name: "Пуф квадратный",
        type: "pouf",
        price: 7990,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
        description: "Мягкий пуф 60×60 — дополнительное сидячее место",
        size: "60×60×42 см",
        parentId: "",
        badges: []
    },
    {
        id: 106,
        name: "Подлокотник мягкий",
        type: "armrest",
        price: 5990,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=600&q=80",
        description: "Съёмный мягкий подлокотник для боковых секций",
        size: "20×90×65 см",
        parentId: "",
        badges: ["new"]
    },
    {
        id: 107,
        name: "Спинка-подушка",
        type: "back-cushion",
        price: 4490,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
        description: "Дополнительная подушка для спинки",
        size: "60×45×20 см",
        parentId: "",
        badges: []
    },
    {
        id: 108,
        name: "Подголовник регулируемый",
        type: "headrest",
        price: 6490,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80",
        description: "Регулируемый подголовник для комфорта шеи",
        size: "55×25×15 см",
        parentId: "",
        badges: ["new"]
    }
];

// === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
let products = JSON.parse(localStorage.getItem('allianceProducts')) || [...DEFAULT_PRODUCTS];
let modules = JSON.parse(localStorage.getItem('allianceModules')) || [...DEFAULT_MODULES];
let cart = JSON.parse(localStorage.getItem('allianceCart')) || [];
let orders = JSON.parse(localStorage.getItem('allianceOrders')) || [];
let activityLog = JSON.parse(localStorage.getItem('allianceActivity')) || [];
let currentFilter = 'all';
let currentSort = 'default';

// === СЛОВАРИ ===
const CATEGORY_NAMES = {
    straight: 'Прямой',
    corner: 'Угловой',
    modular: 'Модульный'
};

const MODULE_TYPE_NAMES = {
    'straight-section': 'Прямая секция',
    'corner-section': 'Угловая секция',
    'ottoman': 'Оттоманка',
    'pouf': 'Пуф',
    'armrest': 'Подлокотник',
    'back-cushion': 'Спинка-подушка',
    'shelf': 'Полка',
    'bed-box': 'Бельевой ящик',
    'headrest': 'Подголовник',
    'other': 'Другое'
};

// ============================================
// PRELOADER
// ============================================
window.addEventListener('load', function () {
    setTimeout(function () {
        document.getElementById('preloader').classList.add('hidden');
    }, 1200);
    initParticles();
    checkPromoBanner();
});

// ============================================
// PARTICLES (Hero)
// ============================================
function initParticles() {
    var container = document.getElementById('heroParticles');
    if (!container) return;
    for (var i = 0; i < 25; i++) {
        var p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (6 + Math.random() * 6) + 's';
        p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
        container.appendChild(p);
    }
}

// ============================================
// NAVBAR SCROLL + PARALLAX
// ============================================
window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;

    // Navbar
    document.getElementById('navbar').classList.toggle('scrolled', scrollY > 80);

    // Hero parallax
    var heroBg = document.getElementById('heroBg');
    if (heroBg) {
        heroBg.style.transform = 'translateY(' + (scrollY * 0.4) + 'px)';
    }

    // Section parallax
    var parallaxBgs = document.querySelectorAll('.parallax-bg[data-speed]');
    for (var i = 0; i < parallaxBgs.length; i++) {
        var bg = parallaxBgs[i];
        var rect = bg.parentElement.getBoundingClientRect();
        var speed = parseFloat(bg.getAttribute('data-speed'));
        bg.style.transform = 'translateY(' + (rect.top * speed) + 'px)';
    }
});

// ============================================
// MOBILE MENU
// ============================================
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('mobile-open');
}

function closeMenu() {
    document.getElementById('navLinks').classList.remove('mobile-open');
}

// ============================================
// SCROLL REVEAL
// ============================================
var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });

function initReveals() {
    var elements = document.querySelectorAll('.reveal');
    for (var i = 0; i < elements.length; i++) {
        revealObserver.observe(elements[i]);
    }
}

// ============================================
// ACCORDION
// ============================================
function toggleAccordion(header) {
    var item = header.parentElement;
    var body = item.querySelector('.accordion-body');
    var wasActive = item.classList.contains('active');

    // Закрыть все
    var allItems = document.querySelectorAll('.accordion-item');
    for (var i = 0; i < allItems.length; i++) {
        allItems[i].classList.remove('active');
        allItems[i].querySelector('.accordion-body').style.maxHeight = '0';
    }

    // Открыть нажатый (если не был открыт)
    if (!wasActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
    }
}

// ============================================
// RENDER PRODUCTS (КАТАЛОГ)
// ============================================
function renderProducts() {
    var grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    // Фильтрация
    var filtered;
    if (currentFilter === 'all') {
        filtered = products.slice();
    } else {
        filtered = products.filter(function (p) {
            return p.category === currentFilter;
        });
    }

    // Сортировка
    switch (currentSort) {
        case 'price-asc':
            filtered.sort(function (a, b) { return a.price - b.price; });
            break;
        case 'price-desc':
            filtered.sort(function (a, b) { return b.price - a.price; });
            break;
        case 'name':
            filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });
            break;
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:50px;color:var(--gray);">Товары не найдены</p>';
        return;
    }

    filtered.forEach(function (p, i) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.style.transitionDelay = (i * 0.08) + 's';

        // Бейджи
        var badgesHTML = '';
        if (p.badges && p.badges.length > 0) {
            badgesHTML = '<div class="product-badges">';
            p.badges.forEach(function (b) {
                if (b === 'new') badgesHTML += '<span class="badge badge-new"><i class="fas fa-sparkles"></i> New</span>';
                if (b === 'sale') badgesHTML += '<span class="badge badge-sale"><i class="fas fa-fire"></i> -' + (p.discount || 0) + '%</span>';
                if (b === 'hit') badgesHTML += '<span class="badge badge-hit"><i class="fas fa-star"></i> Хит</span>';
                if (b === 'exclusive') badgesHTML += '<span class="badge badge-exclusive"><i class="fas fa-gem"></i> Эксклюзив</span>';
            });
            badgesHTML += '</div>';
        }

        // Старая цена
        var oldPriceHTML = '';
        if (p.oldPrice) {
            oldPriceHTML = '<span class="price-old">' + p.oldPrice.toLocaleString('ru-RU') + ' ₽</span>';
        }

        // Мета (размер, материал)
        var metaHTML = '';
        if (p.size || p.material) {
            metaHTML = '<div class="product-meta">';
            if (p.size) metaHTML += '<span><i class="fas fa-ruler"></i> ' + p.size + '</span>';
            if (p.material) metaHTML += '<span><i class="fas fa-palette"></i> ' + p.material + '</span>';
            metaHTML += '</div>';
        }

        // Доступность
        var availHTML = '';
        if (p.availability) {
            var availMap = {
                instock: ['В наличии', 'avail-instock'],
                order: ['Под заказ', 'avail-order'],
                out: ['Нет', 'avail-out']
            };
            var availData = availMap[p.availability];
            if (availData) {
                availHTML = '<span class="availability-badge ' + availData[1] + '">' + availData[0] + '</span>';
            }
        }

        card.innerHTML =
            '<div class="product-image">' +
                '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy"' +
                ' onerror="this.src=\'https://placehold.co/800x600/f0ece4/b08d6e?text=' + encodeURIComponent(p.name) + '\'">' +
                badgesHTML +
                '<div class="product-overlay">' +
                    '<button class="overlay-btn" onclick="addToCart(' + p.id + ',\'product\')" title="В корзину"><i class="fas fa-shopping-bag"></i></button>' +
                    '<button class="overlay-btn" onclick="openQuickView(' + p.id + ')" title="Подробнее"><i class="fas fa-eye"></i></button>' +
                '</div>' +
            '</div>' +
            '<div class="product-info">' +
                '<div style="display:flex;justify-content:space-between;align-items:center">' +
                    '<span class="product-category">' + (CATEGORY_NAMES[p.category] || '') + '</span>' +
                    availHTML +
                '</div>' +
                '<h3 class="product-name">' + p.name + '</h3>' +
                '<p class="product-desc-short">' + (p.description || '') + '</p>' +
                metaHTML +
                '<div class="product-price-row">' +
                    '<div class="product-price">' +
                        '<span class="price-current">' + p.price.toLocaleString('ru-RU') + ' ₽</span>' +
                        oldPriceHTML +
                    '</div>' +
                    '<button class="add-to-cart-btn" onclick="addToCart(' + p.id + ',\'product\')">В корзину</button>' +
                '</div>' +
            '</div>';

        grid.appendChild(card);

        // Анимация появления
        setTimeout(function () {
            card.classList.add('visible');
        }, 80 + i * 80);
    });
}

// ============================================
// RENDER MODULES (Модули)
// ============================================
function renderModules() {
    var grid = document.getElementById('modulesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (modules.length === 0) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:var(--gray);">Модули появятся скоро</p>';
        return;
    }

    modules.forEach(function (m) {
        var card = document.createElement('div');
        card.className = 'module-card reveal';

        // Бейджи
        var badgesHTML = '';
        if (m.badges && m.badges.length > 0) {
            badgesHTML = '<div class="product-badges">';
            m.badges.forEach(function (b) {
                if (b === 'new') badgesHTML += '<span class="badge badge-new"><i class="fas fa-sparkles"></i> New</span>';
                if (b === 'sale') badgesHTML += '<span class="badge badge-sale"><i class="fas fa-fire"></i> Sale</span>';
            });
            badgesHTML += '</div>';
        }

        // Старая цена
        var oldPriceHTML = '';
        if (m.oldPrice) {
            oldPriceHTML = '<span class="price-old" style="margin-left:8px">' + m.oldPrice.toLocaleString('ru-RU') + ' ₽</span>';
        }

        // Размер
        var sizeHTML = '';
        if (m.size) {
            sizeHTML = '<p style="font-size:.72rem;color:var(--gray);margin-bottom:8px"><i class="fas fa-ruler" style="color:var(--accent)"></i> ' + m.size + '</p>';
        }

        card.innerHTML =
            '<div class="module-card-img" style="position:relative">' +
                '<img src="' + m.image + '" alt="' + m.name + '" loading="lazy"' +
                ' onerror="this.src=\'https://placehold.co/600x400/f0ece4/b08d6e?text=' + encodeURIComponent(m.name) + '\'">' +
                badgesHTML +
            '</div>' +
            '<div class="module-card-body">' +
                '<span class="module-type-tag">' + (MODULE_TYPE_NAMES[m.type] || m.type) + '</span>' +
                '<h4>' + m.name + '</h4>' +
                '<p>' + (m.description || '') + '</p>' +
                sizeHTML +
                '<div class="module-price-row">' +
                    '<div>' +
                        '<span class="module-price">' + m.price.toLocaleString('ru-RU') + ' ₽</span>' +
                        oldPriceHTML +
                    '</div>' +
                    '<button class="module-add-btn" onclick="addToCart(' + m.id + ',\'module\')" title="В корзину">' +
                        '<i class="fas fa-plus"></i>' +
                    '</button>' +
                '</div>' +
            '</div>';

        grid.appendChild(card);
    });

    // Подключить reveal для новых элементов
    var newReveals = grid.querySelectorAll('.reveal');
    for (var i = 0; i < newReveals.length; i++) {
        revealObserver.observe(newReveals[i]);
    }
}

// ============================================
// FILTERS & SORT
// ============================================
document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        renderProducts();
    });
});

function sortProducts(value) {
    currentSort = value;
    renderProducts();
}

// ============================================
// QUICK VIEW
// ============================================
function openQuickView(id) {
    var p = products.find(function (x) { return x.id === id; });
    if (!p) return;

    var content = document.getElementById('quickViewContent');
    content.innerHTML =
        '<div class="quick-view-img">' +
            '<img src="' + p.image + '" alt="' + p.name + '"' +
            ' onerror="this.src=\'https://placehold.co/800x600/f0ece4/b08d6e?text=Img\'">' +
        '</div>' +
        '<div class="quick-view-info">' +
            '<span class="product-category">' + (CATEGORY_NAMES[p.category] || '') + '</span>' +
            '<h3>' + p.name + '</h3>' +
            '<p style="color:var(--gray);line-height:1.7;margin:12px 0">' + (p.description || '') + '</p>' +
            (p.size ? '<p style="font-size:.85rem;margin-bottom:5px"><strong>Размеры:</strong> ' + p.size + '</p>' : '') +
            (p.material ? '<p style="font-size:.85rem;margin-bottom:5px"><strong>Материал:</strong> ' + p.material + '</p>' : '') +
            (p.sleep ? '<p style="font-size:.85rem;margin-bottom:15px"><strong>Спальное место:</strong> ' + p.sleep + '</p>' : '') +
            '<div class="product-price" style="margin-bottom:18px">' +
                '<span class="price-current">' + p.price.toLocaleString('ru-RU') + ' ₽</span>' +
                (p.oldPrice ? '<span class="price-old">' + p.oldPrice.toLocaleString('ru-RU') + ' ₽</span>' : '') +
            '</div>' +
            '<button class="add-to-cart-btn" onclick="addToCart(' + p.id + ',\'product\');closeQuickView();" style="width:100%;padding:14px">' +
                '<i class="fas fa-shopping-bag"></i> В корзину' +
            '</button>' +
        '</div>';

    document.getElementById('quickViewModal').classList.add('open');
}

function closeQuickView() {
    document.getElementById('quickViewModal').classList.remove('open');
}

// ============================================
// КОРЗИНА
// ============================================
function toggleCart() {
    document.getElementById('cartOverlay').classList.toggle('open');
    document.getElementById('cartSidebar').classList.toggle('open');
    renderCart();
}

function addToCart(id, type) {
    var source = (type === 'module') ? modules : products;
    var item = source.find(function (x) { return x.id === id; });
    if (!item) return;

    // Проверка доступности
    if (item.availability === 'out') {
        showToast('Товар нет в наличии', 'warning');
        return;
    }

    // Ищем в корзине
    var existing = cart.find(function (c) {
        return c.id === id && c.type === type;
    });

    if (existing) {
        existing.qty += 1;
    } else {
        var cartItem = {};
        // Копируем свойства
        for (var key in item) {
            cartItem[key] = item[key];
        }
        cartItem.qty = 1;
        cartItem.type = type;
        cart.push(cartItem);
    }

    saveCart();
    updateCartCount();
    showToast('«' + item.name + '» добавлен в корзину', 'success');

    // Анимация счётчика
    var counts = document.querySelectorAll('.cart-count');
    for (var i = 0; i < counts.length; i++) {
        counts[i].classList.add('bump');
        (function (el) {
            setTimeout(function () { el.classList.remove('bump'); }, 300);
        })(counts[i]);
    }
}

function changeQty(id, type, delta) {
    var item = cart.find(function (c) {
        return c.id === id && c.type === type;
    });
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(function (c) {
            return !(c.id === id && c.type === type);
        });
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function removeFromCart(id, type) {
    cart = cart.filter(function (c) {
        return !(c.id === id && c.type === type);
    });
    saveCart();
    updateCartCount();
    renderCart();
}

function renderCart() {
    var container = document.getElementById('cartItems');
    var footer = document.getElementById('cartFooter');

    if (cart.length === 0) {
        container.innerHTML =
            '<div class="cart-empty">' +
                '<i class="fas fa-shopping-bag"></i>' +
                '<p>Ваша корзина пуста</p>' +
                '<span>Добавьте товары из каталога</span>' +
            '</div>';
        footer.style.display = 'none';
        return;
    }

    footer.style.display = 'block';
    var total = 0;
    var html = '';

    cart.forEach(function (item) {
        var itemTotal = item.price * item.qty;
        total += itemTotal;

        var catName = '';
        if (item.type === 'module') {
            catName = MODULE_TYPE_NAMES[item.type] || 'Модуль';
        } else {
            catName = CATEGORY_NAMES[item.category] || '';
        }

        html +=
            '<div class="cart-item">' +
                '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-img"' +
                ' onerror="this.src=\'https://placehold.co/140/f0ece4/b08d6e?text=Img\'">' +
                '<div class="cart-item-info">' +
                    '<div class="cart-item-name">' + item.name + '</div>' +
                    '<div class="cart-item-category">' + catName + '</div>' +
                    '<div class="cart-item-qty">' +
                        '<button class="cart-qty-btn" onclick="changeQty(' + item.id + ',\'' + item.type + '\',-1)">−</button>' +
                        '<span>' + item.qty + '</span>' +
                        '<button class="cart-qty-btn" onclick="changeQty(' + item.id + ',\'' + item.type + '\',1)">+</button>' +
                    '</div>' +
                    '<div class="cart-item-price">' + itemTotal.toLocaleString('ru-RU') + ' ₽</div>' +
                '</div>' +
                '<button class="cart-item-remove" onclick="removeFromCart(' + item.id + ',\'' + item.type + '\')">' +
                    '<i class="fas fa-trash-alt"></i>' +
                '</button>' +
            '</div>';
    });

    container.innerHTML = html;
    document.getElementById('cartTotal').textContent = total.toLocaleString('ru-RU') + ' ₽';
}

function updateCartCount() {
    var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var elements = document.querySelectorAll('.cart-count');
    for (var i = 0; i < elements.length; i++) {
        elements[i].textContent = count;
    }
}

function saveCart() {
    localStorage.setItem('allianceCart', JSON.stringify(cart));
}

// ============================================
// ОФОРМЛЕНИЕ ЗАКАЗА
// ============================================
function openCheckout() {
    if (cart.length === 0) return;

    // Закрыть корзину
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('cartSidebar').classList.remove('open');

    // Сформировать сводку
    var total = 0;
    var itemsHTML = '';

    cart.forEach(function (item) {
        var t = item.price * item.qty;
        total += t;
        itemsHTML +=
            '<div class="order-summary-item">' +
                '<span>' + item.name + ' × ' + item.qty + '</span>' +
                '<span>' + t.toLocaleString('ru-RU') + ' ₽</span>' +
            '</div>';
    });

    document.getElementById('orderSummary').innerHTML =
        '<h5>Ваш заказ</h5>' +
        itemsHTML +
        '<div class="order-summary-total">' +
            '<span>Итого:</span>' +
            '<span>' + total.toLocaleString('ru-RU') + ' ₽</span>' +
        '</div>';

    document.getElementById('checkoutModal').classList.add('open');
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
}

function submitOrder(e) {
    e.preventDefault();

    var name = document.getElementById('customerName').value.trim();
    var phone = document.getElementById('customerPhone').value.trim();
    var email = document.getElementById('customerEmail').value.trim();
    var comment = '';
    var commentEl = document.getElementById('customerComment');
    if (commentEl) comment = commentEl.value.trim();

    if (!name || !phone) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }

    var btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';

    // Собираем данные заказа
    var total = 0;
    var orderItemsText = [];
    var orderItemsData = [];

    cart.forEach(function (item) {
        var t = item.price * item.qty;
        total += t;
        orderItemsText.push(item.name + ' × ' + item.qty + ' = ' + t.toLocaleString('ru-RU') + ' ₽');
        orderItemsData.push({ name: item.name, qty: item.qty, price: item.price });
    });

    // Сохраняем заказ локально
    var order = {
        id: Date.now(),
        name: name,
        phone: phone,
        email: email,
        comment: comment,
        items: orderItemsData,
        total: total,
        date: new Date().toISOString(),
        status: 'new'
    };
    orders.push(order);
    localStorage.setItem('allianceOrders', JSON.stringify(orders));
    addActivity('Новый заказ #' + order.id + ' от ' + name + ' на ' + total.toLocaleString('ru-RU') + ' ₽');

    // Отправка на email через FormSubmit
    var orderText =
        'НОВЫЙ ЗАКАЗ — АЛЬЯНС\n' +
        '========================================\n' +
        'Имя: ' + name + '\n' +
        'Телефон: ' + phone + '\n' +
        'Email: ' + (email || 'Не указан') + '\n' +
        'Комментарий: ' + (comment || '—') + '\n' +
        '========================================\n' +
        orderItemsText.join('\n') + '\n' +
        '========================================\n' +
        'ИТОГО: ' + total.toLocaleString('ru-RU') + ' ₽\n' +
        'Дата: ' + new Date().toLocaleString('ru-RU');

    var formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('email', email || 'Не указан');
    formData.append('message', orderText);
    formData.append('_subject', 'Заказ #' + order.id + ' — АЛЬЯНС');
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');

    fetch('https://formsubmit.co/ajax/kcel046@gmail.com', {
        method: 'POST',
        body: formData
    })
    .then(function () { orderSuccess(); })
    .catch(function () { orderSuccess(); })
    .finally(function () {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить заказ';
    });
}

function orderSuccess() {
    showToast('✅ Заказ оформлен! Мы свяжемся с вами', 'success');
    cart = [];
    saveCart();
    updateCartCount();
    closeCheckout();
    document.getElementById('checkoutForm').reset();
}

// ============================================
// ФОРМАТИРОВАНИЕ ТЕЛЕФОНА
// ============================================
function formatPhoneInput(input) {
    input.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '');
        if (v.length > 0 && (v[0] === '7' || v[0] === '8')) {
            var f = '+7';
            if (v.length > 1) f += ' (' + v.substring(1, 4);
            if (v.length > 4) f += ') ' + v.substring(4, 7);
            if (v.length > 7) f += '-' + v.substring(7, 9);
            if (v.length > 9) f += '-' + v.substring(9, 11);
            this.value = f;
        }
    });
}

// Применяем маску ко всем полям телефона
var phoneFields = ['customerPhone', 'adminPhone', 'newAdminPhone'];
phoneFields.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) formatPhoneInput(el);
});

// ============================================
// ПРОМО БАННЕР
// ============================================
function checkPromoBanner() {
    try {
        var promo = JSON.parse(localStorage.getItem('alliancePromo') || '{}');
        if (promo.active && promo.text) {
            document.getElementById('promoTextDisplay').textContent = promo.text;
            document.getElementById('promoBanner').style.display = 'flex';
        }
    } catch (e) {}
}

// ============================================
// ACTIVITY LOG
// ============================================
function addActivity(text) {
    activityLog.unshift({
        text: text,
        time: new Date().toISOString()
    });
    if (activityLog.length > 50) {
        activityLog = activityLog.slice(0, 50);
    }
    localStorage.setItem('allianceActivity', JSON.stringify(activityLog));
}

// ============================================
// TOAST УВЕДОМЛЕНИЯ
// ============================================
function showToast(message, type) {
    type = type || 'info';
    var toast = document.getElementById('toast');
    var icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    var colors = {
        success: '#27ae60',
        error: '#d64541',
        info: '#3498db',
        warning: '#ff9800'
    };

    toast.className = 'toast ' + type;
    toast.innerHTML = '<i class="fas ' + icons[type] + '" style="color:' + colors[type] + '"></i> ' + message;
    toast.classList.add('show');

    setTimeout(function () {
        toast.classList.remove('show');
    }, 3500);
}

// ============================================
// СОХРАНЕНИЕ ДАННЫХ
// ============================================
function saveProducts() {
    localStorage.setItem('allianceProducts', JSON.stringify(products));
}

function saveModules() {
    localStorage.setItem('allianceModules', JSON.stringify(modules));
}

// ============================================
// ЗАКРЫТИЕ ПО ESC И КЛИКУ НА ОВЕРЛЕЙ
// ============================================
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.getElementById('cartOverlay').classList.remove('open');
        document.getElementById('cartSidebar').classList.remove('open');
        closeCheckout();
        closeQuickView();
        closeMenu();
        var loginModal = document.getElementById('adminLoginModal');
        if (loginModal) loginModal.classList.remove('open');
    }
});

document.getElementById('checkoutModal').addEventListener('click', function (e) {
    if (e.target === this) closeCheckout();
});

document.getElementById('quickViewModal').addEventListener('click', function (e) {
    if (e.target === this) closeQuickView();
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    renderProducts();
    renderModules();
    updateCartCount();
    initReveals();
});