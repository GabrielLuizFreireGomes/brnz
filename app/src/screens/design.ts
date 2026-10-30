import { html, on } from '../core/dom';
import { relDay, when } from '../core/format';
import { db, piecesOf, userById, type Request } from '../data/db';
import { request, setRequest } from '../data/actions';
import type { Screen } from '../core/screen';
import { icon } from '../ui/icons';
import { empty, kindLabel, pill, sectionHead } from '../ui/parts';
import { mountDetail, mountUpload, pieceDetail, pieceList, uploadButton, uploadDialog } from '../ui/pieces';

const reqLabel: Record<Request['status'], [string, string]> = { novo: ['Novo', 'warn'], andamento: ['Em andamento', 'info'], entregue: ['Entregue', 'ok'] };

export const design: Screen = {
  title: () => 'Design',
  sub: (c) => (c.staff ? `${c.client.name} · pedidos e entregas` : 'Seus pedidos e tudo o que o time entregou'),
  action: (c) => (c.param ? '' : c.staff ? uploadButton(c) : html`<button class="btn" type="button" data-open-request>${icon('plus')}Novo pedido</button>`),
  view: (c) => {
    if (c.param) return pieceDetail(db().pieces.find((p) => p.id === c.param), c, 'design');
    const pieces = piecesOf(c.client.id, 'design');
    const waiting = pieces.filter((p) => p.stage === 'aprovacao');
    const rest = pieces.filter((p) => p.stage !== 'aprovacao').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const reqs = db().requests.filter((r) => r.clientId === c.client.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const due = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

    return html`
    ${waiting.length ? html`<section class="block">${sectionHead(c.staff ? 'Com o cliente' : 'Esperando seu ok')}${pieceList(waiting, c, 'design', '')}</section>` : ''}

    <section class="block">
      ${sectionHead('Pedidos', html`<span class="muted small">${reqs.filter((r) => r.status !== 'entregue').length} em aberto</span>`)}
      ${reqs.length ? html`<ul class="list list--rows">${reqs.map((r) => html`
        <li class="row row--static">
          <span class="row-main"><strong>${r.title}</strong><small>${kindLabel[r.kind]} · para ${relDay(r.due)} · pedido por ${userById(r.by)?.name.split(' ')[0]}, ${when(r.createdAt)}</small>
          ${r.detail ? html`<span class="row-detail">${r.detail}</span>` : ''}</span>
          ${c.staff
            ? html`<select class="mini-select" data-req="${r.id}" aria-label="Situação do pedido">${(Object.keys(reqLabel) as Request['status'][]).map((s) => html`<option value="${s}" ${s === r.status ? 'selected' : ''}>${reqLabel[s][0]}</option>`)}</select>`
            : pill(...reqLabel[r.status])}
        </li>`)}</ul>` : empty('Nenhum pedido ainda', 'Precisa de uma arte, um cardápio ou uma etiqueta? Faça o pedido aqui e o time responde no mesmo dia.')}
    </section>

    <section class="block">
      ${sectionHead('Entregas')}
      ${pieceList(rest, c, 'design', empty('Nada entregue ainda', 'As artes aprovadas e as versões finais ficam guardadas aqui.'))}
    </section>

    ${c.staff ? uploadDialog(c, 'design') : html`
    <dialog class="sheet sheet--form" data-request aria-labelledby="rq-title">
      <form class="form" data-request-form>
        <div class="sheet-head"><strong id="rq-title">Novo pedido de design</strong><button type="button" class="icon-btn" data-close aria-label="Fechar">${icon('x')}</button></div>
        <label class="field"><span>O que você precisa?</span><input name="title" required maxlength="80" autocomplete="off" placeholder="Ex.: Cardápio de fim de ano" /></label>
        <label class="field"><span>Detalhes</span><textarea name="detail" rows="3" placeholder="Tamanho, onde vai ser usado, textos que precisam entrar"></textarea></label>
        <div class="field-row">
          <label class="field"><span>Tipo</span><select name="kind">${(['banner', 'cardapio', 'post', 'identidade', 'logo'] as const).map((k) => html`<option value="${k}">${kindLabel[k]}</option>`)}</select></label>
          <label class="field"><span>Para quando</span><input type="date" name="due" value="${due}" required /></label>
        </div>
        <button class="btn btn--block" type="submit">Enviar pedido</button>
      </form>
    </dialog>`}`;
  },
  mount: (root, c) => {
    mountDetail(root, c, c.param ? db().pieces.find((p) => p.id === c.param) : undefined);
    on(root, 'change', '[data-req]', (el) => { setRequest(el.dataset.req!, (el as HTMLSelectElement).value as Request['status']); c.toast('Pedido atualizado.'); });

    const opener = root.closest('.app')!.querySelector('[data-open-request]');
    const dlg = root.querySelector<HTMLDialogElement>('[data-request]');
    const open = () => dlg?.showModal();
    opener?.addEventListener('click', open);
    on<SubmitEvent>(root, 'submit', '[data-request-form]', (_, e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      if (!String(fd.get('title') ?? '').trim()) return;
      dlg?.close();
      request({
        clientId: c.client.id, title: String(fd.get('title')).trim(), detail: String(fd.get('detail') ?? '').trim(),
        kind: fd.get('kind') as Request['kind'], due: new Date(`${fd.get('due')}T12:00`).toISOString(),
      }, c.user.id);
      c.toast('Pedido enviado. O time responde pela conversa.');
    });
    const off = mountUpload(root, c, 'design', 'design');
    return () => { opener?.removeEventListener('click', open); off(); };
  },
};
