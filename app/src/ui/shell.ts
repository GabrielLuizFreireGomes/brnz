// A casca: barra lateral no computador, barra superior + abas embaixo no celular.
import { html, type View } from '../core/dom';
import { href } from '../core/router';
import { planName, roleLabel, type ModuleDef } from '../core/access';
import { db, unreadFor } from '../data/db';
import type { Ctx } from '../core/screen';
import { icon, logo } from './icons';
import { avatar } from './parts';

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

function scopeSwitch(c: Ctx, cls = '') {
  if (!c.staff) return html`<div class="scope ${cls}"><span class="scope-label">${planName(c.plan)}</span><strong>${c.client.name}</strong></div>`;
  return html`
    <label class="scope scope--select ${cls}">
      <span class="scope-label">Cliente em foco · ${planName(c.plan)}</span>
      <select data-scope aria-label="Cliente em foco">
        ${db().clients.map((cl) => html`<option value="${cl.id}" ${cl.id === c.client.id ? 'selected' : ''}>${cl.name}</option>`)}
      </select>
      ${icon('down', 'scope-caret')}
    </label>`;
}

export function shell(c: Ctx, active: string, title: string, sub: string, action: View | '', body: View) {
  const { forClient: main, studio } = navGroups(c);
  const tabs = [...c.modules].filter((m) => m.pin).sort((a, b) => a.pin! - b.pin!).slice(0, MAX_TABS);
  const inMore = !tabs.some((t) => t.id === active) || (c.staff && active === 'inicio' && c.param === 'cliente');

  return html`
  <div class="app">
    <aside class="side" aria-label="Navegação">
      <a class="side-brand" href="${href('inicio')}">${logo()}<span class="sr-only">Início</span></a>
      ${scopeSwitch(c)}
      <nav class="side-nav">
        ${c.staff ? html`<p class="nav-group">${c.client.name}</p>` : ''}
        ${main.map((m) => navLink(m, c, active))}
        ${studio.length ? html`<p class="nav-group">Estúdio</p>${studio.map((m) => navLink(m, c, active))}` : ''}
      </nav>
      <a class="side-user" href="${href('conta')}" ${active === 'conta' ? html`aria-current="page"` : ''}>
        ${avatar(c.user.id)}
        <span><strong>${c.user.name}</strong><small>${roleLabel[c.user.role]}</small></span>
      </a>
    </aside>

    <header class="topbar">
      <a class="topbar-brand" href="${href('inicio')}">${logo()}<span class="sr-only">Início</span></a>
      ${c.staff ? scopeSwitch(c, 'scope--top') : html`<span class="topbar-client">${c.client.name}</span>`}
      <a class="topbar-me" href="${href('conta')}" aria-label="Sua conta">${avatar(c.user.id, 'sm')}</a>
    </header>

    <main class="main" id="conteudo" tabindex="-1">
      <div class="page-head">
        <div>
          <h1>${title}</h1>
          ${sub ? html`<p class="page-sub">${sub}</p>` : ''}
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
        ${main.map((m) => navLink(m, c, active))}
        ${studio.length ? html`<p class="nav-group">Estúdio</p>${studio.map((m) => navLink(m, c, active))}` : ''}
        <p class="nav-group">Você</p>
        ${navLink(c.modules.find((m) => m.id === 'conta')!, c, active)}
      </nav>
    </dialog>
    <div class="toast" role="status" aria-live="polite" data-toast></div>
  </div>`;
}
