import { html, on } from "../core/dom";
import { href } from "../core/router";
import { planName, roleLabel } from "../core/access";
import { resetDb, db, type UserPreferences } from "../data/db";
import { preferencesOf, saveMyProfile } from "../data/profile";
import { downloadText } from "../data/workflows";
import type { Screen, Ctx } from "../core/screen";
import { icon } from "../ui/icons";
import { avatar } from "../ui/parts";
import { avatarEditor, mountAvatarEditor } from "../ui/avatar-editor";

let installPrompt: (Event & { prompt: () => Promise<void> }) | null = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e as typeof installPrompt;
});

function choices(
  c: Ctx,
  key: keyof UserPreferences,
  options: [string, string, string][],
) {
  return html`<div class="preference-options preference-options--${key}">
    ${options.map(
      ([value, label, detail]) =>
        html`<label class="preference-option"
          ><input
            type="radio"
            name="${key}"
            value="${value}"
            data-preference
            ${preferencesOf(c.user)[key] === value ? "checked" : ""}
          /><span
            class="preference-sample"
            data-sample="${value}"
            aria-hidden="true"
            >${key === "accent"
              ? ""
              : key === "avatarShape"
                ? c.user.initials
                : key === "theme"
                  ? icon(
                      value === "light"
                        ? "sun"
                        : value === "dark"
                          ? "moon"
                          : "monitor",
                    )
                  : icon("grid")}</span
          ><span><strong>${label}</strong><small>${detail}</small></span
          >${icon("check")}</label
        >`,
    )}
  </div>`;
}

export const conta: Screen = {
  title: () => "Meu perfil",
  sub: () => "",
  view: (c) => {
    const tab = ["aparencia", "acesso"].includes(c.param ?? "") ? c.param : "";
    return html`<div class="account">
      <section class="account-identity" aria-label="Seu perfil">
        <div class="account-person">
          <div class="account-photo">
            ${avatar(c.user.id, "lg")}<label
              class="account-photo-edit"
              title="Alterar foto"
              >${icon("camera")}<span class="sr-only"
                >Alterar foto de perfil</span
              ><input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                data-photo-file
            /></label>
          </div>
          <div class="account-person-copy">
            <h2>${c.user.name}</h2>
            <p>${c.user.email}</p>
            <div class="account-badges">
              <span>${roleLabel[c.user.role]}</span
              ><span>${c.staff ? "BRNZ Studio" : c.client.name}</span>
            </div>
          </div>
          <div class="account-photo-actions">
            <label class="btn btn--ghost"
              >${icon("upload")}Alterar foto<input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                data-photo-file /></label
            >${c.user.photo
              ? html`<button
                  type="button"
                  class="btn btn--quiet"
                  data-photo-remove
                >
                  Remover foto
                </button>`
              : html`<small>JPG, PNG ou WebP · até 10 MB</small>`}
          </div>
        </div>
      </section>
      <nav class="account-tabs" aria-label="Configurações do perfil">
        ${[
          ["", "Dados pessoais", "user"],
          ["aparencia", "Aparência", "palette"],
          ["acesso", "Meu acesso", "key"],
        ].map(
          ([id, label, ico]) =>
            html`<a
              href="${href("conta", id || undefined)}"
              ${tab === id ? html`aria-current="page"` : ""}
              >${icon(ico)}${label}</a
            >`,
        )}
      </nav>
      <div class="account-layout">
        <section class="account-card">
          ${tab === "aparencia"
            ? html`<header>
                  <h2>Aparência</h2>
                  <p>Salvo automaticamente.</p>
                </header>
                <div class="preference-section">
                  <h3>Tema</h3>
                  ${choices(c, "theme", [
                    ["light", "Claro", "Superfícies claras"],
                    ["dark", "Escuro", "Mais conforto à noite"],
                    ["system", "Sistema", "Acompanha seu dispositivo"],
                  ])}
                </div>
                <div class="preference-section">
                  <h3>Cor de destaque</h3>
                  ${choices(c, "accent", [
                    ["indigo", "BRNZ", "Índigo original"],
                    ["blue", "Azul", "Mais luminoso"],
                    ["violet", "Violeta", "Um toque criativo"],
                    ["teal", "Jade", "Calmo e preciso"],
                  ])}
                </div>
                <div class="preference-section">
                  <h3>Formato da foto</h3>
                  ${choices(c, "avatarShape", [
                    ["rounded", "Arredondado", "O padrão do estúdio"],
                    ["circle", "Circular", "Um clássico"],
                  ])}
                </div>
                <div class="preference-section">
                  <h3>Densidade da interface</h3>
                  <p>Espaçamento das listas, painéis e formulários.</p>
                  ${choices(c, "density", [
                    ["comfortable", "Confortável", "Mais espaço para respirar"],
                    ["compact", "Compacta", "Mais conteúdo à vista"],
                  ])}
                </div>`
            : tab === "acesso"
              ? html`<header><h2>Meu acesso</h2></header>
                  <dl class="account-facts">
                    <div>
                      <dt>Perfil de acesso</dt>
                      <dd>${roleLabel[c.user.role]}</dd>
                    </div>
                    <div>
                      <dt>${c.staff ? "Organização" : "Empresa"}</dt>
                      <dd>${c.staff ? "BRNZ Studio" : c.client.name}</dd>
                    </div>
                    ${!c.staff
                      ? html`<div>
                          <dt>Plano atual</dt>
                          <dd>${planName(c.plan)}</dd>
                        </div>`
                      : ""}
                  </dl>
                  <div class="preference-section">
                    <h3>Seções disponíveis</h3>
                    <div class="access-chips">
                      ${c.modules
                        .filter((m) => m.id !== "conta")
                        .map(
                          (m) =>
                            html`<a href="${href(m.id)}"
                              >${icon(m.icon)}${m.label}${icon("chevron")}</a
                            >`,
                        )}
                    </div>
                  </div>
                  <div class="account-local-note">
                    ${icon("server")}
                    <div>
                      <strong>Ambiente de demonstração</strong>
                      <p>
                        Dados e preferências ficam neste navegador. A
                        autenticação real será conectada na próxima etapa do
                        projeto.
                      </p>
                    </div>
                  </div>`
              : html`<header><h2>Dados pessoais</h2></header>
                  <form data-profile-form>
                    <div class="account-fields">
                      <label
                        >Nome completo<input
                          name="name"
                          value="${c.user.name}"
                          required
                          minlength="2"
                          maxlength="80"
                          autocomplete="name"
                          data-keep="profile-name" /></label
                      ><label
                        >E-mail<input
                          name="email"
                          type="email"
                          value="${c.user.email}"
                          required
                          maxlength="120"
                          autocomplete="email"
                          data-keep="profile-email" /></label
                      ><label
                        >Telefone <small>opcional</small
                        ><input
                          name="phone"
                          type="tel"
                          value="${c.user.phone ?? ""}"
                          maxlength="25"
                          placeholder="(11) 99999-9999"
                          autocomplete="tel"
                          data-keep="profile-phone" /></label
                      ><label
                        >Cargo ou função <small>opcional</small
                        ><input
                          name="title"
                          value="${c.user.title}"
                          maxlength="80"
                          placeholder="Como você participa da equipe"
                          autocomplete="organization-title"
                          data-keep="profile-title" /></label
                      ><label class="account-field-wide"
                        >Sobre você <small>opcional</small
                        ><textarea
                          name="bio"
                          rows="3"
                          maxlength="180"
                          placeholder="Um pouco sobre você e o que faz."
                          data-keep="profile-bio"
                        >
${c.user.bio ?? ""}</textarea
                        ><span class="field-hint"
                          >Até 180 caracteres.</span
                        ></label
                      >
                    </div>
                    <p
                      class="field-error"
                      data-profile-error
                      role="alert"
                      hidden
                    ></p>
                    <div class="account-form-footer">
                      <span>Alterações salvas neste navegador.</span
                      ><button class="btn" type="submit">
                        Salvar alterações${icon("check")}
                      </button>
                    </div>
                  </form>`}
        </section>
        <aside class="account-aside">
          <section class="account-card account-context">
            <span class="account-eyebrow">Seu workspace</span>
            <div class="account-org-mark">
              ${icon(c.staff ? "users" : "home")}
            </div>
            <h3>${c.staff ? "BRNZ Studio" : c.client.name}</h3>
            <p>${c.staff ? "Equipe BRNZ" : `Plano ${planName(c.plan)}`}</p>
            <a
              class="account-text-link"
              href="${href(c.staff ? "inicio" : "assinatura")}"
              >${c.staff ? "Ir para o estúdio" : "Ver minha assinatura"}${icon(
                "arrow",
              )}</a
            >
          </section>
          <section class="account-card account-tools">
            <h3>Aplicativo e dados</h3>
            ${installPrompt
              ? html`<button class="btn btn--ghost" data-install>
                  ${icon("download")}Instalar aplicativo
                </button>`
              : html`<small
                  >Use “Instalar aplicativo” ou “Adicionar à tela inicial” no
                  menu do seu navegador.</small
                >`}<button class="account-tool" type="button" data-export>
              ${icon("download")}Exportar meus dados${icon("chevron")}</button
            >${c.user.role === "admin"
              ? html`<button class="account-tool" type="button" data-reset>
                  ${icon("refresh")}Restaurar demonstração
                </button>`
              : ""}<small>Dados de teste salvos neste navegador.</small>
          </section>
        </aside>
      </div>
      ${avatarEditor()}
    </div>`;
  },
  mount: (root, c) => {
    mountAvatarEditor(root, c);
    on<SubmitEvent>(root, "submit", "[data-profile-form]", (form, e) => {
      e.preventDefault();
      const data = new FormData(form as HTMLFormElement);
      try {
        saveMyProfile(
          Object.fromEntries(
            ["name", "email", "phone", "title", "bio"].map((key) => [
              key,
              String(data.get(key) ?? ""),
            ]),
          ),
        );
        c.toast("Perfil atualizado. Tudo salvo por aqui.");
      } catch (error) {
        const el = form.querySelector<HTMLElement>("[data-profile-error]")!;
        el.hidden = false;
        el.textContent = (error as Error).message;
      }
    });
    on(root, "change", "[data-preference]", (input) => {
      const field = input as HTMLInputElement;
      saveMyProfile({ preferences: { [field.name]: field.value } });
      document
        .getElementById("app")
        ?.querySelector<HTMLInputElement>(
          `[data-preference][name="${field.name}"][value="${field.value}"]`,
        )
        ?.focus({ preventScroll: true });
      c.toast("Aparência atualizada.");
    });
    on(root, "click", "[data-install]", async () => {
      await installPrompt?.prompt();
      installPrompt = null;
      c.refresh();
    });
    on(root, "click", "[data-export]", () => {
      const d = structuredClone(db());
      if (!c.staff) {
        d.clients = d.clients.filter((x) => x.id === c.client.id);
        d.users = d.users.filter(
          (x) => x.id === c.user.id || x.role !== "cliente",
        );
        for (const key of [
          "pieces",
          "requests",
          "sites",
          "servers",
          "seo",
          "invoices",
          "messages",
        ] as const)
          (d[key] as { clientId: string }[]) = d[key].filter(
            (x) => x.clientId === c.client.id,
          );
      } else if (c.user.role === "equipe") d.invoices = [];
      downloadText(
        `brnz-dados-${c.user.id}.json`,
        JSON.stringify(d, null, 2),
        "application/json",
      );
      c.toast("Dados de teste exportados.");
    });
    on(root, "click", "[data-reset]", () => {
      if (confirm("Restaurar todos os dados de exemplo deste navegador?")) {
        localStorage.removeItem("brnz:matrix");
        resetDb();
        c.toast("Demonstração restaurada.");
      }
    });
  },
};
