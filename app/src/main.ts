import '@fontsource-variable/inter-tight';
import './styles/app.css';
import './styles/studio.css';
import './styles/overview.css';
import './styles/account.css';
import './styles/entry.css';
import './styles/themes.css';
import './styles/notifications.css';
import './styles/review-cards.css';
import { applyTheme, mountTheme } from './ui/theme';
import { mountNotifications } from './ui/notifications';
import { preferencesOf } from './data/profile';
import { mountUserMenu } from './ui/user-menu';
import { $, on, render } from './core/dom';
import { current, go } from './core/router';
import { visibleModules, type ModuleId } from './core/access';
import { currentUser, isStaff, scopeClient, setScope } from './core/session';
import { onChange } from './data/db';
import type { Ctx, Screen } from './core/screen';
import { shell } from './ui/shell';
import { drawCharts } from './ui/chart';
import { login } from './screens/login';
import { inicio } from './screens/inicio';
import { design } from './screens/design';
import { conteudo } from './screens/conteudo';
import { sites } from './screens/sites';
import { servidor } from './screens/servidor';
import { busca } from './screens/busca';
import { suporte } from './screens/suporte';
import { assinatura } from './screens/assinatura';
import { clientes } from './screens/clientes';
import { acessos } from './screens/acessos';
import { conta } from './screens/conta';
import { mountClientSwitcher } from './ui/client-switcher';
import { mountCommand } from './ui/command';

const screens: Record<ModuleId, Screen> = { inicio, design, conteudo, sites, servidor, busca, suporte, assinatura, clientes, acessos, conta };

const root = $('#app')!;
let cleanup: void | (() => void);
let lastRoute = '';
let lastScope = '';

function toast(text: string) {
  const el = $('[data-toast]');
  if (!el) return;
  el.textContent = text;
  el.classList.add('is-on');
  clearTimeout(Number(el.dataset.t));
  el.dataset.t = String(setTimeout(() => el.classList.remove('is-on'), 2600));
}

window.addEventListener('brnz:error', (event) => {
  const message = (event as CustomEvent<string>).detail;
  const dialog = document.querySelector('dialog[open]');
  if (dialog) {
    let error = dialog.querySelector<HTMLElement>('[data-form-error]');
    if (!error) { error = document.createElement('p'); error.dataset.formError = ''; error.className = 'field-error'; error.setAttribute('role', 'alert'); dialog.append(error); }
    error.textContent = message;
  } else toast(message);
});

/** Guarda o que a pessoa está digitando para não perder numa atualização ao vivo. */
function keepFields() {
  const kept = [...root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-keep]')].map((f) => [f.dataset.keep!, f.value] as const);
  const focus = (document.activeElement as HTMLElement | null)?.dataset?.keep;
  const askOpen = root.querySelector<HTMLFormElement>('[data-ask-form]')?.hidden === false;
  const thread = root.querySelector<HTMLElement>('[data-thread]');
  const readingHistory = thread && thread.scrollHeight - thread.scrollTop - thread.clientHeight > 60 ? thread.scrollTop : null;
  return () => {
    for (const [k, v] of kept) {
      const f = root.querySelector<HTMLInputElement>(`[data-keep="${k}"]`);
      if (f) { f.value = v; f.dispatchEvent(new Event('input', { bubbles: true })); }
    }
    if (askOpen) { const form = root.querySelector<HTMLFormElement>('[data-ask-form]'); if (form) form.hidden = false; }
    if (readingHistory !== null) { const thread = root.querySelector<HTMLElement>('[data-thread]'); if (thread) thread.scrollTop = readingHistory; }
    if (focus) root.querySelector<HTMLElement>(`[data-keep="${focus}"]`)?.focus();
  };
}

function draw() {
  if (typeof cleanup === 'function') cleanup();
  cleanup = undefined;

  const user = currentUser();
  applyTheme();
  root.dataset.accent = user ? preferencesOf(user).accent : 'indigo';
  root.dataset.density = user ? preferencesOf(user).density : 'comfortable';
  const client = scopeClient();
  if (!user || !client) {
    document.title = 'Entrar · brnz';
    render(root, login.view(null as never));
    cleanup = login.mount?.(root.firstElementChild as HTMLElement, null as never);
    lastScope = 'login';
    return;
  }

  const route = current();
  const modules = visibleModules(user.role, client.plan);
  const allowed = modules.find((m) => m.id === route.name);
  if (!allowed) {
    // Tela fora do papel ou do plano: volta para o início sem mostrar o que não é liberado.
    if (route.name !== 'inicio') return go('inicio');
  }

  const scope = `${user.id}:${client.id}`;
  const restore = lastRoute === location.hash && lastScope === scope ? keepFields() : null;
  const ctx: Ctx = { user, client, plan: client.plan, staff: isStaff(user), modules, param: route.param, refresh: draw, toast };
  const screen = screens[(allowed?.id ?? 'inicio') as ModuleId];
  render(root, shell(ctx, route.name, screen.title(ctx), screen.sub?.(ctx) ?? '', screen.action?.(ctx) ?? '', screen.view(ctx)));
  drawCharts(root);
  cleanup = screen.mount?.($('[data-screen]', root)!, ctx);
  restore?.();
  if (lastRoute !== location.hash) {
    window.scrollTo(0, 0);
    if (lastRoute) $('#conteudo')?.focus({ preventScroll: true });
  }
  lastRoute = location.hash;
  lastScope = scope;
  document.title = `${screen.title(ctx)} · brnz`;
}

// Eventos da casca, ligados uma vez na raiz
mountClientSwitcher(root, draw, toast);
mountCommand(root);
mountUserMenu(root);
mountTheme(root);
mountNotifications(root);
window.addEventListener('brnz:theme', draw);
// Da visão do estúdio para a tela de um cliente: troca o foco e abre a tela certa.
window.addEventListener('brnz:focus', (e) => {
  const { clientId, module, id } = (e as CustomEvent<{ clientId: string; module: string; id?: string }>).detail;
  setScope(clientId);
  if (current().name === module && current().param === (id || undefined)) draw();
  else go(module, id || (module === 'suporte' ? clientId : undefined));
});
on(root, 'click', '[data-more]', () => $<HTMLDialogElement>('[data-sheet]')?.showModal());
on<MouseEvent>(root, 'click', '[data-skip]', (_, e) => { e.preventDefault(); $('#conteudo')?.focus(); });
on(root, 'click', '[data-close]', (el) => el.closest('dialog')?.close());
on(root, 'click', '.sheet .nav-link', (el) => el.closest('dialog')?.close());
on(root, 'click', 'dialog', (el, e) => { if (e.target === el) (el as HTMLDialogElement).close(); });

window.addEventListener('hashchange', draw);
onChange((external) => {
  // Uma atualização de outra aba não pode desmontar um formulário aberto.
  const dialog = root.querySelector<HTMLDialogElement>('dialog[open]');
  if (external && dialog) { dialog.addEventListener('close', draw, { once: true }); return; }
  const picker = root.querySelector<HTMLElement>('.client-popover:popover-open, .user-menu:popover-open, .notifications-panel:popover-open');
  if (external && picker) { picker.addEventListener('toggle', () => { if (!picker.matches(':popover-open')) draw(); }, { once: true }); return; }
  draw();
});
window.addEventListener('brnz:session', () => { lastRoute = ''; draw(); });
draw();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

