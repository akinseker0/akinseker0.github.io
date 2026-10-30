// menüde, ekranda görünen bölümün bağlantısını mavi yapar
(() => {
  const links = [...document.querySelectorAll('.nav-pill a')];
  const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  if (!('IntersectionObserver' in window) || !targets.length) return;

  const activate = (id) => {
    links.forEach((a) => {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activate(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  targets.forEach((target) => observer.observe(target));
})();

(() => {
  const root = document.querySelector('[data-slider]');
  if (!root) return;

  const track = root.querySelector('.work-track');
  const prev = root.querySelector('[data-dir="-1"]');
  const next = root.querySelector('[data-dir="1"]');

  // bir fotoğrafın genişliği ve aradaki boşluk
  const step = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return track.querySelector('figure').getBoundingClientRect().width + gap;
  };

  const update = () => {
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
  };

  // ekranda kaç fotoğraf görünüyorsa o kadar ilerler
  const go = (dir) => {
    const visible = Math.max(1, Math.round(track.clientWidth / step()));
    track.scrollBy({ left: dir * step() * visible });
  };

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

(() => {
  const dialog = document.querySelector('.lightbox');
  const figures = [...document.querySelectorAll('.work-track figure')];
  if (!dialog || !figures.length || typeof dialog.showModal !== 'function') return;

  const photo = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  let index = 0;

  const show = (i) => {
    index = (i + figures.length) % figures.length;
    const source = figures[index].querySelector('img');
    photo.src = source.currentSrc || source.src;
    photo.alt = source.alt;
    caption.textContent = figures[index].querySelector('figcaption').textContent;
  };

  const open = (i) => {
    show(i);
    dialog.showModal();
    document.documentElement.classList.add('lb-open');
  };

  figures.forEach((figure, i) => {
    const thumb = figure.querySelector('img');
    thumb.tabIndex = 0;
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('aria-label', 'Büyüt: ' + figure.querySelector('figcaption').textContent);
    thumb.addEventListener('click', () => open(i));
    thumb.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(i);
      }
    });
  });

  // sayfa kaydırması kilidini kaldırır, son bakılan fotoğraf şeritte görünür kalsın
  const unlock = () => {
    document.documentElement.classList.remove('lb-open');
    figures[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const close = () => {
    dialog.close();
    unlock();
  };

  dialog.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  dialog.querySelector('.lb-close').addEventListener('click', close);
  // fotoğrafın dışındaki boş alana tıklayınca kapanır
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  // Esc ile kapanma
  dialog.addEventListener('cancel', unlock);
  dialog.addEventListener('close', unlock);
})();
