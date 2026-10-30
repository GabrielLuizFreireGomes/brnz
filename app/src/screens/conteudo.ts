import { html, on } from "../core/dom";
import { href } from "../core/router";
import { compact, num } from "../core/format";
import { piecesOf, db } from "../data/db";
import type { Screen } from "../core/screen";
import type { PlanId } from "../core/access";
import {
  empty,
  metaBy,
  metricRow,
  thumb,
  stageOrder,
  stageLabel,
} from "../ui/parts";
import {
  mountDetail,
  mountUpload,
  pieceDetail,
  pieceList,
  uploadButton,
  uploadDialog,
} from "../ui/pieces";
import { reviewCard } from "../ui/review-card";

// Cota mensal de cada pacote, a mesma da tabela de planos do site.
const quota: Partial<Record<PlanId, { posts: number; videos: number }>> = {
  presenca: { posts: 12, videos: 4 },
  completo: { posts: 16, videos: 8 },
};

const isVideo = (k: string) => k === "reels";
const isPiece = (param?: string) => !!param && param !== "publicados";

export const conteudo: Screen = {
  title: () => "Posts",
  sub: (c) =>
    c.staff
      ? `${c.client.name} · feed, stories e vídeos`
      : "Feed, stories e vídeos do mês",
  action: (c) => (isPiece(c.param) ? "" : uploadButton(c)),
  view: (c) => {
    if (isPiece(c.param))
      return pieceDetail(
        db().pieces.find((p) => p.id === c.param),
        c,
        "conteudo",
      );

    const all = piecesOf(c.client.id, "post");
    const tab = c.param === "publicados" ? "publicados" : "producao";
    const today = new Date();
    const thisMonth = all.filter((p) => {
      const date = new Date(p.publishedAt ?? p.updatedAt);
      return (
        p.stage === "publicado" &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });
    const q = quota[c.plan];
    const done = {
      posts: thisMonth.filter((p) => !isVideo(p.kind)).length,
      videos: thisMonth.filter((p) => isVideo(p.kind)).length,
    };
    const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

    const waitingFirst = (s: string) => (s === "aprovacao" ? 0 : 1);
    const producing = all
      .filter((p) => p.stage !== "publicado")
      .sort(
        (a, b) =>
          waitingFirst(a.stage) - waitingFirst(b.stage) ||
          a.due.localeCompare(b.due),
      );
    const published = all
      .filter((p) => p.stage === "publicado")
      .sort((a, b) =>
        (b.publishedAt ?? b.updatedAt).localeCompare(
          a.publishedAt ?? a.updatedAt,
        ),
      );
    const reach = published.reduce((s, p) => s + (p.metrics?.alcance ?? 0), 0);

    return html` ${q
        ? html` <section class="quota" aria-label="Entregas do mês">
            <p class="quota-title">Publicados em ${monthName}</p>
            ${(
              [
                ["Posts", done.posts, q.posts],
                ["Vídeos", done.videos, q.videos],
              ] as const
            ).map(
              ([label, n, of]) =>
                html` <div class="quota-row">
                  <span>${label}</span>
                  <span class="quota-cells" aria-hidden="true"
                    >${Array.from(
                      { length: of },
                      (_, i) => html`<i class="${i < n ? "on" : ""}"></i>`,
                    )}</span
                  >
                  <span class="fig">${n} de ${of}</span>
                </div>`,
            )}
          </section>`
        : ""}

      <div class="tabs" aria-label="Posts">
        <a
          href="${href("conteudo")}"
          ${tab === "producao" ? html`aria-current="page"` : ""}
          >Em produção <span class="count">${producing.length}</span></a
        >
        <a
          href="${href("conteudo", "publicados")}"
          ${tab === "publicados" ? html`aria-current="page"` : ""}
          >Publicados <span class="count">${published.length}</span></a
        >
      </div>

      <div class="toolbar">
        <label class="field content-search"
          ><span class="sr-only">Buscar peça</span
          ><input
            type="search"
            placeholder="Buscar pelo título da peça"
            data-piece-search
            data-keep="piece-search" /></label
        >${tab === "producao"
          ? html`<label class="field"
              ><span class="sr-only">Filtrar etapa</span
              ><select
                data-piece-filter
                data-keep="piece-filter"
                aria-label="Filtrar etapa"
              >
                <option value="">Todas as etapas</option>
                ${stageOrder
                  .filter((s) => s !== "publicado")
                  .map(
                    (s) => html`<option value="${s}">${stageLabel[s]}</option>`,
                  )}
              </select></label
            >`
          : ""}
      </div>
      <p class="muted small" data-piece-empty hidden>
        Nenhuma peça corresponde aos filtros.
      </p>

      ${tab === "producao"
        ? producing.length
          ? html`<ul class="post-gallery">
              ${producing.map(
                (p) =>
                  html`<li class="post-tile" data-piece-id="${p.id}">
                    ${reviewCard(p, c.staff)}
                  </li>`,
              )}
            </ul>`
          : empty(
              "Nada em produção",
              c.staff
                ? "Suba a próxima peça para o cliente aprovar."
                : "Quando o time começar a próxima peça, ela aparece aqui.",
            )
        : html` <p class="summary">
              <span class="fig">${compact(reach)}</span> pessoas alcançadas
              pelos ${num(published.length)} posts publicados
            </p>
            ${published.length
              ? html`<ul class="post-gallery">
                  ${published.map(
                    (p) =>
                      html`<li class="post-tile" data-piece-id="${p.id}">
                        ${reviewCard(p, c.staff, true)}
                      </li>`,
                  )}
                </ul>`
              : empty(
                  "Nenhum post publicado ainda",
                  "Os resultados de cada post aparecem aqui depois que ele vai ao ar.",
                )}`}
      ${uploadDialog(c, "post")}`;
  },
  mount: (root, c) => {
    const filter = () => {
      const term =
        root
          .querySelector<HTMLInputElement>("[data-piece-search]")
          ?.value.toLocaleLowerCase("pt-BR") || "";
      const stage =
        root.querySelector<HTMLSelectElement>("[data-piece-filter]")?.value ||
        "";
      let count = 0;
      root.querySelectorAll<HTMLElement>("[data-piece-id]").forEach((row) => {
        const piece = db().pieces.find((p) => p.id === row.dataset.pieceId);
        row.hidden =
          !piece ||
          !piece.title.toLocaleLowerCase("pt-BR").includes(term) ||
          (!!stage && piece.stage !== stage);
        if (!row.hidden) count++;
      });
      root.querySelector<HTMLElement>("[data-piece-empty]")!.hidden = count > 0;
    };
    if (!isPiece(c.param)) {
      on(root, "input", "[data-piece-search], [data-piece-filter]", filter);
      on(root, "change", "[data-piece-filter]", filter);
    }
    mountDetail(
      root,
      c,
      isPiece(c.param) ? db().pieces.find((p) => p.id === c.param) : undefined,
    );
    return mountUpload(root, c, "post", "conteudo");
  },
};
