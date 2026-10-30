import { html, on } from '../core/dom';
import { planName, roleLabel } from '../core/access';
import { signIn } from '../core/session';
import { go } from '../core/router';
import { clientById, db } from '../data/db';
import type { Screen } from '../core/screen';
import { logo } from '../ui/icons';
import { avatar } from '../ui/parts';

const enter = (userId: string) => {
  signIn(userId);
  go('inicio');
  window.dispatchEvent(new Event('brnz:session'));
};

export const login: Screen = {
  title: () => 'Entrar',
  view: () => {
    const users = db().users;
    const staff = users.filter((u) => u.role !== 'cliente');
    const clients = users.filter((u) => u.role === 'cliente');
    return html`
    <div class="login">
      <section class="login-intro">
        ${logo('login-logo')}
        <h1 class="brand-type">Tudo da sua marca, num lugar só.</h1>
        <p>Aprove posts, acompanhe o site, veja como você aparece no Google e fale com o time, sem procurar nada no WhatsApp.</p>
      </section>

      <section class="login-card" aria-labelledby="login-title">
        <h2 id="login-title">Entrar</h2>
        <form class="form" data-login novalidate>
          <label class="field">
            <span>E-mail</span>
            <input type="email" name="email" autocomplete="email" inputmode="email" placeholder="voce@suaempresa.com.br" required spellcheck="false" />
          </label>
          <p class="field-error" data-error hidden></p>
          <button class="btn btn--block" type="submit">Continuar</button>
        </form>

        <div class="demo">
          <p class="demo-title">Perfis de teste</p>
          <p class="demo-note">Enquanto o login de verdade não existe, entre como qualquer perfil. Cada um vê só as telas do seu papel e do seu plano.</p>
          <ul class="list">
            ${[...staff, ...clients].map((u) => html`
              <li><button type="button" class="row row--btn" data-as="${u.id}">
                ${avatar(u.id)}
                <span class="row-main"><strong>${u.name}</strong><small>${u.role === 'cliente' ? `${clientById(u.clientId)?.name} · plano ${planName(clientById(u.clientId)!.plan)}` : roleLabel[u.role]}</small></span>
              </button></li>`)}
          </ul>
        </div>
      </section>
    </div>`;
  },
  mount: (root) => {
    on(root, 'click', '[data-as]', (el) => enter(el.dataset.as!));
    on<SubmitEvent>(root, 'submit', '[data-login]', (form, e) => {
      e.preventDefault();
      const email = (new FormData(form as HTMLFormElement).get('email') as string).trim().toLowerCase();
      const u = db().users.find((x) => x.email === email);
      const err = root.querySelector<HTMLElement>('[data-error]')!;
      if (u) return enter(u.id);
      err.hidden = false;
      err.textContent = email ? 'Esse e-mail não tem acesso ainda. Fale com a brnz pelo WhatsApp.' : 'Digite seu e-mail.';
      form.querySelector('input')?.focus();
    });
  },
};
