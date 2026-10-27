// As ondas da marca seguem a mão com atraso; não substituem o cursor.
import { reducedMotion as reduced } from './motion-preference';
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const fields = document.querySelectorAll<HTMLElement>(
  '.band, .rows, .builder, .closing',
);
fields.forEach((field) => {
  field.dataset.flow = '';
  field.classList.add('flow-surface');
});

const ns = 'http://www.w3.org/2000/svg';
const ribbon = document.createElementNS(ns, 'svg');
ribbon.setAttribute('viewBox', '0 0 320 180');
ribbon.setAttribute('aria-hidden', 'true');
ribbon.classList.add('pointer-flow');
ribbon.innerHTML = '<defs><linearGradient id="pointer-flow-ink"><stop stop-color="#4c63ff" stop-opacity="0"/><stop offset=".25" stop-color="#4c63ff"/><stop offset=".66" stop-color="#c5d0ff"/><stop offset="1" stop-color="#4c63ff" stop-opacity="0"/></linearGradient></defs>';
const paths = Array.from({ length: 12 }, () => {
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'url(#pointer-flow-ink)');
  path.setAttribute('stroke-width', '1.5');
  ribbon.append(path);
  return path;
});

let host: HTMLElement | null = null;
let bounds: DOMRect;
let frame = 0;
let idle: ReturnType<typeof setTimeout>;
let x = 0, y = 0, tx = 0, ty = 0, phase = 0;
let dirty = true;

const draw = () => {
  const dx = tx - x, dy = ty - y;
  x += dx * 0.14;
  y += dy * 0.14;
  phase += Math.min(0.09, (Math.abs(dx) + Math.abs(dy)) * 0.002);
  const amplitude = 12 + Math.min(28, Math.abs(dx) * 0.18 + Math.abs(dy) * 0.1);
  paths.forEach((path, line) => {
    let d = '';
    for (let step = 0; step <= 32; step++) {
      const u = step / 32;
      const py = 36 + line * 8 + Math.sin(u * 6.5 + phase + line * 0.17) * amplitude * Math.sin(Math.PI * u);
      d += `${step ? 'L' : 'M'}${u * 320} ${py.toFixed(1)} `;
    }
    path.setAttribute('d', d);
  });
  ribbon.style.transform = `translate3d(${(x - 160).toFixed(1)}px, ${(y - 90).toFixed(1)}px, 0) rotate(${-24 + Math.max(-12, Math.min(12, dx * 0.08))}deg)`;
  if (Math.abs(dx) + Math.abs(dy) > 0.15) frame = requestAnimationFrame(draw);
  else frame = 0;
};

const hide = () => {
  clearTimeout(idle);
  cancelAnimationFrame(frame);
  frame = 0;
  ribbon.style.opacity = '0';
};
const move = (event: PointerEvent) => {
  if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
  const next = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-flow]') : null;
  if (!next) { hide(); return; }
  if (host !== next) {
    host = next;
    host.append(ribbon);
    bounds = host.getBoundingClientRect();
    x = event.clientX - bounds.left;
    y = event.clientY - bounds.top;
    dirty = false;
  }
  if (dirty) { bounds = host.getBoundingClientRect(); dirty = false; }
  tx = event.clientX - bounds.left;
  ty = event.clientY - bounds.top;
  ribbon.style.opacity = '0.9';
  clearTimeout(idle);
  idle = setTimeout(() => { ribbon.style.opacity = '0'; }, 950);
  if (!frame) frame = requestAnimationFrame(draw);
};
const invalidate = () => { dirty = true; hide(); };
document.addEventListener('pointermove', move, { passive: true });
document.documentElement.addEventListener('pointerleave', hide);
window.addEventListener('scroll', invalidate, { passive: true });
window.addEventListener('resize', invalidate, { passive: true });
reduced.addEventListener('change', hide);
fine.addEventListener('change', hide);

if (import.meta.hot) import.meta.hot.dispose(() => {
  hide();
  ribbon.remove();
  document.removeEventListener('pointermove', move);
  document.documentElement.removeEventListener('pointerleave', hide);
  window.removeEventListener('scroll', invalidate);
  window.removeEventListener('resize', invalidate);
  reduced.removeEventListener('change', hide);
  fine.removeEventListener('change', hide);
});
