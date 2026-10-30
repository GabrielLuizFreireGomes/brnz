import { html, on } from "../core/dom";
import { href } from "../core/router";
import { money, num, relDay, when, isPast } from "../core/format";
import { can, planName } from "../core/access";
import { clientById, db, unreadFor, userById, type Piece } from "../data/db";
import type { Ctx, Screen } from "../core/screen";
import {
  avatar,
  empty,
  kindLabel,
  pill,
  sectionHead,
  stagePill,
  thumb,
} from "../ui/parts";
import { icon } from "../ui/icons";
import { reviewCard } from "../ui/review-card";

const areaOf = (p: Piece) => (p.area === "post" ? "conteudo" : "design");
const sorted = (pieces: Piece[]) =>
  [...pieces].sort((a, b) => a.due.localeCompare(b.due));
const openButton = (p: Piece, content: ReturnType<typeof html>, cls = "") =>
  html`<button
    type="button"
    class="${cls}"
    data-open="${p.clientId}|${areaOf(p)}|${p.id}"
  >
    ${content}
  </button>`;

function workRow(p: Piece, staff: boolean) {
  return html`<li>
    ${openButton(
      p,
      html`${thumb(p)}<span class="row-main"
          ><strong>${p.title}</strong
          ><small
            >${staff ? clientById(p.clientId)?.name : kindLabel[p.kind]}</small
          ></span
        ><span class="work-row-end"
          ><span class="work-due ${isPast(p.due) ? "late" : ""}"
            >${relDay(p.due)}</span
          >${stagePill(p.stage, staff)}</span
        >${icon("chevron", "ico--end")}`,
      "row row--btn",
    )}
  </li>`;
}

function nextDelivery(p: Piece | undefined, staff: boolean) {
  return html`<section class="next-delivery">
    <div class="next-delivery-label">
      ${icon("calendar")}<span>Próxima entrega</span>
    </div>
    ${p
      ? html`<div class="next-delivery-body">
            ${thumb(p)}
            <div>
              <strong>${p.title}</strong>
              <p>${staff ? clientById(p.clientId)?.name : kindLabel[p.kind]}</p>
            </div>
          </div>
          <div class="next-delivery-foot">
            <span>${relDay(p.due)}</span>${openButton(
              p,
              html`Ver projeto ${icon("arrow")}`,
              "text-action",
            )}
          </div>`
      : html`<strong>Tudo em dia.</strong>
          <p>Sem entregas agendadas.</p>`}
  </section>`;
}

function studio(c: Ctx) {
  const d = db();
  const active = d.pieces.filter(
    (p) => p.stage !== "publicado" && p.stage !== "aprovado",
  );
  const queue = sorted(active.filter((p) => p.stage !== "aprovacao"));
  const approvals = sorted(active.filter((p) => p.stage === "aprovacao"));
  const requests = d.requests.filter((r) => r.status === "novo");
  const inbox = d.clients
    .map((client) => ({ client, n: unreadFor(client.id, true) }))
    .filter((x) => x.n);
  const overdue = d.invoices.filter((i) => i.status === "vencida");
  const revenue = d.clients.reduce(
    (sum, x) =>
      sum + (x.plan === "completo" ? 3990 : x.plan === "presenca" ? 2290 : 0),
    0,
  );
  return html`<div class="studio-intro">
      <section class="studio-note">
        <div class="studio-note-top">
          <span class="studio-status"><i></i>Produção do estúdio</span
          ><span class="studio-note-date"
            >${new Date().toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
            })}</span
          >
        </div>
        <h2>${queue.length} entregas<br />em produção.</h2>
        <div class="studio-note-bottom">
          <span><strong>${approvals.length}</strong> aguardando aprovação</span
          ><a href="${href("clientes")}" class="studio-note-link"
            >Ver clientes ${icon("arrow")}</a
          >
        </div>
        <div class="studio-cut" aria-hidden="true"><i></i><i></i><i></i></div>
      </section>
      ${nextDelivery(queue[0], true)}
    </div>
    <div class="studio-summary" aria-label="Resumo do estúdio">
      <a href="${href("clientes")}"
        ><span>Clientes ativos</span><strong>${d.clients.length}</strong>${icon(
          "users",
        )}</a
      >${c.user.role === "admin"
        ? html`<div>
              <span>Receita mensal</span
              ><strong>${money(revenue)}</strong>${icon("card")}
            </div>
            <div>
              <span>Faturas vencidas</span
              ><strong class="${overdue.length ? "warn-text" : ""}"
                >${overdue.length}<small
                  >${money(overdue.reduce((s, i) => s + i.amount, 0))}</small
                ></strong
              >${icon("clock")}
            </div>`
        : ""}
      <div>
        <span>Entregas atrasadas</span
        ><strong>${queue.filter((p) => isPast(p.due)).length}</strong>${icon(
          "calendar",
        )}
      </div>
    </div>
    <div class="work-columns">
      <div class="work-main">
        <section class="work-board">
          <header class="work-board-head">
            <div>
              <h2>Em produção <span>${queue.length}</span></h2>
            </div>
            <span>Por data de entrega</span>
          </header>
          ${queue.length
            ? html`<ul class="list work-list">
                ${queue.map((p) => workRow(p, true))}
              </ul>`
            : empty("Produção em dia", "Os próximos projetos aparecem aqui.")}
        </section>
        <section class="work-board">
          <header class="work-board-head">
            <h2>Com os clientes <span>${approvals.length}</span></h2>
          </header>
          ${approvals.length
            ? html`<ul class="list work-list">
                ${approvals.map((p) => workRow(p, true))}
              </ul>`
            : empty("Tudo aprovado", "Nenhuma peça aguardando aprovação.")}
        </section>
      </div>
      <aside class="work-aside">
        <section class="work-board">
          <header class="work-board-head">
            <h2>Conversas</h2>
            <a href="${href("suporte")}" aria-label="Todas as conversas"
              >${icon("arrow")}</a
            >
          </header>
          ${inbox.length
            ? html`<ul class="inbox-list">
                ${inbox.map(
                  ({ client, n }) =>
                    html`<li>
                      <button type="button" data-open="${client.id}|suporte|">
                        <span
                          class="inbox-monogram"
                          style="--client-hue:${client.hue}"
                          >${client.name
                            .split(" ")
                            .slice(0, 2)
                            .map((x) => x[0])
                            .join("")}</span
                        ><span
                          ><strong>${client.name}</strong
                          ><small>Aguardando sua resposta</small></span
                        ><span class="inbox-count">${n}</span>
                      </button>
                    </li>`,
                )}
              </ul>`
            : html`<div class="quiet-state">
                ${icon("check")}Todas as conversas em dia.
              </div>`}
        </section>
        <section class="work-board">
          <header class="work-board-head">
            <h2>Pedidos novos <span>${requests.length}</span></h2>
          </header>
          ${requests.length
            ? html`<ul class="request-digest">
                ${requests.slice(0, 4).map(
                  (r) =>
                    html`<li>
                      <button type="button" data-open="${r.clientId}|design|">
                        <small>${clientById(r.clientId)?.name}</small
                        ><strong>${r.title}</strong
                        ><span>Para ${relDay(r.due)}${icon("chevron")}</span>
                      </button>
                    </li>`,
                )}
              </ul>`
            : html`<p class="quiet-state">Sem novos pedidos.</p>`}
        </section>
        <a class="studio-help" href="${href("clientes")}"
          >${icon("plus")}Abrir área de um cliente${icon("chevron")}</a
        >
      </aside>
    </div>`;
}

function client(c: Ctx) {
  const pieces = db().pieces.filter(
    (p) =>
      p.clientId === c.client.id &&
      can(c.user.role, c.plan, areaOf(p) as "conteudo" | "design"),
  );
  const waiting = sorted(pieces.filter((p) => p.stage === "aprovacao"));
  const queue = sorted(
    pieces.filter(
      (p) => !["publicado", "aprovado", "aprovacao"].includes(p.stage),
    ),
  );
  const last = db()
    .messages.filter((m) => m.clientId === c.client.id)
    .at(-1);
  const unread = unreadFor(c.client.id, false);
  const seo = can(c.user.role, c.plan, "busca")
    ? db().seo.find((x) => x.clientId === c.client.id)
    : undefined;
  return html`<div class="studio-intro">
      <section class="studio-note studio-note--client">
        <div class="studio-note-top">
          <span class="studio-status"><i></i>Seu time está por aqui</span
          ><span class="studio-note-date">${planName(c.plan)}</span>
        </div>
        <h2>
          ${waiting.length
            ? html`${waiting.length} peças prontas<br />para sua revisão.`
            : html`Tudo aprovado.<br />Vamos ao próximo projeto.`}
        </h2>
        <div class="studio-note-bottom">
          <span><strong>${queue.length}</strong> em produção</span
          ><a href="${href("suporte")}" class="studio-note-link"
            >Falar com o time ${icon("arrow")}</a
          >
        </div>
        <div class="studio-cut" aria-hidden="true"><i></i><i></i><i></i></div>
      </section>
      ${nextDelivery(queue[0] ?? waiting[0], false)}
    </div>
    <div class="work-columns">
      <div class="work-main">
        <section>
          <div class="sec-head">
            <h2>
              Para você aprovar
              <span class="section-count">${waiting.length}</span>
            </h2>
          </div>
          ${waiting.length
            ? html`<div class="approval-grid">
                ${waiting.slice(0, 4).map((p) => reviewCard(p, c.staff))}
              </div>`
            : empty(
                "Tudo aprovado",
                "As próximas peças aparecem aqui para sua revisão.",
              )}
        </section>
        <section class="work-board">
          <header class="work-board-head">
            <h2>Próximas entregas <span>${queue.length}</span></h2>
          </header>
          ${queue.length
            ? html`<ul class="work-list list">
                ${queue.map((p) => workRow(p, false))}
              </ul>`
            : html`<p class="quiet-state">Nenhuma entrega pendente.</p>`}
        </section>
      </div>
      <aside class="work-aside">
        <a class="client-conversation work-board" href="${href("suporte")}"
          ><div class="work-board-head">
            <h2>Conversa</h2>
            ${unread
              ? pill(`${unread} nova${unread > 1 ? "s" : ""}`, "info")
              : icon("arrow")}
          </div>
          ${last
            ? html`<div class="conversation-preview">
                ${avatar(last.from)}
                <div>
                  <strong>${userById(last.from)?.name.split(" ")[0]}</strong>
                  <p>${last.text}</p>
                  <small>${when(last.at)}</small>
                </div>
              </div>`
            : html`<p class="quiet-state">Fale com seu time por aqui.</p>`}</a
        >
        <section class="work-board client-plan">
          <header class="work-board-head">
            <h2>Seu plano</h2>
            ${icon("card")}
          </header>
          <h3>${planName(c.plan)}</h3>
          <p>${c.client.name}</p>
          ${can(c.user.role, c.plan, "assinatura")
            ? html`<a class="text-action" href="${href("assinatura")}"
                >Ver assinatura ${icon("arrow")}</a
              >`
            : ""}
        </section>
        ${seo
          ? html`<a href="${href("busca")}" class="work-board client-plan"
              ><header class="work-board-head">
                <h2>Visibilidade no Google</h2>
                ${icon("search")}
              </header>
              <h3>${num(seo.google.series.reduce((sum, v) => sum + v, 0))}</h3>
              <p>Cliques nos últimos 28 dias</p>
              <span class="text-action"
                >Ver resultados ${icon("arrow")}</span
              ></a
            >`
          : ""}<a
          class="studio-help"
          href="${href(
            can(c.user.role, c.plan, "design") ? "design" : "suporte",
          )}"
          >${icon("plus")}Pedir um design${icon("chevron")}</a
        >
      </aside>
    </div>`;
}

export const inicio: Screen = {
  title: (c) =>
    c.staff && c.param !== "cliente"
      ? `Olá, ${c.user.name.split(" ")[0]}.`
      : c.staff
        ? "Visão do cliente"
        : `Olá, ${c.user.name.split(" ")[0]}.`,
  sub: () => "",
  view: (c) => (c.staff && c.param !== "cliente" ? studio(c) : client(c)),
  mount: (root) => {
    on(root, "click", "[data-open]", (el) => {
      const [clientId, module, id] = el.dataset.open!.split("|");
      window.dispatchEvent(
        new CustomEvent("brnz:focus", { detail: { clientId, module, id } }),
      );
    });
  },
};
