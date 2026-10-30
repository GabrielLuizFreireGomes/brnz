import { html, on } from '../core/dom';
import { money, relDay, shortDate } from '../core/format';
import { plans as planIds, planName, unlockedBy, type PlanId } from '../core/access';
import { db, mutate, type Invoice } from '../data/db';
import type { Screen } from '../core/screen';
// Os pacotes, as linhas da tabela e o WhatsApp vêm do próprio site: mudou lá, muda aqui.
import { plans as sitePlans, planRows, wa } from '../../../src/data/site';
import { icon } from '../ui/icons';
import { pill, sectionHead } from '../ui/parts';

const invoiceTone: Record<Invoice['status'], [string, string]> = { paga: ['Paga', 'ok'], aberta: ['Em aberto', 'mute'], vencida: ['Vencida', 'bad'] };

export const assinatura: Screen = {
  title: () => 'Assinatura',
  sub: (c) => (c.staff ? `${c.client.name} · plano, faturas e mudanças` : 'Seu plano, suas faturas e o que dá para somar'),
  view: (c) => {
    const plan = sitePlans.find((p) => p.id === c.plan)!;
    const invoices = db().invoices.filter((i) => i.clientId === c.client.id).sort((a, b) => b.due.localeCompare(a.due));
    const others = planIds.filter((p) => p.id !== c.plan);

    return html`
    <section class="plan-card">
      <div class="plan-top">
        <div>
          <p class="muted small">Plano atual · desde ${shortDate(c.client.since)}</p>
          <h2 class="plan-name brand-type">${plan.name}</h2>
        </div>
        <p class="plan-price"><span class="fig">${plan.price}</span><small>${plan.period}</small></p>
      </div>
      ${plan.note ? html`<p class="muted small">${plan.note}</p>` : ''}
      <dl class="plan-rows">
        ${planRows.slice(2).map((row, i) => html`<div class="${plan.cells[i + 2] === 'Não incluso' ? 'off' : ''}"><dt>${row}</dt><dd>${plan.cells[i + 2]}</dd></div>`)}
      </dl>
      ${c.user.role === 'admin' ? html`
        <label class="field field--inline"><span>Trocar o plano deste cliente</span>
          <select data-plan>${planIds.map((p) => html`<option value="${p.id}" ${p.id === c.plan ? 'selected' : ''}>${p.name}</option>`)}</select></label>
        <p class="muted small">Ao trocar, as telas do cliente mudam na hora, conforme a matriz em Acessos.</p>` : ''}
    </section>

    <section class="block">
      ${sectionHead('Faturas')}
      <ul class="list list--rows">${invoices.map((i) => html`
        <li class="row row--static">
          <span class="row-main"><strong>${i.ref}</strong><small>${c.plan === 'largada' ? '' : 'Mensalidade · '}${i.status === 'paga' ? `venceu em ${shortDate(i.due)}` : `vence ${relDay(i.due)}`}</small></span>
          <span class="fig amount">${money(i.amount)}</span>
          ${pill(...invoiceTone[i.status])}
          ${!c.staff && i.status !== 'paga' ? html`<a class="btn btn--sm" href="${wa(`Olá, brnz! Quero pagar a fatura "${i.ref}" de ${money(i.amount)}.`)}" target="_blank" rel="noopener">Pagar</a>` : ''}
        </li>`)}</ul>
    </section>

    ${c.staff ? '' : html`
    <section class="block">
      ${sectionHead('Outros planos')}
      <ul class="list list--plans">${others.map((p) => {
        const gain = unlockedBy(c.plan as PlanId, p.id);
        return html`
        <li class="other-plan">
          <div><strong>${p.name}</strong><span class="muted"> · ${p.price} ${p.period}</span></div>
          <p class="muted small">${gain.length ? `Libera no app: ${gain.map((m) => m.label).join(', ')}` : 'Mesmas telas no app, com outro escopo de entregas.'}</p>
          <a class="btn btn--ghost btn--sm" href="${wa(`Olá, brnz! Quero conversar sobre mudar do plano ${planName(c.plan)} para o ${p.name}.`)}" target="_blank" rel="noopener">${icon('whatsapp')}Conversar sobre o ${p.name}</a>
        </li>`;
      })}</ul>
    </section>`}`;
  },
  mount: (root, c) => {
    on(root, 'change', '[data-plan]', (el) => {
      const plan = (el as HTMLSelectElement).value as PlanId;
      mutate((d) => { const cl = d.clients.find((x) => x.id === c.client.id); if (cl) cl.plan = plan; });
      c.toast(`${c.client.name} agora está no plano ${planName(plan)}.`);
    });
  },
};
