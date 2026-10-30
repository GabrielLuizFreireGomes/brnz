import { html, on } from "../core/dom";
import { href, go } from "../core/router";
import { roleLabel, planName } from "../core/access";
import { signOut } from "../core/session";
import type { Ctx } from "../core/screen";
import { avatar } from "./parts";
import { icon } from "./icons";

export function userTrigger(c: Ctx, mobile = false) {
  return html`<button
    type="button"
    class="${mobile ? "topbar-me" : "side-user"}"
    data-user-open
    aria-haspopup="dialog"
    aria-expanded="false"
    aria-controls="user-menu"
    aria-label="Abrir menu de ${c.user.name}"
  >
    ${avatar(c.user.id, mobile ? "sm" : "md")}${mobile
      ? ""
      : html`<span class="user-trigger-copy"
            ><strong>${c.user.name}</strong
            ><small>${roleLabel[c.user.role]}</small></span
          >${icon("expand")}`}
  </button>`;
}

export function userMenu(c: Ctx) {
  return html`<div
    class="user-menu"
    id="user-menu"
    popover="auto"
    role="dialog"
    aria-label="Sua conta"
  >
    <div class="user-menu-identity">
      ${avatar(c.user.id)}
      <div>
        <strong>${c.user.name}</strong><span>${c.user.email}</span
        ><small
          >${roleLabel[c.user.role]}${c.staff
            ? " · BRNZ"
            : ` · ${c.client.name}`}</small
        >
      </div>
    </div>
    ${!c.staff
      ? html`<p class="user-menu-plan">
          <span>Seu plano</span><strong>${planName(c.plan)}</strong>
        </p>`
      : ""}
    <nav aria-label="Atalhos da conta">
      <a href="${href("conta")}" class="user-menu-link"
        >${icon("user")}Meu perfil${icon("chevron")}</a
      ><a href="${href("conta", "aparencia")}" class="user-menu-link"
        >${icon("palette")}Personalizar aparência${icon("chevron")}</a
      ><a href="${href("suporte")}" class="user-menu-link"
        >${icon("chat")}Falar com o time${icon("chevron")}</a
      >
    </nav>
    <div class="user-menu-footer">
      <span><i class="live-dot"></i>Demonstração</span
      ><button type="button" data-menu-signout>${icon("logout")}Sair</button>
    </div>
  </div>`;
}

export function mountUserMenu(root: HTMLElement) {
  let trigger: HTMLElement | null = null;
  on(root, "click", "[data-user-open]", (button) => {
    const menu = root.querySelector<HTMLElement>("#user-menu")!;
    if (menu.matches(":popover-open")) {
      menu.hidePopover();
      return;
    }
    trigger = button;
    menu.style.maxHeight = `${innerHeight - 24}px`;
    menu.showPopover();
    const box = button.getBoundingClientRect();
    menu.style.left = `${Math.min(Math.max(12, box.left), innerWidth - menu.offsetWidth - 12)}px`;
    menu.style.top = `${Math.max(12, Math.min(innerHeight - menu.offsetHeight - 12, box.top > innerHeight / 2 ? box.top - menu.offsetHeight - 10 : box.bottom + 8))}px`;
    button.setAttribute("aria-expanded", "true");
    menu.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  });
  root.addEventListener(
    "toggle",
    (event) => {
      const menu = event.target as HTMLElement;
      if (menu.id === "user-menu" && !menu.matches(":popover-open"))
        trigger?.setAttribute("aria-expanded", "false");
    },
    true,
  );
  on<KeyboardEvent>(root, "keydown", "#user-menu", (menu, event) => {
    const items = [...menu.querySelectorAll<HTMLElement>("a,button")];
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      items[
        (event.key === "ArrowDown"
          ? index + 1
          : index <= 0
            ? items.length - 1
            : index - 1) % items.length
      ]?.focus();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      menu.hidePopover();
      trigger?.focus({ preventScroll: true });
    }
  });
  on(root, "click", "#user-menu a", (link) =>
    link.closest<HTMLElement>("#user-menu")!.hidePopover(),
  );
  on(root, "click", "[data-menu-signout]", () => {
    signOut();
    go("inicio");
    window.dispatchEvent(new Event("brnz:session"));
  });
}
