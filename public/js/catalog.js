// ============================================
// АЛЬЯНС — Catalog.js
// Загрузка и отображение товаров
// ============================================

let allProducts = [];
let allCategories = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});

// ============================================
// ЗАГРУЗКА КАТЕГОРИЙ
// ============================================
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        allCategories = await res.json();
        renderCategoryFilter();
    } catch (e) {
        console.error('Ошибка загрузки категорий:', e);
    }
}

function renderCategoryFilter() {
    const container = document.getElementById('categoryFilter');
    if (!container) return;

    let html = '<button class="filter-btn active" data-category="all"><span>Все модели</span></button>';

    allCategories.forEach(cat => {
        html += `<button class="filter-btn" data-category="${cat.name}">
            <span>${cat.name}</span>
        </button>`;
    });

    container.innerHTML = html;

    // Клик по фильтрам
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-category');
            filterProducts(cat);
        });
    });
}

// ============================================
// ЗАГРУЗКА ТОВАРОВ
// ============================================
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (e) {
        console.error('Ошибка загрузки товаров:', e);
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки каталога</p>
                </div>`;
        }
    }
}

function filterProducts(category) {
    if (category === 'all') {
        renderProducts(allProducts);
    } else {
        renderProducts(allProducts.filter(p => p.category === category));
    }
}

// ============================================
// РЕНДЕР ТОВАРОВ
// ============================================
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-couch" style="opacity:0.3;"></i>
                <p>В этой категории пока нет товаров</p>
            </div>`;
        return;
    }

    grid.innerHTML = products.map((product, index) => {
        // Скидка
        const discount = product.oldPrice
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : 0;

        // Модули (максимум 3)
        const modules = (product.modules || []).slice(0, 3)
            .map(m => `<span class="module-tag">${m}</span>`)
            .join('');

        // Главное фото
        const image = (product.images && product.images.length > 0)
            ? product.images[0]
            : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=70';

        // Бейджи
        let badges = '';
        if (discount > 0) badges += `<span class="badge badge-sale">−${discount}%</span>`;
        if (product.featured) badges += `<span class="badge badge-hit">HIT</span>`;

        return `
        <div class="product-card fade-in-up shine-effect"
             style="animation-delay: ${index * 0.08}s"
             data-id="${product.id}">

            <div class="product-image">
                <img src="${image}" 
                     alt="${product.name}" 
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=70'">
                
                <div class="product-badges">${badges}</div>

                <div class="product-quick-actions">
                    <button class="quick-action-btn"
                            onclick="event.stopPropagation(); openProductModal(${product.id})"
                            title="Подробнее">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="quick-action-btn"
                            onclick="event.stopPropagation(); addToCart(${product.id})"
                            title="В корзину">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                </div>
            </div>

            <div class="product-info">
                <div class="product-category">${product.category || ''}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                ${modules ? `<div class="product-modules">${modules}</div>` : ''}
                <div class="product-footer">
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.price)}</span>
                        ${product.oldPrice ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn"
                            onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-plus"></i> В корзину
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Клик по карточке — открыть модал
    grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            openProductModal(parseInt(card.dataset.id));
        });
    });
}

// ============================================
// МОДАЛКА ТОВАРА
// ============================================
function openProductModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const body = document.getElementById('modalBody');

    const image = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

    const modules = (product.modules || [])
        .map(m => `<span class="modal-module-tag">${m}</span>`)
        .join('');

    const colors = (product.colors || [])
        .map(c => `<span class="modal-color-tag">${c}</span>`)
        .join('');

    body.innerHTML = `
    <div class="product-modal-inner">
        <div class="product-modal-gallery">
            <img src="${image}" alt="${product.name}"
                 onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'">
        </div>
        <div class="product-modal-details">
            <div class="modal-category">${product.category || ''}</div>
            <h2>${product.name}</h2>
            <p class="modal-description">${product.description || ''}</p>

            <div class="modal-specs">
                ${product.dimensions ? `
                <div class="modal-spec-item">
                    <span>Размеры</span>
                    <span>${product.dimensions}</span>
                </div>` : ''}
                ${product.material ? `
                <div class="modal-spec-item">
                    <span>Материал</span>
                    <span>${product.material}</span>
                </div>` : ''}
                <div class="modal-spec-item">
                    <span>Наличие</span>
                    <span style="color: ${product.inStock !== false ? '#4caf7d' : '#d44a4a'}">
                        ${product.inStock !== false ? 'В наличии' : 'Под заказ'}
                    </span>
                </div>
            </div>

            ${modules ? `
            <div class="modal-modules">
                <h4>Комплектация</h4>
                <div class="modal-modules-list">${modules}</div>
            </div>` : ''}

            ${colors ? `
            <div class="modal-colors">
                <h4>Доступные цвета</h4>
                <div class="modal-colors-list">${colors}</div>
            </div>` : ''}

            <div class="modal-price-block">
                <div>
                    ${product.oldPrice ? `<span class="modal-old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                    <span class="modal-price">${formatPrice(product.price)}</span>
                </div>
                <button class="btn btn-primary" onclick="addToCart(${product.id}); closeProductModal();">
                    <i class="fas fa-shopping-bag"></i>
                    <span>В корзину</span>
                </button>
            </div>
        </div>
    </div>`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Закрытие модалки
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('modalClose');

    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeProductModal();
        });
    }

    // Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeProductModal();
            closeCheckoutModal();
        }
    });
});

// ============================================
// АВТООБНОВЛЕНИЕ каждые 30 сек
// ============================================
setInterval(async () => {
    try {
        const res = await fetch('/api/products');
        const fresh = await res.json();

        if (JSON.stringify(fresh) !== JSON.stringify(allProducts)) {
            allProducts = fresh;
            const activeBtn = document.querySelector('.filter-btn.active');
            const activeCat = activeBtn ? activeBtn.dataset.category : 'all';
            filterProducts(activeCat);
        }

        const catRes = await fetch('/api/categories');
        const freshCats = await catRes.json();
        if (JSON.stringify(freshCats) !== JSON.stringify(allCategories)) {
            allCategories = freshCats;
            renderCategoryFilter();
        }
    } catch (e) {
        // тихо
    }
}, 30000);

// ============================================
// УТИЛИТЫ
// ============================================
function formatPrice(num) {
    return Number(num).toLocaleString('ru-RU') + ' ₽';
}