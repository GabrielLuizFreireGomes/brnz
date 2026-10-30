import { db, mutate, userById, type User, type Client } from "./db";
import { can } from "../core/access";
import { currentUser } from "../core/session";
import { href } from "../core/router";

export type Notification = {
  id: string;
  title: string;
  detail: string;
  icon: string;
  href: string;
  clientId: string;
  module: string;
  param?: string;
  at: string;
  read: boolean;
};

export function notificationsFor(user: User, client: Client): Notification[] {
  const d = db(),
    staff = user.role !== "cliente";
  const read = new Set(user.notificationRead ?? []);
  const items: Notification[] = [];
  const allowed = (
    clientId: string,
    module: "design" | "conteudo" | "sites" | "assinatura" | "suporte",
  ) => {
    const cl = d.clients.find((x) => x.id === clientId);
    return (
      cl &&
      (staff || clientId === user.clientId) &&
      can(user.role, cl.plan, module)
    );
  };
  const add = (item: Omit<Notification, "href" | "read">) =>
    items.push({
      ...item,
      href: href(item.module, item.param),
      read: read.has(item.id),
    });
  for (const cl of d.clients) {
    if (!allowed(cl.id, "suporte")) continue;
    const messages = d.messages.filter(
      (m) =>
        m.clientId === cl.id &&
        !m.read &&
        (userById(m.from)?.role === "cliente") === staff,
    );
    const last = messages.at(-1);
    if (last)
      add({
        id: `message:${last.id}`,
        title:
          messages.length === 1
            ? "Nova mensagem"
            : `${messages.length} novas mensagens`,
        detail: staff
          ? cl.name
          : `${userById(last.from)?.name.split(" ")[0] ?? "Equipe"}: ${last.text || "Imagem enviada"}`,
        icon: "chat",
        module: "suporte",
        param: staff ? cl.id : undefined,
        clientId: cl.id,
        at: last.at,
      });
  }
  for (const p of d.pieces) {
    const module = p.area === "post" ? "conteudo" : "design";
    if (!allowed(p.clientId, module)) continue;
    if ((!staff && p.stage === "aprovacao") || (staff && p.stage === "ajuste"))
      add({
        id: `piece:${p.id}:${p.stage}:${p.updatedAt}`,
        title: staff ? "Ajuste solicitado" : "Peça para aprovar",
        detail: p.title,
        icon: staff ? "pen" : "check",
        module,
        param: p.id,
        clientId: p.clientId,
        at: p.updatedAt,
      });
  }
  if (staff)
    for (const r of d.requests) {
      if (r.status === "novo" && allowed(r.clientId, "design"))
        add({
          id: `request:${r.id}`,
          title: "Novo pedido de design",
          detail: r.title,
          icon: "pen",
          module: "design",
          clientId: r.clientId,
          at: r.createdAt,
        });
    }
  for (const invoice of d.invoices) {
    if (invoice.status === "paga" || !allowed(invoice.clientId, "assinatura"))
      continue;
    add({
      id: `invoice:${invoice.id}:${invoice.status}`,
      title:
        invoice.status === "vencida" ? "Fatura vencida" : "Fatura disponível",
      detail: `${d.clients.find((x) => x.id === invoice.clientId)?.name} · ${invoice.ref}`,
      icon: "card",
      module: "assinatura",
      clientId: invoice.clientId,
      at: invoice.due,
    });
  }
  if (!staff)
    for (const site of d.sites) {
      if (
        site.step === 3 &&
        !site.approvedAt &&
        allowed(site.clientId, "sites")
      )
        add({
          id: `site:${site.id}:${site.lastDeploy}`,
          title: "Site pronto para revisão",
          detail: site.name,
          icon: "browser",
          module: "sites",
          clientId: site.clientId,
          at: site.lastDeploy,
        });
    }
  return items.sort(
    (a, b) => Number(a.read) - Number(b.read) || b.at.localeCompare(a.at),
  );
}

export function readNotifications(ids: string[]) {
  const user = currentUser();
  if (!user) return;
  mutate((d) => {
    const target = d.users.find((x) => x.id === user.id)!;
    target.notificationRead = [
      ...new Set([...(target.notificationRead ?? []), ...ids]),
    ].slice(-2000);
  });
}
