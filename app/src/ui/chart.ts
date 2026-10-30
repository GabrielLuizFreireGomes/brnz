// Gráficos em SVG puro: uma série, poucas linhas de grade, rótulos do eixo em faixa própria.
// A tela deixa um marcador e drawCharts() desenha na largura real do aparelho, para o texto não encolher.
import { html, raw } from '../core/dom';
import { num } from '../core/format';

type LineOpts = { labels?: string[]; height?: number; unit?: string; mark?: number; label: string };

const nice = (max: number) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(max, 1)));
  const steps = [1, 2, 2.5, 5, 10].map((s) => s * p);
  return steps.find((s) => s * 3 >= max) ?? max;
};

export const line = (values: number[], o: LineOpts) =>
  html`<div class="chart" data-chart="${JSON.stringify({ values, ...o })}" style="height:${o.height ?? 180}px" role="img" aria-label="${o.label}"></div>`;

function draw(el: HTMLElement) {
  const { values, labels = [], height, unit, mark } = JSON.parse(el.dataset.chart!) as LineOpts & { values: number[] };
  const W = Math.max(240, el.clientWidth), H = height ?? 180, L = 44, R = 10, T = 10, B = 26;
  const step = nice(Math.max(...values));
  const top = step * 3;
  const x = (i: number) => L + (i / (values.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const grid = [0, 1, 2, 3].map((k) => {
    const v = step * k;
    return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${num(v)}${k === 3 && unit ? ` ${unit}` : ''}</text>`;
  }).join('');
  const xl = labels.map((t, k, a) => {
    const i = Math.round((k / (a.length - 1)) * (values.length - 1));
    const anchor = k === 0 ? 'start' : k === a.length - 1 ? 'end' : 'middle';
    return `<text x="${x(i)}" y="${H - 6}" text-anchor="${anchor}">${t}</text>`;
  }).join('');
  const last = values.length - 1;
  const warn = mark !== undefined ? `<circle cx="${x(mark)}" cy="${y(values[mark])}" r="4" class="mark-warn"/>` : '';
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${grid}${xl}
    <polygon class="area" points="${x(0)},${y(0)} ${pts} ${x(last)},${y(0)}"/>
    <polyline class="stroke" points="${pts}"/>
    <circle cx="${x(last)}" cy="${y(values[last])}" r="4" class="dot"/>${warn}</svg>`;
}

export const drawCharts = (root: ParentNode) => root.querySelectorAll<HTMLElement>('[data-chart]').forEach(draw);

let t = 0;
window.addEventListener('resize', () => {
  clearTimeout(t);
  t = window.setTimeout(() => drawCharts(document), 120);
});

/** Barra de uso (CPU, memória, disco): vira alerta a partir de 80%. */
export const meter = (label: string, pct: number) => raw(`
  <div class="meter${pct >= 80 ? ' meter--warn' : ''}">
    <div class="meter-top"><span>${label}</span><span class="fig">${pct}%</span></div>
    <div class="meter-track" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}"><span style="width:${pct}%"></span></div>
  </div>`);

/** Rótulos de datas para N dias até hoje. */
export function dayLabels(n: number) {
  const fmt = (d: number) => new Date(Date.now() - d * 86_400_000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
  return [fmt(n - 1), fmt(Math.round(((n - 1) * 2) / 3)), fmt(Math.round((n - 1) / 3)), 'hoje'];
}
