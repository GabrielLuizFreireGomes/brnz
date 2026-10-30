import { html } from "../core/dom";
import { href } from "../core/router";
import { relDay } from "../core/format";
import { userById, type Piece } from "../data/db";
import { thumb, kindLabel, stagePill, metricRow } from "./parts";
import { icon } from "./icons";

/** One coherent card for the dashboard and the content library. */
export function reviewCard(p: Piece, staff = false, showMetrics = false) {
  const video = p.kind === "reels";
  return html`<a
    class="approval-card review-card"
    href="${href(p.area === "post" ? "conteudo" : "design", p.id)}"
    aria-label="${p.stage === "aprovacao" && !staff
      ? "Revisar"
      : "Abrir"} ${p.title}"
  >
    <div class="review-card-head">
      <span class="review-format"
        >${icon(
          video ? "play" : p.kind === "carrossel" ? "grid" : "pen",
        )}${kindLabel[p.kind]}</span
      >${stagePill(p.stage, staff)}
    </div>
    <div class="approval-art">
      ${thumb(p, "approval-preview")}<span
        class="review-open"
        aria-hidden="true"
        >${icon(video ? "play" : "external")}</span
      >
    </div>
    <div class="approval-card-copy">
      <h3>${p.title}</h3>
      <div class="review-card-meta">
        <span>${icon("calendar")}Entrega ${relDay(p.due)}</span
        ><span>${userById(p.by)?.name.split(" ")[0] ?? "Equipe"}</span>
      </div>
      ${showMetrics && p.metrics ? metricRow(p.metrics) : ""}
      <div class="review-card-footer">
        <span
          >${p.stage === "aprovacao" && !staff
            ? "Revisar e aprovar"
            : "Ver detalhes"}</span
        >${icon("arrow")}
      </div>
    </div>
  </a>`;
}
