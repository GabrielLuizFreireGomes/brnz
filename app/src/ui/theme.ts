import { html, on } from "../core/dom";
import { currentUser } from "../core/session";
import { preferencesOf, saveMyProfile } from "../data/profile";
import { icon } from "./icons";

const systemDark = matchMedia("(prefers-color-scheme: dark)");
export function applyTheme() {
  const user = currentUser();
  const choice = user ? preferencesOf(user).theme : "system";
  document.documentElement.dataset.theme =
    choice === "system" ? (systemDark.matches ? "dark" : "light") : choice;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      document.documentElement.dataset.theme === "dark" ? "#101521" : "#2f3b90",
    );
}
export function themeTrigger(mobile = false) {
  const dark = document.documentElement.dataset.theme === "dark";
  return html`<button
    type="button"
    class="icon-btn theme-toggle ${mobile ? "theme-toggle--mobile" : ""}"
    data-theme-toggle
    aria-label="Ativar tema ${dark ? "claro" : "escuro"}"
    title="Tema ${dark ? "claro" : "escuro"}"
  >
    ${icon(dark ? "sun" : "moon")}
  </button>`;
}
export function mountTheme(root: HTMLElement) {
  systemDark.addEventListener("change", () => {
    applyTheme();
    window.dispatchEvent(new Event("brnz:theme"));
  });
  on(root, "click", "[data-theme-toggle]", (button) => {
    const mobile = button.classList.contains("theme-toggle--mobile");
    saveMyProfile({
      preferences: {
        theme:
          document.documentElement.dataset.theme === "dark" ? "light" : "dark",
      },
    });
    root
      .querySelector<HTMLElement>(
        mobile ? ".theme-toggle--mobile" : ".header-tools .theme-toggle",
      )
      ?.focus({ preventScroll: true });
  });
}
