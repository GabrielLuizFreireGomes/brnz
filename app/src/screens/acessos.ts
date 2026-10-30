import { html, on } from '../core/dom';
import { loadMatrix, modules, planModules, plans, resetMatrix, roleLabel, saveMatrix, type ModuleId, type PlanId, type Role } from '../core/access';
import { db } from '../data/db';
import type { Screen } from '../core/screen';
import { sectionHead } from '../ui/parts';

const roles: Role[] = ['admin', 'equipe', 'cliente'];

export const acessos: Screen = {
  title: () => 'Acessos',
  sub: () => 'Quais telas cada plano e cada papel enxerga',
  view: () => {
    const matrix = loadMatrix();
    const count = (p: PlanId) => db().clients.filter((c) => c.plan === p).length;
    return html`
    <section class="block">
      ${sectionHead('Telas por plano', html`<button class="btn btn--ghost btn--sm" type="button" data-reset>Voltar ao padrão</button>`)}
      <p class="muted small">Vale para os clientes e para a equipe quando estiver vendo aquele cliente. Muda na hora em todos os aparelhos conectados.</p>
      <div class="table-scroll">
        <table class="table matrix">
          <thead><tr><th scope="col">Tela</th>${plans.map((p) => html`<th scope="col" class="center">${p.name}<small class="cell-sub">${count(p.id)} cliente${count(p.id) === 1 ? '' : 's'}</small></th>`)}</tr></thead>
          <tbody>${planModules.map((m) => html`
            <tr><th scope="row">${m.label}</th>${plans.map((p) => html`
              <td class="center"><input type="checkbox" class="check" data-cell="${p.id}|${m.id}" ${matrix[p.id].includes(m.id) ? 'checked' : ''} aria-label="${m.label} no plano ${p.name}" /></td>`)}</tr>`)}
          </tbody>
        </table>
      </div>
    </section>

    <section class="block">
      ${sectionHead('Telas por papel')}
      <p class="muted small">Fixo no código (src/core/access.ts). Início, Conversa e Conta aparecem para todos.</p>
      <div class="table-scroll">
        <table class="table matrix">
          <thead><tr><th scope="col">Tela</th>${roles.map((r) => html`<th scope="col" class="center">${roleLabel[r]}</th>`)}</tr></thead>
          <tbody>${modules.map((m) => html`
            <tr><th scope="row">${m.label}</th>${roles.map((r) => html`
              <td class="center">${m.roles.includes(r) ? (m.byPlan ? html`<span class="muted small">plano</span>` : html`<span class="yes" aria-label="Sim">Sim</span>`) : html`<span class="muted" aria-label="Não">—</span>`}</td>`)}</tr>`)}
          </tbody>
        </table>
      </div>
    </section>`;
  },
  mount: (root, c) => {
    on(root, 'change', '[data-cell]', (el) => {
      const [plan, mod] = el.dataset.cell!.split('|') as [PlanId, ModuleId];
      const m = loadMatrix();
      const checked = (el as HTMLInputElement).checked;
      m[plan] = checked ? [...new Set([...m[plan], mod])] : m[plan].filter((x) => x !== mod);
      saveMatrix(m);
      c.toast('Acesso atualizado.');
      c.refresh();
    });
    on(root, 'click', '[data-reset]', () => { resetMatrix(); c.toast('Acessos de volta ao padrão.'); c.refresh(); });
  },
};
