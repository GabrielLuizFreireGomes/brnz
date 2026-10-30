import { html } from '../core/dom';
import { num, when } from '../core/format';
import { db } from '../data/db';
import type { Screen } from '../core/screen';
import { icon } from '../ui/icons';
import { empty, pill } from '../ui/parts';

// Etapas de um site, da conversa até o ar.
const steps = ['Estrutura', 'Design', 'Desenvolvimento', 'Revisão', 'No ar'];

export const sites: Screen = {
  title: () => 'Sites',
  sub: (c) => (c.staff ? `${c.client.name} · no ar e em desenvolvimento` : 'O que está no ar e o que está sendo feito'),
  view: (c) => {
    const list = db().sites.filter((s) => s.clientId === c.client.id);
    if (!list.length) return empty('Nenhum site ainda', 'Quando o time começar o seu site, cada etapa aparece aqui.');
    return html`<ul class="list list--sites">${list.map((s) => html`
      <li class="site">
        <div class="site-head">
          <div>
            <h2>${s.name}</h2>
            <a class="link" href="https://${s.domain}" target="_blank" rel="noopener">${s.domain}${icon('external', 'ico--inline')}</a>
          </div>
          ${s.status === 'no-ar' ? pill('No ar', 'ok') : pill('Em desenvolvimento', 'info')}
        </div>
        <ol class="steps" aria-label="Etapas">
          ${steps.map((label, i) => html`<li class="${i < s.step ? 'done' : i === s.step ? 'now' : ''}" ${i === s.step ? html`aria-current="step"` : ''}><span>${label}</span></li>`)}
        </ol>
        <dl class="facts">
          <div><dt>Visitas, 30 dias</dt><dd class="fig">${s.status === 'no-ar' ? num(s.visits30) : '—'}</dd></div>
          <div><dt>Última atualização</dt><dd>${when(s.lastDeploy)}</dd></div>
          <div><dt>Feito com</dt><dd>${s.stack}</dd></div>
        </dl>
      </li>`)}</ul>`;
  },
};
