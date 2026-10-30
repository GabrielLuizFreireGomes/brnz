import { html, on } from '../core/dom';
import { money, shortDate } from '../core/format';
import { planName } from '../core/access';
import { db, unreadFor } from '../data/db';
import type { Screen } from '../core/screen';
import { chev, pill } from '../ui/parts';

export const clientes: Screen = {
  title: () => 'Clientes',
  sub: () => `${db().clients.length} contas · escolha uma para ver o app como ela vê`,
  view: (c) => {
    const d = db();
    return html`
    <table class="table table--rows">
      <thead><tr>
        <th scope="col">Cliente</th><th scope="col">Plano</th>
        <th scope="col" class="num hide-sm">Esperando ok</th><th scope="col" class="num hide-sm">Na fila</th>
        ${c.user.role === 'admin' ? html`<th scope="col" class="hide-sm">Financeiro</th>` : ''}
        <th scope="col"><span class="sr-only">Abrir</span></th>
      </tr></thead>
      <tbody>${d.clients.map((cl) => {
        const open = d.pieces.filter((p) => p.clientId === cl.id);
        const waiting = open.filter((p) => p.stage === 'aprovacao').length;
        const queue = open.filter((p) => ['briefing', 'criacao', 'ajuste'].includes(p.stage)).length;
        const late = d.invoices.filter((i) => i.clientId === cl.id && i.status === 'vencida');
        const unread = unreadFor(cl.id, true);
        return html`
        <tr data-client="${cl.id}" tabindex="0" ${cl.id === c.client.id ? html`aria-current="true"` : ''}>
          <td><strong>${cl.name}</strong><small class="cell-sub">${cl.segment} · ${cl.city}${unread ? html` · <span class="warn-text">${unread} mensage${unread > 1 ? 'ns' : 'm'}</span>` : ''}</small></td>
          <td>${planName(cl.plan)}<small class="cell-sub">desde ${shortDate(cl.since)}</small></td>
          <td class="num fig hide-sm">${waiting || html`<span class="muted">0</span>`}</td>
          <td class="num fig hide-sm">${queue || html`<span class="muted">0</span>`}</td>
          ${c.user.role === 'admin' ? html`<td class="hide-sm">${late.length ? pill(`${money(late.reduce((s, i) => s + i.amount, 0))} vencido`, 'bad') : html`<span class="muted">Em dia</span>`}</td>` : ''}
          <td class="num">${chev()}</td>
        </tr>`;
      })}</tbody>
    </table>`;
  },
  mount: (root) => {
    const open = (id: string) => window.dispatchEvent(new CustomEvent('brnz:focus', { detail: { clientId: id, module: 'inicio', id: 'cliente' } }));
    on(root, 'click', '[data-client]', (el) => open(el.dataset.client!));
    on<KeyboardEvent>(root, 'keydown', '[data-client]', (el, e) => { if (e.key === 'Enter') open(el.dataset.client!); });
  },
};
