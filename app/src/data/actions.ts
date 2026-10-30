// O que cada pessoa pode fazer com as peças, os pedidos e a conversa. Toda mudança fica registrada no histórico da peça.
import { db, mutate, nowIso, uid, userById, type Piece, type PieceKind, type Stage } from './db';

const firstName = (id: string) => userById(id)?.name.split(' ')[0] ?? 'Alguém';

function log(p: Piece, by: string, text: string) {
  p.log.unshift({ at: nowIso(), by, text });
  p.updatedAt = nowIso();
}

function say(clientId: string, from: string, text: string) {
  db().messages.push({ id: uid(), clientId, from, text, at: nowIso(), read: false });
}

export function approve(pieceId: string, by: string) {
  mutate((d) => {
    const p = d.pieces.find((x) => x.id === pieceId);
    if (!p) return;
    p.stage = 'aprovado';
    log(p, by, `${firstName(by)} aprovou`);
    say(p.clientId, by, `Aprovado: ${p.title}.`);
  });
}

export function askChanges(pieceId: string, by: string, note: string) {
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
  const text: Record<Stage, string> = {
    briefing: 'voltou para o briefing', criacao: 'começou a criação', aprovacao: 'enviou para aprovação',
    ajuste: 'marcou em ajuste', aprovado: 'marcou como aprovado', publicado: 'marcou como publicado',
  };
  mutate((d) => {
    const p = d.pieces.find((x) => x.id === pieceId);
    if (!p) return;
    p.stage = stage;
    if (stage === 'aprovacao') p.note = undefined;
    log(p, by, `${firstName(by)} ${text[stage]}`);
  });
}

/** A equipe sobe uma peça nova ou uma versão nova: o cliente vê na hora. */
export function upload(input: { pieceId?: string; clientId: string; area: Piece['area']; kind: PieceKind; title: string; due: string; image?: string }, by: string) {
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
  mutate((d) => {
    d.requests.unshift({ id: uid(), status: 'novo', createdAt: nowIso(), by, ...input });
    say(input.clientId, by, `Pedido novo de design: ${input.title}.`);
  });
}

export function setRequest(id: string, status: 'novo' | 'andamento' | 'entregue') {
  mutate((d) => {
    const r = d.requests.find((x) => x.id === id);
    if (r) r.status = status;
  });
}

export function send(clientId: string, from: string, text: string, image?: string) {
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
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
