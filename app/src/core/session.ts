// Sessão por aba (sessionStorage): dá para abrir o admin numa aba e o cliente em outra e ver as mudanças ao vivo.
import { db, userById, clientById, type User, type Client } from '../data/db';
import type { PlanId } from './access';

const KEY = 'brnz:session';
type SessionData = { userId: string; scope?: string };

function read(): SessionData | null {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
}
function write(s: SessionData | null) {
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else sessionStorage.removeItem(KEY);
  } catch {}
}

export function currentUser(): User | null {
  const s = read();
  return s ? userById(s.userId) ?? null : null;
}

export const isStaff = (u: User) => u.role !== 'cliente';

/** Cliente em foco: o próprio, para clientes; o escolhido no seletor, para a equipe. */
export function scopeClient(): Client | null {
  const u = currentUser();
  if (!u) return null;
  if (u.role === 'cliente') return clientById(u.clientId) ?? null;
  const s = read();
  return clientById(s?.scope) ?? db().clients[0] ?? null;
}

export const scopePlan = (): PlanId | null => scopeClient()?.plan ?? null;

export function signIn(userId: string) { write({ userId }); }
export function signOut() { write(null); }
export function setScope(clientId: string) {
  const s = read();
  if (s) write({ ...s, scope: clientId });
}
