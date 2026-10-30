import { reducedMotion } from './motion-preference';

const fine = matchMedia('(hover: hover) and (pointer: fine)');
const cleanups: (() => void)[] = [];
document.querySelectorAll<HTMLAnchorElement>('a.btn, a.hero-cta, a.contact-link').forEach(button => {
  button.dataset.tilt = '';
  // Mesmo plano de texto nos CTAs existentes, sem mudar o nome acessível.
  [...button.childNodes].forEach(node => {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return;
    const label = document.createElement('span');
    label.textContent = node.textContent;
    node.replaceWith(label);
  });
  let bounds: DOMRect | undefined, frame = 0;
  const current = [0, 0, 0, 0, 0, 1];
  const target = [...current];
  const properties = ['--rx', '--ry', '--lift', '--pull-x', '--pull-y', '--zoom'];
  const units = ['deg', 'deg', 'px', 'px', 'px', ''];
  const tick = () => {
    let moving = false;
    current.forEach((value, i) => {
      const next = value + (target[i] - value) * 0.18;
      const settled = Math.abs(target[i] - next) < 0.003;
      current[i] = settled ? target[i] : next;
      moving ||= !settled;
      button.style.setProperty(properties[i], current[i].toFixed(3) + units[i]);
    });
    frame = moving ? requestAnimationFrame(tick) : 0;
  };
  const run = () => { if (!frame) frame = requestAnimationFrame(tick); };
  const enter = () => { bounds = button.getBoundingClientRect(); };
  const move = (event: PointerEvent) => {
    if (!fine.matches || reducedMotion.matches || event.pointerType === 'touch') return;
    bounds ??= button.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    target.splice(0, 6, y * 12, -x * 16, -4, x * 4, y * 2, 1.035);
    button.style.setProperty('--light-x', `${(x + 1) * 50}%`);
    button.style.setProperty('--light-y', `${(y + 1) * 50}%`);
    run();
  };
  const leave = () => {
    bounds = undefined; target.splice(0, 6, 0, 0, 0, 0, 0, 1);
    if (current.some((value, i) => Math.abs(value - target[i]) > 0.001)) run();
  };
  const focus = () => { if (!reducedMotion.matches && button.matches(':focus-visible')) { target[2] = -3; target[5] = 1.025; run(); } };
  const stop = () => {
    cancelAnimationFrame(frame); frame = 0; bounds = undefined;
    target.splice(0, 6, 0, 0, 0, 0, 0, 1); current.splice(0, 6, ...target);
    [...properties, '--light-x', '--light-y'].forEach(property => button.style.removeProperty(property));
  };
  button.addEventListener('pointerenter', enter);
  button.addEventListener('pointermove', move);
  button.addEventListener('pointerleave', leave);
  button.addEventListener('focus', focus);
  button.addEventListener('blur', leave);
  window.addEventListener('scroll', leave, { passive: true });
  window.addEventListener('blur', leave);
  fine.addEventListener('change', stop);
  reducedMotion.addEventListener('change', stop);
  cleanups.push(() => {
    stop(); button.removeEventListener('pointerenter', enter); button.removeEventListener('pointermove', move); button.removeEventListener('pointerleave', leave);
    button.removeEventListener('focus', focus); button.removeEventListener('blur', leave);
    window.removeEventListener('scroll', leave); window.removeEventListener('blur', leave);
    fine.removeEventListener('change', stop); reducedMotion.removeEventListener('change', stop);
  });
});
if (import.meta.hot) import.meta.hot.dispose(() => cleanups.forEach(cleanup => cleanup()));
