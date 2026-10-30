// Peças (posts e artes): lista, detalhe com aprovação e envio pela equipe. Usado por Posts e Design.
import { html, on, type View } from "../core/dom";
import { href, go } from "../core/router";
import { relDay, when, isPast } from "../core/format";
import {
  db,
  userById,
  type Piece,
  type PieceKind,
  type Stage,
} from "../data/db";
import {
  approve,
  askChanges,
  readImage,
  setStage,
  upload,
  saveMetrics,
} from "../data/actions";
import type { Ctx } from "../core/screen";
import { icon } from "./icons";
import { artworkFor } from "./demo-artwork";
import {
  avatar,
  chev,
  empty,
  kindLabel,
  metaBy,
  metricRow,
  stageLabelStaff,
  stageOrder,
  stagePill,
  stageHint,
  thumb,
} from "./parts";

export function pieceRow(
  p: Piece,
  c: Ctx,
  module: string,
  opts: { client?: boolean } = {},
) {
  const late =
    p.stage !== "publicado" && p.stage !== "aprovado" && isPast(p.due);
  return html` <li>
    <a class="row" href="${href(module, p.id)}">
      ${thumb(p)}
      <span class="row-main">
        <strong>${p.title}</strong>
        <small
          >${opts.client
            ? `${db().clients.find((x) => x.id === p.clientId)?.name} · `
            : ""}${metaBy(p)}${late
            ? html` · <span class="late">atrasada</span>`
            : ""}</small
        >
        ${stageHint(p.stage, c.staff)}
      </span>
      ${stagePill(p.stage, c.staff)}${chev()}
    </a>
  </li>`;
}

export const pieceList = (
  list: Piece[],
  c: Ctx,
  module: string,
  emptyView: View | "",
) =>
  list.length
    ? html`<ul class="list list--rows">
        ${list.map((p) => pieceRow(p, c, module))}
      </ul>`
    : emptyView;

export function pieceDetail(p: Piece | undefined, c: Ctx, module: string) {
  if (!p || p.clientId !== c.client.id)
    return empty(
      "Peça não encontrada",
      "Ela pode ter sido removida ou ser de outro cliente.",
      html`<a class="btn btn--ghost" href="${href(module)}">Voltar</a>`,
    );
  const canDecide = !c.staff && p.stage === "aprovacao";
  const image = artworkFor(p);
  const imageExtension =
    image?.match(/\.svg(?:\?|$)/) || image?.startsWith("data:image/svg+xml")
      ? "svg"
      : image?.startsWith("data:image/png")
        ? "png"
        : "jpg";
  return html` <a class="back" href="${href(module)}">${icon("back")}Voltar</a>
    <article class="detail">
      <div class="detail-media">${thumb(p, "thumb--xl")}</div>
      <div class="detail-info">
        <div class="detail-pills">
          ${stagePill(p.stage, c.staff)}<span class="pill pill--mute"
            >${kindLabel[p.kind]}</span
          >
        </div>
        <h2 class="detail-title">${p.title}</h2>
        <p class="muted">
          Entrega ${relDay(p.due)} · feita por ${userById(p.by)?.name ?? "brnz"}
        </p>
        ${image
          ? html`<a
              class="btn btn--ghost btn--sm asset-download"
              href="${image}"
              download="${p.title.replace(
                /[^a-zA-Z0-9-]/g,
                "-",
              )}.${imageExtension}"
              >${icon("download")}Baixar imagem</a
            >`
          : ""}
        ${p.note && p.stage === "ajuste"
          ? html`<p class="callout"><strong>Ajuste pedido</strong>${p.note}</p>`
          : ""}
        ${canDecide
          ? html` <div class="decide">
                <button class="btn" type="button" data-approve>
                  ${icon("check")}Aprovar
                </button>
                <button class="btn btn--ghost" type="button" data-ask>
                  Pedir ajuste
                </button>
              </div>
              <form class="form ask" data-ask-form hidden>
                <label class="field"
                  ><span>O que precisa mudar?</span>
                  <textarea
                    name="note"
                    rows="3"
                    required
                    data-keep="ask-${p.id}"
                    placeholder="Ex.: trocar a foto da segunda lâmina"
                  ></textarea>
                </label>
                <div class="decide">
                  <button class="btn" type="submit">Enviar pedido</button
                  ><button class="btn btn--ghost" type="button" data-ask-cancel>
                    Cancelar
                  </button>
                </div>
              </form>`
          : ""}
        ${c.staff
          ? html` <div class="staff-tools">
              <label class="field"
                ><span>Etapa</span>
                <select data-stage>
                  ${stageOrder.map(
                    (s) =>
                      html`<option
                        value="${s}"
                        ${s === p.stage ? "selected" : ""}
                      >
                        ${stageLabelStaff[s]}
                      </option>`,
                  )}
                </select></label
              >
              <label class="btn btn--ghost file-btn"
                >${icon("upload")}Subir versão nova<input
                  type="file"
                  accept="image/*"
                  data-version
                  hidden
              /></label>
            </div>`
          : ""}
        ${p.metrics
          ? html`<h3 class="h3">Resultado</h3>
              ${metricRow(p.metrics)}`
          : ""}
        ${c.staff && p.stage === "publicado"
          ? html`<details class="metrics-editor">
              <summary>Editar métricas de demonstração</summary>
              <form class="form" data-metrics>
                <div class="field-row">
                  ${(
                    ["alcance", "curtidas", "comentarios", "salvos"] as const
                  ).map(
                    (key) =>
                      html`<label class="field"
                        ><span
                          >${{
                            alcance: "Alcance",
                            curtidas: "Curtidas",
                            comentarios: "Comentários",
                            salvos: "Salvos",
                          }[key]}</span
                        ><input
                          type="number"
                          name="${key}"
                          min="0"
                          max="999999999"
                          step="1"
                          value="${p.metrics?.[key] ?? 0}"
                          required
                      /></label>`,
                  )}
                </div>
                <button class="btn btn--sm" type="submit">
                  Salvar métricas
                </button>
              </form>
            </details>`
          : ""}

        <h3 class="h3">Histórico</h3>
        <ol class="timeline">
          ${p.log.map(
            (l) =>
              html`<li>
                ${avatar(l.by, "sm")}<span>${l.text}</span
                ><time datetime="${l.at}">${when(l.at)}</time>
              </li>`,
          )}
        </ol>
      </div>
    </article>`;
}

export function mountDetail(root: HTMLElement, c: Ctx, p: Piece | undefined) {
  if (!p || p.clientId !== c.client.id) return;
  on(root, "click", "[data-approve]", () => {
    approve(p.id, c.user.id);
    c.toast("Aprovado. O time já foi avisado.");
  });
  on(root, "click", "[data-ask]", () => {
    const f = root.querySelector<HTMLFormElement>("[data-ask-form]")!;
    f.hidden = false;
    f.querySelector("textarea")!.focus();
  });
  on(root, "click", "[data-ask-cancel]", () => {
    root.querySelector<HTMLFormElement>("[data-ask-form]")!.hidden = true;
  });
  on<SubmitEvent>(root, "submit", "[data-ask-form]", (f, e) => {
    e.preventDefault();
    const note = String(
      new FormData(f as HTMLFormElement).get("note") ?? "",
    ).trim();
    if (!note) return f.querySelector("textarea")!.focus();
    askChanges(p.id, c.user.id, note);
    c.toast("Pedido de ajuste enviado.");
  });
  on(root, "change", "[data-stage]", (el) => {
    setStage(p.id, c.user.id, (el as HTMLSelectElement).value as Stage);
    c.toast("Etapa atualizada.");
  });
  on<SubmitEvent>(root, "submit", "[data-metrics]", (form, e) => {
    e.preventDefault();
    const f = new FormData(form as HTMLFormElement);
    saveMetrics(p.id, c.user.id, {
      alcance: Number(f.get("alcance")),
      curtidas: Number(f.get("curtidas")),
      comentarios: Number(f.get("comentarios")),
      salvos: Number(f.get("salvos")),
    });
    c.toast("Métricas atualizadas.");
  });
  on(root, "change", "[data-version]", async (el) => {
    const file = (el as HTMLInputElement).files?.[0];
    if (!file) return;
    let image: string;
    try {
      image = await readImage(file);
    } catch (error) {
      c.toast((error as Error).message);
      return;
    }
    upload(
      {
        pieceId: p.id,
        clientId: p.clientId,
        area: p.area,
        kind: p.kind,
        title: p.title,
        due: p.due,
        image,
      },
      c.user.id,
    );
    c.toast(`Versão nova enviada para ${c.client.name}.`);
  });
}

// ---------- Envio de peça nova pela equipe ----------

const kindsFor: Record<Piece["area"], PieceKind[]> = {
  post: ["post", "carrossel", "story", "reels"],
  design: ["identidade", "logo", "banner", "cardapio", "post"],
};

export const uploadButton = (c: Ctx) =>
  c.staff
    ? html`<button class="btn" type="button" data-open-upload>
        ${icon("upload")}Subir peça
      </button>`
    : "";

export function uploadDialog(c: Ctx, area: Piece["area"]) {
  if (!c.staff) return "";
  const due = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
  return html` <dialog
    class="sheet sheet--form"
    data-upload
    aria-labelledby="up-title"
  >
    <form class="form" method="dialog" data-upload-form>
      <div class="sheet-head">
        <strong id="up-title">Peça nova para ${c.client.name}</strong
        ><button type="button" class="icon-btn" data-close aria-label="Fechar">
          ${icon("x")}
        </button>
      </div>
      <label class="field"
        ><span>Título</span
        ><input
          name="title"
          required
          maxlength="80"
          autocomplete="off"
          placeholder="Ex.: Promoção de sexta"
      /></label>
      <div class="field-row">
        <label class="field"
          ><span>Formato</span
          ><select name="kind">
            ${kindsFor[area].map(
              (k) => html`<option value="${k}">${kindLabel[k]}</option>`,
            )}
          </select></label
        >
        <label class="field"
          ><span>Entrega</span
          ><input type="date" name="due" value="${due}" required
        /></label>
      </div>
      <label class="field"
        ><span>Imagem</span><input type="file" name="image" accept="image/*"
      /></label>
      <p class="muted small">
        A peça entra como “esperando seu ok” e o cliente vê na hora, no app
        dele.
      </p>
      <button class="btn btn--block" type="submit">
        Enviar para o cliente
      </button>
    </form>
  </dialog>`;
}

export function mountUpload(
  root: HTMLElement,
  c: Ctx,
  area: Piece["area"],
  module: string,
) {
  const page = root.closest(".app")!;
  const dlg =
    page.querySelector<HTMLDialogElement>("[data-upload]") ??
    root.querySelector<HTMLDialogElement>("[data-upload]");
  const opener = page.querySelector("[data-open-upload]");
  const open = () => dlg?.showModal();
  opener?.addEventListener("click", open);
  dlg?.querySelector("form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const file = fd.get("image") as File | null;
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return;
    const button = (
      e.target as HTMLFormElement
    ).querySelector<HTMLButtonElement>('[type="submit"]')!;
    button.disabled = true;
    let image: string | undefined;
    try {
      image = file && file.size ? await readImage(file) : undefined;
    } catch (error) {
      button.disabled = false;
      window.dispatchEvent(
        new CustomEvent("brnz:error", { detail: (error as Error).message }),
      );
      return;
    }
    dlg.close();
    let id: string;
    try {
      id = upload(
        {
          clientId: c.client.id,
          area,
          kind: fd.get("kind") as PieceKind,
          title,
          due: new Date(`${fd.get("due")}T12:00`).toISOString(),
          image,
        },
        c.user.id,
      );
    } catch (error) {
      button.disabled = false;
      dlg.showModal();
      window.dispatchEvent(
        new CustomEvent("brnz:error", { detail: (error as Error).message }),
      );
      return;
    }
    c.toast(`Enviado para ${c.client.name}.`);
    go(module, id);
  });
  return () => opener?.removeEventListener("click", open);
}
