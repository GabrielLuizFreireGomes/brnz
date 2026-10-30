import { html } from '../core/dom';
import { href } from '../core/router';
import { num, one } from '../core/format';
import { db } from '../data/db';
import type { Screen } from '../core/screen';
import { dayLabels, line } from '../ui/chart';
import { empty, sectionHead } from '../ui/parts';

const sources = { google: 'Google Search Console', bing: 'Bing Webmaster' } as const;

export const busca: Screen = {
  title: () => 'Busca',
  sub: () => 'Como as pessoas chegam até você pelo Google e pelo Bing',
  view: (c) => {
    const seo = db().seo.find((s) => s.clientId === c.client.id);
    if (!seo) return empty('Busca ainda não conectada', 'Quando o site for ao ar, o time liga o Search Console e o Bing Webmaster e os números aparecem aqui.');
    const src = c.param === 'bing' ? 'bing' : 'google';
    const d = seo[src];
    const half = d.series.length / 2;
    const prev = d.series.slice(0, half).reduce((a, b) => a + b, 0);
    const curr = d.series.slice(half).reduce((a, b) => a + b, 0);
    const change = prev ? Math.round(((curr - prev) / prev) * 100) : 0;

    return html`
    <div class="tabs" aria-label="Fonte">
      ${(Object.keys(sources) as (keyof typeof sources)[]).map((k) => html`<a href="${href('busca', k)}" ${k === src ? html`aria-current="page"` : ''}>${k === 'google' ? 'Google' : 'Bing'}</a>`)}
    </div>

    <dl class="kpis">
      <div><dt>Cliques</dt><dd class="fig">${num(d.clicks)}</dd><small class="${change > 0 ? 'good-text' : change < 0 ? 'warn-text' : ''}">${change > 0 ? '+' : ''}${change}% nas últimas 2 semanas</small></div>
      <div><dt>Aparições</dt><dd class="fig">${num(d.impressions)}</dd><small>vezes que o site apareceu</small></div>
      <div><dt>Taxa de clique</dt><dd class="fig">${one(d.ctr)}%</dd><small>de quem viu, quantos clicaram</small></div>
      <div><dt>Posição média</dt><dd class="fig">${one(d.position)}</dd><small>1 a 10 é a primeira página</small></div>
    </dl>

    <section class="panel">
      <div class="panel-head"><h2>Cliques por dia</h2><span class="muted small">${sources[src]} · 28 dias</span></div>
      ${line(d.series, { label: `Cliques por dia no ${src === 'google' ? 'Google' : 'Bing'} nos últimos 28 dias`, labels: dayLabels(28) })}
    </section>

    <div class="cols">
      <section class="block col-main">
        ${sectionHead('O que pesquisaram', html`<span class="muted small">Google, 28 dias</span>`)}
        <table class="table">
          <thead><tr><th scope="col">Pesquisa</th><th scope="col" class="num">Cliques</th><th scope="col" class="num hide-sm">Aparições</th><th scope="col" class="num">Posição</th></tr></thead>
          <tbody>${seo.queries.map((q) => html`<tr><td>${q.q}</td><td class="num fig">${num(q.clicks)}</td><td class="num fig hide-sm">${num(q.impressions)}</td><td class="num fig ${q.position > 10 ? 'warn-text' : ''}">${one(q.position)}</td></tr>`)}</tbody>
        </table>
        <p class="muted small">Posição acima de 10 fica na segunda página do Google: são as pesquisas em que um conteúdo novo mais ajuda.</p>
      </section>
      <section class="block col-side">
        ${sectionHead('Páginas que mais trazem gente')}
        <table class="table">
          <thead><tr><th scope="col">Página</th><th scope="col" class="num">Cliques</th></tr></thead>
          <tbody>${seo.pages.map((p) => html`<tr><td><code>${p.path}</code></td><td class="num fig">${num(p.clicks)}</td></tr>`)}</tbody>
        </table>
      </section>
    </div>`;
  },
};
