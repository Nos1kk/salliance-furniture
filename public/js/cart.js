// ============================================
// АЛЬЯНС — Cart.js v2
// Корзина + динамические поля checkout
// ============================================

let cart = [];
try { cart = JSON.parse(localStorage.getItem('alliance_cart') || '[]'); } catch (e) { cart = []; }

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    initCartEvents();
});

// ============================================
// ADD / REMOVE / UPDATE
// ============================================
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) { existing.quantity += 1; }
    else { cart.push({ id: product.id, name: product.name, price: product.price, image: (product.images && product.images[0]) || '', quantity: 1 }); }
    saveCart(); updateCartUI();
    showNotification(`${product.name} — добавлен в корзину`);
    const c = document.getElementById('cartCount');
    if (c) { c.classList.remove('bounce'); void c.offsetWidth; c.classList.add('bounce'); }
}

function removeFromCart(pid) { cart = cart.filter(i => i.id !== pid); saveCart(); updateCartUI(); }

function updateQuantity(pid, d) {
    const item = cart.find(i => i.id === pid);
    if (!item) return;
    item.quantity += d;
    if (item.quantity <= 0) { removeFromCart(pid); return; }
    saveCart(); updateCartUI();
}

function saveCart() { localStorage.setItem('alliance_cart', JSON.stringify(cart)); }
function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.quantity, 0); }

// ============================================
// UI
// ============================================
function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('totalPrice');
    const footerEl = document.getElementById('cartFooter');

    const qty = cart.reduce((s, i) => s + i.quantity, 0);
    if (countEl) countEl.textContent = qty;

    if (itemsEl) {
        if (cart.length === 0) {
            itemsEl.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Корзина пуста</p></div>';
            if (footerEl) footerEl.style.display = 'none';
        } else {
            if (footerEl) footerEl.style.display = '';
            itemsEl.innerHTML = cart.map(i => `
                <div class="cart-item">
                    <div class="cart-item-image"><img src="${i.image || 'https://via.placeholder.com/72'}" onerror="this.src='https://via.placeholder.com/72'"></div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${i.name}</div>
                        <div class="cart-item-price">${formatPrice(i.price * i.quantity)}</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" onclick="updateQuantity(${i.id},-1)">−</button>
                            <span class="cart-item-qty">${i.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${i.id},1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${i.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('');
        }
    }
    if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

// ============================================
// EVENTS
// ============================================
function initCartEvents() {
    const cartBtn = document.getElementById('cartBtn');
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('cartClose');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const open = () => { sidebar?.classList.add('active'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { sidebar?.classList.remove('active'); overlay?.classList.remove('active'); document.body.style.overflow = ''; };

    cartBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    checkoutBtn?.addEventListener('click', () => {
        if (cart.length === 0) { showNotification('Корзина пуста'); return; }
        close();
        openCheckoutModal();
    });

    document.getElementById('checkoutForm')?.addEventListener('submit', handleCheckout);
    document.getElementById('checkoutClose')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('checkoutModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeCheckoutModal(); });
    document.getElementById('successClose')?.addEventListener('click', () => {
        document.getElementById('successOverlay').classList.remove('active');
        document.body.style.overflow = '';
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeCheckoutModal(); close(); }
    });
}

// ============================================
// CHECKOUT
// ============================================
function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const summary = document.getElementById('orderSummary');

    if (summary) {
        summary.innerHTML = `
            <h4>Ваш заказ</h4>
            ${cart.map(i => `<div class="order-item"><span>${i.name} × ${i.quantity}</span><span>${formatPrice(i.price * i.quantity)}</span></div>`).join('')}
            <div class="order-total"><span>Итого</span><span>${formatPrice(getCartTotal())}</span></div>
        `;
    }

    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal')?.classList.remove('active');
    document.body.style.overflow = '';
}

async function handleCheckout(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Отправка...';
    btn.disabled = true;

    // Собираем данные из динамических полей
    const fieldKeys = ['name', 'phone', 'email', 'address', 'comment'];
    const orderData = { items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })), total: getCartTotal() };

    fieldKeys.forEach(key => {
        const el = document.getElementById('orderField_' + key);
        if (el) orderData[key] = el.value.trim();
    });

    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await res.json();
        if (result.success) {
            closeCheckoutModal();
            cart = []; saveCart(); updateCartUI();
            document.getElementById('successOverlay')?.classList.add('active');
            e.target.reset();
        } else {
            showNotification('Ошибка. Попробуйте ещё раз.');
        }
    } catch (err) {
        showNotification('Ошибка сети.');
    }

    btn.innerHTML = orig;
    btn.disabled = false;
}

// ============================================
// UTILS
// ============================================
if (typeof formatPrice === 'undefined') {
    function formatPrice(n) { return Number(n).toLocaleString('ru-RU') + ' ₽'; }
}