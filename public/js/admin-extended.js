// ============================================
// ADMIN-EXTENDED.JS — Расширенные настройки
// Ткани, цвета, ножки, механизмы, наполнители
// ============================================

var extendedSettings = {
    fabrics: [],
    colors: [],
    legs: [],
    mechanisms: [],
    fillers: [],
    extras: [],
    deliveryZones: [],
    sizes: { straight: [], corner: [] }
};

// ============================================
// ЗАГРУЗКА НАСТРОЕК
// ============================================

async function loadExtendedSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        extendedSettings.fabrics = settings.fabrics || [];
        extendedSettings.colors = settings.colors || [];
        extendedSettings.legs = settings.legs || [];
        extendedSettings.mechanisms = settings.mechanisms || [];
        extendedSettings.fillers = settings.fillers || [];
        extendedSettings.extras = settings.extras || [];
        extendedSettings.deliveryZones = settings.deliveryZones || [];
        extendedSettings.sizes = settings.sizes || { straight: [], corner: [] };
        
        // Загружаем email в форму
        var emailInput = document.getElementById('orderEmailInput');
        if (emailInput && settings.email) {
            emailInput.value = settings.email;
        }
        
        console.log('✅ Расширенные настройки загружены');
    } catch (e) {
        console.error('❌ Ошибка загрузки настроек:', e);
    }
}

// ============================================
// РЕНДЕР ВКЛАДКИ
// ============================================

function renderExtendedSettings() {
    var container = document.getElementById('tabExtendedSettings');
    if (!container) return;
    
    container.innerHTML = `
        <h3 class="admin-section-title"><i class="fas fa-sliders-h"></i> Конфигуратор диванов</h3>
        
        <div class="extended-settings-tabs">
            <button class="ext-tab-btn active" onclick="switchExtTab('fabrics', this)">
                <i class="fas fa-scroll"></i> Ткани
            </button>
            <button class="ext-tab-btn" onclick="switchExtTab('colors', this)">
                <i class="fas fa-palette"></i> Цвета
            </button>
            <button class="ext-tab-btn" onclick="switchExtTab('legs', this)">
                <i class="fas fa-chair"></i> Ножки
            </button>
            <button class="ext-tab-btn" onclick="switchExtTab('mechanisms', this)">
                <i class="fas fa-cogs"></i> Механизмы
            </button>
            <button class="ext-tab-btn" onclick="switchExtTab('fillers', this)">
                <i class="fas fa-cloud"></i> Наполнители
            </button>
            <button class="ext-tab-btn" onclick="switchExtTab('extras', this)">
                <i class="fas fa-plus-circle"></i> Допы
            </button>
            <button class="ext-tab-btn" onclick="switchExtTab('delivery', this)">
                <i class="fas fa-truck"></i> Доставка
            </button>
            <button class="ext-tab-btn" onclick="switchExtTab('email', this)">
                <i class="fas fa-envelope"></i> Email
            </button>
        </div>
        
        <div class="ext-tab-content" id="extFabrics">${renderFabricsEditor()}</div>
        <div class="ext-tab-content" id="extColors" style="display:none;">${renderColorsEditor()}</div>
        <div class="ext-tab-content" id="extLegs" style="display:none;">${renderGenericEditor('legs', 'Ножки', 'fas fa-chair')}</div>
        <div class="ext-tab-content" id="extMechanisms" style="display:none;">${renderGenericEditor('mechanisms', 'Механизмы', 'fas fa-cogs')}</div>
        <div class="ext-tab-content" id="extFillers" style="display:none;">${renderGenericEditor('fillers', 'Наполнители', 'fas fa-cloud')}</div>
        <div class="ext-tab-content" id="extExtras" style="display:none;">${renderGenericEditor('extras', 'Допы', 'fas fa-plus-circle')}</div>
        <div class="ext-tab-content" id="extDelivery" style="display:none;">${renderDeliveryEditor()}</div>
        <div class="ext-tab-content" id="extEmail" style="display:none;">${renderEmailEditor()}</div>
    `;
}

function switchExtTab(tab, btn) {
    document.querySelectorAll('.ext-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.ext-tab-content').forEach(c => c.style.display = 'none');
    
    var tabMap = {
        'fabrics': 'extFabrics', 'colors': 'extColors', 'legs': 'extLegs',
        'mechanisms': 'extMechanisms', 'fillers': 'extFillers', 'extras': 'extExtras',
        'delivery': 'extDelivery', 'email': 'extEmail'
    };
    
    var el = document.getElementById(tabMap[tab]);
    if (el) el.style.display = 'block';
}

// ============================================
// УНИВЕРСАЛЬНЫЙ РЕДАКТОР
// ============================================

function renderGenericEditor(type, title, icon) {
    var items = extendedSettings[type] || [];
    
    var itemsHtml = items.map((item, i) => `
        <div class="editor-item">
            <input type="text" value="${item.name || ''}" placeholder="Название" 
                onchange="updateSettingItem('${type}', ${i}, 'name', this.value)">
            <div class="price-input">
                <span>+</span>
                <input type="number" value="${item.price || 0}" 
                    onchange="updateSettingItem('${type}', ${i}, 'price', parseInt(this.value) || 0)">
                <span>₽</span>
            </div>
            <button class="remove-item-btn" onclick="removeSettingItem('${type}', ${i})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    return `
        <div class="settings-editor">
            <div class="editor-header">
                <h4><i class="${icon}"></i> ${title}</h4>
                <button class="add-item-btn" onclick="addSettingItem('${type}')">
                    <i class="fas fa-plus"></i> Добавить
                </button>
            </div>
            <div class="editor-list" id="${type}List">${itemsHtml || '<p style="color:var(--gray);padding:20px;text-align:center;">Нет элементов</p>'}</div>
            <button class="save-settings-btn" onclick="saveSettingsList('${type}')">
                <i class="fas fa-save"></i> Сохранить
            </button>
        </div>
    `;
}

function addSettingItem(type) {
    extendedSettings[type].push({ id: Date.now(), name: '', price: 0 });
    refreshSettingsList(type);
}

function updateSettingItem(type, index, field, value) {
    if (extendedSettings[type][index]) {
        extendedSettings[type][index][field] = value;
    }
}

function removeSettingItem(type, index) {
    extendedSettings[type].splice(index, 1);
    refreshSettingsList(type);
}

function refreshSettingsList(type) {
    var container = document.getElementById(type + 'List');
    if (!container) return;
    
    var items = extendedSettings[type] || [];
    container.innerHTML = items.map((item, i) => `
        <div class="editor-item">
            <input type="text" value="${item.name || ''}" placeholder="Название" 
                onchange="updateSettingItem('${type}', ${i}, 'name', this.value)">
            <div class="price-input">
                <span>+</span>
                <input type="number" value="${item.price || 0}" 
                    onchange="updateSettingItem('${type}', ${i}, 'price', parseInt(this.value) || 0)">
                <span>₽</span>
            </div>
            <button class="remove-item-btn" onclick="removeSettingItem('${type}', ${i})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('') || '<p style="color:var(--gray);padding:20px;text-align:center;">Нет элементов</p>';
}

async function saveSettingsList(type) {
    try {
        await fetch('/api/settings/' + type, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(extendedSettings[type])
        });
        showToast('Сохранено', 'success');
        addActivityServer('Обновлены настройки: ' + type);
    } catch (e) {
        showToast('Ошибка сохранения', 'error');
    }
}

// ============================================
// ТКАНИ
// ============================================

function renderFabricsEditor() {
    var items = extendedSettings.fabrics || [];
    
    var itemsHtml = items.map((f, i) => `
        <div class="editor-item">
            <input type="text" value="${f.name || ''}" placeholder="Название ткани" 
                onchange="updateSettingItem('fabrics', ${i}, 'name', this.value)">
            <div class="price-input">
                <span>+</span>
                <input type="number" value="${f.price || 0}" 
                    onchange="updateSettingItem('fabrics', ${i}, 'price', parseInt(this.value) || 0)">
                <span>₽</span>
            </div>
            <button class="remove-item-btn" onclick="removeSettingItem('fabrics', ${i})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    return `
        <div class="settings-editor">
            <div class="editor-header">
                <h4><i class="fas fa-scroll"></i> Типы тканей</h4>
                <button class="add-item-btn" onclick="addSettingItem('fabrics'); refreshFabricsList()">
                    <i class="fas fa-plus"></i> Добавить ткань
                </button>
            </div>
            <p style="color:var(--gray);font-size:0.85rem;margin-bottom:15px;">
                Укажите наценку за тип ткани. 0 — базовая цена, отрицательное число — скидка.
            </p>
            <div class="editor-list" id="fabricsList">${itemsHtml}</div>
            <button class="save-settings-btn" onclick="saveSettingsList('fabrics')">
                <i class="fas fa-save"></i> Сохранить ткани
            </button>
        </div>
    `;
}

function refreshFabricsList() {
    refreshSettingsList('fabrics');
}

// ============================================
// ЦВЕТА
// ============================================

function renderColorsEditor() {
    var items = extendedSettings.colors || [];
    
    var itemsHtml = items.map((c, i) => `
        <div class="color-item">
            <input type="color" value="${c.hex || '#808080'}" 
                onchange="updateSettingItem('colors', ${i}, 'hex', this.value)">
            <input type="text" value="${c.name || ''}" placeholder="Название цвета" 
                onchange="updateSettingItem('colors', ${i}, 'name', this.value)">
            <button class="remove-item-btn" onclick="removeSettingItem('colors', ${i}); refreshColorsList()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    return `
        <div class="settings-editor">
            <div class="editor-header">
                <h4><i class="fas fa-palette"></i> Цвета обивки</h4>
                <button class="add-item-btn" onclick="addColor()">
                    <i class="fas fa-plus"></i> Добавить цвет
                </button>
            </div>
            <div class="editor-list colors-grid" id="colorsList">${itemsHtml}</div>
            <button class="save-settings-btn" onclick="saveSettingsList('colors')">
                <i class="fas fa-save"></i> Сохранить цвета
            </button>
        </div>
    `;
}

function addColor() {
    extendedSettings.colors.push({ id: Date.now(), name: '', hex: '#808080' });
    refreshColorsList();
}

function refreshColorsList() {
    var container = document.getElementById('colorsList');
    if (!container) return;
    
    container.innerHTML = extendedSettings.colors.map((c, i) => `
        <div class="color-item">
            <input type="color" value="${c.hex || '#808080'}" 
                onchange="updateSettingItem('colors', ${i}, 'hex', this.value)">
            <input type="text" value="${c.name || ''}" placeholder="Название цвета" 
                onchange="updateSettingItem('colors', ${i}, 'name', this.value)">
            <button class="remove-item-btn" onclick="removeSettingItem('colors', ${i}); refreshColorsList()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// ============================================
// ДОСТАВКА
// ============================================

function renderDeliveryEditor() {
    var items = extendedSettings.deliveryZones || [];
    
    var itemsHtml = items.map((d, i) => `
        <div class="editor-item delivery-item">
            <input type="text" value="${d.name || ''}" placeholder="Название зоны" 
                onchange="updateDeliveryItem(${i}, 'name', this.value)">
            <div class="price-input">
                <input type="number" value="${d.price || 0}" 
                    onchange="updateDeliveryItem(${i}, 'price', parseInt(this.value) || 0)">
                <span>₽</span>
            </div>
            <div class="min-order-input">
                <span>Бесплатно от:</span>
                <input type="number" value="${d.minOrder || 0}" 
                    onchange="updateDeliveryItem(${i}, 'minOrder', parseInt(this.value) || 0)">
                <span>₽</span>
            </div>
            <button class="remove-item-btn" onclick="removeDeliveryItem(${i})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    return `
        <div class="settings-editor">
            <div class="editor-header">
                <h4><i class="fas fa-truck"></i> Зоны доставки</h4>
                <button class="add-item-btn" onclick="addDeliveryItem()">
                    <i class="fas fa-plus"></i> Добавить зону
                </button>
            </div>
            <p style="color:var(--gray);font-size:0.85rem;margin-bottom:15px;">
                «Бесплатно от» — минимальная сумма заказа для бесплатной доставки. 0 — всегда платная.
            </p>
            <div class="editor-list" id="deliveryList">${itemsHtml}</div>
            <button class="save-settings-btn" onclick="saveDeliverySettings()">
                <i class="fas fa-save"></i> Сохранить доставку
            </button>
        </div>
    `;
}

function addDeliveryItem() {
    extendedSettings.deliveryZones.push({ id: Date.now(), name: '', price: 0, minOrder: 0 });
    refreshDeliveryList();
}

function updateDeliveryItem(index, field, value) {
    if (extendedSettings.deliveryZones[index]) {
        extendedSettings.deliveryZones[index][field] = value;
    }
}

function removeDeliveryItem(index) {
    extendedSettings.deliveryZones.splice(index, 1);
    refreshDeliveryList();
}

function refreshDeliveryList() {
    var container = document.getElementById('deliveryList');
    if (!container) return;
    
    container.innerHTML = extendedSettings.deliveryZones.map((d, i) => `
        <div class="editor-item delivery-item">
            <input type="text" value="${d.name || ''}" placeholder="Название зоны" 
                onchange="updateDeliveryItem(${i}, 'name', this.value)">
            <div class="price-input">
                <input type="number" value="${d.price || 0}" 
                    onchange="updateDeliveryItem(${i}, 'price', parseInt(this.value) || 0)">
                <span>₽</span>
            </div>
            <div class="min-order-input">
                <span>Бесплатно от:</span>
                <input type="number" value="${d.minOrder || 0}" 
                    onchange="updateDeliveryItem(${i}, 'minOrder', parseInt(this.value) || 0)">
                <span>₽</span>
            </div>
            <button class="remove-item-btn" onclick="removeDeliveryItem(${i})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

async function saveDeliverySettings() {
    try {
        await fetch('/api/settings/deliveryZones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(extendedSettings.deliveryZones)
        });
        showToast('Доставка сохранена', 'success');
        addActivityServer('Обновлены зоны доставки');
    } catch (e) {
        showToast('Ошибка сохранения', 'error');
    }
}

// ============================================
// EMAIL
// ============================================

function renderEmailEditor() {
    return `
        <div class="settings-editor">
            <div class="editor-header">
                <h4><i class="fas fa-envelope"></i> Настройки Email</h4>
            </div>
            <div class="email-settings-form">
                <div class="form-group">
                    <label><i class="fas fa-at"></i> Email для заказов</label>
                    <input type="email" id="orderEmailInput" placeholder="kcel046@gmail.com" value="">
                    <p class="form-hint">На этот адрес будут приходить уведомления о новых заказах</p>
                </div>
                
                <button class="save-settings-btn" onclick="saveEmailSettings()">
                    <i class="fas fa-save"></i> Сохранить email
                </button>
                
                <div class="email-test-section">
                    <h5>Тестирование</h5>
                    <p style="color:var(--gray);font-size:0.85rem;margin-bottom:15px;">
                        Отправьте тестовое письмо, чтобы убедиться, что email работает корректно.
                    </p>
                    <button class="test-email-btn" onclick="sendTestEmail()">
                        <i class="fas fa-paper-plane"></i> Отправить тестовое письмо
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function saveEmailSettings() {
    var input = document.getElementById('orderEmailInput');
    if (!input) return;
    
    var email = input.value.trim();
    if (!email || !email.includes('@')) {
        showToast('Введите корректный email', 'error');
        return;
    }
    
    try {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        showToast('Email сохранён: ' + email, 'success');
        addActivityServer('Изменён email для заказов: ' + email);
    } catch (e) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function sendTestEmail() {
    showToast('Отправка...', 'info');
    
    try {
        const response = await fetch('/api/test-email', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message, 'success');
        } else {
            showToast(result.error || 'Ошибка', 'error');
        }
    } catch (e) {
        showToast('Ошибка отправки', 'error');
    }
}

// ============================================
// HELPER
// ============================================

async function addActivityServer(text) {
    try {
        await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
    } catch (e) {
        console.error('Ошибка записи активности:', e);
    }
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadExtendedSettings();
    console.log('✅ admin-extended.js загружен');
});