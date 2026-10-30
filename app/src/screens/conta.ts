import { html, on } from '../core/dom';
import { go } from '../core/router';
import { planName, roleLabel } from '../core/access';
import { signOut } from '../core/session';
import { resetDb } from '../data/db';
import type { Screen } from '../core/screen';
import { icon } from '../ui/icons';
import { avatar } from '../ui/parts';

// O botão de instalar só aparece quando o navegador oferece (Chrome no Android, Edge, Chrome no computador).
let installPrompt: (Event & { prompt: () => Promise<void> }) | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e as typeof installPrompt;
});

export const conta: Screen = {
  title: () => 'Conta',
  view: (c) => {
    const standalone = matchMedia('(display-mode: standalone)').matches;
    return html`
    <section class="profile">
      ${avatar(c.user.id)}
      <div><strong>${c.user.name}</strong><small>${c.user.email}</small></div>
    </section>
    <dl class="facts facts--list">
      <div><dt>Papel</dt><dd>${roleLabel[c.user.role]}</dd></div>
      <div><dt>${c.staff ? 'Função' : 'Empresa'}</dt><dd>${c.staff ? c.user.title : c.client.name}</dd></div>
      ${c.staff ? '' : html`<div><dt>Plano</dt><dd>${planName(c.plan)}</dd></div>`}
      <div><dt>Telas liberadas</dt><dd>${c.modules.filter((m) => m.id !== 'conta').map((m) => m.label).join(', ')}</dd></div>
    </dl>

    <div class="stack">
      ${!standalone && installPrompt ? html`<button class="btn" type="button" data-install>${icon('upload')}Instalar o app</button>` : ''}
      ${!standalone && !installPrompt ? html`<p class="muted small">Para instalar: no Chrome do Android, abra o menu e toque em “Adicionar à tela inicial”.</p>` : ''}
      <button class="btn btn--ghost" type="button" data-signout>${icon('logout')}Sair</button>
      <button class="btn btn--quiet" type="button" data-reset>Apagar dados de teste deste aparelho</button>
    </div>`;
  },
  mount: (root, c) => {
    on(root, 'click', '[data-install]', async () => { await installPrompt?.prompt(); installPrompt = null; c.refresh(); });
    on(root, 'click', '[data-signout]', () => { signOut(); go('inicio'); window.dispatchEvent(new Event('brnz:session')); });
    on(root, 'click', '[data-reset]', () => {
      if (!confirm('Volta todas as peças, mensagens e acessos para os dados de exemplo. Continuar?')) return;
      localStorage.removeItem('brnz:matrix');
      resetDb();
      c.toast('Dados de teste restaurados.');
    });
  },
};
