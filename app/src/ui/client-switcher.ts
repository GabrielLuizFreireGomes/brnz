import { html, on, $ } from '../core/dom';
import { planName } from '../core/access';
import type { Ctx } from '../core/screen';
import { db } from '../data/db';
import { setScope } from '../core/session';
import { current, go } from '../core/router';
import { icon } from './icons';

export const clientInitials = (name: string) => name.split(/\s+/).filter((word) => !['de', 'da', 'do'].includes(word.toLowerCase())).slice(0, 2).map((word) => word[0]).join('');

export function clientSwitcher(c: Ctx, location: 'side' | 'top') {
  const id = `clients-${location}`;
  return html`<div class="client-context client-context--${location}">
    <span class="context-label">${c.staff ? 'Cliente em foco' : 'Seu espaço'}</span>
    ${c.staff ? html`<button class="client-trigger" type="button" data-switch-open="${id}" aria-expanded="false" aria-haspopup="dialog" aria-controls="${id}" aria-label="Trocar cliente: ${c.client.name}">
      <span class="client-monogram" style="--client-hue:${c.client.hue}">${clientInitials(c.client.name)}</span>
      <span class="client-trigger-text"><strong>${c.client.name}</strong><small>Plano ${planName(c.plan)}</small></span>${icon('expand')}
    </button>
    <div class="client-popover" id="${id}" popover="auto" role="dialog" aria-label="Escolher cliente">
      <div class="switcher-heading"><strong>Seus clientes</strong><span>${db().clients.length}</span></div>
      <label class="switcher-search">${icon('search')}<input type="search" data-switch-search placeholder="Buscar cliente…" aria-label="Buscar cliente" autocomplete="off" /></label>
      <div class="client-options">${db().clients.map((cl) => html`<button type="button" class="client-option" data-switch-client="${cl.id}" data-client-name="${cl.name}" aria-pressed="${cl.id === c.client.id}">
        <span class="client-monogram" style="--client-hue:${cl.hue}">${clientInitials(cl.name)}</span><span class="client-option-text"><strong>${cl.name}</strong><small>${cl.segment}</small></span><span class="client-plan">${planName(cl.plan)}</span>${cl.id === c.client.id ? icon('check') : ''}
      </button>`)}</div>
      <p class="switcher-empty" data-switch-empty hidden>Nenhum cliente encontrado.</p>
      <a class="switcher-manage" href="#/clientes">${icon('users')}Gerenciar clientes${icon('chevron')}</a>
    </div>` : html`<div class="client-trigger client-trigger--static"><span class="client-monogram" style="--client-hue:${c.client.hue}">${clientInitials(c.client.name)}</span><span class="client-trigger-text"><strong>${c.client.name}</strong><small>Plano ${planName(c.plan)}</small></span></div>`}
  </div>`;
}

export function mountClientSwitcher(root: HTMLElement, refresh: () => void, toast: (text: string) => void) {
  on(root, 'click', '[data-switch-open]', (button) => {
    const panel = document.getElementById(button.dataset.switchOpen!) as HTMLElement;
    if (panel.matches(':popover-open')) { panel.hidePopover(); button.setAttribute('aria-expanded', 'false'); return; }
    const rect = button.getBoundingClientRect();
    panel.style.left = `${Math.min(Math.max(12, rect.left), innerWidth - Math.min(380, innerWidth - 24) - 12)}px`;
    panel.style.top = `${rect.bottom + 8}px`;
    panel.style.maxHeight = `${innerHeight - rect.bottom - 24}px`;
    panel.showPopover(); button.setAttribute('aria-expanded', 'true');
    const search = panel.querySelector<HTMLInputElement>('input')!;
    search.value = ''; search.dispatchEvent(new Event('input', { bubbles: true })); search.focus({ preventScroll: true });
  });
  root.addEventListener('toggle', (event) => { const panel = event.target as HTMLElement; if (panel.classList?.contains('client-popover')) root.querySelector(`[data-switch-open="${panel.id}"]`)?.setAttribute('aria-expanded', String(panel.matches(':popover-open'))); }, true);
  on(root, 'input', '[data-switch-search]', (input) => {
    const panel = input.closest('.client-popover')!;
    const search = (input as HTMLInputElement).value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let count = 0;
    panel.querySelectorAll<HTMLElement>('[data-switch-client]').forEach((option) => { option.hidden = !option.textContent!.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search); if (!option.hidden) count++; });
    panel.querySelector<HTMLElement>('[data-switch-empty]')!.hidden = count > 0;
  });
  on<KeyboardEvent>(root, 'keydown', '.client-popover', (panel, event) => {
    const options = [...panel.querySelectorAll<HTMLElement>('[data-switch-client]:not([hidden])')];
    const index = options.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const next = event.key === 'ArrowDown' ? (index + 1) % options.length : (index <= 0 ? options.length - 1 : index - 1); options[next]?.focus(); }
    if (event.key === 'Enter' && (event.target as Element).matches('input')) { event.preventDefault(); options[0]?.click(); }
    if (event.key === 'Escape') { event.preventDefault(); panel.hidePopover(); $<HTMLButtonElement>(`[data-switch-open="${panel.id}"]`, root)?.focus(); }
  });
  on(root, 'click', '[data-switch-client]', (button) => {
    const clientId = button.dataset.switchClient!; const name = button.dataset.clientName!;
    const panel = button.closest<HTMLElement>('.client-popover')!;
    const panelId = panel.id;
    panel.hidePopover();
    setScope(clientId);
    const route = current();
    if (route.name === 'suporte' && route.param) go('suporte', clientId);
    else if (route.param && (route.name === 'design' || (route.name === 'conteudo' && route.param !== 'publicados'))) go(route.name);
    else refresh();
    toast(`Agora você está vendo ${name}.`);
    requestAnimationFrame(() => root.querySelector<HTMLElement>(`[data-switch-open="${panelId}"]`)?.focus({ preventScroll: true }));
  });
}
