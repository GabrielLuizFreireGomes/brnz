import { html, on } from '../core/dom';
import { href } from '../core/router';
import { money, num, one, two, relDay, when, isPast } from '../core/format';
import { can, planName } from '../core/access';
import { clientById, db, unreadFor, userById, type Piece, type Stage } from '../data/db';
import { approve } from '../data/actions';
import type { Ctx, Screen } from '../core/screen';
import { avatar, chev, empty, kindLabel, pill, sectionHead, stageLabel, stagePill, thumb } from '../ui/parts';

// A linha de produção: cada peça do cliente andando do briefing até o ar. É o desenho que só a brnz tem.
const line: { stage: Stage; label: string }[] = [
  { stage: 'briefing', label: 'Briefing' },
  { stage: 'criacao', label: 'Criação' },
  { stage: 'aprovacao', label: 'Seu ok' },
  { stage: 'ajuste', label: 'Ajuste' },
  { stage: 'aprovado', label: 'Agenda' },
];

function productionLine(pieces: Piece[], staff: boolean) {
  return html`
  <section class="pipeline" aria-label="Linha de produção">
    ${line.map(({ stage, label }) => {
      const list = pieces.filter((p) => p.stage === stage);
      const hot = stage === 'aprovacao' && list.length > 0;
      return html`
      <div class="pipe ${hot ? 'pipe--hot' : ''}">
        <span class="pipe-label">${staff && stage === 'aprovacao' ? 'Com cliente' : label}</span>
        <span class="pipe-count fig">${list.length}</span>
        <span class="pipe-dots" aria-hidden="true">${list.slice(0, 6).map(() => html`<i></i>`)}</span>
      </div>`;
    })}
  </section>`;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const moduleOf = (p: Piece) => (p.area === 'post' ? 'conteudo' : 'design');

function clientHome(c: Ctx) {
  const pieces = db().pieces.filter((p) => p.clientId === c.client.id && p.stage !== 'publicado');
  const waiting = pieces.filter((p) => p.stage === 'aprovacao');
  const next = pieces.filter((p) => p.stage !== 'aprovacao').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  const msgs = db().messages.filter((m) => m.clientId === c.client.id);
  const last = msgs[msgs.length - 1];
  const unread = unreadFor(c.client.id, false);
  const invoice = db().invoices.filter((i) => i.clientId === c.client.id && i.status !== 'paga').sort((a, b) => a.due.localeCompare(b.due))[0];
  const seo = can(c.user.role, c.plan, 'busca') ? db().seo.find((s) => s.clientId === c.client.id) : undefined;
  const server = can(c.user.role, c.plan, 'servidor') ? db().servers.find((s) => s.clientId === c.client.id) : undefined;

  return html`
  ${productionLine(pieces, false)}

  <div class="cols">
    <div class="col-main">
      <section class="block">
        ${sectionHead('Esperando seu ok', waiting.length ? html`<span class="muted small">${waiting.length} ${waiting.length === 1 ? 'peça' : 'peças'}</span>` : '')}
        ${waiting.length ? html`<ul class="list list--rows">${waiting.map((p) => html`
          <li class="row row--static">
            <a class="row-link" href="${href(moduleOf(p), p.id)}">${thumb(p)}<span class="row-main"><strong>${p.title}</strong><small>${kindLabel[p.kind]} · entrega ${relDay(p.due)}</small></span></a>
            <button class="btn btn--sm" type="button" data-approve="${p.id}">Aprovar</button>
          </li>`)}</ul>` : empty('Tudo aprovado', 'Quando o time terminar a próxima peça, ela aparece aqui para você dar o ok.')}
      </section>

      <section class="block">
        ${sectionHead('Próximas entregas')}
        ${next.length ? html`<ul class="list list--rows">${next.map((p) => html`
          <li><a class="row" href="${href(moduleOf(p), p.id)}">
            ${thumb(p)}<span class="row-main"><strong>${p.title}</strong><small>${kindLabel[p.kind]} · ${relDay(p.due)}</small></span>${stagePill(p.stage)}${chev()}
          </a></li>`)}</ul>` : empty('Sem entregas marcadas', 'Peça algo novo na aba Design ou pela conversa.')}
      </section>
    </div>

    <div class="col-side">
      <a class="panel panel--link" href="${href('suporte')}">
        <div class="panel-head"><h2>Conversa</h2>${unread ? pill(`${unread} nova${unread > 1 ? 's' : ''}`, 'warn') : ''}</div>
        ${last ? html`<p class="quote">${avatar(last.from, 'sm')}<span><strong>${userById(last.from)?.name.split(' ')[0]}</strong> ${last.text}</span></p><p class="muted small">${when(last.at)}</p>` : html`<p class="muted">Fale com o time por aqui.</p>`}
      </a>

      ${seo ? html`
      <a class="panel panel--link" href="${href('busca')}">
        <div class="panel-head"><h2>No Google, 28 dias</h2>${chev()}</div>
        <p class="big fig">${num(seo.google.clicks)}</p>
        <p class="muted small">cliques de quem pesquisou · posição média ${one(seo.google.position)}</p>
      </a>` : ''}

      ${server ? html`
      <a class="panel panel--link" href="${href('servidor')}">
        <div class="panel-head"><h2>Site no ar</h2>${chev()}</div>
        <p class="big fig">${two(server.uptime30)}%</p>
        <p class="muted small">do tempo nos últimos 30 dias · resposta média ${server.avgMs} ms</p>
      </a>` : ''}

      ${can(c.user.role, c.plan, 'assinatura') ? html`
      <a class="panel panel--link" href="${href('assinatura')}">
        <div class="panel-head"><h2>Plano ${planName(c.plan)}</h2>${chev()}</div>
        ${invoice ? html`<p class="${invoice.status === 'vencida' ? 'warn-text' : ''}">${invoice.status === 'vencida' ? 'Fatura vencida' : 'Próxima fatura'}: <span class="fig">${money(invoice.amount)}</span>, ${relDay(invoice.due)}</p>` : html`<p class="muted">Nenhuma fatura em aberto.</p>`}
      </a>` : ''}
    </div>
  </div>`;
}

function studioHome(c: Ctx) {
  const d = db();
  const open = d.pieces.filter((p) => p.stage !== 'publicado' && p.stage !== 'aprovado');
  const queue = open.filter((p) => p.stage !== 'aprovacao').sort((a, b) => a.due.localeCompare(b.due));
  const withClient = open.filter((p) => p.stage === 'aprovacao');
  const monthly = d.clients.filter((x) => x.plan !== 'largada');
  const price = { largada: 0, presenca: 2290, completo: 3990 } as const;
  const mrr = monthly.reduce((s, x) => s + price[x.plan], 0);
  const overdue = d.invoices.filter((i) => i.status === 'vencida');
  const newReqs = d.requests.filter((r) => r.status === 'novo');
  const inbox = d.clients.map((x) => ({ client: x, n: unreadFor(x.id, true) })).filter((x) => x.n);
  const admin = c.user.role === 'admin';

  return html`
  <dl class="kpis">
    <div><dt>Clientes</dt><dd class="fig">${d.clients.length}</dd><small>${monthly.length} mensais</small></div>
    ${admin ? html`<div><dt>Receita mensal</dt><dd class="fig">${money(mrr)}</dd><small>sem projetos únicos</small></div>` : ''}
    <div><dt>Na fila do estúdio</dt><dd class="fig">${queue.length}</dd><small>${queue.filter((p) => isPast(p.due)).length} atrasadas</small></div>
    <div><dt>Com os clientes</dt><dd class="fig">${withClient.length}</dd><small>esperando ok</small></div>
    ${admin ? html`<div><dt>Faturas vencidas</dt><dd class="fig ${overdue.length ? 'warn-text' : ''}">${overdue.length}</dd><small>${overdue.length ? money(overdue.reduce((s, i) => s + i.amount, 0)) : 'nenhuma'}</small></div>` : ''}
  </dl>

  <div class="cols">
    <div class="col-main">
      <section class="block">
        ${sectionHead('Fila do estúdio', html`<span class="muted small">por data de entrega</span>`)}
        ${queue.length ? html`<ul class="list list--rows">${queue.map((p) => html`
          <li><button type="button" class="row row--btn" data-open="${p.clientId}|${moduleOf(p)}|${p.id}">
            ${thumb(p)}
            <span class="row-main"><strong>${p.title}</strong><small>${clientById(p.clientId)?.name} · ${kindLabel[p.kind]} · ${relDay(p.due)}${isPast(p.due) ? html` · <span class="late">atrasada</span>` : ''}</small></span>
            ${pill(stageLabel[p.stage], p.stage === 'ajuste' ? 'warn' : 'mute')}${chev()}
          </button></li>`)}</ul>` : empty('Fila vazia', 'Nenhuma peça em briefing, criação ou ajuste.')}
      </section>
    </div>
    <div class="col-side">
      <section class="panel">
        <div class="panel-head"><h2>Mensagens</h2></div>
        ${inbox.length ? html`<ul class="list">${inbox.map(({ client, n }) => html`
          <li><button type="button" class="row row--btn row--tight" data-open="${client.id}|suporte|">
            <span class="row-main"><strong>${client.name}</strong></span>${pill(`${n} nova${n > 1 ? 's' : ''}`, 'warn')}
          </button></li>`)}</ul>` : html`<p class="muted">Nenhuma mensagem esperando resposta.</p>`}
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Pedidos novos</h2></div>
        ${newReqs.length ? html`<ul class="list">${newReqs.map((r) => html`
          <li><button type="button" class="row row--btn row--tight" data-open="${r.clientId}|design|">
            <span class="row-main"><strong>${r.title}</strong><small>${clientById(r.clientId)?.name} · para ${relDay(r.due)}</small></span>${chev()}
          </button></li>`)}</ul>` : html`<p class="muted">Nenhum pedido novo.</p>`}
      </section>
    </div>
  </div>`;
}

export const inicio: Screen = {
  title: (c) => (c.staff ? (c.param === 'cliente' ? 'Visão do cliente' : 'Estúdio') : 'Início'),
  sub: (c) => (c.staff && c.param !== 'cliente' ? cap(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })) : `${c.client.name} · plano ${planName(c.plan)}`),
  view: (c) => (c.staff && c.param !== 'cliente' ? studioHome(c) : clientHome(c)),
  mount: (root, c) => {
    on(root, 'click', '[data-approve]', (el) => { approve(el.dataset.approve!, c.user.id); c.toast('Aprovado. O time já foi avisado.'); });
    on(root, 'click', '[data-open]', (el) => {
      const [clientId, module, id] = el.dataset.open!.split('|');
      window.dispatchEvent(new CustomEvent('brnz:focus', { detail: { clientId, module, id } }));
    });
  },
};
