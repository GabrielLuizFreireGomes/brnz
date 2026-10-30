import { html, on } from '../core/dom';
import { roleLabel } from '../core/access';
import { signIn } from '../core/session';
import { go } from '../core/router';
import { clientById, db } from '../data/db';
import type { Screen } from '../core/screen';
import { logo, icon } from '../ui/icons';
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
        <div class="login-art" aria-hidden="true"><span class="login-art-line"></span><span class="login-art-circle"></span><span class="login-art-square"></span><span class="login-art-note">Ideias que<br>ganham forma.</span></div>
        <div class="login-statement"><h1>Um espaço.<br>Todas as conexões.</h1><p>Seu estúdio, seus projetos e as pessoas que fazem acontecer.</p></div>
        <div class="login-intro-footer"><span>BRNZ Studio</span><span>Design + tecnologia</span></div>
      </section>

      <section class="login-card" aria-labelledby="login-title">
        <div class="login-card-heading"><p class="login-overline">Seu workspace</p><h2 id="login-title">Bom ter você aqui.</h2></div>
        <form class="form" data-login novalidate>
          <label class="field">
            <span>E-mail</span>
            <input type="email" name="email" autocomplete="email" inputmode="email" placeholder="voce@suaempresa.com.br" required spellcheck="false" />
          </label>
          <p class="field-error" data-error hidden></p>
          <button class="btn btn--block" type="submit">Entrar no workspace${icon('arrow')}</button>
        </form>

        <div class="demo">
          <p class="demo-title">Perfis de teste</p>
          <p class="demo-note">Escolha um perfil para conhecer o workspace.</p>
          <ul class="list">
            ${[...staff, ...clients].map((u) => html`
              <li><button type="button" class="row row--btn" data-as="${u.id}">
                ${avatar(u.id)}
                <span class="row-main"><strong>${u.name}</strong><small>${u.role === 'cliente' ? `${clientById(u.clientId)?.name}` : roleLabel[u.role]}</small></span>${icon('arrow')}
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
