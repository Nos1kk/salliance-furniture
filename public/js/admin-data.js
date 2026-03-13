// ============================================
// ADMIN-DATA.JS — CRUD операции с данными
// Товары, модули, заказы, настройки
// ============================================

// ============================================
// ТОВАРЫ: CRUD
// ============================================

function saveProduct(e) {
    e.preventDefault();

    var name = document.getElementById('prodName').value.trim();
    var category = document.getElementById('prodCategory').value;
    var price = parseInt(document.getElementById('prodPrice').value) || 0;
    var oldPrice = parseInt(document.getElementById('prodOldPrice').value) || 0;
    var discount = parseInt(document.getElementById('prodDiscount').value) || 0;
    var size = document.getElementById('prodSize').value.trim();
    var material = document.getElementById('prodMaterial').value.trim();
    var sleep = document.getElementById('prodSleep').value.trim();
    var description = document.getElementById('prodDesc').value.trim();
    var image = getImageValue('prod');
    var editId = document.getElementById('prodEditId').value;

    var availRadio = document.querySelector('input[name="prodAvail"]:checked');
    var availability = availRadio ? availRadio.value : 'instock';

    if (!image) {
        showToast('Добавьте изображение товара', 'warning');
        return;
    }

    var badges = [];
    if (document.getElementById('prodBadgeNew') && document.getElementById('prodBadgeNew').checked) badges.push('new');
    if (document.getElementById('prodBadgeSale') && document.getElementById('prodBadgeSale').checked) badges.push('sale');
    if (document.getElementById('prodBadgeHit') && document.getElementById('prodBadgeHit').checked) badges.push('hit');
    if (document.getElementById('prodBadgeExclusive') && document.getElementById('prodBadgeExclusive').checked) badges.push('exclusive');

    if (editId && editId !== '') {
        for (var i = 0; i < products.length; i++) {
            if (products[i].id === parseInt(editId)) {
                products[i].name = name;
                products[i].category = category;
                products[i].price = price;
                products[i].oldPrice = oldPrice;
                products[i].discount = discount;
                products[i].size = size;
                products[i].material = material;
                products[i].sleep = sleep;
                products[i].description = description;
                products[i].image = image;
                products[i].badges = badges;
                products[i].availability = availability;
                break;
            }
        }
        showToast('Товар «' + name + '» обновлён', 'success');
        addActivity('Отредактирован товар: ' + name);
    } else {
        var maxId = 0;
        for (var j = 0; j < products.length; j++) {
            if (products[j].id > maxId) maxId = products[j].id;
        }
        products.push({
            id: maxId + 1, name: name, category: category, price: price, oldPrice: oldPrice,
            discount: discount, size: size, material: material, sleep: sleep,
            description: description, image: image, badges: badges, availability: availability
        });
        showToast('Товар «' + name + '» добавлен', 'success');
        addActivity('Добавлен товар: ' + name);
    }

    saveProducts();
    renderProducts();
    resetProductForm();
    renderAdminProducts();
    updateDashboard();
}

function resetProductForm() {
    var form = document.getElementById('productForm');
    if (form) form.reset();
    var editId = document.getElementById('prodEditId');
    if (editId) editId.value = '';
    removePreview('prod');
    var saveBtn = document.getElementById('prodSaveBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить товар';
}

function editProduct(id) {
    var p = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id) { p = products[i]; break; }
    }
    if (!p) return;

    var addBtn = document.querySelectorAll('.admin-nav-btn')[1];
    switchAdminTab('add', addBtn);

    document.getElementById('prodName').value = p.name || '';
    document.getElementById('prodCategory').value = p.category || '';
    document.getElementById('prodPrice').value = p.price || '';
    document.getElementById('prodOldPrice').value = p.oldPrice || '';
    document.getElementById('prodDiscount').value = p.discount || '';
    document.getElementById('prodSize').value = p.size || '';
    document.getElementById('prodMaterial').value = p.material || '';
    document.getElementById('prodSleep').value = p.sleep || '';
    document.getElementById('prodDesc').value = p.description || '';
    document.getElementById('prodEditId').value = p.id;

    if (p.image) {
        if (p.image.indexOf('data:') === 0) {
            var pc = document.getElementById('prodImagePreview');
            var pi = document.getElementById('prodPreviewImg');
            if (pc) { pc.style.display = 'block'; pc.setAttribute('data-base64', p.image); }
            if (pi) pi.src = p.image;
        } else {
            document.getElementById('prodImageUrl').value = p.image;
        }
    }

    var badgeNew = document.getElementById('prodBadgeNew');
    var badgeSale = document.getElementById('prodBadgeSale');
    var badgeHit = document.getElementById('prodBadgeHit');
    var badgeExcl = document.getElementById('prodBadgeExclusive');
    if (badgeNew) badgeNew.checked = (p.badges && p.badges.indexOf('new') !== -1);
    if (badgeSale) badgeSale.checked = (p.badges && p.badges.indexOf('sale') !== -1);
    if (badgeHit) badgeHit.checked = (p.badges && p.badges.indexOf('hit') !== -1);
    if (badgeExcl) badgeExcl.checked = (p.badges && p.badges.indexOf('exclusive') !== -1);

    var availRadio = document.querySelector('input[name="prodAvail"][value="' + (p.availability || 'instock') + '"]');
    if (availRadio) availRadio.checked = true;

    var saveBtn = document.getElementById('prodSaveBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> Обновить товар';
    showToast('Редактирование: ' + p.name, 'info');
}

function deleteProduct(id) {
    var p = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id) { p = products[i]; break; }
    }
    if (!p) return;
    if (!confirm('Удалить «' + p.name + '»?')) return;

    products = products.filter(function (x) { return x.id !== id; });
    cart = cart.filter(function (c) { return !(c.id === id && c.type === 'product'); });

    saveProducts();
    saveCart();
    updateCartCount();
    renderProducts();
    renderAdminProducts();
    updateDashboard();
    showToast('Товар «' + p.name + '» удалён', 'error');
    addActivity('Удалён товар: ' + p.name);
}

function renderAdminProducts() {
    var list = document.getElementById('adminProductsList');
    if (!list) return;

    var searchEl = document.getElementById('productSearch');
    var search = searchEl ? searchEl.value.toLowerCase() : '';

    var filtered = products.filter(function (p) {
        return p.name.toLowerCase().indexOf(search) !== -1;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center;padding:30px;color:var(--gray)">Нет товаров</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var p = filtered[i];
        var badgesHTML = '';
        if (p.badges && p.badges.length > 0) {
            var badgeStyles = { 'new': 'background:#27ae60;color:#fff', 'sale': 'background:#d64541;color:#fff', 'hit': 'background:#c9a84c;color:#fff', 'exclusive': 'background:#8e44ad;color:#fff' };
            var badgeLabels = { 'new': 'NEW', 'sale': 'SALE', 'hit': 'ХИТ', 'exclusive': 'ЭКСКЛ' };
            for (var b = 0; b < p.badges.length; b++) {
                var badge = p.badges[b];
                badgesHTML += '<span class="inline-badge" style="' + (badgeStyles[badge] || '') + '">' + (badgeLabels[badge] || badge) + '</span>';
            }
        }

        html +=
            '<div class="admin-table-item">' +
            '<img src="' + p.image + '" alt="' + p.name + '" class="admin-table-thumb" onerror="this.src=\'https://placehold.co/110/f0ece4/b08d6e?text=Img\'">' +
            '<div class="admin-table-info"><h5>' + p.name + ' ' + badgesHTML + '</h5><span>' + (CATEGORY_NAMES[p.category] || '') + (p.size ? ' • ' + p.size : '') + '</span></div>' +
            '<div class="admin-table-price">' + p.price.toLocaleString('ru-RU') + ' ₽</div>' +
            '<div class="admin-table-actions">' +
            '<button class="btn-edit" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i> Ред.</button>' +
            '<button class="btn-delete" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div></div>';
    }
    list.innerHTML = html;
}

function filterAdminProducts() { renderAdminProducts(); }

// ============================================
// МОДУЛИ: CRUD
// ============================================

function populateModuleParentSelect() {
    var select = document.getElementById('modParent');
    if (!select) return;
    var html = '<option value="">Универсальный (для всех)</option>';
    for (var i = 0; i < products.length; i++) {
        if (products[i].category === 'modular') {
            html += '<option value="' + products[i].id + '">' + products[i].name + '</option>';
        }
    }
    select.innerHTML = html;
}

function saveModule(e) {
    e.preventDefault();

    var name = document.getElementById('modName').value.trim();
    var type = document.getElementById('modType').value;
    var price = parseInt(document.getElementById('modPrice').value) || 0;
    var oldPrice = parseInt(document.getElementById('modOldPrice').value) || 0;
    var size = document.getElementById('modSize').value.trim();
    var parentId = document.getElementById('modParent').value;
    var description = document.getElementById('modDesc').value.trim();
    var image = getImageValue('mod');
    var editId = document.getElementById('modEditId').value;

    if (!image) {
        showToast('Добавьте изображение модуля', 'warning');
        return;
    }

    var badges = [];
    if (document.getElementById('modBadgeNew') && document.getElementById('modBadgeNew').checked) badges.push('new');
    if (document.getElementById('modBadgeSale') && document.getElementById('modBadgeSale').checked) badges.push('sale');

    if (editId && editId !== '') {
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].id === parseInt(editId)) {
                modules[i].name = name;
                modules[i].type = type;
                modules[i].price = price;
                modules[i].oldPrice = oldPrice;
                modules[i].size = size;
                modules[i].parentId = parentId;
                modules[i].description = description;
                modules[i].image = image;
                modules[i].badges = badges;
                break;
            }
        }
        showToast('Модуль «' + name + '» обновлён', 'success');
        addActivity('Обновлён модуль: ' + name);
    } else {
        var maxId = 200;
        for (var j = 0; j < modules.length; j++) {
            if (modules[j].id > maxId) maxId = modules[j].id;
        }
        modules.push({
            id: maxId + 1, name: name, type: type, price: price, oldPrice: oldPrice,
            size: size, parentId: parentId, description: description, image: image, badges: badges
        });
        showToast('Модуль «' + name + '» создан', 'success');
        addActivity('Создан модуль: ' + name);
    }

    saveModules();
    renderModules();
    resetModuleForm();
    renderAdminModules();
    updateDashboard();
}

function resetModuleForm() {
    var form = document.getElementById('moduleForm');
    if (form) form.reset();
    var editId = document.getElementById('modEditId');
    if (editId) editId.value = '';
    removePreview('mod');
}

function editModule(id) {
    var m = null;
    for (var i = 0; i < modules.length; i++) {
        if (modules[i].id === id) { m = modules[i]; break; }
    }
    if (!m) return;

    var modBtn = document.querySelectorAll('.admin-nav-btn')[3];
    switchAdminTab('add-module', modBtn);

    document.getElementById('modName').value = m.name || '';
    document.getElementById('modType').value = m.type || '';
    document.getElementById('modPrice').value = m.price || '';
    document.getElementById('modOldPrice').value = m.oldPrice || '';
    document.getElementById('modSize').value = m.size || '';
    document.getElementById('modParent').value = m.parentId || '';
    document.getElementById('modDesc').value = m.description || '';
    document.getElementById('modEditId').value = m.id;

    if (m.image) {
        if (m.image.indexOf('data:') === 0) {
            var pc = document.getElementById('modImagePreview');
            var pi = document.getElementById('modPreviewImg');
            if (pc) { pc.style.display = 'block'; pc.setAttribute('data-base64', m.image); }
            if (pi) pi.src = m.image;
        } else {
            document.getElementById('modImageUrl').value = m.image;
        }
    }

    var bn = document.getElementById('modBadgeNew');
    var bs = document.getElementById('modBadgeSale');
    if (bn) bn.checked = (m.badges && m.badges.indexOf('new') !== -1);
    if (bs) bs.checked = (m.badges && m.badges.indexOf('sale') !== -1);

    showToast('Редактирование модуля: ' + m.name, 'info');
}

function deleteModule(id) {
    var m = null;
    for (var i = 0; i < modules.length; i++) {
        if (modules[i].id === id) { m = modules[i]; break; }
    }
    if (!m) return;
    if (!confirm('Удалить модуль «' + m.name + '»?')) return;

    modules = modules.filter(function (x) { return x.id !== id; });
    cart = cart.filter(function (c) { return !(c.id === id && c.type === 'module'); });

    saveModules(); saveCart(); updateCartCount();
    renderModules(); renderAdminModules(); updateDashboard();
    showToast('Модуль «' + m.name + '» удалён', 'error');
    addActivity('Удалён модуль: ' + m.name);
}

function renderAdminModules() {
    var list = document.getElementById('adminModulesList');
    if (!list) return;

    var searchEl = document.getElementById('moduleSearch');
    var search = searchEl ? searchEl.value.toLowerCase() : '';
    var filtered = modules.filter(function (m) { return m.name.toLowerCase().indexOf(search) !== -1; });

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center;padding:30px;color:var(--gray)">Нет модулей</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var m = filtered[i];
        var badgesHTML = '';
        if (m.badges && m.badges.length > 0) {
            var styles = { 'new': 'background:#27ae60;color:#fff', 'sale': 'background:#d64541;color:#fff' };
            var labels = { 'new': 'NEW', 'sale': 'SALE' };
            for (var b = 0; b < m.badges.length; b++) {
                badgesHTML += '<span class="inline-badge" style="' + (styles[m.badges[b]] || '') + '">' + (labels[m.badges[b]] || m.badges[b]) + '</span>';
            }
        }
        html +=
            '<div class="admin-table-item">' +
            '<img src="' + m.image + '" alt="' + m.name + '" class="admin-table-thumb" onerror="this.src=\'https://placehold.co/110/f0ece4/b08d6e?text=Mod\'">' +
            '<div class="admin-table-info"><h5>' + m.name + ' ' + badgesHTML + '</h5><span>' + (MODULE_TYPE_NAMES[m.type] || m.type) + (m.size ? ' • ' + m.size : '') + '</span></div>' +
            '<div class="admin-table-price">' + m.price.toLocaleString('ru-RU') + ' ₽</div>' +
            '<div class="admin-table-actions">' +
            '<button class="btn-edit" onclick="editModule(' + m.id + ')"><i class="fas fa-edit"></i> Ред.</button>' +
            '<button class="btn-delete" onclick="deleteModule(' + m.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div></div>';
    }
    list.innerHTML = html;
}

function filterAdminModules() { renderAdminModules(); }

// ============================================
// ЗАКАЗЫ
// ============================================

function renderOrders() {
    var list = document.getElementById('ordersList');
    if (!list) return;

    if (orders.length === 0) {
        list.innerHTML = '<p class="empty-log">Заказов пока нет</p>';
        return;
    }

    var sorted = orders.slice().reverse();
    var html = '';
    for (var i = 0; i < sorted.length; i++) {
        var o = sorted[i];
        var date = new Date(o.date);
        var dateStr = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        var statusClass = (o.status === 'done') ? 'status-done' : 'status-new';
        var statusText = (o.status === 'done') ? 'Выполнен' : 'Новый';

        var itemsHTML = '';
        if (o.items) {
            for (var j = 0; j < o.items.length; j++) {
                var item = o.items[j];
                itemsHTML += '<li>' + item.name + ' × ' + item.qty + ' — ' + (item.price * item.qty).toLocaleString('ru-RU') + ' ₽</li>';
            }
        }

        var completeBtn = (o.status !== 'done') ?
            '<button class="btn-complete" onclick="completeOrder(' + o.id + ')"><i class="fas fa-check"></i> Выполнен</button>' : '';

        html +=
            '<div class="order-card">' +
            '<div class="order-card-header"><h4>Заказ #' + o.id + '</h4><span class="order-status ' + statusClass + '">' + statusText + '</span></div>' +
            '<p><strong>Клиент:</strong> ' + o.name + '</p>' +
            '<p><strong>Телефон:</strong> ' + o.phone + '</p>' +
            (o.email ? '<p><strong>Email:</strong> ' + o.email + '</p>' : '') +
            (o.comment ? '<p><strong>Комментарий:</strong> ' + o.comment + '</p>' : '') +
            '<p><strong>Дата:</strong> ' + dateStr + '</p>' +
            '<ul class="order-items-list">' + itemsHTML + '</ul>' +
            '<p style="margin-top:8px;font-weight:700;color:var(--accent)">Итого: ' + o.total.toLocaleString('ru-RU') + ' ₽</p>' +
            '<div class="order-actions">' + completeBtn +
            '<button class="btn-delete" onclick="deleteOrder(' + o.id + ')"><i class="fas fa-trash"></i> Удалить</button>' +
            '</div></div>';
    }
    list.innerHTML = html;
}

function completeOrder(id) {
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].id === id) { orders[i].status = 'done'; break; }
    }
    localStorage.setItem('allianceOrders', JSON.stringify(orders));
    renderOrders(); updateDashboard();
    addActivity('Заказ #' + id + ' выполнен');
    showToast('Заказ выполнен', 'success');
}

function deleteOrder(id) {
    if (!confirm('Удалить заказ?')) return;
    orders = orders.filter(function (x) { return x.id !== id; });
    localStorage.setItem('allianceOrders', JSON.stringify(orders));
    renderOrders(); updateDashboard();
    addActivity('Удалён заказ #' + id);
    showToast('Заказ удалён', 'error');
}

// ============================================
// НАСТРОЙКИ
// ============================================

function changeAdminPassword(e) {
    e.preventDefault();
    var current = document.getElementById('currentPassword').value;
    var newPass = document.getElementById('newPassword').value;
    var confirmPass = document.getElementById('confirmPassword').value;

    if (newPass !== confirmPass) { showToast('Пароли не совпадают', 'error'); return; }

    var admins = getAdmins();
    var found = false;
    for (var i = 0; i < admins.length; i++) {
        if (admins[i].password === current) { admins[i].password = newPass; found = true; break; }
    }
    if (!found) { showToast('Неверный текущий пароль', 'error'); return; }

    localStorage.setItem('allianceAdmins', JSON.stringify(admins));
    showToast('Пароль изменён', 'success');
    addActivity('Смена пароля');
    e.target.reset();
}

function addNewAdmin(e) {
    e.preventDefault();
    var phone = normalizePhone(document.getElementById('newAdminPhone').value);
    var pass = document.getElementById('newAdminPass').value;
    if (phone.length < 10) { showToast('Некорректный номер', 'error'); return; }

    var admins = getAdmins();
    for (var i = 0; i < admins.length; i++) {
        if (normalizePhone(admins[i].phone) === phone) { showToast('Номер уже есть', 'warning'); return; }
    }

    admins.push({ phone: phone, password: pass });
    localStorage.setItem('allianceAdmins', JSON.stringify(admins));
    showToast('Админ добавлен', 'success');
    addActivity('Добавлен админ: +7' + phone.substring(1));
    e.target.reset();
    renderAdminUsers();
}

function removeAdmin(phone) {
    var admins = getAdmins();
    if (admins.length <= 1) { showToast('Нельзя удалить последнего', 'error'); return; }
    if (!confirm('Удалить админа?')) return;
    var filtered = admins.filter(function (a) { return normalizePhone(a.phone) !== normalizePhone(phone); });
    localStorage.setItem('allianceAdmins', JSON.stringify(filtered));
    renderAdminUsers();
    showToast('Админ удалён', 'info');
    addActivity('Удалён админ: ' + phone);
}

function renderAdminUsers() {
    var list = document.getElementById('adminUsersList');
    if (!list) return;
    var admins = getAdmins();
    var html = '';
    for (var i = 0; i < admins.length; i++) {
        var phoneDisplay = '+7' + normalizePhone(admins[i].phone).substring(1);
        html +=
            '<div class="admin-user-item">' +
            '<span><i class="fas fa-user-shield" style="color:var(--accent);margin-right:6px"></i> ' + phoneDisplay + '</span>' +
            '<button class="btn-delete" onclick="removeAdmin(\'' + admins[i].phone + '\')" style="padding:3px 8px;font-size:.6rem"><i class="fas fa-times"></i></button>' +
            '</div>';
    }
    list.innerHTML = html;
}

// ============================================
// ЭКСПОРТ / ИМПОРТ / СБРОС
// ============================================

function exportData() {
    var data = {
        products: products, modules: modules, orders: orders,
        admins: getAdmins(), activity: activityLog,
        promo: JSON.parse(localStorage.getItem('alliancePromo') || '{}')
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'alliance-backup-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Данные экспортированы', 'success');
    addActivity('Экспорт данных');
}

function importData(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var data = JSON.parse(e.target.result);
            if (data.products) { products = data.products; saveProducts(); }
            if (data.modules) { modules = data.modules; saveModules(); }
            if (data.orders) { orders = data.orders; localStorage.setItem('allianceOrders', JSON.stringify(orders)); }
            if (data.admins) localStorage.setItem('allianceAdmins', JSON.stringify(data.admins));
            if (data.activity) { activityLog = data.activity; localStorage.setItem('allianceActivity', JSON.stringify(activityLog)); }
            if (data.promo) localStorage.setItem('alliancePromo', JSON.stringify(data.promo));
            renderProducts(); renderModules(); updateDashboard();
            renderAdminProducts(); renderAdminModules(); renderOrders(); renderAdminUsers();
            showToast('Данные импортированы', 'success');
            addActivity('Импорт данных');
        } catch (err) { showToast('Ошибка файла', 'error'); }
    };
    reader.readAsText(file);
    input.value = '';
}

function resetAllData() {
    if (!confirm('ВСЕ данные будут удалены!')) return;
    if (!confirm('Точно удалить?')) return;
    ['allianceProducts', 'allianceModules', 'allianceOrders', 'allianceCart', 'allianceActivity', 'alliancePromo'].forEach(function (k) { localStorage.removeItem(k); });
    products = DEFAULT_PRODUCTS.slice();
    modules = DEFAULT_MODULES.slice();
    cart = []; orders = []; activityLog = [];
    saveProducts(); saveModules(); saveCart();
    localStorage.setItem('allianceOrders', JSON.stringify(orders));
    localStorage.setItem('allianceActivity', JSON.stringify(activityLog));
    renderProducts(); renderModules(); updateCartCount(); updateDashboard();
    renderAdminProducts(); renderAdminModules(); renderOrders();
    showToast('Данные сброшены', 'warning');
}

// ============================================
// ПРОМО БАННЕР
// ============================================

function loadPromoSettings() {
    try {
        var promo = JSON.parse(localStorage.getItem('alliancePromo') || '{}');
        var t = document.getElementById('promoText');
        var a = document.getElementById('promoActive');
        if (t && promo.text) t.value = promo.text;
        if (a) a.checked = !!promo.active;
    } catch (e) {}
}

function savePromoBanner(e) {
    e.preventDefault();
    var text = document.getElementById('promoText').value.trim();
    var active = document.getElementById('promoActive').checked;
    localStorage.setItem('alliancePromo', JSON.stringify({ text: text, active: active }));
    if (active && text) {
        document.getElementById('promoTextDisplay').textContent = text;
        document.getElementById('promoBanner').style.display = 'flex';
    } else {
        document.getElementById('promoBanner').style.display = 'none';
    }
    showToast('Баннер сохранён', 'success');
    addActivity('Промо-баннер ' + (active ? 'вкл' : 'выкл') + ': ' + text);
}

console.log('admin-data.js загружен');