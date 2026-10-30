import { html, on, render } from '../core/dom';
import { can, visibleModules } from '../core/access';
import { currentUser, scopeClient } from '../core/session';
import { db } from '../data/db';
import { icon } from './icons';
const searchable = (text: string) => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function mountCommand(root: HTMLElement) {
  let restoreFocus: HTMLElement | null = null;
  const update = () => {
    const user = currentUser(); const client = scopeClient();
    if (!user || !client) return;
    const term = searchable(root.querySelector<HTMLInputElement>('[data-command-input]')!.value.trim());
    const modules = visibleModules(user.role, client.plan);
    const entries = [
      ...modules.filter((m) => searchable(m.label).includes(term)).map((m) => ({ title: m.label, sub: 'Página do workspace', icon: m.icon, module: m.id, clientId: client.id, param: undefined as string | undefined })),
      ...db().clients.filter((cl) => user.role !== 'cliente' && searchable(cl.name).includes(term)).map((cl) => ({ title: cl.name, sub: cl.segment, icon: 'users', module: 'inicio', clientId: cl.id, param: 'cliente' })),
      ...db().pieces.filter((p) => {
        const cl = db().clients.find((cl) => cl.id === p.clientId);
        return term && cl && (user.role !== 'cliente' || p.clientId === client.id) && searchable(p.title).includes(term) && can(user.role, cl.plan, p.area === 'post' ? 'conteudo' : 'design');
      }).map((p) => ({ title: p.title, sub: db().clients.find((cl) => cl.id === p.clientId)!.name, icon: p.area === 'post' ? 'grid' : 'pen', module: p.area === 'post' ? 'conteudo' : 'design', clientId: p.clientId, param: p.id })),
    ].slice(0, 14);
    render(root.querySelector('[data-command-results]')!, html`<p class="command-section">${term ? 'Resultados' : 'Navegação rápida'}</p>${entries.length ? entries.map((entry) => html`<button type="button" class="command-result" data-command-result="${JSON.stringify(entry)}">${icon(entry.icon)}<span><strong>${entry.title}</strong><small>${entry.sub}</small></span>${icon('arrow')}</button>`) : html`<p class="command-empty">Nenhum resultado. Tente outro termo.</p>`}`);
  };
  const open = () => {
    const dialog = root.querySelector<HTMLDialogElement>('[data-command]');
    if (!dialog || dialog.open) return;
    root.querySelector<HTMLDialogElement>('[data-sheet][open]')?.close();
    restoreFocus = document.activeElement as HTMLElement;
    const input = dialog.querySelector<HTMLInputElement>('input')!; input.value = ''; update(); dialog.showModal(); input.focus();
    dialog.addEventListener('close', () => restoreFocus?.isConnected && restoreFocus.focus(), { once: true });
  };
  on(root, 'click', '[data-search-open]', open);
  window.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && currentUser()) { event.preventDefault(); open(); } });
  on(root, 'input', '[data-command-input]', update);
  on<KeyboardEvent>(root, 'keydown', '[data-command]', (dialog, event) => {
    const results = [...dialog.querySelectorAll<HTMLButtonElement>('[data-command-result]')];
    const index = results.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); results[(event.key === 'ArrowDown' ? index + 1 : index <= 0 ? results.length - 1 : index - 1) % results.length]?.focus(); }
    if (event.key === 'Enter' && (event.target as Element).matches('input')) { event.preventDefault(); results[0]?.click(); }
  });
  on(root, 'click', '[data-command-result]', (button) => {
    const { module, clientId, param } = JSON.parse(button.dataset.commandResult!);
    root.querySelector<HTMLDialogElement>('[data-command]')!.close();
    window.dispatchEvent(new CustomEvent('brnz:focus', { detail: { clientId, module, id: param } }));
  });
}
