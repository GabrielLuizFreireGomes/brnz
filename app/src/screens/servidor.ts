import { html, on } from '../core/dom';
import { relDay, two, when } from '../core/format';
import { db, mutate, nowIso, uid } from '../data/db';
import { authorize } from '../data/workflows';
import type { Screen } from '../core/screen';
import { dayLabels, line, meter } from '../ui/chart';
import { empty, pill, sectionHead } from '../ui/parts';

export const servidor: Screen = {
  title: () => 'Servidor',
  sub: (c) => {
    const s = db().servers.find((x) => x.clientId === c.client.id);
    return s ? `${s.host} · ${s.region}` : c.client.name;
  },
  view: (c) => {
    const s = db().servers.find((x) => x.clientId === c.client.id);
    if (!s) return empty('Sem servidor ainda', 'Quando o site for ao ar, a saúde do servidor aparece aqui.');
    const peak = s.response.indexOf(Math.max(...s.response));
    const sslDays = Math.round((Date.parse(s.sslUntil) - Date.now()) / 86_400_000);

    return html`
    <div class="toolbar"><p class="status-line"><i></i>Ambiente operacional <span class="muted small">· simulação</span></p><div class="toolbar-actions"><button class="btn btn--ghost btn--sm" data-health>Verificar saúde</button>${c.staff ? html`<button class="btn btn--ghost btn--sm" data-cache>Simular limpeza de cache</button>` : ''}</div></div>
    <p class="notice" data-health-result hidden role="status"></p>
    <dl class="kpis">
      <div><dt>No ar, 30 dias</dt><dd class="fig">${two(s.uptime30)}%</dd><small>${Math.round((100 - s.uptime30) * 432)} min fora</small></div>
      <div><dt>Resposta média</dt><dd class="fig">${s.avgMs} ms</dd><small>abaixo de 300 ms é rápido</small></div>
      <div><dt>Certificado SSL</dt><dd class="fig ${sslDays < 15 ? 'warn-text' : ''}">${sslDays} dias</dd><small>validade simulada</small></div>
    </dl>

    <div class="cols">
      <section class="panel col-main">
        <div class="panel-head"><h2>Tempo de resposta</h2><span class="muted small">ms, média do dia</span></div>
        ${line(s.response, { label: 'Tempo de resposta nos últimos 30 dias', labels: dayLabels(30), unit: 'ms', mark: peak })}
        <p class="muted small">Pico ${relDay(new Date(Date.now() - (29 - peak) * 86_400_000).toISOString())}: ${s.response[peak]} ms, durante a troca de cache das imagens.</p>
      </section>
      <section class="panel col-side">
        <div class="panel-head"><h2>Uso agora</h2></div>
        ${meter('Processador', s.cpu)}${meter('Memória', s.mem)}${meter('Disco', s.disk)}
      </section>
    </div>

    <section class="block">
      ${sectionHead('Publicações')}
      <ul class="list list--rows">${[...s.deploys].sort((a, b) => b.at.localeCompare(a.at)).map((d) => html`
        <li class="row row--static">
          <code class="ref">${d.ref}</code>
          <span class="row-main"><strong>${d.text}</strong><small>${when(d.at)}</small></span>
          ${d.ok ? pill('Publicado', 'ok') : pill('Falhou', 'bad')}
        </li>`)}</ul>
    </section>`;
  },
  mount: (root, c) => {
    on(root, 'click', '[data-health]', () => { authorize(c.client.id, 'servidor'); const result = root.querySelector<HTMLElement>('[data-health-result]')!; result.hidden = false; result.textContent = `Verificação simulada às ${new Date().toLocaleTimeString('pt-BR')}: HTTP 200 · DNS disponível · SSL válido. Nenhuma requisição foi enviada ao servidor.`; });
    on(root, 'click', '[data-cache]', () => { authorize(c.client.id, 'servidor', true); mutate((d) => { const server = d.servers.find((s) => s.clientId === c.client.id)!; server.deploys.unshift({ at: nowIso(), ref: uid().slice(0, 7), text: 'Simulação de limpeza de cache concluída', ok: true }); }); c.toast('Limpeza simulada registrada no histórico.'); });
  },
};
