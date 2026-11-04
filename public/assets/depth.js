/* Black Horse SPA — первый экран со сценами, которые листаются прокруткой.
   Колесо / свайп / стрелки переключают сцены; после последней прокрутка отпускается на сайт.
   При «уменьшить движение» сцены переключаются только кнопками, прокрутка не перехватывается. */
(() => {
  const root = document.documentElement;
  const hero = document.getElementById('depth');
  const intro = document.getElementById('intro');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Заставка с эмблемой (один раз за сессию) ---------- */
  if (intro) {
    let seen = false;
    try { seen = sessionStorage.getItem('bh-intro') === '1'; } catch (e) {}
    if (seen || reduce) intro.remove();
    else {
      root.classList.add('intro-on');
      const close = () => {
        if (!intro.isConnected) return;
        intro.classList.add('is-done');
        root.classList.remove('intro-on');
        try { sessionStorage.setItem('bh-intro', '1'); } catch (e) {}
        setTimeout(() => intro.remove(), 900);
      };
      setTimeout(close, 1900);
      intro.addEventListener('click', close);
      addEventListener('keydown', close, { once: true });
    }
  }
  if (!hero) return;

  const slides = [...hero.querySelectorAll('.depth-slide')];
  const texts = [...hero.querySelectorAll('.depth-text')];
  const dots = [...hero.querySelectorAll('.depth-dot')];
  const hint = hero.querySelector('.depth-hint');
  const pause = hero.querySelector('.depth-pause');
  const last = slides.length - 1;
  let idx = 0, lockUntil = 0, acc = 0, accTimer = 0;
  const LOCK = 1050;

  /* Высота сцены = экран минус шапка */
  const fit = () => {
    const top = Math.max(0, hero.getBoundingClientRect().top + scrollY);
    hero.style.setProperty('--depth-h', `${Math.max(520, innerHeight - top - 12)}px`);
  };
  fit(); addEventListener('resize', fit);

  function go(n) {
    n = Math.max(0, Math.min(last, n));
    if (n === idx) return;
    const prev = idx; idx = n;
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === idx);
      s.classList.toggle('is-leaving', i === prev);
    });
    setTimeout(() => slides[prev] && slides[prev].classList.remove('is-leaving'), 1400);
    texts.forEach((t, i) => {
      const on = i === idx;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-hidden', String(!on));
      t.querySelectorAll('a').forEach(a => on ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1'));
    });
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
      d.classList.toggle('is-done', i < idx);
      i === idx ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current');
    });
    hero.classList.toggle('is-last', idx === last);
    hint.querySelector('span').textContent = idx === last ? hero.dataset.open : hero.dataset.hint;
    lockUntil = performance.now() + LOCK;
  }
  const step = d => go(idx + d);

  /* Сцена «захватывает» прокрутку, пока страница в самом верху */
  const engaged = () => !reduce && scrollY < 6 && !root.classList.contains('menu-open');
  const wants = d => (d > 0 && idx < last) || (d < 0 && idx > 0);

  addEventListener('wheel', e => {
    if (!engaged() || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    const d = Math.sign(e.deltaY);
    if (!wants(d)) return;            // на краях отпускаем прокрутку
    e.preventDefault();
    if (performance.now() < lockUntil) return;
    acc += e.deltaY;
    clearTimeout(accTimer); accTimer = setTimeout(() => { acc = 0; }, 180);
    if (Math.abs(acc) >= 24) { acc = 0; step(d); }
  }, { passive: false });

  let ty = null;
  hero.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
  hero.addEventListener('touchmove', e => {
    if (ty === null || !engaged()) return;
    const d = Math.sign(ty - e.touches[0].clientY);
    if (wants(d)) e.preventDefault();
  }, { passive: false });
  hero.addEventListener('touchend', e => {
    if (ty === null) return;
    const dy = ty - e.changedTouches[0].clientY; ty = null;
    if (!engaged() || Math.abs(dy) < 45) return;
    const d = Math.sign(dy);
    if (wants(d) && performance.now() >= lockUntil) step(d);
  });

  addEventListener('keydown', e => {
    if (!engaged() || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    const down = ['ArrowDown', 'PageDown', ' '].includes(e.key), up = ['ArrowUp', 'PageUp'].includes(e.key);
    const d = down ? 1 : up ? -1 : 0;
    if (d && wants(d)) { e.preventDefault(); if (performance.now() >= lockUntil) step(d); }
  });

  hero.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => step(+b.dataset.step)));
  dots.forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));

  /* «Листайте» → следующая сцена; на последней — плавно на сайт */
  hint.addEventListener('click', () => {
    if (idx < last) return step(1);
    const next = hero.nextElementSibling;
    if (next) scrollTo({ top: next.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* Пауза фонового движения */
  pause.addEventListener('click', () => {
    const p = hero.classList.toggle('is-paused');
    pause.setAttribute('aria-pressed', String(p));
    pause.querySelector('span').textContent = p ? hero.dataset.play : hero.dataset.pause;
    pause.querySelector('i').textContent = p ? '▶' : '❙❙';
  });

  /* Объём: эмблема и фото слегка следуют за курсором */
  if (fine && !reduce) {
    let raf = 0, tx = 0, ty2 = 0;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5; ty2 = (e.clientY - r.top) / r.height - .5;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        if (hero.classList.contains('is-paused')) return;
        hero.style.setProperty('--px', tx.toFixed(3));
        hero.style.setProperty('--py', ty2.toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', () => { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });
  }
})();
