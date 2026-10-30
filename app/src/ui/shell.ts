// A casca: barra lateral no computador, barra superior + abas embaixo no celular.
import { html, type View } from '../core/dom';
import { href } from '../core/router';
import { type ModuleDef } from '../core/access';
import { db, unreadFor } from '../data/db';
import type { Ctx } from '../core/screen';
import { icon, logo } from './icons';
import { userTrigger, userMenu } from './user-menu';
import { clientSwitcher } from './client-switcher';
import { themeTrigger } from './theme';
import { notificationsTrigger, notificationsPanel } from './notifications';

const MAX_TABS = 4;

function badge(m: ModuleDef, c: Ctx) {
  if (m.id === 'suporte') {
    const n = c.staff ? db().clients.reduce((a, cl) => a + unreadFor(cl.id, true), 0) : unreadFor(c.client.id, false);
    return n ? html`<span class="badge" aria-label="${n} não lidas">${n}</span>` : '';
  }
  if ((m.id === 'conteudo' || m.id === 'design') && !c.staff) {
    const area = m.id === 'conteudo' ? 'post' : 'design';
    const n = db().pieces.filter((p) => p.clientId === c.client.id && p.area === area && p.stage === 'aprovacao').length;
    return n ? html`<span class="badge" aria-label="${n} esperando aprovação">${n}</span>` : '';
  }
  return '';
}

// Para a equipe, "Início" vira duas entradas: a visão do estúdio e a visão do cliente em foco.
type NavItem = ModuleDef & { param?: string };
const isActive = (m: NavItem, c: Ctx, active: string) =>
  active === m.id && (m.id !== 'inicio' || !c.staff || (c.param === 'cliente') === (m.param === 'cliente'));

const navLink = (m: NavItem, c: Ctx, active: string) => html`
  <a class="nav-link" href="${href(m.id, m.param)}" ${isActive(m, c, active) ? html`aria-current="page"` : ''}>
    ${icon(m.icon)}<span>${m.label}</span>${badge(m, c)}
  </a>`;

function navGroups(c: Ctx) {
  const inicio = c.modules.find((m) => m.id === 'inicio')!;
  const forClient: NavItem[] = c.modules.filter((m) => m.group === 'cliente' && m.id !== 'inicio');
  const studio: NavItem[] = c.modules.filter((m) => m.group === 'estudio');
  if (!c.staff) return { forClient: [inicio, ...forClient], studio };
  return {
    forClient: [{ ...inicio, label: 'Visão do cliente', icon: 'user', param: 'cliente' }, ...forClient],
    studio: [{ ...inicio, label: 'Estúdio' }, ...studio],
  };
}

export function shell(c: Ctx, active: string, title: string, sub: string, action: View | '', body: View) {
  const { forClient: main, studio } = navGroups(c);
  const tabs = [...c.modules].filter((m) => m.pin).sort((a, b) => a.pin! - b.pin!).slice(0, MAX_TABS);
  const inMore = !tabs.some((t) => t.id === active) || (c.staff && active === 'inicio' && c.param === 'cliente');
  const studioPage = ['clientes', 'acessos'].includes(active) || (active === 'inicio' && c.param !== 'cliente');
  const breadcrumb = c.staff && studioPage ? 'Estúdio' : c.client.name;
  const pageLabel = active === 'inicio' ? (c.param === 'cliente' ? 'Visão do cliente' : 'Visão geral') : title;

  return html`
  <a class="skip-link" href="#conteudo" data-skip>Pular para o conteúdo</a>
  <div class="app" data-module="${active}">
    <aside class="side" aria-label="Navegação">
      <a class="side-brand" href="${href('inicio')}">${logo()}<span class="workspace-word">workspace</span><span class="sr-only">Início</span></a>
      ${clientSwitcher(c, 'side')}
      ${studio.length ? html`<nav class="studio-nav" aria-label="Estúdio">${studio.map((m) => navLink(m, c, active))}</nav>` : ''}
      <nav class="side-nav">
        <p class="nav-group">${c.staff ? 'Trabalho do cliente' : 'Sua marca'}</p>
        ${main.map((m) => navLink(m, c, active))}
      </nav>
      ${userTrigger(c)}
    </aside>

    <header class="topbar">
      <a class="topbar-brand" href="${href('inicio')}">${logo()}<span class="sr-only">Início</span></a>
      ${clientSwitcher(c, 'top')}
      ${themeTrigger(true)}${notificationsTrigger(c,true)}
      ${userTrigger(c, true)}
    </header>

    <main class="main" id="conteudo" tabindex="-1">
      <header class="workspace-header"><div class="breadcrumbs"><a href="${href('inicio')}" aria-label="${breadcrumb}: voltar ao dashboard">${breadcrumb}</a>${icon('chevron')}<strong>${pageLabel}</strong></div><div class="header-tools"><button type="button" class="workspace-search" data-search-open>${icon('search')}<span>Buscar no workspace</span><kbd>Ctrl K</kbd></button>${themeTrigger()}${notificationsTrigger(c)}</div></header>
      <div class="page-head">
        <div>
          <h1>${title}</h1>
          ${sub && (active === 'inicio' || active === 'servidor') ? html`<p class="page-sub">${sub}</p>` : ''}
        </div>
        ${action}
      </div>
      <div class="page-body" data-screen>${body}</div>
    </main>

    <nav class="tabbar" aria-label="Seções">
      ${tabs.map((m) => html`<a href="${href(m.id)}" ${isActive(m, c, active) ? html`aria-current="page"` : ''}>${icon(m.icon)}<span>${c.staff && m.id === 'inicio' ? 'Estúdio' : m.short}</span>${badge(m, c)}</a>`)}
      <button type="button" data-more ${inMore ? html`aria-current="page"` : ''} aria-haspopup="dialog">${icon('more')}<span>Mais</span></button>
    </nav>

    <dialog class="sheet" data-sheet aria-label="Todas as seções">
      <div class="sheet-head"><strong>Todas as seções</strong><button type="button" class="icon-btn" data-close aria-label="Fechar">${icon('x')}</button></div>
      <nav class="sheet-nav">

        <button type="button" class="nav-link" data-search-open>${icon('search')}Buscar no workspace</button>
        ${main.map((m) => navLink(m, c, active))}
        ${studio.length ? html`<p class="nav-group">Estúdio</p>${studio.map((m) => navLink(m, c, active))}` : ''}
        <p class="nav-group">Você</p>
        ${navLink(c.modules.find((m) => m.id === 'conta')!, c, active)}
      </nav>
    </dialog>
    <dialog class="command-dialog" data-command aria-labelledby="command-title"><div class="command-head">${icon('search')}<label class="sr-only" id="command-title" for="command-input">Buscar no workspace</label><input id="command-input" data-command-input type="search" placeholder="Buscar clientes, peças ou páginas…" autocomplete="off" /><button class="command-escape" type="button" data-close aria-label="Fechar busca">Esc</button></div><div class="command-results" data-command-results></div><div class="command-footer"><span>↑ ↓ navegar</span><span>Enter abrir</span><span>Esc fechar</span></div></dialog>
    ${userMenu(c)}
    ${notificationsPanel(c)}
    <div class="toast" role="status" aria-live="polite" data-toast></div>
  </div>`;
}
