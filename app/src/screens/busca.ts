import { html, on } from '../core/dom';
import { href } from '../core/router';
import { num, one } from '../core/format';
import { db } from '../data/db';
import type { Screen } from '../core/screen';
import { dayLabels, line } from '../ui/chart';
import { empty, sectionHead } from '../ui/parts';
import { downloadText } from '../data/workflows';

const sources = { google: 'Google Search Console', bing: 'Bing Webmaster' } as const;

export const busca: Screen = {
  title: () => 'Busca',
  sub: () => 'Como as pessoas chegam até você pelo Google e pelo Bing',
  view: (c) => {
    const seo = db().seo.find((s) => s.clientId === c.client.id);
    if (!seo) return empty('Busca ainda não conectada', 'Quando o site for ao ar, o time liga o Search Console e o Bing Webmaster e os números aparecem aqui.');
    const [requestedSource, requestedPeriod] = (c.param || '').split('-');
    const src = requestedSource === 'bing' ? 'bing' : 'google';
    const days = requestedPeriod === '7' ? 7 : 28;
    const original = seo[src];
    const series = original.series.slice(-days);
    const clicks = series.reduce((a, b) => a + b, 0);
    const d = { ...original, series, clicks, impressions: Math.round(clicks / (original.ctr / 100)) };
    const queries = src === 'google' ? seo.queries : (seo.bingQueries ?? [
      { q: 'clínica sorriso leve sjc', clicks: 48, impressions: 310, position: 2.1 },
      { q: 'dentista em são josé dos campos', clicks: 32, impressions: 1800, position: 8.4 },
      { q: 'clareamento dental perto de mim', clicks: 21, impressions: 950, position: 10.2 },
    ]);
    const pages = src === 'google' ? seo.pages : (seo.bingPages ?? [{ path: '/', clicks: 71 }, { path: '/contato', clicks: 30 }, { path: '/clareamento', clicks: 20 }]);
    const half = Math.floor(d.series.length / 2);
    const prev = d.series.slice(0, half).reduce((a, b) => a + b, 0);
    const curr = d.series.slice(-half).reduce((a, b) => a + b, 0);
    const change = prev ? Math.round(((curr - prev) / prev) * 100) : 0;

    return html`
    <div class="toolbar"><p class="muted small">Métricas simuladas · ${days} dias até hoje</p><div class="toolbar-actions"><label class="sr-only" for="seo-period">Período</label><select class="mini-select" id="seo-period" data-period data-source="${src}"><option value="28" ${days === 28 ? 'selected' : ''}>Últimos 28 dias</option><option value="7" ${days === 7 ? 'selected' : ''}>Últimos 7 dias</option></select><button class="btn btn--ghost btn--sm" data-export-seo>Exportar CSV</button></div></div>
    <div class="tabs" aria-label="Fonte">
      ${(Object.keys(sources) as (keyof typeof sources)[]).map((k) => html`<a href="${href('busca', `${k}-${days}`)}" ${k === src ? html`aria-current="page"` : ''}>${k === 'google' ? 'Google' : 'Bing'}</a>`)}
    </div>

    <dl class="kpis">
      <div><dt>Cliques</dt><dd class="fig">${num(d.clicks)}</dd><small class="${change > 0 ? 'good-text' : change < 0 ? 'warn-text' : ''}">${change > 0 ? '+' : ''}${change}% entre as metades do período</small></div>
      <div><dt>Aparições</dt><dd class="fig">${num(d.impressions)}</dd><small>vezes que o site apareceu</small></div>
      <div><dt>Taxa de clique</dt><dd class="fig">${one(d.ctr)}%</dd><small>de quem viu, quantos clicaram</small></div>
      <div><dt>Posição média</dt><dd class="fig">${one(d.position)}</dd><small>quanto menor, mais perto do topo</small></div>
    </dl>

    <section class="panel">
      <div class="panel-head"><h2>Cliques por dia</h2><span class="muted small">${sources[src]} · ${days} dias</span></div>
      ${line(d.series, { label: `Cliques por dia no ${src === 'google' ? 'Google' : 'Bing'} nos últimos ${days} dias`, labels: dayLabels(days) })}
    </section>

    <div class="cols">
      <section class="block col-main">
        ${sectionHead('O que pesquisaram', html`<span class="muted small">${src === 'google' ? 'Google' : 'Bing'} · ${days} dias</span>`)}
        <table class="table">
          <thead><tr><th scope="col">Pesquisa</th><th scope="col" class="num">Cliques</th><th scope="col" class="num hide-sm">Aparições</th><th scope="col" class="num">Posição</th></tr></thead>
          <tbody>${queries.map((q) => html`<tr><td>${q.q}</td><td class="num fig">${num(Math.round(q.clicks * days / 28))}</td><td class="num fig hide-sm">${num(Math.round(q.impressions * days / 28))}</td><td class="num fig ${q.position > 10 ? 'warn-text' : ''}">${one(q.position)}</td></tr>`)}</tbody>
        </table>
        <p class="muted small">Pesquisas com posição acima de 10 são oportunidades de melhorar a visibilidade. Dados ilustrativos, sem conexão com as plataformas.</p>
      </section>
      <section class="block col-side">
        ${sectionHead('Páginas que mais trazem gente')}
        <table class="table">
          <thead><tr><th scope="col">Página</th><th scope="col" class="num">Cliques</th></tr></thead>
          <tbody>${pages.map((p) => html`<tr><td><code>${p.path}</code></td><td class="num fig">${num(Math.round(p.clicks * days / 28))}</td></tr>`)}</tbody>
        </table>
      </section>
    </div>`;
  },
  mount: (root) => {
    on(root, 'change', '[data-period]', (el) => { location.hash = href('busca', `${el.dataset.source}-${(el as HTMLSelectElement).value}`); });
    on(root, 'click', '[data-export-seo]', () => { const rows = [...root.querySelectorAll('.table tr')].map((row) => [...row.querySelectorAll('th,td')].map((cell) => `"${cell.textContent?.trim().replace(/"/g, '""')}"`).join(';')); downloadText(`brnz-seo-${location.hash.split('/').pop() || 'google'}.csv`, 'Relatório de demonstração BRNZ\n' + rows.join('\n'), 'text/csv;charset=utf-8'); });
  },
};
