import { html, on } from '../core/dom';
import { go, href } from '../core/router';
import { setScope } from '../core/session';
import { time, relDay } from '../core/format';
import { clientById, db, unreadFor, userById, type Message } from '../data/db';
import { markRead, readImage, send } from '../data/actions';
import type { Ctx, Screen } from '../core/screen';
import { icon } from '../ui/icons';
import { avatar, pill } from '../ui/parts';

const fromClient = (m: Message) => userById(m.from)?.role === 'cliente';

function thread(c: Ctx, clientId: string) {
  const msgs = db().messages.filter((m) => m.clientId === clientId);
  let lastDay = '';
  return html`
  <div class="thread" data-thread>
    ${msgs.length ? msgs.map((m) => {
      const mine = c.staff ? !fromClient(m) : fromClient(m);
      const day = relDay(m.at);
      const sep = day !== lastDay ? html`<p class="day-sep"><span>${day}</span></p>` : '';
      lastDay = day;
      const who = userById(m.from);
      return html`${sep}
        <div class="msg ${mine ? 'msg--mine' : ''}">
          ${mine ? '' : avatar(m.from, 'sm')}
          <div class="bubble">
            ${mine && !c.staff ? '' : html`<span class="msg-who">${who?.id === c.user.id ? 'Você' : who?.name.split(' ')[0]}</span>`}
            ${m.image ? html`<img class="msg-img" src="${m.image}" alt="Imagem enviada" loading="lazy" />` : ''}
            ${m.text ? html`<p>${m.text}</p>` : ''}
            <time datetime="${m.at}">${time(m.at)}</time>
          </div>
        </div>`;
    }) : html`<p class="muted thread-empty">Comece a conversa. O time responde em horário comercial, normalmente no mesmo dia.</p>`}
  </div>
  <form class="composer" data-composer>
    <label class="icon-btn file-btn" aria-label="Anexar imagem">${icon('clip')}<input type="file" accept="image/*" data-attach hidden /></label>
    <label class="sr-only" for="msg">Mensagem</label>
    <textarea id="msg" name="text" rows="1" placeholder="Escreva para ${c.staff ? clientById(clientId)?.name : 'o time'}" data-keep="msg-${clientId}" enterkeyhint="send"></textarea>
    <button class="icon-btn icon-btn--fill" type="submit" aria-label="Enviar">${icon('send')}</button>
  </form>`;
}

function inbox(c: Ctx, active: string | undefined) {
  const d = db();
  const rows = d.clients.map((cl) => {
    const msgs = d.messages.filter((m) => m.clientId === cl.id);
    return { cl, last: msgs[msgs.length - 1], n: unreadFor(cl.id, true) };
  }).sort((a, b) => (b.last?.at ?? '').localeCompare(a.last?.at ?? ''));
  return html`<ul class="list inbox">${rows.map(({ cl, last, n }) => html`
    <li><button type="button" class="row row--btn" data-thread-open="${cl.id}" ${cl.id === active ? html`aria-current="true"` : ''}>
      <span class="row-main"><strong>${cl.name}</strong><small>${last ? `${userById(last.from)?.name.split(' ')[0]}: ${last.text || 'imagem'}` : 'Sem mensagens'}</small></span>
      ${n ? pill(String(n), 'warn') : last ? html`<span class="muted small">${relDay(last.at)}</span>` : ''}
    </button></li>`)}</ul>`;
}

export const suporte: Screen = {
  title: (c) => (c.staff ? 'Conversas' : 'Conversa'),
  sub: (c) => (c.staff ? 'Uma conversa por cliente' : 'Fale com Arthur, Gabriel e o time de captação'),
  view: (c) => {
    if (!c.staff) return html`<div class="chat">${thread(c, c.client.id)}</div>`;
    const open = c.param;
    return html`
    <div class="chat chat--staff ${open ? 'has-open' : ''}">
      <div class="chat-list">${inbox(c, open)}</div>
      <div class="chat-pane">
        ${open ? html`<a class="back chat-back" href="${href('suporte')}">${icon('back')}Conversas</a><p class="chat-title">${clientById(open)?.name}</p>${thread(c, open)}`
          : html`<p class="muted thread-empty">Escolha um cliente para abrir a conversa.</p>`}
      </div>
    </div>`;
  },
  mount: (root, c) => {
    const clientId = c.staff ? c.param : c.client.id;
    const t = root.querySelector<HTMLElement>('[data-thread]');
    if (t) t.scrollTop = t.scrollHeight;
    if (clientId) setTimeout(() => markRead(clientId, c.staff), 600);

    on(root, 'click', '[data-thread-open]', (el) => { setScope(el.dataset.threadOpen!); go('suporte', el.dataset.threadOpen!); });

    const box = root.querySelector<HTMLTextAreaElement>('textarea');
    const grow = () => { if (box) { box.style.height = 'auto'; box.style.height = `${Math.min(box.scrollHeight, 140)}px`; } };
    box?.addEventListener('input', grow);
    box?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && matchMedia('(hover: hover)').matches) {
        e.preventDefault();
        box.form?.requestSubmit();
      }
    });
    on<SubmitEvent>(root, 'submit', '[data-composer]', (_, e) => {
      e.preventDefault();
      const text = box?.value.trim() ?? '';
      if (!text || !clientId) return;
      box!.value = '';
      send(clientId, c.user.id, text);
      root.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    });
    on(root, 'change', '[data-attach]', async (el) => {
      const file = (el as HTMLInputElement).files?.[0];
      if (!file || !clientId) return;
      send(clientId, c.user.id, '', await readImage(file, 900));
    });
  },
};
