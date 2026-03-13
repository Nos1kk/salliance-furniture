// ============================================
// АЛЬЯНС — Main.js v2
// Динамический контент + аналитика
// ============================================

let siteSettings = {};

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initCustomCursor();
    initNavbar();
    initMobileMenu();
    initParallax();
    initScrollAnimations();
    initHeroParticles();
    initCounterAnimation();
    initRippleEffect();
    initSmoothScroll();
    initContactForm();
    loadSiteSettings();
    trackPageView();
});

// ============================================
// ЗАГРУЗКА НАСТРОЕК — динамический контент
// ============================================
async function loadSiteSettings() {
    try {
        const res = await fetch('/api/settings');
        siteSettings = await res.json();
        applySettings(siteSettings);
    } catch (e) {
        console.log('Settings: using defaults');
    }
}

function applySettings(s) {
    // Hero
    setText('dHeroBadge', s.heroBadge);
    setText('dHeroTitle1', s.heroTitle1);
    setText('dHeroTitle2', s.heroTitle2);
    setText('dHeroTitle3', s.heroTitle3);
    setText('dHeroSubtitle', s.heroSubtitle);
    setText('dHeroBtn1', s.heroBtn1);
    setText('dHeroBtn2', s.heroBtn2);

    // Stats
    if (s.stat1Value) {
        const el1 = document.getElementById('dStat1Value');
        if (el1) { el1.setAttribute('data-count', s.stat1Value); }
    }
    setText('dStat1Label', s.stat1Label);
    if (s.stat2Value) {
        const el2 = document.getElementById('dStat2Value');
        if (el2) { el2.setAttribute('data-count', s.stat2Value); }
    }
    setText('dStat2Label', s.stat2Label);
    if (s.stat3Value) {
        const el3 = document.getElementById('dStat3Value');
        if (el3) { el3.setAttribute('data-count', s.stat3Value); }
    }
    setText('dStat3Label', s.stat3Label);

    // Marquee
    if (s.marqueeItems && s.marqueeItems.length > 0) {
        const marquee = document.getElementById('dMarquee');
        if (marquee) {
            // Дублируем для бесшовной прокрутки
            const items = s.marqueeItems;
            const doubled = [...items, ...items];
            marquee.innerHTML = doubled.map(t => `<span>&#10038; ${escHtml(t)}</span>`).join('');
        }
    }

    // About
    setText('dAboutTag', s.aboutTag);
    setText('dAboutTitle', s.aboutTitle);
    setText('dAboutTitleAccent', s.aboutTitleAccent);
    setText('dAboutSubtitle', s.aboutSubtitle);

    if (s.aboutCards && s.aboutCards.length > 0) {
        const grid = document.getElementById('dAboutGrid');
        if (grid) {
            grid.innerHTML = s.aboutCards.map((c, i) => `
                <div class="about-card animate-on-scroll" data-delay="${i * 100}">
                    <div class="about-card-icon"><i class="${escHtml(c.icon || 'fas fa-star')}"></i></div>
                    <h3>${escHtml(c.title)}</h3>
                    <p>${escHtml(c.text)}</p>
                </div>
            `).join('');
            // Переинициализация анимаций
            reinitScrollAnimations();
        }
    }

    // Catalog headers
    setText('dCatalogTag', s.catalogTag);
    setText('dCatalogTitle', s.catalogTitle);
    setText('dCatalogTitleAccent', s.catalogTitleAccent);
    setText('dCatalogSubtitle', s.catalogSubtitle);

    // Features
    setText('dFeaturesTag', s.featuresTag);
    setText('dFeaturesTitle', s.featuresTitle);
    setText('dFeaturesTitleAccent', s.featuresTitleAccent);

    if (s.featureCards && s.featureCards.length > 0) {
        const fGrid = document.getElementById('dFeaturesGrid');
        if (fGrid) {
            fGrid.innerHTML = s.featureCards.map((c, i) => `
                <div class="feature-card animate-on-scroll" data-delay="${i * 150}">
                    <div class="feature-number">${escHtml(c.number)}</div>
                    <h3>${escHtml(c.title)}</h3>
                    <p>${escHtml(c.text)}</p>
                </div>
            `).join('');
            reinitScrollAnimations();
        }
    }

    // Contact
    setText('dContactTag', s.contactTag);
    setText('dContactTitle', s.contactTitle);
    setText('dContactTitleAccent', s.contactTitleAccent);
    setText('dContactAddress', s.contactAddress);
    setText('dContactPhone', s.contactPhone);
    setText('dContactEmail', s.contactEmail);
    setText('dContactSchedule', s.contactSchedule);

    // Footer
    setText('dFooterText', s.footerText);
    setText('dFooterCopyright', s.footerCopyright);
    setText('dFooterPhone', s.contactPhone);
    setText('dFooterEmail', s.contactEmail);

    // Social
    setHref('dSocialVk', s.socialVk);
    setHref('dSocialTelegram', s.socialTelegram);
    setHref('dSocialWhatsapp', s.socialWhatsapp);
    setHref('dSocialInstagram', s.socialInstagram);

    // Footer catalog — из категорий
    loadFooterCategories();

    // Checkout fields
    buildCheckoutForm(s.checkoutFields);
}

async function loadFooterCategories() {
    try {
        const res = await fetch('/api/categories');
        const cats = await res.json();
        const ul = document.getElementById('dFooterCatalog');
        if (ul && cats.length > 0) {
            ul.innerHTML = cats.map(c =>
                `<li><a href="#catalog">${escHtml(c.name)}</a></li>`
            ).join('');
        }
    } catch (e) { /* silent */ }
}

function buildCheckoutForm(fields) {
    if (!fields) return;
    const container = document.getElementById('checkoutFieldsContainer');
    if (!container) return;

    const fieldKeys = ['name', 'phone', 'email', 'address', 'comment'];
    let html = '';

    // Группируем по парам для row-2
    const enabled = fieldKeys.filter(k => fields[k] && fields[k].enabled !== false);
    let i = 0;

    while (i < enabled.length) {
        const key = enabled[i];
        const f = fields[key];
        const nextKey = enabled[i + 1];
        const nextF = nextKey ? fields[nextKey] : null;

        const isTextarea = key === 'comment';
        const isNextTextarea = nextKey === 'comment';

        if (isTextarea) {
            // Textarea на всю ширину
            html += `<div class="form-group">
                <label>${escHtml(f.label)}</label>
                <textarea id="orderField_${key}" rows="3" placeholder="${escHtml(f.placeholder || '')}" ${f.required ? 'required' : ''}></textarea>
            </div>`;
            i++;
        } else if (nextF && !isNextTextarea) {
            // Два поля в ряд
            html += `<div class="form-row">
                <div class="form-group">
                    <label>${escHtml(f.label)}${f.required ? ' *' : ''}</label>
                    <input type="${key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}" 
                           id="orderField_${key}" 
                           placeholder="${escHtml(f.placeholder || '')}" 
                           ${f.required ? 'required' : ''}>
                </div>
                <div class="form-group">
                    <label>${escHtml(nextF.label)}${nextF.required ? ' *' : ''}</label>
                    <input type="${nextKey === 'email' ? 'email' : nextKey === 'phone' ? 'tel' : 'text'}" 
                           id="orderField_${nextKey}" 
                           placeholder="${escHtml(nextF.placeholder || '')}" 
                           ${nextF.required ? 'required' : ''}>
                </div>
            </div>`;
            i += 2;
        } else {
            // Одно поле
            html += `<div class="form-group">
                <label>${escHtml(f.label)}${f.required ? ' *' : ''}</label>
                <input type="${key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}" 
                       id="orderField_${key}" 
                       placeholder="${escHtml(f.placeholder || '')}" 
                       ${f.required ? 'required' : ''}>
            </div>`;
            i++;
        }
    }

    container.innerHTML = html;
}

// ============================================
// АНАЛИТИКА — трекинг
// ============================================
function trackPageView() {
    try {
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: window.location.pathname })
        });
    } catch (e) { /* silent */ }
}

// ============================================
// PRELOADER
// ============================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    document.body.style.overflow = 'hidden';
    const hide = () => { preloader.classList.add('hidden'); document.body.style.overflow = ''; };
    window.addEventListener('load', () => setTimeout(hide, 2300));
    setTimeout(hide, 4000);
}

// ============================================
// CUSTOM CURSOR
// ============================================
function initCustomCursor() {
    const cursor = document.querySelector('.cursor-follower');
    if (!cursor || 'ontouchstart' in window) { if (cursor) cursor.style.display = 'none'; return; }

    let mx = -100, my = -100, cx = -100, cy = -100;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
        cx += (mx - cx) * 0.12;
        cy += (my - cy) * 0.12;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
        requestAnimationFrame(loop);
    })();

    function bindHover() {
        document.querySelectorAll('a, button, .product-card, .about-card, .feature-card, .filter-btn, .contact-item, input, textarea, select').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }
    bindHover();
    new MutationObserver(() => bindHover()).observe(document.body, { childList: true, subtree: true });
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                header.classList.toggle('scrolled', sy > 60);

                const sections = document.querySelectorAll('section[id]');
                let current = '';
                sections.forEach(s => {
                    if (sy >= s.offsetTop - 200 && sy < s.offsetTop + s.offsetHeight) current = s.id;
                });
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
                });
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(l => {
        l.addEventListener('click', () => {
            burger.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ============================================
// PARALLAX
// ============================================
function initParallax() {
    const heroBg = document.querySelector('.hero-parallax-bg');
    const featBg = document.querySelector('.parallax-bg');
    if (!heroBg && !featBg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                if (heroBg) heroBg.style.transform = `scale(1.1) translate3d(0,${sy * 0.35}px,0)`;
                if (featBg) {
                    const sec = document.getElementById('features');
                    if (sec) featBg.style.transform = `scale(1.2) translate3d(0,${-sec.getBoundingClientRect().top * 0.15}px,0)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    observeAnimations(document.querySelectorAll('.animate-on-scroll'));
}

function reinitScrollAnimations() {
    const fresh = document.querySelectorAll('.animate-on-scroll:not(.animated)');
    observeAnimations(fresh);
}

function observeAnimations(elements) {
    if (elements.length === 0) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const delay = e.target.getAttribute('data-delay') || 0;
                setTimeout(() => e.target.classList.add('animated'), parseInt(delay));
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    elements.forEach(el => obs.observe(el));
}

// ============================================
// HERO PARTICLES
// ============================================
function initHeroParticles() {
    const c = document.getElementById('heroParticles');
    if (!c) return;
    const count = window.innerWidth < 768 ? 20 : 35;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('hero-particle');
        const sz = Math.random() * 3 + 1.5;
        p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;animation:particleDrift ${Math.random() * 10 + 8}s ${Math.random() * 8}s linear infinite;background:rgba(200,165,90,${Math.random() * 0.4 + 0.15});`;
        c.appendChild(p);
    }
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (counters.length === 0) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                animateCount(e.target, parseInt(e.target.getAttribute('data-count')));
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
}

function animateCount(el, target) {
    const start = performance.now();
    const dur = 2000;
    (function update(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(ease * target).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(update);
    })(start);
}

// ============================================
// RIPPLE
// ============================================
function initRippleEffect() {
    document.addEventListener('click', e => {
        const btn = e.target.closest('.btn, .add-to-cart-btn, .filter-btn');
        if (!btn) return;
        const r = document.createElement('span');
        r.classList.add('ripple-effect');
        const rect = btn.getBoundingClientRect();
        const sz = Math.max(rect.width, rect.height) * 1.4;
        r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px;`;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(r);
        setTimeout(() => r.remove(), 600);
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const id = a.getAttribute('href');
            if (id === '#') return;
            const t = document.querySelector(id);
            if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
        });
    });
}

// ============================================
// CONTACT FORM
// ============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); showNotification('Сообщение отправлено!'); form.reset(); });
}

// ============================================
// NOTIFICATION
// ============================================
function showNotification(text) {
    const el = document.getElementById('notification');
    const t = document.getElementById('notificationText');
    if (!el || !t) return;
    t.textContent = text;
    el.classList.add('show');
    clearTimeout(window._nTimer);
    window._nTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ============================================
// UTILS
// ============================================
function setText(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.textContent = val;
}

function setHref(id, val) {
    const el = document.getElementById(id);
    if (el && val) {
        el.href = val;
        // Скрываем если пустая ссылка
        el.style.display = (!val || val === '#') ? 'none' : '';
    }
}

function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}