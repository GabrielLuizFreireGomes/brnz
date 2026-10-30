import { html, on, render } from '../core/dom';
import { num, when } from '../core/format';
import { db } from '../data/db';
import { reviewSite, saveSite } from '../data/workflows';
import type { Screen } from '../core/screen';
import { icon } from '../ui/icons';
import { empty, pill } from '../ui/parts';

const steps = ['Estrutura', 'Design', 'Desenvolvimento', 'Revisão', 'No ar'];
export const sites: Screen = {
  title: () => 'Sites',
  sub: (c) => `${c.client.name} · da primeira ideia à publicação`,
  action: (c) => c.staff ? html`<button class="btn" data-new-site>${icon('plus')}Novo site</button>` : '',
  view: (c) => {
    const list = db().sites.filter((s) => s.clientId === c.client.id);
    return html`
    <div class="notice">${icon('browser')}<span>Projetos de demonstração. As prévias abrem aqui no app; os domínios são ilustrativos.</span></div>
    ${!list.length ? empty('Seu próximo endereço começa aqui', c.staff ? 'Cadastre um site para organizar as etapas com o cliente.' : 'Quando o time começar seu site, acompanhe todas as etapas por aqui.') : html`
    <ul class="list list--sites">${list.map((s) => html`
      <li class="site">
        <div class="site-head"><div><p class="eyebrow">${s.domain}</p><h2>${s.name}</h2></div>${s.status === 'no-ar' ? pill('No ar', 'ok') : pill('Em desenvolvimento', 'info')}</div>
        <ol class="steps" aria-label="Etapas de ${s.name}">${steps.map((label, i) => html`<li class="${i < s.step ? 'done' : i === s.step ? 'now' : ''}" ${i === s.step ? html`aria-current="step"` : ''}><span>${label}</span></li>`)}</ol>
        <dl class="facts"><div><dt>Visitas, 30 dias</dt><dd>${s.status === 'no-ar' ? num(s.visits30) : '—'}</dd></div><div><dt>Última atualização</dt><dd>${when(s.lastDeploy)}</dd></div><div><dt>Tecnologia</dt><dd>${s.stack}</dd></div></dl>
        ${s.feedback ? html`<p class="callout"><strong>${s.approvedAt ? 'Revisão aprovada' : 'Retorno do cliente'}</strong>${s.feedback}</p>` : ''}
        <div class="decide"><button class="btn btn--ghost btn--sm" data-preview="${s.id}">${icon('browser')}Ver prévia</button>${c.staff ? html`<button class="btn btn--sm" data-edit-site="${s.id}">Atualizar projeto</button>` : s.step === 3 && !s.approvedAt ? html`<button class="btn btn--sm" data-review="${s.id}">Revisar site</button>` : ''}</div>
      </li>`)}</ul>`}
    <dialog class="sheet sheet--form" data-preview-dialog aria-label="Prévia ilustrativa do site"><div class="sheet-head"><strong>Prévia do projeto</strong><button class="icon-btn" data-close aria-label="Fechar">${icon('x')}</button></div><div data-preview-content></div></dialog>
    ${c.staff ? html`<dialog class="sheet sheet--form" data-site-dialog aria-labelledby="site-title"><form class="form" data-site-form>
      <div class="sheet-head"><strong id="site-title">Projeto de site</strong><button type="button" class="icon-btn" data-close aria-label="Fechar">${icon('x')}</button></div>
      <input type="hidden" name="id" />
      <label class="field"><span>Nome do projeto</span><input name="name" required maxlength="80" /></label>
      <label class="field"><span>Domínio ilustrativo</span><input name="domain" placeholder="exemplo.com.br" required maxlength="150" /></label>
      <label class="field"><span>Etapa atual</span><select name="step">${steps.map((s, i) => html`<option value="${i}">${s}</option>`)}</select></label>
      <label class="field"><span>Tecnologia</span><input name="stack" placeholder="Astro · Cloudflare" maxlength="100" /></label>
      <button class="btn" type="submit">Salvar projeto</button>
    </form></dialog>` : html`<dialog class="sheet sheet--form" data-review-dialog aria-labelledby="review-title"><form class="form" data-review-form><div class="sheet-head"><strong id="review-title">Revisar o site</strong><button type="button" class="icon-btn" data-close aria-label="Fechar">${icon('x')}</button></div><input type="hidden" name="id" /><label class="field"><span>Seu retorno</span><textarea name="feedback" maxlength="2000" placeholder="Descreva os ajustes, se houver."></textarea></label><button type="submit" class="btn" name="decision" value="approve">Aprovar revisão</button><button type="submit" class="btn btn--ghost" name="decision" value="changes">Pedir ajustes</button></form></dialog>`}`;
  },
  mount: (root, c) => {
    const open = (id?: string) => {
      const dialog = root.querySelector<HTMLDialogElement>('[data-site-dialog]')!;
      const form = dialog.querySelector('form')!; form.reset();
      const site = db().sites.find((s) => s.id === id && s.clientId === c.client.id);
      for (const key of ['id', 'name', 'domain', 'step', 'stack'] as const) (form.elements.namedItem(key) as HTMLInputElement).value = String(site?.[key] ?? (key === 'step' ? 0 : ''));
      dialog.showModal();
    };
    const opener = root.closest('.app')!.querySelector('[data-new-site]');
    const create = () => open(); opener?.addEventListener('click', create);
    on(root, 'click', '[data-edit-site]', (el) => open(el.dataset.editSite));
    on<SubmitEvent>(root, 'submit', '[data-site-form]', (form, e) => {
      e.preventDefault(); const f = new FormData(form as HTMLFormElement);
      saveSite({ name: String(f.get('name')), domain: String(f.get('domain')), step: Number(f.get('step')), stack: String(f.get('stack')) }, c.client.id, String(f.get('id')) || undefined);
      root.querySelector<HTMLDialogElement>('[data-site-dialog]')!.close();
      c.toast('Projeto atualizado. O cliente já pode acompanhar.');
    });
    on(root, 'click', '[data-preview]', (el) => {
      const site = db().sites.find((s) => s.id === el.dataset.preview && s.clientId === c.client.id)!;
      render(root.querySelector('[data-preview-content]')!, html`<div class="website-preview"><p class="eyebrow">${c.client.name}</p><h2>Cuidado em cada detalhe.</h2><p>${c.client.segment} em ${c.client.city}. Um espaço pensado para conectar sua marca às pessoas.</p><div class="preview-shapes" aria-hidden="true"><i></i><i></i><i></i></div><strong>${site.name}</strong><p class="small muted">Maquete ilustrativa · etapa ${steps[site.step]}. O site definitivo será conectado pela equipe.</p></div>`);
      root.querySelector<HTMLDialogElement>('[data-preview-dialog]')!.showModal();
    });
    on(root, 'click', '[data-review]', (el) => { const dialog = root.querySelector<HTMLDialogElement>('[data-review-dialog]')!; dialog.querySelector<HTMLInputElement>('[name="id"]')!.value = el.dataset.review!; dialog.showModal(); });
    on<SubmitEvent>(root, 'submit', '[data-review-form]', (form, e) => { e.preventDefault(); const f = new FormData(form as HTMLFormElement); reviewSite(String(f.get('id')), (e.submitter as HTMLButtonElement)?.value === 'approve', String(f.get('feedback'))); root.querySelector<HTMLDialogElement>('[data-review-dialog]')!.close(); c.toast('Retorno enviado para o time.'); });
    return () => opener?.removeEventListener('click', create);
  },
};
