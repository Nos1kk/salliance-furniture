// ============================================
// ADMIN-CORE.JS — Авторизация, навигация, базовые функции
// ============================================

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
var DEFAULT_ADMINS = [
    { phone: '79056704413', password: 'admin123' },
    { phone: '89056704413', password: 'admin123' }
];

var isAdminAuth = false;

// Проверяем авторизацию при загрузке
try {
    isAdminAuth = sessionStorage.getItem('allianceAdminAuth') === 'true';
} catch (e) {
    isAdminAuth = false;
}

// ============================================
// РАБОТА С АДМИНАМИ
// ============================================

function getAdmins() {
    var admins = null;
    try {
        admins = JSON.parse(localStorage.getItem('allianceAdmins'));
    } catch (e) {
        admins = null;
    }
    if (!admins || !Array.isArray(admins) || admins.length === 0) {
        admins = [];
        for (var i = 0; i < DEFAULT_ADMINS.length; i++) {
            admins.push({
                phone: DEFAULT_ADMINS[i].phone,
                password: DEFAULT_ADMINS[i].password
            });
        }
        localStorage.setItem('allianceAdmins', JSON.stringify(admins));
    }
    return admins;
}

function normalizePhone(phone) {
    if (!phone) return '';
    var digits = phone.replace(/\D/g, '');
    if (digits.charAt(0) === '8' && digits.length === 11) {
        digits = '7' + digits.substring(1);
    }
    if (digits.charAt(0) !== '7' && digits.length === 10) {
        digits = '7' + digits;
    }
    return digits;
}

// ============================================
// МОДАЛЬНОЕ ОКНО ЛОГИНА
// ============================================

function openAdminLogin() {
    console.log('openAdminLogin вызван, isAdminAuth:', isAdminAuth);
    if (isAdminAuth) {
        openAdmin();
        return;
    }
    var modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.add('open');
        var errEl = document.getElementById('loginError');
        if (errEl) errEl.style.display = 'none';
    }
}

function closeAdminLogin() {
    var modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

// ============================================
// АВТОРИЗАЦИЯ
// ============================================

function adminLogin(e) {
    e.preventDefault();

    var phoneInput = document.getElementById('adminPhone');
    var passInput = document.getElementById('adminPassword');
    if (!phoneInput || !passInput) return;

    var phone = normalizePhone(phoneInput.value);
    var password = passInput.value;
    var admins = getAdmins();

    console.log('Попытка входа, телефон:', phone, 'пароль:', password);

    var found = false;
    for (var i = 0; i < admins.length; i++) {
        var adminPhone = normalizePhone(admins[i].phone);
        if (adminPhone === phone && admins[i].password === password) {
            found = true;
            break;
        }
    }

    if (found) {
        isAdminAuth = true;
        try {
            sessionStorage.setItem('allianceAdminAuth', 'true');
        } catch (e) {}
        closeAdminLogin();
        openAdmin();
        showToast('Добро пожаловать, администратор!', 'success');
        addActivity('Вход администратора');
    } else {
        var errEl = document.getElementById('loginError');
        var errText = document.getElementById('loginErrorText');
        if (errEl) errEl.style.display = 'flex';
        if (errText) errText.textContent = 'Неверный номер телефона или пароль';
        showToast('Ошибка авторизации', 'error');
    }
}

function togglePasswordVisibility() {
    var input = document.getElementById('adminPassword');
    var icon = document.getElementById('passToggleIcon');
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function adminLogout() {
    isAdminAuth = false;
    try {
        sessionStorage.removeItem('allianceAdminAuth');
    } catch (e) {}
    closeAdmin();
    showToast('Вы вышли из панели управления', 'info');
    addActivity('Выход администратора');
}

// ============================================
// ОТКРЫТИЕ / ЗАКРЫТИЕ АДМИН-ПАНЕЛИ
// ============================================

function openAdmin() {
    if (!isAdminAuth) {
        openAdminLogin();
        return;
    }
    var overlay = document.getElementById('adminOverlay');
    if (overlay) {
        overlay.classList.add('open');
    }
    updateDashboard();
    renderAdminProducts();
    renderAdminModules();
    renderOrders();
    renderAnalytics();
    renderAdminUsers();
    loadPromoSettings();
    populateModuleParentSelect();
}

function closeAdmin() {
    var overlay = document.getElementById('adminOverlay');
    if (overlay) {
        overlay.classList.remove('open');
    }
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================

function switchAdminTab(tab, btn) {
    var allBtns = document.querySelectorAll('.admin-nav-btn');
    for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.remove('active');
    }
    if (btn) btn.classList.add('active');

    var tabMap = {
        'dashboard': 'tabDashboard',
        'add': 'tabAdd',
        'products': 'tabProducts',
        'add-module': 'tabAddModule',
        'modules-list': 'tabModulesList',
        'orders': 'tabOrders',
        'settings': 'tabSettings',
        'analytics': 'tabAnalytics'
    };

    var allTabs = document.querySelectorAll('.admin-tab-content');
    for (var j = 0; j < allTabs.length; j++) {
        allTabs[j].style.display = 'none';
    }

    var targetId = tabMap[tab];
    if (targetId) {
        var targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.style.display = 'block';
    }

    if (tab === 'products') renderAdminProducts();
    if (tab === 'modules-list') renderAdminModules();
    if (tab === 'orders') renderOrders();
    if (tab === 'analytics') renderAnalytics();
    if (tab === 'dashboard') updateDashboard();
    if (tab === 'add-module') populateModuleParentSelect();
    if (tab === 'settings') renderAdminUsers();
}

// ============================================
// ДАШБОРД
// ============================================

function updateDashboard() {
    var el1 = document.getElementById('dashTotalProducts');
    var el2 = document.getElementById('dashTotalModules');
    var el3 = document.getElementById('dashTotalOrders');
    var el4 = document.getElementById('dashTotalSale');

    if (el1) el1.textContent = products.length;
    if (el2) el2.textContent = modules.length;
    if (el3) el3.textContent = orders.length;

    var saleCount = 0;
    for (var i = 0; i < products.length; i++) {
        if (products[i].badges && products[i].badges.indexOf('sale') !== -1) {
            saleCount++;
        }
    }
    if (el4) el4.textContent = saleCount;

    var logEl = document.getElementById('activityLog');
    if (!logEl) return;

    if (activityLog.length === 0) {
        logEl.innerHTML = '<p class="empty-log">Нет активности</p>';
    } else {
        var logHTML = '';
        var max = Math.min(activityLog.length, 20);
        for (var k = 0; k < max; k++) {
            var a = activityLog[k];
            var time = new Date(a.time);
            var timeStr = time.toLocaleDateString('ru-RU') + ' ' +
                time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            logHTML +=
                '<div class="activity-item">' +
                '<i class="fas fa-circle" style="font-size:.4rem"></i>' +
                a.text +
                '<span class="activity-time">' + timeStr + '</span>' +
                '</div>';
        }
        logEl.innerHTML = logHTML;
    }
}

// ============================================
// ЗАГРУЗКА ИЗОБРАЖЕНИЙ
// ============================================

function switchUploadTab(type, btn, prefix) {
    var tabs = btn.parentElement.querySelectorAll('.upload-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    btn.classList.add('active');

    var urlEl = document.getElementById(prefix + 'UploadUrl');
    var fileEl = document.getElementById(prefix + 'UploadFile');
    if (urlEl) urlEl.style.display = (type === 'url') ? 'block' : 'none';
    if (fileEl) fileEl.style.display = (type === 'file') ? 'block' : 'none';
}

function handleFileUpload(input, prefix) {
    var file = input.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Файл слишком большой (макс 5MB)', 'error');
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var previewContainer = document.getElementById(prefix + 'ImagePreview');
        var previewImg = document.getElementById(prefix + 'PreviewImg');
        if (previewImg) previewImg.src = e.target.result;
        if (previewContainer) {
            previewContainer.style.display = 'block';
            previewContainer.setAttribute('data-base64', e.target.result);
        }
    };
    reader.readAsDataURL(file);
}

function removePreview(prefix) {
    var previewContainer = document.getElementById(prefix + 'ImagePreview');
    if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.setAttribute('data-base64', '');
    }
    var previewImg = document.getElementById(prefix + 'PreviewImg');
    if (previewImg) previewImg.src = '';
    var fileInput = document.getElementById(prefix + 'FileInput');
    if (fileInput) fileInput.value = '';
}

function getImageValue(prefix) {
    var preview = document.getElementById(prefix + 'ImagePreview');
    if (preview) {
        var base64 = preview.getAttribute('data-base64');
        if (base64 && base64.length > 0) return base64;
    }
    var urlInput = document.getElementById(prefix + 'ImageUrl');
    return urlInput ? urlInput.value.trim() : '';
}

function initDropZones() {
    var prefixes = ['prod', 'mod'];
    for (var p = 0; p < prefixes.length; p++) {
        (function (prefix) {
            var dropZone = document.getElementById(prefix + 'DropZone');
            if (!dropZone) return;

            dropZone.addEventListener('dragover', function (e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', function () {
                this.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', function (e) {
                e.preventDefault();
                this.classList.remove('drag-over');

                var file = e.dataTransfer.files[0];
                if (file && file.type.indexOf('image/') === 0) {
                    var input = document.getElementById(prefix + 'FileInput');
                    if (input) {
                        try {
                            var dt = new DataTransfer();
                            dt.items.add(file);
                            input.files = dt.files;
                            handleFileUpload(input, prefix);
                        } catch (err) {
                            var reader = new FileReader();
                            reader.onload = function (ev) {
                                var pc = document.getElementById(prefix + 'ImagePreview');
                                var pi = document.getElementById(prefix + 'PreviewImg');
                                if (pi) pi.src = ev.target.result;
                                if (pc) {
                                    pc.style.display = 'block';
                                    pc.setAttribute('data-base64', ev.target.result);
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                    }
                }
            });
        })(prefixes[p]);
    }
}

// ============================================
// АНАЛИТИКА
// ============================================

function renderAnalytics() {
    var catChart = document.getElementById('categoryChart');
    var priceChart = document.getElementById('priceChart');
    var statsTable = document.getElementById('statsTable');
    if (!catChart || !priceChart || !statsTable) return;

    var cats = { straight: 0, corner: 0, modular: 0 };
    for (var i = 0; i < products.length; i++) {
        if (cats[products[i].category] !== undefined) cats[products[i].category]++;
    }
    var maxCat = Math.max(cats.straight, cats.corner, cats.modular, 1);
    var catColors = { straight: '#b08d6e', corner: '#c9a84c', modular: '#27ae60' };
    var catHTML = '';
    ['straight', 'corner', 'modular'].forEach(function (key) {
        catHTML += '<div class="chart-bar"><span class="chart-bar-label">' + CATEGORY_NAMES[key] + '</span><div class="chart-bar-fill" style="width:' + (cats[key] / maxCat * 100) + '%;background:' + catColors[key] + '">' + cats[key] + '</div></div>';
    });
    catChart.innerHTML = catHTML;

    var ranges = { 'До 30к': 0, '30-60к': 0, '60-90к': 0, '90к+': 0 };
    for (var j = 0; j < products.length; j++) {
        if (products[j].price < 30000) ranges['До 30к']++;
        else if (products[j].price < 60000) ranges['30-60к']++;
        else if (products[j].price < 90000) ranges['60-90к']++;
        else ranges['90к+']++;
    }
    var maxP = Math.max(ranges['До 30к'], ranges['30-60к'], ranges['60-90к'], ranges['90к+'], 1);
    var pColors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c'];
    var pHTML = '';
    ['До 30к', '30-60к', '60-90к', '90к+'].forEach(function (key, idx) {
        pHTML += '<div class="chart-bar"><span class="chart-bar-label">' + key + '</span><div class="chart-bar-fill" style="width:' + (ranges[key] / maxP * 100) + '%;background:' + pColors[idx] + '">' + ranges[key] + '</div></div>';
    });
    priceChart.innerHTML = pHTML;

    var totalVal = 0, saleC = 0, newC = 0, ordTotal = 0, newOrd = 0, doneOrd = 0;
    for (var k = 0; k < products.length; k++) {
        totalVal += products[k].price;
        if (products[k].badges) {
            if (products[k].badges.indexOf('sale') !== -1) saleC++;
            if (products[k].badges.indexOf('new') !== -1) newC++;
        }
    }
    var avg = products.length ? Math.round(totalVal / products.length) : 0;
    for (var l = 0; l < orders.length; l++) {
        ordTotal += orders[l].total;
        if (orders[l].status === 'new') newOrd++;
        if (orders[l].status === 'done') doneOrd++;
    }

    statsTable.innerHTML =
        '<div class="stats-row"><span>Всего товаров</span><span>' + products.length + '</span></div>' +
        '<div class="stats-row"><span>Всего модулей</span><span>' + modules.length + '</span></div>' +
        '<div class="stats-row"><span>Средняя цена</span><span>' + avg.toLocaleString('ru-RU') + ' ₽</span></div>' +
        '<div class="stats-row"><span>Со скидкой</span><span>' + saleC + '</span></div>' +
        '<div class="stats-row"><span>Новинки</span><span>' + newC + '</span></div>' +
        '<div class="stats-row"><span>Всего заказов</span><span>' + orders.length + '</span></div>' +
        '<div class="stats-row"><span>Новых</span><span>' + newOrd + '</span></div>' +
        '<div class="stats-row"><span>Выполненных</span><span>' + doneOrd + '</span></div>' +
        '<div class="stats-row"><span>Сумма заказов</span><span>' + ordTotal.toLocaleString('ru-RU') + ' ₽</span></div>';
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initDropZones();

    var adminOverlay = document.getElementById('adminOverlay');
    if (adminOverlay) {
        adminOverlay.addEventListener('click', function (e) {
            if (e.target === this) closeAdmin();
        });
    }

    var loginModal = document.getElementById('adminLoginModal');
    if (loginModal) {
        loginModal.addEventListener('click', function (e) {
            if (e.target === this) closeAdminLogin();
        });
    }

    console.log('admin-core.js загружен');
});