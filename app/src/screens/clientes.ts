import { html, on } from '../core/dom';
import { money, shortDate } from '../core/format';
import { planName, plans, type PlanId } from '../core/access';
import { db, unreadFor } from '../data/db';
import type { Screen } from '../core/screen';
import { chev, pill } from '../ui/parts';
import { saveClient } from '../data/workflows';
import { icon } from '../ui/icons';

export const clientes: Screen = {
  title: () => 'Clientes',
  sub: () => `${db().clients.length} contas · escolha uma para ver o app como ela vê`,
  action: (c) => c.user.role === 'admin' ? html`<button class="btn" data-new-client>${icon('plus')}Novo cliente</button>` : '',
  view: (c) => {
    const d = db();
    return html`
    <label class="field client-search"><span>Buscar cliente</span><input type="search" placeholder="Nome, segmento ou cidade" data-client-search data-keep="client-search" /></label>
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
          <td class="num">${c.user.role === 'admin' ? html`<button class="btn btn--ghost btn--sm" data-edit-client="${cl.id}" aria-label="Editar ${cl.name}">Editar</button>` : chev()}</td>
        </tr>`;
      })}</tbody>
    </table><p class="muted small" data-no-clients hidden>Nenhum cliente encontrado. Tente outro nome.</p>
    ${c.user.role === 'admin' ? html`<dialog class="sheet sheet--form" data-client-dialog aria-labelledby="client-title"><form class="form" data-client-form><div class="sheet-head"><strong id="client-title">Cadastro do cliente</strong><button type="button" class="icon-btn" data-close aria-label="Fechar">${icon('x')}</button></div><input type="hidden" name="id" />
      <label class="field"><span>Empresa</span><input name="name" required maxlength="80" /></label>
      <div class="field-row"><label class="field"><span>Segmento</span><input name="segment" maxlength="80" /></label><label class="field"><span>Cidade</span><input name="city" maxlength="80" /></label></div>
      <label class="field"><span>Nome do contato</span><input name="contact" required maxlength="80" /></label><label class="field"><span>E-mail do contato</span><input name="email" type="email" required maxlength="120" /></label>
      <label class="field"><span>Plano</span><select name="plan">${plans.map((p) => html`<option value="${p.id}">${p.name}</option>`)}</select></label><p class="muted small">O contato recebe um perfil de teste. O cadastro não envia convite nem gera cobrança.</p><button class="btn" type="submit">Salvar cliente</button></form></dialog>` : ''}`;
  },
  mount: (root, c) => {
    const open = (id: string) => window.dispatchEvent(new CustomEvent('brnz:focus', { detail: { clientId: id, module: 'inicio', id: 'cliente' } }));
    on(root, 'click', '[data-client]', (el, e) => { if (!(e.target as Element).closest('[data-edit-client]')) open(el.dataset.client!); });
    on<KeyboardEvent>(root, 'keydown', '[data-client]', (el, e) => { if (e.target === el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(el.dataset.client!); } });
    on(root, 'input', '[data-client-search]', (el) => { const term = (el as HTMLInputElement).value.toLocaleLowerCase('pt-BR'); let count = 0; root.querySelectorAll<HTMLElement>('[data-client]').forEach((row) => { row.hidden = !row.textContent!.toLocaleLowerCase('pt-BR').includes(term); if (!row.hidden) count++; }); root.querySelector<HTMLElement>('[data-no-clients]')!.hidden = count !== 0; });
    const edit = (id?: string) => { const dialog = root.querySelector<HTMLDialogElement>('[data-client-dialog]')!; const form = dialog.querySelector('form')!; form.reset(); const cl = db().clients.find((cl) => cl.id === id); const user = id ? db().users.find((u) => u.clientId === id) : undefined; const values = { id: cl?.id || '', name: cl?.name || '', city: cl?.city || '', segment: cl?.segment || '', contact: user?.name || '', email: user?.email || '', plan: cl?.plan || 'largada' }; for (const [key, value] of Object.entries(values)) (form.elements.namedItem(key) as HTMLInputElement).value = value; dialog.showModal(); };
    const opener = root.closest('.app')!.querySelector('[data-new-client]'); const create = () => edit(); opener?.addEventListener('click', create);
    on(root, 'click', '[data-edit-client]', (el) => edit(el.dataset.editClient));
    on<SubmitEvent>(root, 'submit', '[data-client-form]', (form, e) => { e.preventDefault(); const f = new FormData(form as HTMLFormElement); saveClient({ name: String(f.get('name')), segment: String(f.get('segment')), city: String(f.get('city')), plan: f.get('plan') as PlanId, contact: String(f.get('contact')), email: String(f.get('email')) }, String(f.get('id')) || undefined); c.toast('Cliente salvo. Perfil de teste disponível na entrada.'); });
    return () => opener?.removeEventListener('click', create);
  },
};
