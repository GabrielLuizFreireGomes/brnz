// Dados de exemplo enquanto não existe backend. Tudo fica no localStorage do aparelho e é compartilhado
// entre abas: o que a equipe sobe aparece ao vivo para o cliente (BroadcastChannel + evento storage).
// Para ligar a uma API real, troque as funções deste arquivo mantendo as mesmas assinaturas.

import type { PlanId, Role } from '../core/access';

export type Client = { id: string; name: string; segment: string; city: string; plan: PlanId; since: string; hue: number };
export type User = { id: string; name: string; email: string; role: Role; clientId?: string; initials: string; title: string };

export type Stage = 'briefing' | 'criacao' | 'aprovacao' | 'ajuste' | 'aprovado' | 'publicado';
export type PieceKind = 'post' | 'carrossel' | 'story' | 'reels' | 'logo' | 'banner' | 'cardapio' | 'identidade';
export type Piece = {
  id: string; clientId: string; area: 'design' | 'post'; kind: PieceKind; title: string; stage: Stage;
  due: string; updatedAt: string; by: string; image?: string; note?: string;
  metrics?: { alcance: number; curtidas: number; comentarios: number; salvos: number };
  log: { at: string; by: string; text: string }[];
};
export type Request = { id: string; clientId: string; title: string; detail: string; kind: PieceKind; due: string; status: 'novo' | 'andamento' | 'entregue'; createdAt: string; by: string };
export type Site = { id: string; clientId: string; name: string; domain: string; status: 'no-ar' | 'desenvolvimento'; step: number; visits30: number; lastDeploy: string; stack: string };
export type Server = {
  clientId: string; host: string; region: string; uptime30: number; avgMs: number; cpu: number; mem: number; disk: number;
  sslUntil: string; response: number[]; deploys: { at: string; ref: string; text: string; ok: boolean }[];
};
export type SeoSource = { clicks: number; impressions: number; ctr: number; position: number; series: number[] };
export type Seo = { clientId: string; google: SeoSource; bing: SeoSource; queries: { q: string; clicks: number; impressions: number; position: number }[]; pages: { path: string; clicks: number }[] };
export type Invoice = { id: string; clientId: string; ref: string; due: string; amount: number; status: 'paga' | 'aberta' | 'vencida' };
export type Message = { id: string; clientId: string; from: string; text: string; at: string; read: boolean; image?: string };

export type Db = {
  version: number; clients: Client[]; users: User[]; pieces: Piece[]; requests: Request[]; sites: Site[];
  servers: Server[]; seo: Seo[]; invoices: Invoice[]; messages: Message[];
};

const KEY = 'brnz:db';
const VERSION = 2;

const day = 86_400_000;
const at = (days: number, h = 10, m = 0) => {
  const d = new Date(Date.now() + days * day);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
// Série com tendência e ruído determinístico, para os gráficos não mudarem a cada carga.
const series = (n: number, base: number, grow: number, wobble: number, seed: number) =>
  Array.from({ length: n }, (_, i) => Math.max(0, Math.round(base + grow * i + wobble * Math.sin(i * 1.7 + seed) + wobble * 0.5 * Math.cos(i * 0.6 + seed * 2))));

const work = {
  posts: new URL('../../../public/work/story-criacao-de-posts.jpg', import.meta.url).href,
  identidade: new URL('../../../public/work/story-identidade-visual.jpg', import.meta.url).href,
};

function seed(): Db {
  const clients: Client[] = [
    { id: 'dona-lu', name: 'Padaria Dona Lu', segment: 'Padaria e confeitaria', city: 'Taubaté, SP', plan: 'presenca', since: at(-84), hue: 32 },
    { id: 'sorriso-leve', name: 'Clínica Sorriso Leve', segment: 'Odontologia', city: 'São José dos Campos, SP', plan: 'completo', since: at(-140), hue: 172 },
    { id: 'atelie-mare', name: 'Ateliê Maré', segment: 'Moda autoral', city: 'Ubatuba, SP', plan: 'largada', since: at(-12), hue: 205 },
    { id: 'brasa-12', name: 'Brasa 12', segment: 'Hamburgueria', city: 'Jacareí, SP', plan: 'presenca', since: at(-47), hue: 4 },
  ];

  const users: User[] = [
    { id: 'gabriel', name: 'Gabriel Gomes', email: 'gabriel@brnz.com.br', role: 'admin', initials: 'GG', title: 'Sites e automação' },
    { id: 'arthur', name: 'Arthur Branze', email: 'arthur@brnz.com.br', role: 'admin', initials: 'AB', title: 'Design e edição de vídeo' },
    { id: 'captacao', name: 'Foto e filmagem', email: 'captacao@brnz.com.br', role: 'equipe', initials: 'FF', title: 'Captação' },
    { id: 'luciana', name: 'Luciana Ramos', email: 'luciana@donalu.com.br', role: 'cliente', clientId: 'dona-lu', initials: 'LR', title: 'Dona da Padaria Dona Lu' },
    { id: 'rafael', name: 'Rafael Tavares', email: 'rafael@sorrisoleve.com.br', role: 'cliente', clientId: 'sorriso-leve', initials: 'RT', title: 'Dentista e sócio' },
    { id: 'marina', name: 'Marina Costa', email: 'marina@ateliemare.com.br', role: 'cliente', clientId: 'atelie-mare', initials: 'MC', title: 'Estilista' },
    { id: 'diego', name: 'Diego Alves', email: 'diego@brasa12.com.br', role: 'cliente', clientId: 'brasa-12', initials: 'DA', title: 'Sócio da Brasa 12' },
  ];

  let n = 0;
  const piece = (p: Omit<Piece, 'id' | 'log' | 'updatedAt'> & { updatedAt?: string }): Piece => ({
    id: `p${++n}`, updatedAt: p.updatedAt ?? at(-1), log: [{ at: p.updatedAt ?? at(-1), by: p.by, text: 'Peça criada' }], ...p,
  });

  const pieces: Piece[] = [
    // Padaria Dona Lu: Presença, 12 posts e 4 vídeos por mês
    piece({ clientId: 'dona-lu', area: 'post', kind: 'carrossel', title: 'Pão de fermentação natural: as 48 horas', stage: 'aprovacao', due: at(2), by: 'arthur', image: work.posts, updatedAt: at(0, 9, 40) }),
    piece({ clientId: 'dona-lu', area: 'post', kind: 'reels', title: 'Fornada das 6h, sem cortes', stage: 'aprovacao', due: at(3), by: 'arthur', updatedAt: at(-1, 17, 10) }),
    piece({ clientId: 'dona-lu', area: 'post', kind: 'post', title: 'Encomendas de Natal abertas', stage: 'aprovado', due: at(6), by: 'arthur' }),
    piece({ clientId: 'dona-lu', area: 'post', kind: 'story', title: 'Enquete: sonho de creme ou de doce de leite?', stage: 'briefing', due: at(8), by: 'gabriel' }),
    piece({ clientId: 'dona-lu', area: 'post', kind: 'post', title: 'Café da manhã de domingo', stage: 'publicado', due: at(-3), by: 'arthur', updatedAt: at(-3), metrics: { alcance: 3420, curtidas: 286, comentarios: 31, salvos: 44 } }),
    piece({ clientId: 'dona-lu', area: 'post', kind: 'reels', title: 'Bastidores do bolo de rolo', stage: 'publicado', due: at(-6), by: 'arthur', updatedAt: at(-6), metrics: { alcance: 9810, curtidas: 742, comentarios: 58, salvos: 133 } }),
    piece({ clientId: 'dona-lu', area: 'post', kind: 'carrossel', title: 'Cinco pães para o fim de semana', stage: 'publicado', due: at(-10), by: 'arthur', updatedAt: at(-10), metrics: { alcance: 2875, curtidas: 199, comentarios: 12, salvos: 67 } }),
    piece({ clientId: 'dona-lu', area: 'design', kind: 'cardapio', title: 'Cardápio do balcão, versão de verão', stage: 'ajuste', due: at(4), by: 'arthur', note: 'Trocar o preço do pão de queijo para R$ 4,50' }),

    // Clínica Sorriso Leve: Completo
    piece({ clientId: 'sorriso-leve', area: 'post', kind: 'carrossel', title: 'Clareamento: o que muda em 3 sessões', stage: 'aprovacao', due: at(1), by: 'arthur', updatedAt: at(0, 8, 15) }),
    piece({ clientId: 'sorriso-leve', area: 'post', kind: 'reels', title: 'Um dia na recepção', stage: 'criacao', due: at(5), by: 'captacao' }),
    piece({ clientId: 'sorriso-leve', area: 'post', kind: 'post', title: 'Horário estendido às quintas', stage: 'publicado', due: at(-2), by: 'arthur', updatedAt: at(-2), metrics: { alcance: 1960, curtidas: 104, comentarios: 9, salvos: 6 } }),
    piece({ clientId: 'sorriso-leve', area: 'post', kind: 'reels', title: 'Mitos sobre aparelho invisível', stage: 'publicado', due: at(-9), by: 'arthur', updatedAt: at(-9), metrics: { alcance: 14_230, curtidas: 1_018, comentarios: 87, salvos: 212 } }),
    piece({ clientId: 'sorriso-leve', area: 'design', kind: 'banner', title: 'Banner da fachada, 3 × 1 m', stage: 'aprovacao', due: at(2), by: 'arthur', updatedAt: at(-1, 15, 30) }),

    // Ateliê Maré: Largada, identidade
    piece({ clientId: 'atelie-mare', area: 'design', kind: 'identidade', title: 'Logo e paleta: duas rotas', stage: 'aprovacao', due: at(1), by: 'arthur', image: work.identidade, updatedAt: at(0, 11, 5) }),
    piece({ clientId: 'atelie-mare', area: 'design', kind: 'post', title: 'Kit de 6 modelos editáveis', stage: 'briefing', due: at(9), by: 'arthur' }),

    // Brasa 12: Presença
    piece({ clientId: 'brasa-12', area: 'post', kind: 'reels', title: 'Smash no ponto, em câmera lenta', stage: 'criacao', due: at(2), by: 'captacao' }),
    piece({ clientId: 'brasa-12', area: 'post', kind: 'post', title: 'Combo de terça', stage: 'publicado', due: at(-4), by: 'arthur', updatedAt: at(-4), metrics: { alcance: 4120, curtidas: 351, comentarios: 40, salvos: 22 } }),
  ];

  const requests: Request[] = [
    { id: 'r1', clientId: 'dona-lu', title: 'Arte para a vitrine de Natal', detail: 'Adesivo para o vidro da frente, 1,2 × 0,8 m, com o horário de fim de ano.', kind: 'banner', due: at(12), status: 'novo', createdAt: at(-1, 16, 20), by: 'luciana' },
    { id: 'r2', clientId: 'dona-lu', title: 'Etiqueta dos potes de geleia', detail: 'Três sabores: morango, goiaba e laranja.', kind: 'identidade', due: at(10), status: 'andamento', createdAt: at(-5), by: 'luciana' },
    { id: 'r3', clientId: 'sorriso-leve', title: 'Cartão de retorno', detail: 'Frente e verso, com QR code para agendar.', kind: 'post', due: at(7), status: 'andamento', createdAt: at(-3), by: 'rafael' },
    { id: 'r4', clientId: 'atelie-mare', title: 'Tag de roupa', detail: 'Tag de papel kraft com o logo novo, quando a identidade for aprovada.', kind: 'identidade', due: at(20), status: 'novo', createdAt: at(-2), by: 'marina' },
  ];

  const sites: Site[] = [
    { id: 's1', clientId: 'sorriso-leve', name: 'Site da clínica', domain: 'sorrisoleve.com.br', status: 'no-ar', step: 4, visits30: 2_184, lastDeploy: at(-2, 14, 12), stack: 'Astro · Cloudflare' },
    { id: 's2', clientId: 'sorriso-leve', name: 'Página de agendamento', domain: 'agenda.sorrisoleve.com.br', status: 'desenvolvimento', step: 2, visits30: 0, lastDeploy: at(-1, 18, 40), stack: 'Astro · WhatsApp API' },
  ];

  const servers: Server[] = [
    {
      clientId: 'sorriso-leve', host: 'sorrisoleve.com.br', region: 'São Paulo (gru1)', uptime30: 99.97, avgMs: 182, cpu: 23, mem: 41, disk: 37, sslUntil: at(64),
      response: series(30, 170, 0.2, 18, 3).map((v, i) => (i === 21 ? v + 260 : v)),
      deploys: [
        { at: at(-1, 18, 40), ref: 'a3f9c21', text: 'Agenda: formulário com horários livres', ok: true },
        { at: at(-2, 14, 12), ref: '7be01d4', text: 'Home: depoimentos novos', ok: true },
        { at: at(-6, 10, 3), ref: 'c41d8e0', text: 'Ajuste de cache das imagens', ok: false },
        { at: at(-6, 10, 25), ref: 'd02aa17', text: 'Ajuste de cache das imagens (refeito)', ok: true },
      ],
    },
  ];

  const seo: Seo[] = [
    {
      clientId: 'sorriso-leve',
      google: { clicks: 1_312, impressions: 41_870, ctr: 3.1, position: 11.4, series: series(28, 32, 0.9, 7, 1) },
      bing: { clicks: 146, impressions: 5_930, ctr: 2.5, position: 9.8, series: series(28, 4, 0.1, 2, 4) },
      queries: [
        { q: 'dentista são josé dos campos', clicks: 402, impressions: 9_820, position: 6.2 },
        { q: 'clareamento dental sjc', clicks: 233, impressions: 4_110, position: 4.8 },
        { q: 'aparelho invisível preço', clicks: 151, impressions: 7_540, position: 14.9 },
        { q: 'sorriso leve clínica', clicks: 138, impressions: 412, position: 1.1 },
        { q: 'dentista aberto quinta à noite', clicks: 61, impressions: 1_880, position: 8.3 },
      ],
      pages: [
        { path: '/', clicks: 618 }, { path: '/clareamento', clicks: 301 }, { path: '/aparelho-invisivel', clicks: 214 }, { path: '/contato', clicks: 97 },
      ],
    },
  ];

  const invoices: Invoice[] = [];
  const price: Record<PlanId, number> = { largada: 1490, presenca: 2290, completo: 3990 };
  for (const c of clients) {
    if (c.plan === 'largada') {
      invoices.push({ id: `${c.id}-1`, clientId: c.id, ref: 'Sinal do projeto (50%)', due: at(-10), amount: 745, status: 'paga' });
      invoices.push({ id: `${c.id}-2`, clientId: c.id, ref: 'Entrega do projeto (50%)', due: at(15), amount: 745, status: 'aberta' });
      continue;
    }
    const months = Math.min(4, Math.ceil((Date.now() - Date.parse(c.since)) / (30 * day)));
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i + 1, 5);
      const ref = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      invoices.push({ id: `${c.id}-${i}`, clientId: c.id, ref: ref.charAt(0).toUpperCase() + ref.slice(1), due: d.toISOString(), amount: price[c.plan], status: i === 0 ? 'aberta' : 'paga' });
    }
  }
  const late = invoices.find((i) => i.clientId === 'brasa-12' && i.status === 'paga');
  if (late) late.status = 'vencida';

  const messages: Message[] = [
    { id: 'm1', clientId: 'dona-lu', from: 'luciana', text: 'Bom dia! Dá pra trocar a foto do carrossel do pão? Tenho uma da fornada de ontem que ficou linda.', at: at(-1, 8, 12), read: true },
    { id: 'm2', clientId: 'dona-lu', from: 'arthur', text: 'Dá sim, Luciana. Manda por aqui que eu encaixo na segunda lâmina e te devolvo hoje.', at: at(-1, 8, 40), read: true },
    { id: 'm3', clientId: 'dona-lu', from: 'arthur', text: 'Subi a versão nova do carrossel na aba Posts, está esperando seu ok.', at: at(0, 9, 41), read: false },
    { id: 'm4', clientId: 'sorriso-leve', from: 'gabriel', text: 'Rafael, a página de agendamento já está no ambiente de teste. Assim que você aprovar os horários, publico.', at: at(-1, 18, 45), read: false },
    { id: 'm5', clientId: 'brasa-12', from: 'diego', text: 'Pessoal, a mensalidade de setembro ficou para trás, pago até sexta.', at: at(-2, 21, 3), read: false },
    { id: 'm6', clientId: 'atelie-mare', from: 'arthur', text: 'Marina, as duas rotas do logo estão na aba Design. A rota B usa a onda do mar no M.', at: at(0, 11, 6), read: false },
  ];

  return { version: VERSION, clients, users, pieces, requests, sites, servers, seo, invoices, messages };
}

// ---------- Armazenamento ----------

let cache: Db | null = null;
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('brnz') : null;
const listeners = new Set<() => void>();

export function db(): Db {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Db;
      if (parsed.version === VERSION) return (cache = parsed);
    }
  } catch {}
  cache = seed();
  persist(false);
  return cache;
}

function persist(broadcast = true) {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
  if (broadcast) channel?.postMessage('change');
}

/** Muda os dados e avisa as outras abas e telas abertas. */
export function mutate(fn: (d: Db) => void) {
  fn(db());
  persist();
  listeners.forEach((l) => l());
}

export function onChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function reloadFromOutside() {
  cache = null;
  listeners.forEach((l) => l());
}
channel?.addEventListener('message', reloadFromOutside);
window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === 'brnz:matrix') reloadFromOutside(); });

export function resetDb() {
  try { localStorage.removeItem(KEY); } catch {}
  cache = null;
  db();
  channel?.postMessage('change');
  listeners.forEach((l) => l());
}

export const uid = () => Math.random().toString(36).slice(2, 10);
export const nowIso = () => new Date().toISOString();

// ---------- Consultas ----------

export const userById = (id: string) => db().users.find((u) => u.id === id);
export const clientById = (id: string | undefined) => db().clients.find((c) => c.id === id);
export const piecesOf = (clientId: string, area?: Piece['area']) => db().pieces.filter((p) => p.clientId === clientId && (!area || p.area === area));
export const unreadFor = (clientId: string, viewerIsStaff: boolean) =>
  db().messages.filter((m) => m.clientId === clientId && !m.read && (userById(m.from)?.role === 'cliente') === viewerIsStaff).length;
