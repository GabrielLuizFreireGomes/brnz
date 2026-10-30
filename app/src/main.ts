import '@fontsource-variable/inter-tight';
import './styles/app.css';
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

const screens: Record<ModuleId, Screen> = { inicio, design, conteudo, sites, servidor, busca, suporte, assinatura, clientes, acessos, conta };

const root = $('#app')!;
let cleanup: void | (() => void);
let lastRoute = '';

function toast(text: string) {
  const el = $('[data-toast]');
  if (!el) return;
  el.textContent = text;
  el.classList.add('is-on');
  clearTimeout(Number(el.dataset.t));
  el.dataset.t = String(setTimeout(() => el.classList.remove('is-on'), 2600));
}

/** Guarda o que a pessoa está digitando para não perder numa atualização ao vivo. */
function keepFields() {
  const kept = [...root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-keep]')].map((f) => [f.dataset.keep!, f.value] as const);
  const focus = (document.activeElement as HTMLElement | null)?.dataset?.keep;
  return () => {
    for (const [k, v] of kept) {
      const f = root.querySelector<HTMLInputElement>(`[data-keep="${k}"]`);
      if (f) f.value = v;
    }
    if (focus) root.querySelector<HTMLElement>(`[data-keep="${focus}"]`)?.focus();
  };
}

function draw() {
  if (typeof cleanup === 'function') cleanup();
  cleanup = undefined;

  const user = currentUser();
  const client = scopeClient();
  if (!user || !client) {
    render(root, login.view(null as never));
    cleanup = login.mount?.(root.firstElementChild as HTMLElement, null as never);
    return;
  }

  const route = current();
  const modules = visibleModules(user.role, client.plan);
  const allowed = modules.find((m) => m.id === route.name);
  if (!allowed) {
    // Tela fora do papel ou do plano: volta para o início sem mostrar o que não é liberado.
    if (route.name !== 'inicio') return go('inicio');
  }

  const restore = lastRoute === location.hash ? keepFields() : null;
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
}

// Eventos da casca, ligados uma vez na raiz
on(root, 'change', '[data-scope]', (el) => {
  const select = el as HTMLSelectElement;
  const name = select.selectedOptions[0].text.split(' · ')[0];
  setScope(select.value);
  draw();
  toast(`Vendo ${name}`);
});
// Da visão do estúdio para a tela de um cliente: troca o foco e abre a tela certa.
window.addEventListener('brnz:focus', (e) => {
  const { clientId, module, id } = (e as CustomEvent<{ clientId: string; module: string; id?: string }>).detail;
  setScope(clientId);
  if (current().name === module && current().param === (id || undefined)) draw();
  else go(module, id || undefined);
});
on(root, 'click', '[data-more]', () => $<HTMLDialogElement>('[data-sheet]')?.showModal());
on(root, 'click', '[data-close]', (el) => el.closest('dialog')?.close());
on(root, 'click', '.sheet .nav-link', (el) => el.closest('dialog')?.close());
on(root, 'click', 'dialog', (el, e) => { if (e.target === el) (el as HTMLDialogElement).close(); });

window.addEventListener('hashchange', draw);
onChange(draw);
window.addEventListener('brnz:session', () => { lastRoute = ''; draw(); });
draw();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

