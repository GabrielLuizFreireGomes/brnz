// Navegação por setores: setas e PageUp/PageDown descem ou sobem um setor inteiro,
// e uma coluna de pontos mostra onde você está e leva a qualquer setor.
import { reducedMotion } from './motion-preference';

type ScrollFn = (y: number) => void;
let scrollFn: ScrollFn = (y) => window.scrollTo({ top: y, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
export const setSectorScroll = (fn: ScrollFn | null) => {
  scrollFn = fn ?? ((y) => window.scrollTo({ top: y, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
};

const labels: Record<string, string> = {
  inicio: 'Início', abertura: 'Por que a brnz', servicos: 'Serviços', processo: 'Como funciona',
  pacotes: 'Pacotes', monte: 'Monte o seu', time: 'Time', duvidas: 'Dúvidas', contato: 'Contato', rodape: 'Rodapé',
};
const sectors = [...document.querySelectorAll<HTMLElement>('#inicio, main > section, body > footer')];
sectors.forEach((s) => s.setAttribute('data-sector', ''));

// Posição no layout (ignora o deslocamento das animações de entrada).
const topOf = (el: HTMLElement) => {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
};
let target: number | null = null;
let settle = 0;
const go = (y: number) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  target = Math.max(0, Math.min(max, y));
  window.clearTimeout(settle);
  settle = window.setTimeout(() => (target = null), 1200);
  scrollFn(target);
};

const step = (dir: 1 | -1) => {
  const y = target ?? window.scrollY;
  const vh = window.innerHeight;
  const tops = sectors.map(topOf);
  let i = 0;
  tops.forEach((t, k) => { if (t <= y + 8) i = k; });
  const top = tops[i];
  const bottom = top + sectors[i].offsetHeight;
  if (dir === 1) {
    const next = tops[i + 1];
    // Setor mais alto que a tela: desce em etapas até o fim dele antes de pular.
    if (bottom - (y + vh) > vh * 0.15) return go(Math.min(next ?? Infinity, y + vh * 0.85));
    if (next !== undefined) go(next);
  } else {
    if (y - top > 8) return go(y - top > vh ? y - vh * 0.85 : top);
    if (i > 0) go(tops[i - 1]);
  }
};

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
  const el = event.target;
  if (el instanceof HTMLElement && el.closest('input, textarea, select, button, [contenteditable="true"], [role="slider"]')) return;
  const down = event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey);
  const up = event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey);
  if (!down && !up) return;
  event.preventDefault();
  step(down ? 1 : -1);
});

// Pontos laterais
const nav = document.createElement('nav');
nav.className = 'sector-dots';
nav.setAttribute('aria-label', 'Setores da página');
const dots = sectors.map((s, k) => {
  if (!s.id) s.id = k === sectors.length - 1 ? 'rodape' : 'abertura';
  const a = document.createElement('a');
  a.href = `#${s.id}`;
  a.innerHTML = `<span>${labels[s.id] ?? s.id}</span>`;
  a.setAttribute('aria-label', labels[s.id] ?? s.id);
  a.addEventListener('click', (e) => { e.preventDefault(); go(topOf(s)); });
  nav.append(a);
  return a;
});
document.body.append(nav);

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const k = sectors.indexOf(e.target as HTMLElement);
    dots.forEach((d, j) => d.toggleAttribute('aria-current', j === k));
    // Pontos claros sobre fundos claros
    nav.dataset.tone = (e.target as HTMLElement).matches('.closing') ? 'light' : 'dark';
  }
}, { rootMargin: '-45% 0px -45% 0px' });
sectors.forEach((s) => io.observe(s));
