import type Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './pointer-flow';
import { reducedMotion as reduced } from './motion-preference';
import { setSectorScroll } from './sectors';

const fine = matchMedia('(hover: hover) and (pointer: fine)');
let smooth: Lenis | undefined;
let generation = 0;

// Suaviza a roda; toque, teclado e zoom continuam com comportamento nativo.
async function syncScroll() {
  const ticket = ++generation;
  smooth?.destroy();
  smooth = undefined;
  setSectorScroll(null);
  document.documentElement.classList.remove('has-smooth-scroll');
  if (!fine.matches || reduced.matches || document.hidden) return;
  try {
    const { default: Lenis } = await import('lenis');
    if (ticket !== generation) return;
    smooth = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      anchors: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: false, // a escolha local da página já foi aplicada acima
      virtualScroll: ({ event }) => !event.ctrlKey && !event.metaKey,
    });
    document.documentElement.classList.add('has-smooth-scroll');
    const lenis = smooth;
    setSectorScroll((y) => lenis.scrollTo(y, { duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) }));
  } catch {
    // Falha do módulo mantém o scroll nativo e a página utilizável.
  }
}

fine.addEventListener('change', syncScroll);
reduced.addEventListener('change', syncScroll);
document.addEventListener('visibilitychange', syncScroll);
void syncScroll();

// Interrompe a inércia antes da ação nativa do teclado, sem cancelar a tecla.
const interruptForKeyboard = (event: KeyboardEvent) => {
  if (!smooth || event.ctrlKey || event.metaKey || event.altKey) return;
  // Setas, PageUp/PageDown e espaço ficam com a navegação por setores (sectors.ts).
  if (!['Home', 'End', 'Tab'].includes(event.key)) return;
  const target = event.target;
  if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')) return;
  smooth.scrollTo(window.scrollY, { immediate: true });
};
window.addEventListener('keydown', interruptForKeyboard);

// Um feixe largo atravessa a arte; o cursor do sistema permanece intacto.
const cleanups: (() => void)[] = [];
document.querySelectorAll<HTMLElement>('[data-optic]').forEach((surface) => {
  let bounds: DOMRect;
  let frame = 0;
  let active = false;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  const tick = () => {
    x += (targetX - x) * 0.1;
    y += (targetY - y) * 0.1;
    const moving = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.0005;
    if (!moving) { x = targetX; y = targetY; }
    surface.style.setProperty('--pointer-x', x.toFixed(5));
    surface.style.setProperty('--pointer-y', y.toFixed(5));
    frame = moving ? requestAnimationFrame(tick) : 0;
  };
  const run = () => { if (!frame) frame = requestAnimationFrame(tick); };
  const enter = () => {
    if (!fine.matches || reduced.matches) return;
    active = true;
    bounds = surface.getBoundingClientRect();
    surface.style.setProperty('--pointer-active', '1');
  };
  const move = (event: PointerEvent) => {
    if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
    if (!active) enter();
    if (!bounds) return;
    targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    run();
  };
  const leave = () => {
    active = false;
    targetX = targetY = 0;
    surface.style.setProperty('--pointer-active', '0');
    run();
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    active = false;
    x = y = targetX = targetY = 0;
    surface.style.removeProperty('--pointer-active');
    surface.style.removeProperty('--pointer-x');
    surface.style.removeProperty('--pointer-y');
  };
  surface.addEventListener('pointerenter', enter);
  surface.addEventListener('pointermove', move);
  surface.addEventListener('pointerleave', leave);
  window.addEventListener('scroll', leave, { passive: true });
  window.addEventListener('blur', leave);
  reduced.addEventListener('change', stop);
  fine.addEventListener('change', stop);
  cleanups.push(() => {
    stop();
    surface.removeEventListener('pointerenter', enter);
    surface.removeEventListener('pointermove', move);
    surface.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', leave);
    window.removeEventListener('blur', leave);
    reduced.removeEventListener('change', stop);
    fine.removeEventListener('change', stop);
  });
});

if (import.meta.hot) import.meta.hot.dispose(() => {
  generation++;
  smooth?.destroy();
  fine.removeEventListener('change', syncScroll);
  reduced.removeEventListener('change', syncScroll);
  document.removeEventListener('visibilitychange', syncScroll);
  window.removeEventListener('keydown', interruptForKeyboard);
  cleanups.forEach((cleanup) => cleanup());
});
