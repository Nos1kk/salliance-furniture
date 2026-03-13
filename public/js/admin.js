// ============================================
// АЛЬЯНС — Admin.js v2
// Полная логика админ-панели
// ============================================

let adminProducts = [];
let adminCategories = [];
let adminOrders = [];
let adminSettings = {};
let adminAnalytics = {};
let adminChangelog = [];
let uploadedUrls = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    bindLogin();
    bindNav();
    bindSidebar();
    bindProductForm();
    bindCategoryForm();
    bindDropZone();
    bindLogout();
    bindCredentialsForm();
    bindPreviewControls();
});

// ============================================
// AUTH
// ============================================
function checkAuth() {
    if (sessionStorage.getItem('admin_token')) showPanel();
}

function bindLogin() {
    document.getElementById('loginForm').addEventListener('submit', async e => {
        e.preventDefault();
        const user = document.getElementById('loginUsername').value;
        const pass = document.getElementById('loginPassword').value;
        const err = document.getElementById('loginError');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            const data = await res.json();
            if (data.success) {
                sessionStorage.setItem('admin_token', data.token);
                sessionStorage.setItem('admin_user', user);
                showPanel();
            } else {
                err.textContent = 'Неверный логин или пароль';
                setTimeout(() => (err.textContent = ''), 3000);
            }
        } catch (e) {
            err.textContent = 'Ошибка сервера';
        }
    });
}

function showPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    const name = sessionStorage.getItem('admin_user') || 'Администратор';
    document.getElementById('adminDisplayName').textContent = name;
    loadAll();
}

function bindLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        location.reload();
    });
}

// ============================================
// LOAD ALL DATA
// ============================================
async function loadAll() {
    await Promise.all([
        loadProducts(),
        loadCategories(),
        loadOrders(),
        loadSettings(),
        loadAnalytics(),
        loadChangelog()
    ]);
    updateDashboard();
}

async function loadProducts() {
    try {
        adminProducts = await (await fetch('/api/products')).json();
        renderTable();
    } catch (e) { console.error(e); }
}

async function loadCategories() {
    try {
        adminCategories = await (await fetch('/api/categories')).json();
        renderCats();
        fillCategorySelect();
    } catch (e) { console.error(e); }
}

async function loadOrders() {
    try {
        adminOrders = await (await fetch('/api/orders')).json();
        renderOrders();
    } catch (e) { console.error(e); }
}

async function loadSettings() {
    try {
        adminSettings = await (await fetch('/api/settings')).json();
        fillContentEditor();
        fillSocialEditor();
        fillCheckoutFieldsEditor();
        fillEmailSettings();
    } catch (e) { console.error(e); }
}

async function loadAnalytics() {
    try {
        adminAnalytics = await (await fetch('/api/analytics')).json();
        renderAnalytics();
    } catch (e) { console.error(e); }
}

async function loadChangelog() {
    try {
        adminChangelog = await (await fetch('/api/changelog')).json();
        renderChangelog();
    } catch (e) { console.error(e); }
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
    document.getElementById('statProducts').textContent = adminProducts.length;
    document.getElementById('statCategories').textContent = adminCategories.length;
    document.getElementById('statOrders').textContent = adminOrders.length;
    document.getElementById('statFeatured').textContent = adminProducts.filter(p => p.featured).length;

    const t = today();
    const views = adminAnalytics.totalViews || 0;
    const visitors = adminAnalytics.totalVisitors || 0;
    const todayV = (adminAnalytics.dailyViews || {})[t] || 0;
    const todayU = (adminAnalytics.dailyVisitors || {})[t] || 0;

    document.getElementById('statViews').textContent = views.toLocaleString('ru-RU');
    document.getElementById('statVisitors').textContent = visitors.toLocaleString('ru-RU');
    document.getElementById('statTodayViews').textContent = todayV.toLocaleString('ru-RU');
    document.getElementById('statTodayVisitors').textContent = todayU.toLocaleString('ru-RU');
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// ============================================
// NAVIGATION
// ============================================
function bindNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });
}

function switchSection(name) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.nav-item[data-section="${name}"]`);
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + name);
    if (page) page.classList.add('active');

    const titles = {
        dashboard: 'Дашборд', products: 'Товары', categories: 'Категории',
        orders: 'Заказы', content: 'Редактирование контента', social: 'Социальные сети',
        'checkout-fields': 'Поля формы заказа', analytics: 'Аналитика',
        changelog: 'Журнал изменений', preview: 'Предпросмотр', settings: 'Настройки'
    };
    document.getElementById('pageTitle').textContent = titles[name] || '';
    document.getElementById('sidebar').classList.remove('open');

    // Подгрузка данных при переходе
    if (name === 'analytics') loadAnalytics();
    if (name === 'changelog') loadChangelog();
    if (name === 'orders') loadOrders();
    if (name === 'preview') refreshPreview();
}

function bindSidebar() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebarClose').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });
}

// ============================================
// PRODUCTS TABLE
// ============================================
function renderTable() {
    const tbody = document.getElementById('productsTableBody');
    if (adminProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-couch"></i><p>Нет товаров</p></td></tr>';
        return;
    }
    tbody.innerHTML = adminProducts.map(p => {
        const src = (p.images && p.images[0]) || 'https://via.placeholder.com/48x48/1a1a28/555?text=...';
        return `<tr>
            <td><img src="${src}" class="tbl-img" onerror="this.src='https://via.placeholder.com/48x48/1a1a28/555?text=...'"></td>
            <td><strong>${esc(p.name)}</strong></td>
            <td style="color:var(--a-gray)">${esc(p.category || '—')}</td>
            <td><strong>${fmtPrice(p.price)}</strong>${p.oldPrice ? '<br><small style="color:var(--a-muted);text-decoration:line-through">' + fmtPrice(p.oldPrice) + '</small>' : ''}</td>
            <td><span class="status-pill ${p.inStock !== false ? 'pill-green' : 'pill-red'}">${p.inStock !== false ? 'В наличии' : 'Нет'}</span></td>
            <td style="color:var(--a-gold)">${p.featured ? '★' : '—'}</td>
            <td><div class="tbl-actions">
                <button class="tbl-btn tbl-edit" onclick="editProduct(${p.id})" title="Редактировать"><i class="fas fa-pen"></i></button>
                <button class="tbl-btn tbl-del" onclick="deleteProduct(${p.id})" title="Удалить"><i class="fas fa-trash"></i></button>
            </div></td>
        </tr>`;
    }).join('');
}

// ============================================
// PRODUCT FORM
// ============================================
function bindProductForm() {
    document.getElementById('productForm').addEventListener('submit', async e => {
        e.preventDefault();
        await saveProduct();
    });
}

function openProductForm(id) {
    uploadedUrls = [];
    document.getElementById('previewRow').innerHTML = '';
    const modal = document.getElementById('productFormModal');
    const title = document.getElementById('productFormTitle');

    if (id) {
        const p = adminProducts.find(x => x.id === id);
        if (!p) return;
        title.textContent = 'Редактировать товар';
        document.getElementById('productId').value = p.id;
        document.getElementById('pName').value = p.name || '';
        document.getElementById('pCategory').value = p.category || '';
        document.getElementById('pPrice').value = p.price || '';
        document.getElementById('pOldPrice').value = p.oldPrice || '';
        document.getElementById('pDescription').value = p.description || '';
        document.getElementById('pDimensions').value = p.dimensions || '';
        document.getElementById('pMaterial').value = p.material || '';
        document.getElementById('pImages').value = (p.images || []).join('\n');
        document.getElementById('pModules').value = (p.modules || []).join(', ');
        document.getElementById('pColors').value = (p.colors || []).join(', ');
        document.getElementById('pInStock').checked = p.inStock !== false;
        document.getElementById('pFeatured').checked = !!p.featured;
        if (p.images) { uploadedUrls = [...p.images]; renderPreviews(); }
    } else {
        title.textContent = 'Добавить товар';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('pInStock').checked = true;
    }
    fillCategorySelect();
    modal.classList.add('active');
}

function closeProductForm() {
    document.getElementById('productFormModal').classList.remove('active');
}

function editProduct(id) { openProductForm(id); }

async function saveProduct() {
    const id = document.getElementById('productId').value;
    const textUrls = document.getElementById('pImages').value.split('\n').map(s => s.trim()).filter(Boolean);
    const allImages = [...new Set([...uploadedUrls, ...textUrls])];

    const data = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        price: Number(document.getElementById('pPrice').value),
        oldPrice: document.getElementById('pOldPrice').value ? Number(document.getElementById('pOldPrice').value) : null,
        description: document.getElementById('pDescription').value,
        dimensions: document.getElementById('pDimensions').value,
        material: document.getElementById('pMaterial').value,
        images: allImages,
        modules: document.getElementById('pModules').value.split(',').map(s => s.trim()).filter(Boolean),
        colors: document.getElementById('pColors').value.split(',').map(s => s.trim()).filter(Boolean),
        inStock: document.getElementById('pInStock').checked,
        featured: document.getElementById('pFeatured').checked
    };

    try {
        const res = await fetch(id ? `/api/products/${id}` : '/api/products', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeProductForm();
            await loadProducts();
            updateDashboard();
            toast(id ? 'Товар обновлён' : 'Товар добавлен');
        }
    } catch (e) { toast('Ошибка сохранения'); }
}

async function deleteProduct(id) {
    if (!confirm('Удалить этот товар?')) return;
    try {
        await fetch('/api/products/' + id, { method: 'DELETE' });
        await loadProducts();
        updateDashboard();
        toast('Товар удалён');
    } catch (e) { console.error(e); }
}

function fillCategorySelect() {
    const sel = document.getElementById('pCategory');
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = '<option value="">Выберите</option>' +
        adminCategories.map(c => `<option value="${esc(c.name)}" ${c.name === val ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
}

// ============================================
// FILE UPLOAD
// ============================================
function bindDropZone() {
    const zone = document.getElementById('dropZone');
    const input = document.getElementById('fileInput');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--a-gold)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
    zone.addEventListener('drop', e => {
        e.preventDefault(); zone.style.borderColor = '';
        if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', () => { if (input.files[0]) uploadFile(input.files[0]); input.value = ''; });
}

async function uploadFile(file) {
    const fd = new FormData();
    fd.append('image', file);
    try {
        const data = await (await fetch('/api/upload', { method: 'POST', body: fd })).json();
        if (data.url) { uploadedUrls.push(data.url); renderPreviews(); toast('Фото загружено'); }
    } catch (e) { toast('Ошибка загрузки'); }
}

function renderPreviews() {
    document.getElementById('previewRow').innerHTML = uploadedUrls.map((url, i) => `
        <div class="preview-item">
            <img src="${url}" onerror="this.src='https://via.placeholder.com/56/1a1a28/555?text=...'">
            <button type="button" onclick="removePreview(${i})"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

function removePreview(i) { uploadedUrls.splice(i, 1); renderPreviews(); }

// ============================================
// CATEGORIES
// ============================================
function bindCategoryForm() {
    document.getElementById('categoryForm').addEventListener('submit', async e => {
        e.preventDefault();
        await saveCategory();
    });
}

function renderCats() {
    const grid = document.getElementById('categoriesGrid');
    if (adminCategories.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-layer-group"></i><p>Нет категорий</p></div>';
        return;
    }
    const counts = {};
    adminProducts.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    grid.innerHTML = adminCategories.map(c => `
        <div class="cat-card">
            <div class="cat-icon">${esc(c.icon || '◆')}</div>
            <div class="cat-info"><h4>${esc(c.name)}</h4><p>${counts[c.name] || 0} товаров</p></div>
            <div class="cat-actions">
                <button class="tbl-btn tbl-edit" onclick="editCategory(${c.id})"><i class="fas fa-pen"></i></button>
                <button class="tbl-btn tbl-del" onclick="deleteCategory(${c.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function openCategoryForm(id) {
    const modal = document.getElementById('categoryFormModal');
    const title = document.getElementById('categoryFormTitle');
    if (id) {
        const c = adminCategories.find(x => x.id === id);
        if (!c) return;
        title.textContent = 'Редактировать категорию';
        document.getElementById('categoryId').value = c.id;
        document.getElementById('catName').value = c.name;
        document.getElementById('catIcon').value = c.icon || '';
    } else {
        title.textContent = 'Добавить категорию';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
    }
    modal.classList.add('active');
}

function closeCategoryForm() { document.getElementById('categoryFormModal').classList.remove('active'); }
function editCategory(id) { openCategoryForm(id); }

async function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const data = { name: document.getElementById('catName').value, icon: document.getElementById('catIcon').value };
    try {
        const res = await fetch(id ? `/api/categories/${id}` : '/api/categories', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { closeCategoryForm(); await loadCategories(); updateDashboard(); toast(id ? 'Категория обновлена' : 'Категория добавлена'); }
    } catch (e) { console.error(e); }
}

async function deleteCategory(id) {
    if (!confirm('Удалить категорию?')) return;
    try {
        await fetch('/api/categories/' + id, { method: 'DELETE' });
        await loadCategories(); updateDashboard(); toast('Категория удалена');
    } catch (e) { console.error(e); }
}

// ============================================
// ORDERS
// ============================================
function renderOrders() {
    const container = document.getElementById('ordersContainer');
    if (adminOrders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Заказов пока нет</p></div>';
        return;
    }
    const sorted = [...adminOrders];
    container.innerHTML = sorted.map((o, idx) => {
        const items = (o.items || []).map(it =>
            `<div class="order-row"><span>${esc(it.name)} × ${it.quantity}</span><span>${fmtPrice(it.price * it.quantity)}</span></div>`
        ).join('');
        const date = o.date ? new Date(o.date).toLocaleString('ru-RU') : '—';
        return `
        <div class="order-card">
            <div class="order-top">
                <h4>Заказ #${idx + 1}</h4>
                <span class="order-date">${date}</span>
            </div>
            <div class="order-info">
                <p><strong>Имя:</strong> ${esc(o.name || '—')}</p>
                <p><strong>Телефон:</strong> ${esc(o.phone || '—')}</p>
                <p><strong>Email:</strong> ${esc(o.email || '—')}</p>
                <p><strong>Адрес:</strong> ${esc(o.address || '—')}</p>
            </div>
            ${o.comment ? '<p style="font-size:.83rem;color:var(--a-gray);margin-bottom:12px;"><strong>Комментарий:</strong> ' + esc(o.comment) + '</p>' : ''}
            <div class="order-items-box">
                <h5>Товары:</h5>
                ${items}
                <div class="order-total-line"><span>Итого</span><span>${fmtPrice(o.total)}</span></div>
            </div>
            <button class="order-delete-btn" onclick="deleteOrder(${idx})"><i class="fas fa-trash"></i> Удалить заказ</button>
        </div>`;
    }).reverse().join('');
}

async function deleteOrder(idx) {
    if (!confirm('Удалить этот заказ?')) return;
    try {
        await fetch('/api/orders/' + idx, { method: 'DELETE' });
        await loadOrders(); updateDashboard(); toast('Заказ удалён');
    } catch (e) { console.error(e); }
}

// ============================================
// CONTENT EDITOR
// ============================================
function fillContentEditor() {
    const s = adminSettings;
    // Hero
    setVal('s_heroBadge', s.heroBadge);
    setVal('s_heroTitle1', s.heroTitle1);
    setVal('s_heroTitle2', s.heroTitle2);
    setVal('s_heroTitle3', s.heroTitle3);
    setVal('s_heroSubtitle', s.heroSubtitle);
    setVal('s_heroBtn1', s.heroBtn1);
    setVal('s_heroBtn2', s.heroBtn2);
    setVal('s_stat1Value', s.stat1Value);
    setVal('s_stat1Label', s.stat1Label);
    setVal('s_stat2Value', s.stat2Value);
    setVal('s_stat2Label', s.stat2Label);
    setVal('s_stat3Value', s.stat3Value);
    setVal('s_stat3Label', s.stat3Label);

    // Marquee
    setVal('s_marqueeItems', (s.marqueeItems || []).join(', '));

    // About
    setVal('s_aboutTag', s.aboutTag);
    setVal('s_aboutTitle', s.aboutTitle);
    setVal('s_aboutTitleAccent', s.aboutTitleAccent);
    setVal('s_aboutSubtitle', s.aboutSubtitle);
    renderAboutCardsEditor(s.aboutCards || []);

    // Catalog
    setVal('s_catalogTag', s.catalogTag);
    setVal('s_catalogTitle', s.catalogTitle);
    setVal('s_catalogTitleAccent', s.catalogTitleAccent);
    setVal('s_catalogSubtitle', s.catalogSubtitle);

    // Features
    setVal('s_featuresTag', s.featuresTag);
    setVal('s_featuresTitle', s.featuresTitle);
    setVal('s_featuresTitleAccent', s.featuresTitleAccent);
    renderFeatureCardsEditor(s.featureCards || []);

    // Contact
    setVal('s_contactTag', s.contactTag);
    setVal('s_contactTitle', s.contactTitle);
    setVal('s_contactTitleAccent', s.contactTitleAccent);
    setVal('s_contactAddress', s.contactAddress);
    setVal('s_contactPhone', s.contactPhone);
    setVal('s_contactEmail', s.contactEmail);
    setVal('s_contactSchedule', s.contactSchedule);

    // Footer
    setVal('s_footerText', s.footerText);
    setVal('s_footerCopyright', s.footerCopyright);
}

function renderAboutCardsEditor(cards) {
    const container = document.getElementById('aboutCardsEditor');
    container.innerHTML = cards.map((c, i) => `
        <div class="card-editor-item" data-index="${i}">
            <button type="button" class="card-remove" onclick="removeAboutCard(${i})"><i class="fas fa-times"></i></button>
            <div class="row-2">
                <div class="field"><label>Иконка (CSS класс)</label><input type="text" class="about-icon" value="${esc(c.icon || '')}" placeholder="fas fa-gem"></div>
                <div class="field"><label>Заголовок</label><input type="text" class="about-title" value="${esc(c.title || '')}"></div>
            </div>
            <div class="field"><label>Текст</label><textarea class="about-text" rows="2">${esc(c.text || '')}</textarea></div>
        </div>
    `).join('');
}

function addAboutCard() {
    const cards = collectAboutCards();
    cards.push({ icon: 'fas fa-star', title: 'Новое преимущество', text: 'Описание' });
    renderAboutCardsEditor(cards);
}

function removeAboutCard(i) {
    const cards = collectAboutCards();
    cards.splice(i, 1);
    renderAboutCardsEditor(cards);
}

function collectAboutCards() {
    const items = document.querySelectorAll('#aboutCardsEditor .card-editor-item');
    return Array.from(items).map(item => ({
        icon: item.querySelector('.about-icon').value,
        title: item.querySelector('.about-title').value,
        text: item.querySelector('.about-text').value
    }));
}

function renderFeatureCardsEditor(cards) {
    const container = document.getElementById('featureCardsEditor');
    container.innerHTML = cards.map((c, i) => `
        <div class="card-editor-item" data-index="${i}">
            <button type="button" class="card-remove" onclick="removeFeatureCard(${i})"><i class="fas fa-times"></i></button>
            <div class="row-3">
                <div class="field"><label>Номер</label><input type="text" class="feat-number" value="${esc(c.number || '')}" placeholder="01"></div>
                <div class="field"><label>Заголовок</label><input type="text" class="feat-title" value="${esc(c.title || '')}"></div>
                <div class="field"></div>
            </div>
            <div class="field"><label>Текст</label><textarea class="feat-text" rows="2">${esc(c.text || '')}</textarea></div>
        </div>
    `).join('');
}

function addFeatureCard() {
    const cards = collectFeatureCards();
    cards.push({ number: String(cards.length + 1).padStart(2, '0'), title: 'Новое', text: 'Описание' });
    renderFeatureCardsEditor(cards);
}

function removeFeatureCard(i) {
    const cards = collectFeatureCards();
    cards.splice(i, 1);
    renderFeatureCardsEditor(cards);
}

function collectFeatureCards() {
    const items = document.querySelectorAll('#featureCardsEditor .card-editor-item');
    return Array.from(items).map(item => ({
        number: item.querySelector('.feat-number').value,
        title: item.querySelector('.feat-title').value,
        text: item.querySelector('.feat-text').value
    }));
}

async function saveAllContent() {
    const data = {
        heroBadge: getVal('s_heroBadge'),
        heroTitle1: getVal('s_heroTitle1'),
        heroTitle2: getVal('s_heroTitle2'),
        heroTitle3: getVal('s_heroTitle3'),
        heroSubtitle: getVal('s_heroSubtitle'),
        heroBtn1: getVal('s_heroBtn1'),
        heroBtn2: getVal('s_heroBtn2'),
        stat1Value: getVal('s_stat1Value'),
        stat1Label: getVal('s_stat1Label'),
        stat2Value: getVal('s_stat2Value'),
        stat2Label: getVal('s_stat2Label'),
        stat3Value: getVal('s_stat3Value'),
        stat3Label: getVal('s_stat3Label'),
        marqueeItems: getVal('s_marqueeItems').split(',').map(s => s.trim()).filter(Boolean),
        aboutTag: getVal('s_aboutTag'),
        aboutTitle: getVal('s_aboutTitle'),
        aboutTitleAccent: getVal('s_aboutTitleAccent'),
        aboutSubtitle: getVal('s_aboutSubtitle'),
        aboutCards: collectAboutCards(),
        catalogTag: getVal('s_catalogTag'),
        catalogTitle: getVal('s_catalogTitle'),
        catalogTitleAccent: getVal('s_catalogTitleAccent'),
        catalogSubtitle: getVal('s_catalogSubtitle'),
        featuresTag: getVal('s_featuresTag'),
        featuresTitle: getVal('s_featuresTitle'),
        featuresTitleAccent: getVal('s_featuresTitleAccent'),
        featureCards: collectFeatureCards(),
        contactTag: getVal('s_contactTag'),
        contactTitle: getVal('s_contactTitle'),
        contactTitleAccent: getVal('s_contactTitleAccent'),
        contactAddress: getVal('s_contactAddress'),
        contactPhone: getVal('s_contactPhone'),
        contactEmail: getVal('s_contactEmail'),
        contactSchedule: getVal('s_contactSchedule'),
        footerText: getVal('s_footerText'),
        footerCopyright: getVal('s_footerCopyright')
    };

    try {
        await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        adminSettings = { ...adminSettings, ...data };
        toast('Контент сохранён! Изменения уже на сайте.');
    } catch (e) { toast('Ошибка сохранения'); }
}

// Аккордеон блоков редактора
function toggleBlock(head) {
    const block = head.closest('.editor-block');
    block.classList.toggle('open');
}

// ============================================
// SOCIAL
// ============================================
function fillSocialEditor() {
    setVal('s_socialVk', adminSettings.socialVk);
    setVal('s_socialTelegram', adminSettings.socialTelegram);
    setVal('s_socialWhatsapp', adminSettings.socialWhatsapp);
    setVal('s_socialInstagram', adminSettings.socialInstagram);
}

async function saveSocial() {
    const data = {
        socialVk: getVal('s_socialVk'),
        socialTelegram: getVal('s_socialTelegram'),
        socialWhatsapp: getVal('s_socialWhatsapp'),
        socialInstagram: getVal('s_socialInstagram')
    };
    try {
        await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        adminSettings = { ...adminSettings, ...data };
        toast('Соцсети сохранены');
    } catch (e) { toast('Ошибка'); }
}

// ============================================
// CHECKOUT FIELDS
// ============================================
function fillCheckoutFieldsEditor() {
    const fields = adminSettings.checkoutFields || {};
    const container = document.getElementById('checkoutFieldsEditor');
    const fieldKeys = ['name', 'phone', 'email', 'address', 'comment'];

    container.innerHTML = fieldKeys.map(key => {
        const f = fields[key] || { label: key, required: false, enabled: true, placeholder: '' };
        return `
        <div class="checkout-field-item" data-key="${key}">
            <div class="field" style="margin:0">
                <label>Название поля</label>
                <input type="text" class="cf-label" value="${esc(f.label || '')}">
            </div>
            <div class="field" style="margin:0">
                <label>Placeholder</label>
                <input type="text" class="cf-placeholder" value="${esc(f.placeholder || '')}">
            </div>
            <div class="checkout-field-toggle">
                <input type="checkbox" class="cf-required" ${f.required ? 'checked' : ''}>
                <span>Обяз.</span>
            </div>
            <div class="checkout-field-toggle">
                <input type="checkbox" class="cf-enabled" ${f.enabled !== false ? 'checked' : ''}>
                <span>Вкл.</span>
            </div>
        </div>`;
    }).join('');
}

async function saveCheckoutFields() {
    const items = document.querySelectorAll('.checkout-field-item');
    const fields = {};
    items.forEach(item => {
        const key = item.dataset.key;
        fields[key] = {
            label: item.querySelector('.cf-label').value,
            placeholder: item.querySelector('.cf-placeholder').value,
            required: item.querySelector('.cf-required').checked,
            enabled: item.querySelector('.cf-enabled').checked
        };
    });

    try {
        await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutFields: fields })
        });
        adminSettings.checkoutFields = fields;
        toast('Поля формы сохранены');
    } catch (e) { toast('Ошибка'); }
}

// ============================================
// ANALYTICS
// ============================================
function renderAnalytics() {
    const a = adminAnalytics;
    const t = today();

    document.getElementById('anTotalViews').textContent = (a.totalViews || 0).toLocaleString('ru-RU');
    document.getElementById('anTotalVisitors').textContent = (a.totalVisitors || 0).toLocaleString('ru-RU');
    document.getElementById('anTodayViews').textContent = ((a.dailyViews || {})[t] || 0).toLocaleString('ru-RU');
    document.getElementById('anTodayVisitors').textContent = ((a.dailyVisitors || {})[t] || 0).toLocaleString('ru-RU');

    // Charts — last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }

    renderBarChart('chartViews', days, a.dailyViews || {}, 'gold');
    renderBarChart('chartVisitors', days, a.dailyVisitors || {}, 'blue');

    // Page views
    const pvContainer = document.getElementById('pageViewsList');
    const pv = a.pageViews || {};
    const pvArr = Object.entries(pv).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (pvArr.length === 0) {
        pvContainer.innerHTML = '<p style="color:var(--a-muted);font-size:.85rem;">Нет данных</p>';
    } else {
        pvContainer.innerHTML = pvArr.map(([page, count]) =>
            `<div class="page-view-item"><span>${esc(page)}</span><span>${count}</span></div>`
        ).join('');
    }
}

function renderBarChart(containerId, labels, data, colorClass) {
    const container = document.getElementById(containerId);
    const values = labels.map(l => data[l] || 0);
    const max = Math.max(...values, 1);

    container.innerHTML = labels.map((label, i) => {
        const val = values[i];
        const pct = (val / max * 100).toFixed(1);
        const shortLabel = label.slice(5); // MM-DD
        return `
        <div class="chart-bar-row">
            <div class="chart-label">${shortLabel}</div>
            <div class="chart-bar-bg"><div class="chart-bar-fill ${colorClass}" style="width:${pct}%"></div></div>
            <div class="chart-bar-value">${val}</div>
        </div>`;
    }).join('');
}

// ============================================
// CHANGELOG
// ============================================
function renderChangelog() {
    const container = document.getElementById('changelogContainer');
    if (adminChangelog.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-clock-rotate-left"></i><p>Нет записей</p></div>';
        return;
    }
    container.innerHTML = adminChangelog.map(log => {
        const date = log.date ? new Date(log.date).toLocaleString('ru-RU') : '—';
        return `
        <div class="log-item">
            <div class="log-dot"></div>
            <div class="log-content">
                <div class="log-action">${esc(log.action)}</div>
                ${log.details ? `<div class="log-details">${esc(log.details)}</div>` : ''}
                <div class="log-date">${date}</div>
            </div>
        </div>`;
    }).join('');
}

// ============================================
// PREVIEW
// ============================================
function bindPreviewControls() {
    document.querySelectorAll('.preview-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preview-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const width = btn.dataset.width;
            document.getElementById('previewWrap').style.maxWidth = width;
        });
    });
}

function refreshPreview() {
    const frame = document.getElementById('previewFrame');
    frame.src = '/?t=' + Date.now();
}

// ============================================
// SETTINGS — CREDENTIALS
// ============================================
function bindCredentialsForm() {
    document.getElementById('credentialsForm').addEventListener('submit', async e => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;

        if (!newUsername && !newPassword) {
            toast('Укажите новый логин или пароль');
            return;
        }

        try {
            const res = await fetch('/api/admin/credentials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newUsername: newUsername || undefined, newPassword: newPassword || undefined })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast('Учётные данные обновлены');
                document.getElementById('credentialsForm').reset();
                if (newUsername) {
                    sessionStorage.setItem('admin_user', newUsername);
                    document.getElementById('adminDisplayName').textContent = newUsername;
                }
            } else {
                toast(data.error || 'Ошибка');
            }
        } catch (e) { toast('Ошибка сервера'); }
    });
}

// ============================================
// SETTINGS — EMAIL
// ============================================
function fillEmailSettings() {
    setVal('s_orderEmail', adminSettings.orderEmail);
    setVal('s_gmailAppPassword', adminSettings.gmailAppPassword);
}

async function saveEmailSettings() {
    const data = {
        orderEmail: getVal('s_orderEmail'),
        gmailAppPassword: getVal('s_gmailAppPassword')
    };
    try {
        await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        adminSettings = { ...adminSettings, ...data };
        toast('Email настройки сохранены');
    } catch (e) { toast('Ошибка'); }
}

// ============================================
// TOAST
// ============================================
function toast(text) {
    const el = document.getElementById('toast');
    document.getElementById('toastText').textContent = text;
    el.classList.add('show');
    clearTimeout(window._toastT);
    window._toastT = setTimeout(() => el.classList.remove('show'), 3500);
}

// ============================================
// UTILS
// ============================================
function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function fmtPrice(n) {
    return Number(n).toLocaleString('ru-RU') + ' ₽';
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}