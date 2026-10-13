(() => {
  const stage = document.querySelector('[data-compare]');
  if (!stage) return;

  const clip = stage.querySelector('#cleanClipRect');
  const handle = stage.querySelector('.handle');
  const input = stage.querySelector('.compare-input');
  const hit = stage.querySelector('.compare-hit');

  // koltuğun SVG içindeki yatay aralığı (viewBox birimi)
  const X0 = 150;
  const X1 = 570;
  const WIDTH = 900;

  const set = (value) => {
    const v = Math.max(0, Math.min(100, value));
    const x = X0 + ((X1 - X0) * v) / 100;
    input.value = v;
    clip.setAttribute('x', x);
    clip.setAttribute('width', WIDTH - x);
    handle.setAttribute('transform', `translate(${x} 0)`);
  };

  const fromPointer = (event) => {
    const box = hit.getBoundingClientRect();
    set(((event.clientX - box.left) / box.width) * 100);
  };

  hit.addEventListener('pointerdown', (event) => {
    hit.setPointerCapture(event.pointerId);
    fromPointer(event);
  });
  hit.addEventListener('pointermove', (event) => {
    if (hit.hasPointerCapture(event.pointerId)) fromPointer(event);
  });
  input.addEventListener('input', () => set(Number(input.value)));

  set(50);
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
