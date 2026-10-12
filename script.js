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
