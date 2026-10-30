import { html, on } from "../core/dom";
import { currentUser, scopeClient } from "../core/session";
import { notificationsFor, readNotifications } from "../data/notifications";
import type { Ctx } from "../core/screen";
import { icon } from "./icons";

export function notificationsTrigger(c: Ctx, mobile = false) {
  const count = notificationsFor(c.user, c.client).filter(
    (x) => !x.read,
  ).length;
  return html`<button
    type="button"
    class="icon-btn notifications-trigger ${mobile
      ? "notifications-trigger--mobile"
      : ""}"
    data-notifications-open
    aria-haspopup="dialog"
    aria-expanded="false"
    aria-controls="notifications-panel"
    aria-label="Notificações${count ? `, ${count} não lidas` : ""}"
    title="Notificações"
  >
    ${icon("bell")}${count
      ? html`<span class="notification-count" aria-hidden="true"
          >${count > 99 ? "99+" : count}</span
        >`
      : ""}
  </button>`;
}
export function notificationsPanel(c: Ctx) {
  const items = notificationsFor(c.user, c.client),
    count = items.filter((x) => !x.read).length;
  return html`<div
    id="notifications-panel"
    class="notifications-panel"
    popover="auto"
    role="dialog"
    aria-labelledby="notifications-title"
  >
    <header>
      <div>
        <h2 id="notifications-title">Notificações</h2>
        <span>${count ? `${count} não lidas` : "Tudo em dia"}</span>
      </div>
      <button
        type="button"
        class="icon-btn"
        data-notifications-close
        aria-label="Fechar notificações"
      >
        ${icon("x")}
      </button>
    </header>
    ${count
      ? html`<button
          type="button"
          class="notifications-read-all"
          data-notifications-read-all
        >
          ${icon("check")}Marcar todas como lidas
        </button>`
      : ""}
    <div class="notifications-list">
      ${items.length
        ? items.map(
            (item) =>
              html`<a
                class="notification-item ${item.read ? "is-read" : ""}"
                href="${item.href}"
                data-notification-id="${item.id}"
                data-notification-client="${item.clientId}"
                data-notification-module="${item.module}"
                data-notification-param="${item.param ?? ""}"
                ><span class="notification-symbol">${icon(item.icon)}</span
                ><span
                  ><strong>${item.title}</strong
                  ><small>${item.detail}</small></span
                >${!item.read ? html`<i aria-label="Não lida"></i>` : ""}</a
              >`,
          )
        : html`<div class="notifications-empty">
            ${icon("bell")}<strong>Nenhuma notificação</strong>
            <p>Novidades dos seus projetos aparecem aqui.</p>
          </div>`}
    </div>
  </div>`;
}
export function mountNotifications(root: HTMLElement) {
  let trigger: HTMLElement | null = null;
  const open = (button: HTMLElement) => {
    const panel = root.querySelector<HTMLElement>("#notifications-panel")!;
    trigger = button;
    panel.style.maxHeight = `${innerHeight - 24}px`;
    panel.showPopover();
    const box = button.getBoundingClientRect();
    panel.style.left = `${Math.max(12, Math.min(box.right - panel.offsetWidth, innerWidth - panel.offsetWidth - 12))}px`;
    panel.style.top = `${Math.max(12, Math.min(box.bottom + 10, innerHeight - panel.offsetHeight - 12))}px`;
    button.setAttribute("aria-expanded", "true");
    panel.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  };
  on(root, "click", "[data-notifications-open]", (button) => {
    const panel = root.querySelector<HTMLElement>("#notifications-panel")!;
    if (panel.matches(":popover-open")) panel.hidePopover();
    else open(button);
  });
  on(root, "click", "[data-notifications-close]", () => {
    root.querySelector<HTMLElement>("#notifications-panel")?.hidePopover();
    trigger?.focus({ preventScroll: true });
  });
  on<KeyboardEvent>(root, "keydown", "#notifications-panel", (panel, e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      panel.hidePopover();
      trigger?.focus({ preventScroll: true });
    }
  });
  root.addEventListener(
    "toggle",
    (event) => {
      const el = event.target as HTMLElement;
      if (el.id === "notifications-panel" && !el.matches(":popover-open"))
        trigger?.setAttribute("aria-expanded", "false");
    },
    true,
  );
  on(root, "click", "[data-notifications-read-all]", () => {
    const user = currentUser(),
      client = scopeClient();
    if (!user || !client) return;
    const mobile = trigger?.classList.contains("notifications-trigger--mobile");
    readNotifications(
      notificationsFor(user, client)
        .filter((x) => !x.read)
        .map((x) => x.id),
    );
    const button = root.querySelector<HTMLElement>(
      mobile
        ? ".notifications-trigger--mobile"
        : ".header-tools .notifications-trigger",
    );
    if (button) open(button);
  });
  on<MouseEvent>(root, "click", "[data-notification-id]", (link, e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const {
      notificationId: id,
      notificationClient: clientId,
      notificationModule: module,
      notificationParam: param,
    } = link.dataset;
    root.querySelector<HTMLElement>("#notifications-panel")?.hidePopover();
    readNotifications([id!]);
    window.dispatchEvent(
      new CustomEvent("brnz:focus", {
        detail: { clientId, module, id: param || undefined },
      }),
    );
  });
}
