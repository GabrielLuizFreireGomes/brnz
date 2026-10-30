import { html } from '../core/dom';
import { href } from '../core/router';
import { compact, num } from '../core/format';
import { piecesOf, db } from '../data/db';
import type { Screen } from '../core/screen';
import type { PlanId } from '../core/access';
import { empty, metaBy, metricRow, thumb } from '../ui/parts';
import { mountDetail, mountUpload, pieceDetail, pieceList, uploadButton, uploadDialog } from '../ui/pieces';

// Cota mensal de cada pacote, a mesma da tabela de planos do site.
const quota: Partial<Record<PlanId, { posts: number; videos: number }>> = {
  presenca: { posts: 12, videos: 4 },
  completo: { posts: 16, videos: 8 },
};

const isVideo = (k: string) => k === 'reels';
const isPiece = (param?: string) => !!param && param !== 'publicados';

export const conteudo: Screen = {
  title: () => 'Posts',
  sub: (c) => (c.staff ? `${c.client.name} · feed, stories e vídeos` : 'Feed, stories e vídeos do mês'),
  action: (c) => (isPiece(c.param) ? '' : uploadButton(c)),
  view: (c) => {
    if (isPiece(c.param)) return pieceDetail(db().pieces.find((p) => p.id === c.param), c, 'conteudo');

    const all = piecesOf(c.client.id, 'post');
    const tab = c.param === 'publicados' ? 'publicados' : 'producao';
    const month = new Date().getMonth();
    const thisMonth = all.filter((p) => p.stage === 'publicado' && new Date(p.updatedAt).getMonth() === month);
    const q = quota[c.plan];
    const done = { posts: thisMonth.filter((p) => !isVideo(p.kind)).length, videos: thisMonth.filter((p) => isVideo(p.kind)).length };
    const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

    const waitingFirst = (s: string) => (s === 'aprovacao' ? 0 : 1);
    const producing = all.filter((p) => p.stage !== 'publicado').sort((a, b) => waitingFirst(a.stage) - waitingFirst(b.stage) || a.due.localeCompare(b.due));
    const published = all.filter((p) => p.stage === 'publicado').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const reach = published.reduce((s, p) => s + (p.metrics?.alcance ?? 0), 0);

    return html`
    ${q ? html`
      <section class="quota" aria-label="Entregas do mês">
        <p class="quota-title">Publicados em ${monthName}</p>
        ${([['Posts', done.posts, q.posts], ['Vídeos', done.videos, q.videos]] as const).map(([label, n, of]) => html`
          <div class="quota-row">
            <span>${label}</span>
            <span class="quota-cells" aria-hidden="true">${Array.from({ length: of }, (_, i) => html`<i class="${i < n ? 'on' : ''}"></i>`)}</span>
            <span class="fig">${n} de ${of}</span>
          </div>`)}
      </section>` : ''}

    <div class="tabs" aria-label="Posts">
      <a href="${href('conteudo')}" ${tab === 'producao' ? html`aria-current="page"` : ''}>Em produção <span class="count">${producing.length}</span></a>
      <a href="${href('conteudo', 'publicados')}" ${tab === 'publicados' ? html`aria-current="page"` : ''}>Publicados <span class="count">${published.length}</span></a>
    </div>

    ${tab === 'producao'
      ? pieceList(producing, c, 'conteudo', empty('Nada em produção', c.staff ? 'Suba a próxima peça para o cliente aprovar.' : 'Quando o time começar a próxima peça, ela aparece aqui.'))
      : html`
        <p class="summary"><span class="fig">${compact(reach)}</span> pessoas alcançadas pelos ${num(published.length)} posts publicados</p>
        ${published.length ? html`<ul class="list list--cards">${published.map((p) => html`
          <li class="post-card"><a href="${href('conteudo', p.id)}">${thumb(p)}<span class="row-main"><strong>${p.title}</strong><small>${metaBy(p)}</small></span></a>
          ${p.metrics ? metricRow(p.metrics) : ''}</li>`)}</ul>` : empty('Nenhum post publicado ainda', 'Os resultados de cada post aparecem aqui depois que ele vai ao ar.')}`}
    ${uploadDialog(c, 'post')}`;
  },
  mount: (root, c) => {
    mountDetail(root, c, isPiece(c.param) ? db().pieces.find((p) => p.id === c.param) : undefined);
    return mountUpload(root, c, 'post', 'conteudo');
  },
};
