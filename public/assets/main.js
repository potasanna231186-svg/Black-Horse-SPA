/* Black Horse SPA — поведение страниц. Данные салона приходят из window.AURA (см. data/site.json) */
(() => {
  const A = window.AURA || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* Шапка при прокрутке + липкая кнопка записи на телефоне */
  const header = $('#header'), sticky = $('#sticky-cta');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    header && header.classList.toggle('scrolled', y > 20);
    if (sticky) {
      const show = y > 600 && innerHeight + y < document.body.scrollHeight - 300;
      sticky.classList.toggle('show', show);
      sticky.setAttribute('aria-hidden', String(!show));
      $('a', sticky).tabIndex = show ? 0 : -1;
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Мобильное меню */
  const burger = $('.burger');
  const mm = $('#mobile-menu');
  const setMenu = open => {
    if (open && mm && header) mm.style.setProperty('--hb', `${Math.round(header.getBoundingClientRect().bottom)}px`);
    document.body.classList.toggle('menu-open', open);
    burger && burger.setAttribute('aria-expanded', String(open));
    mm && mm.setAttribute('aria-hidden', String(!open));
  };

  /* Шапка подстраивается под ширину: если всё не помещается,
     сначала прячем телефон, потом меню уходит в бургер */
  const fitHeader = () => {
    if (!header) return;
    header.classList.remove('no-phone', 'is-compact');
    const nav = $('.nav', header), logo = $('.logo', header), cta = $('.header-cta', header);
    if (!nav || getComputedStyle(nav).display === 'none') return;
    const tight = () => {
      const l = logo.getBoundingClientRect(), n = nav.getBoundingClientRect(), c = cta.getBoundingClientRect();
      return nav.scrollWidth > nav.clientWidth + 1 || n.left < l.right + 20 || c.left < n.right + 20;
    };
    if (tight()) { header.classList.add('no-phone'); if (tight()) header.classList.add('is-compact'); }
    if (burger && getComputedStyle(burger).display === 'none') setMenu(false);
  };
  let fitRaf = 0;
  addEventListener('resize', () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitHeader); });
  fitHeader();
  document.fonts && document.fonts.ready.then(fitHeader);
  burger && burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* Светлая / тёмная тема */
  $$('.theme-toggle').forEach(b => b.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('aura-theme', next);
  }));

  /* Кнопка мессенджеров */
  const fab = $('#fab');
  if (fab) {
    const main = $('.fab-main', fab);
    main.addEventListener('click', () => {
      const open = fab.classList.toggle('open');
      main.setAttribute('aria-expanded', String(open));
      $$('.fab-list a', fab).forEach(a => a.tabIndex = open ? 0 : -1);
    });
  }

  /* Выбор языка: закрывается по клику мимо */
  const langMenus = $$('.lang-menu');
  document.addEventListener('click', e => langMenus.forEach(d => { if (d.open && !d.contains(e.target)) d.open = false; }));

  /* Escape закрывает всё открытое */
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    setMenu(false);
    langMenus.forEach(d => d.open = false);
    fab && fab.classList.remove('open');
    closeLightbox();
  });

  /* Полоса акции с обратным отсчётом */
  const promo = $('#promo');
  if (promo) {
    const until = new Date(promo.dataset.until).getTime();
    const key = 'aura-promo-' + promo.dataset.until;
    const cd = $('[data-cd]', promo);
    const tick = () => {
      const left = until - Date.now();
      if (!(left > 0)) { promo.hidden = true; return false; }
      const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60;
      cd.textContent = `${d}${A.t.d} ${h}${A.t.h} ${m}${A.t.m}`;
      return true;
    };
    if (store.get(key) !== 'closed' && tick()) {
      promo.hidden = false;
      setInterval(tick, 30000);
    }
    $('.promo-close', promo).addEventListener('click', () => { promo.hidden = true; store.set(key, 'closed'); });
  }

  /* Появление блоков при прокрутке */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(e => io.observe(e));
  } else reveals.forEach(e => e.classList.add('in'));

  /* Вкладки прайса */
  const tabs = $$('.tab[data-tab]');
  if (tabs.length) {
    const show = id => {
      tabs.forEach(b => { const on = b.dataset.tab === id; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
      $$('.price-group').forEach(g => g.classList.toggle('active', g.id === id));
    };
    tabs.forEach(b => b.addEventListener('click', () => { show(b.dataset.tab); history.replaceState(null, '', '#' + b.dataset.tab); }));
    const fromHash = () => { const id = location.hash.slice(1); if (id && document.getElementById(id) && tabs.some(b => b.dataset.tab === id)) { show(id); return true; } };
    fromHash() || show(tabs[0].dataset.tab);
    addEventListener('hashchange', fromHash);
  }

  /* Галерея: фильтр по категориям + просмотр */
  const items = $$('.g-item');
  $$('.filters .tab').forEach(b => b.addEventListener('click', () => {
    $$('.filters .tab').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    const f = b.dataset.filter;
    items.forEach(i => { i.hidden = !(f === 'all' || i.dataset.cat === f); });
  }));
  const lb = $('#lightbox');
  let idx = 0, lastFocus = null;
  const visible = () => items.filter(i => !i.hidden);
  const render = () => {
    const list = visible(); const it = list[idx]; if (!it) return;
    const ph = $('.photo', it).cloneNode(true);
    $('.cap', ph) && $('.cap', ph).remove();
    $('.lb-stage', lb).replaceChildren(ph);
    $('.lb-cap', lb).textContent = it.getAttribute('aria-label');
  };
  function closeLightbox() { if (lb && lb.classList.contains('open')) { lb.classList.remove('open'); lastFocus && lastFocus.focus(); } }
  if (lb) {
    items.forEach(it => it.addEventListener('click', () => {
      idx = visible().indexOf(it); lastFocus = it; render();
      lb.classList.add('open'); $('.lb-close', lb).focus();
    }));
    const step = d => { const n = visible().length; idx = (idx + d + n) % n; render(); };
    $('.lb-prev', lb).addEventListener('click', () => step(-1));
    $('.lb-next', lb).addEventListener('click', () => step(1));
    $('.lb-close', lb).addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* Карта загружается только когда до неё доскроллили */
  const map = $('#map');
  if (map && 'IntersectionObserver' in window) {
    const mo = new IntersectionObserver(es => { if (es[0].isIntersecting) { map.src = map.dataset.src; mo.disconnect(); } });
    mo.observe(map);
  } else if (map) map.src = map.dataset.src;

  /* Форма записи → готовое сообщение в WhatsApp / Telegram */
  const form = $('#booking');
  if (form) {
    let text = '';
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(f => { const bad = !f.value.trim(); f.classList.toggle('invalid', bad); if (bad && ok) { f.focus(); ok = false; } });
      if (!ok) return;
      const d = Object.fromEntries(new FormData(form));
      text = A.t.msg.replace('{name}', A.name).replace('{n}', d.name).replace('{p}', d.phone)
        .replace('{s}', d.service).replace('{d}', d.date || '—').replace('{c}', d.comment || '—');
      const done = $('#form-done');
      $('.wa-send', done).href = `https://wa.me/${A.whatsapp}?text=${encodeURIComponent(text)}`;
      $('.tg-send', done).href = `https://t.me/${A.telegram}`;
      done.hidden = false;
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $$('input,textarea', form).forEach(f => f.addEventListener('input', () => f.classList.remove('invalid')));
    const copy = $('.copy-send', form);
    copy && copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text); copy.textContent = A.t.copied; setTimeout(() => copy.textContent = A.t.copy, 2000); } catch (e) {}
    });
  }
})();
