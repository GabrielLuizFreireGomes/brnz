// Os pontos mostram a seção atual e levam a cada parte da página.
// Teclado e rolagem de leitura mantêm o comportamento nativo.
import { reducedMotion } from './motion-preference';

type ScrollFn = (y: number) => void;
let scrollFn: ScrollFn = (y) => window.scrollTo({ top: y, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
export const setSectorScroll = (fn: ScrollFn | null) => {
  scrollFn = fn ?? ((y) => window.scrollTo({ top: y, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
};

const labels: Record<string, string> = {
  inicio: 'Início', abertura: 'Por que a brnz', servicos: 'Serviços', processo: 'Como funciona',
  workspace: 'BRNZ Workspace', pacotes: 'Pacotes', monte: 'Monte o seu', time: 'Time', duvidas: 'Dúvidas', contato: 'Contato', rodape: 'Rodapé',
};
const sectors = [...document.querySelectorAll<HTMLElement>('#inicio, main > section, body > footer')];
sectors.forEach((s) => s.setAttribute('data-sector', ''));

// Posição no layout (ignora o deslocamento das animações de entrada).
const topOf = (el: HTMLElement) => {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
};
const go = (y: number) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollFn(Math.max(0, Math.min(max, y)));
};
export const scrollToElement = (element: HTMLElement) => go(topOf(element) - 20);

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
