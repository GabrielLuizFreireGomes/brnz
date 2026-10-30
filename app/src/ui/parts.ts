// Peças pequenas reaproveitadas pelas telas.
import { html, raw, type View } from '../core/dom';
import { num, shortDate } from '../core/format';
import { userById, type Piece, type PieceKind, type Stage } from '../data/db';
import { icon } from './icons';

export const stageLabel: Record<Stage, string> = {
  briefing: 'Briefing', criacao: 'Em criação', aprovacao: 'Esperando seu ok', ajuste: 'Em ajuste', aprovado: 'Aprovado', publicado: 'Publicado',
};
// Rótulo do ponto de vista da equipe
export const stageLabelStaff: Record<Stage, string> = { ...stageLabel, aprovacao: 'Com o cliente' };
export const stageOrder: Stage[] = ['briefing', 'criacao', 'aprovacao', 'ajuste', 'aprovado', 'publicado'];
const stageTone: Record<Stage, string> = { briefing: 'mute', criacao: 'info', aprovacao: 'warn', ajuste: 'info', aprovado: 'ok', publicado: 'ok' };

export const kindLabel: Record<PieceKind, string> = {
  post: 'Post', carrossel: 'Carrossel', story: 'Story', reels: 'Reels', logo: 'Logo', banner: 'Banner', cardapio: 'Cardápio', identidade: 'Identidade',
};

export const pill = (text: string, tone = 'mute') => html`<span class="pill pill--${tone}">${text}</span>`;
export const stagePill = (s: Stage, staff = false) => pill((staff ? stageLabelStaff : stageLabel)[s], stageTone[s]);

/** Iniciais numa tinta própria de cada pessoa (identidade, não dado). */
export function avatar(userId: string, size: 'sm' | 'md' = 'md') {
  const u = userById(userId);
  const hue = u?.role === 'cliente' ? 32 : 232;
  const n = [...(u?.id ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0);
  return html`<span class="avatar avatar--${size}" style="--h:${(hue + (n % 7) * 18) % 360}" aria-hidden="true">${u?.initials ?? '?'}</span>`;
}

/** Miniatura da peça: a imagem enviada, ou um bloco chapado com o formato. */
export function thumb(p: Piece, cls = '') {
  if (p.image) return html`<span class="thumb ${cls}"><img src="${p.image}" alt="" loading="lazy" decoding="async" /></span>`;
  return html`<span class="thumb thumb--flat ${cls}" data-kind="${p.kind}"><span>${kindLabel[p.kind]}</span></span>`;
}

export const empty = (title: string, text: string, action?: View) =>
  html`<div class="empty"><p class="empty-title">${title}</p><p>${text}</p>${action ?? ''}</div>`;

export const sectionHead = (title: string, aside?: View | '') =>
  html`<div class="sec-head"><h2>${title}</h2>${aside ?? ''}</div>`;

export const metaBy = (p: Piece) => `${kindLabel[p.kind]} · ${userById(p.by)?.name.split(' ')[0] ?? 'brnz'} · entrega ${shortDate(p.due)}`;

export const metricRow = (m: NonNullable<Piece['metrics']>) => html`
  <dl class="mini-metrics">
    <div><dt>Alcance</dt><dd>${num(m.alcance)}</dd></div>
    <div><dt>Curtidas</dt><dd>${num(m.curtidas)}</dd></div>
    <div><dt>Coment.</dt><dd>${num(m.comentarios)}</dd></div>
    <div><dt>Salvos</dt><dd>${num(m.salvos)}</dd></div>
  </dl>`;

export const chev = () => icon('chevron', 'ico--end');
export { raw };
