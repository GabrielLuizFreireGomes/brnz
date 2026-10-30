import { html, on } from '../core/dom';
import { money, relDay, shortDate } from '../core/format';
import { plans as planIds, planName, unlockedBy, type PlanId } from '../core/access';
import { db, mutate, type Invoice } from '../data/db';
import { payInvoice, downloadText } from '../data/workflows';
import { send } from '../data/actions';
import { href } from '../core/router';
import type { Screen } from '../core/screen';
// Catálogo local: o workspace pode ser publicado sem reconstruir a landing.
import { plans as sitePlans, planRows } from '../data/catalog';
import { icon } from '../ui/icons';
import { pill, sectionHead } from '../ui/parts';

const invoiceTone: Record<Invoice['status'], [string, string]> = { paga: ['Paga', 'brand'], aberta: ['Em aberto', 'mute'], vencida: ['Vencida', 'bad'] };

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
          <span class="row-main"><strong>${i.ref}</strong><small>${c.plan === 'largada' ? '' : 'Mensalidade · '}${i.status === 'paga' ? `vencimento em ${shortDate(i.due)}` : i.status === 'vencida' ? `venceu em ${shortDate(i.due)}` : `vence ${relDay(i.due)}`}</small></span>
          <span class="fig amount">${money(i.amount)}</span>
          ${pill(...invoiceTone[i.status])}
          ${i.status !== 'paga' ? html`<button class="btn" data-pay="${i.id}">${c.staff ? 'Registrar pagamento' : 'Pagar fatura'}</button>` : html`<button class="btn btn--ghost btn--sm" data-receipt="${i.id}">Comprovante</button>`}
        </li>`)}</ul>
    </section>

    ${c.staff ? '' : html`
    <section class="block">
      ${sectionHead('Outros planos')}
      <ul class="list list--plans">${others.map((p) => {
        const gain = unlockedBy(c.plan as PlanId, p.id);
        const loss = unlockedBy(p.id, c.plan as PlanId);
        return html`
        <li class="other-plan">
          <div><strong>${p.name}</strong><span class="muted"> · ${p.price} ${p.period}</span></div>
          <p class="muted small">${gain.length ? `Libera no app: ${gain.map((m) => m.label).join(', ')}` : loss.length ? `Deixam de fazer parte: ${loss.map((m) => m.label).join(', ')}` : 'Outro escopo de entregas, com as mesmas telas.'}</p>
          <button class="btn btn--ghost btn--sm" data-upgrade="${p.id}">Solicitar ${p.name}</button>
        </li>`;
      })}</ul>
    </section>`}
    <dialog class="sheet sheet--form" data-payment aria-labelledby="payment-title"><form class="form" data-payment-form><div class="sheet-head"><strong id="payment-title">Simular pagamento</strong><button class="icon-btn" type="button" data-close aria-label="Fechar">${icon('x')}</button></div><input type="hidden" name="invoice" /><p data-payment-info></p><p class="muted small">Esta ação marca apenas a fatura de teste como paga. Nenhum dado bancário é solicitado e nenhum dinheiro é movimentado.</p><button class="btn" type="submit">Confirmar pagamento de teste</button></form></dialog>`;
  },
  mount: (root, c) => {
    on(root, 'click', '[data-pay]', (el) => { const invoice = db().invoices.find((i) => i.id === el.dataset.pay && i.clientId === c.client.id)!; const dialog = root.querySelector<HTMLDialogElement>('[data-payment]')!; dialog.querySelector<HTMLInputElement>('[name="invoice"]')!.value = invoice.id; dialog.querySelector('[data-payment-info]')!.textContent = `${invoice.ref} · ${money(invoice.amount)}`; dialog.showModal(); });
    on<SubmitEvent>(root, 'submit', '[data-payment-form]', (form, e) => { e.preventDefault(); payInvoice(String(new FormData(form as HTMLFormElement).get('invoice'))); c.toast('Pagamento de teste registrado.'); });
    on(root, 'click', '[data-receipt]', (el) => { const i = db().invoices.find((i) => i.id === el.dataset.receipt && i.clientId === c.client.id)!; downloadText(`brnz-comprovante-${i.id}.txt`, `BRNZ — COMPROVANTE DE DEMONSTRAÇÃO\nSem valor fiscal ou financeiro\nCliente: ${c.client.name}\nReferência: ${i.ref}\nValor: ${money(i.amount)}\nStatus: Paga\n${i.paidAt ? `Pagamento simulado: ${new Date(i.paidAt).toLocaleString('pt-BR')}` : 'Fatura paga nos dados de exemplo.'}`); c.toast('Comprovante de demonstração baixado.'); });
    on(root, 'click', '[data-upgrade]', (el) => { const plan = planIds.find((p) => p.id === el.dataset.upgrade)!; send(c.client.id, c.user.id, `Quero conversar sobre a mudança do plano ${planName(c.plan)} para o ${plan.name}.`); location.hash = href('suporte'); });
    on(root, 'change', '[data-plan]', (el) => {
      const plan = (el as HTMLSelectElement).value as PlanId;
      mutate((d) => { const cl = d.clients.find((x) => x.id === c.client.id); if (cl) cl.plan = plan; });
      c.toast(`${c.client.name} agora está no plano ${planName(plan)}.`);
    });
  },
};
