// O que cada pessoa pode fazer com as peças, os pedidos e a conversa. Toda mudança fica registrada no histórico da peça.
import { db, mutate, nowIso, uid, userById, type Piece, type PieceKind, type Stage } from './db';
import { authorize } from './workflows';

function pieceAccess(id: string, by: string, staffOnly = false) {
  const p = db().pieces.find((p) => p.id === id);
  if (!p) throw new Error('Peça não encontrada.');
  const u = authorize(p.clientId, p.area === 'post' ? 'conteudo' : 'design', staffOnly);
  if (u.id !== by) throw new Error('Perfil inválido.');
  return { p, u };
}

const firstName = (id: string) => userById(id)?.name.split(' ')[0] ?? 'Alguém';

function log(p: Piece, by: string, text: string) {
  p.log.unshift({ at: nowIso(), by, text });
  p.updatedAt = nowIso();
}

function say(clientId: string, from: string, text: string) {
  db().messages.push({ id: uid(), clientId, from, text, at: nowIso(), read: false });
}

export function approve(pieceId: string, by: string) {
  const { p, u } = pieceAccess(pieceId, by);
  if (u.role !== 'cliente' || p.stage !== 'aprovacao') throw new Error('Esta peça não está disponível para sua aprovação.');
  mutate((d) => {
    const p = d.pieces.find((x) => x.id === pieceId);
    if (!p) return;
    p.stage = 'aprovado';
    log(p, by, `${firstName(by)} aprovou`);
    say(p.clientId, by, `Aprovado: ${p.title}.`);
  });
}

export function askChanges(pieceId: string, by: string, note: string) {
  const { p, u } = pieceAccess(pieceId, by);
  if (u.role !== 'cliente' || p.stage !== 'aprovacao' || !note.trim()) throw new Error('Informe um ajuste para uma peça em aprovação.');
  mutate((d) => {
    const p = d.pieces.find((x) => x.id === pieceId);
    if (!p) return;
    p.stage = 'ajuste';
    p.note = note;
    log(p, by, `${firstName(by)} pediu ajuste: ${note}`);
    say(p.clientId, by, `Ajuste em “${p.title}”: ${note}`);
  });
}

export function setStage(pieceId: string, by: string, stage: Stage) {
  pieceAccess(pieceId, by, true);
  const text: Record<Stage, string> = {
    briefing: 'voltou para o briefing', criacao: 'começou a criação', aprovacao: 'enviou para aprovação',
    ajuste: 'marcou em ajuste', aprovado: 'marcou como aprovado', publicado: 'marcou como publicado',
  };
  mutate((d) => {
    const p = d.pieces.find((x) => x.id === pieceId);
    if (!p) return;
    if (stage === 'publicado' && p.stage !== 'publicado') p.publishedAt = nowIso();
    p.stage = stage;
    if (stage === 'aprovacao') p.note = undefined;
    log(p, by, `${firstName(by)} ${text[stage]}`);
  });
}

export function saveMetrics(pieceId: string, by: string, metrics: NonNullable<Piece['metrics']>) {
  const { p } = pieceAccess(pieceId, by, true);
  if (p.stage !== 'publicado' || Object.values(metrics).some((v) => !Number.isSafeInteger(v) || v < 0)) throw new Error('Informe números inteiros positivos ou zero para uma peça publicada.');
  mutate((d) => { const target = d.pieces.find((p) => p.id === pieceId)!; target.publishedAt ??= target.updatedAt; target.metrics = metrics; log(target, by, 'Métricas de demonstração atualizadas'); });
}

/** A equipe sobe uma peça nova ou uma versão nova: o cliente vê na hora. */
export function upload(input: { pieceId?: string; clientId: string; area: Piece['area']; kind: PieceKind; title: string; due: string; image?: string }, by: string) {
  const user = authorize(input.clientId, input.area === 'post' ? 'conteudo' : 'design', true);
  if (user.id !== by || !input.title.trim()) throw new Error('Informe um título para a peça.');
  if (input.pieceId) pieceAccess(input.pieceId, by, true);
  let id = input.pieceId;
  mutate((d) => {
    const existing = d.pieces.find((x) => x.id === input.pieceId);
    if (existing) {
      if (input.image) existing.image = input.image;
      existing.stage = 'aprovacao';
      existing.note = undefined;
      log(existing, by, `${firstName(by)} subiu uma versão nova`);
      say(existing.clientId, by, `Versão nova de “${existing.title}” esperando seu ok.`);
      return;
    }
    id = uid();
    d.pieces.unshift({
      id, clientId: input.clientId, area: input.area, kind: input.kind, title: input.title, due: input.due,
      stage: 'aprovacao', by, image: input.image, updatedAt: nowIso(), log: [{ at: nowIso(), by, text: `${firstName(by)} subiu a peça` }],
    });
    say(input.clientId, by, `Peça nova esperando seu ok: ${input.title}.`);
  });
  return id!;
}

export function request(input: { clientId: string; title: string; detail: string; kind: PieceKind; due: string }, by: string) {
  const user = authorize(input.clientId, 'design');
  if (user.id !== by || !input.title.trim()) throw new Error('Informe um título para o pedido.');
  mutate((d) => {
    d.requests.unshift({ id: uid(), status: 'novo', createdAt: nowIso(), by, ...input });
    say(input.clientId, by, `Pedido novo de design: ${input.title}.`);
  });
}

export function setRequest(id: string, status: 'novo' | 'andamento' | 'entregue') {
  const r = db().requests.find((r) => r.id === id);
  if (!r) throw new Error('Pedido não encontrado.');
  authorize(r.clientId, 'design', true);
  mutate((d) => {
    const r = d.requests.find((x) => x.id === id);
    if (r) r.status = status;
  });
}

export function send(clientId: string, from: string, text: string, image?: string) {
  const user = authorize(clientId, 'suporte');
  if (user.id !== from || (!text.trim() && !image)) throw new Error('Escreva uma mensagem ou anexe uma imagem.');
  mutate((d) => d.messages.push({ id: uid(), clientId, from, text, at: nowIso(), read: false, image }));
}

/** Marca como lidas as mensagens que vieram do outro lado. */
export function markRead(clientId: string, viewerIsStaff: boolean) {
  const pending = db().messages.some((m) => m.clientId === clientId && !m.read && (userById(m.from)?.role === 'cliente') === viewerIsStaff);
  if (!pending) return;
  mutate((d) => d.messages.forEach((m) => {
    if (m.clientId === clientId && (userById(m.from)?.role === 'cliente') === viewerIsStaff) m.read = true;
  }));
}

/** Reduz a imagem antes de guardar, para caber no armazenamento do aparelho. */
export function readImage(file: File, max = 1080): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return Promise.reject(new Error('Escolha uma imagem JPG, PNG, WebP, GIF ou AVIF.'));
  if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error('A imagem deve ter até 10 MB.'));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('Não foi possível abrir essa imagem. Escolha outro arquivo.')); };
    img.src = URL.createObjectURL(file);
  });
}
