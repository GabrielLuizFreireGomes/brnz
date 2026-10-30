import { db, mutate, nowIso, uid, type Client, type Site } from './db';
import { currentUser } from '../core/session';
import { can, type ModuleId } from '../core/access';

export function authorize(clientId: string, module: ModuleId, staffOnly = false) {
  const user = currentUser();
  const client = db().clients.find((c) => c.id === clientId);
  if (!user || !client || (staffOnly && user.role === 'cliente') || (user.role === 'cliente' && user.clientId !== clientId) || !can(user.role, client.plan, module)) throw new Error('Seu perfil não tem acesso a esta ação.');
  return user;
}

export function saveSite(input: Pick<Site, 'name' | 'domain' | 'step' | 'stack'>, clientId: string, id?: string) {
  authorize(clientId, 'sites', true);
  const name = input.name.trim();
  const domain = input.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!name || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) throw new Error('Informe um nome e um domínio válido, sem caminhos.');
  const step = Math.min(4, Math.max(0, Number(input.step)));
  mutate((d) => {
    const existing = d.sites.find((s) => s.id === id && s.clientId === clientId);
    const values = { name, domain, step, stack: input.stack.trim() || 'A definir', lastDeploy: nowIso(), status: step === 4 ? 'no-ar' as const : 'desenvolvimento' as const };
    if (existing) Object.assign(existing, values, { approvedAt: undefined });
    else d.sites.unshift({ id: uid(), clientId, visits30: 0, ...values });
  });
}

export function reviewSite(id: string, approved: boolean, feedback: string) {
  const site = db().sites.find((s) => s.id === id);
  if (!site) throw new Error('Site não encontrado.');
  const user = authorize(site.clientId, 'sites');
  if (user.role !== 'cliente' || site.step !== 3) throw new Error('Este site não está em revisão.');
  if (!approved && !feedback.trim()) throw new Error('Descreva o ajuste necessário.');
  mutate((d) => {
    const target = d.sites.find((s) => s.id === id)!;
    target.feedback = approved ? 'Revisão aprovada pelo cliente.' : feedback.trim();
    target.approvedAt = approved ? nowIso() : undefined;
    d.messages.push({ id: uid(), clientId: site.clientId, from: user.id, at: nowIso(), read: false, text: `${approved ? 'Aprovei a revisão' : 'Pedido de ajuste'} do site ${site.name}: ${target.feedback}` });
  });
}

export function payInvoice(id: string) {
  const invoice = db().invoices.find((i) => i.id === id);
  if (!invoice) throw new Error('Fatura não encontrada.');
  authorize(invoice.clientId, 'assinatura');
  if (invoice.status === 'paga') return;
  mutate((d) => { const target = d.invoices.find((i) => i.id === id)!; target.status = 'paga'; target.paidAt = nowIso(); });
}

export function saveClient(input: Pick<Client, 'name' | 'segment' | 'city' | 'plan'> & { contact: string; email: string }, id?: string) {
  if (currentUser()?.role !== 'admin') throw new Error('Somente administradores podem gerenciar clientes.');
  if (!input.name.trim() || !input.contact.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) throw new Error('Preencha a empresa, o contato e um e-mail válido.');
  const email = input.email.trim().toLowerCase();
  if (db().users.some((u) => u.email === email && u.clientId !== id)) throw new Error('Este e-mail já está em uso.');
  const clientId = id || uid();
  mutate((d) => {
    const existing = d.clients.find((c) => c.id === id);
    const values = { name: input.name.trim(), segment: input.segment.trim(), city: input.city.trim(), plan: input.plan };
    if (existing) Object.assign(existing, values);
    else d.clients.push({ id: clientId, ...values, since: nowIso(), hue: 232 });
    const user = d.users.find((u) => u.clientId === clientId);
    const contact = { name: input.contact.trim(), email, initials: input.contact.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() };
    if (user) Object.assign(user, contact);
    else d.users.push({ id: uid(), role: 'cliente', clientId, title: 'Contato do cliente', ...contact });
  });
  return clientId;
}

export function downloadText(name: string, text: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
