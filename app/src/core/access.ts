// Quem vê o quê. Cada tela do app é um módulo; o acesso sai do papel da pessoa e, para clientes, do plano.
// O admin pode mudar a matriz plano × módulo na tela "Acessos" sem mexer no código.

export type Role = 'admin' | 'equipe' | 'cliente';
export type PlanId = 'largada' | 'presenca' | 'completo';
export type ModuleId =
  | 'inicio' | 'design' | 'conteudo' | 'sites' | 'servidor' | 'busca'
  | 'suporte' | 'assinatura' | 'clientes' | 'acessos' | 'conta';

export type ModuleDef = {
  id: ModuleId;
  label: string;
  /** Rótulo curto da barra inferior no celular */
  short: string;
  icon: string;
  /** Papéis que podem abrir o módulo */
  roles: Role[];
  /** Módulo sobre os dados de um cliente: liberado conforme o plano dele */
  byPlan?: boolean;
  /** Ordem de prioridade na barra inferior do celular (menor primeiro) */
  pin?: number;
  group: 'cliente' | 'estudio' | 'conta';
};

export const roleLabel: Record<Role, string> = { admin: 'Administrador', equipe: 'Equipe', cliente: 'Cliente' };

export const plans: { id: PlanId; name: string; price: string; period: string }[] = [
  { id: 'largada', name: 'Largada', price: 'R$ 1.490', period: 'projeto único' },
  { id: 'presenca', name: 'Presença', price: 'R$ 2.290', period: 'por mês' },
  { id: 'completo', name: 'Completo', price: 'R$ 3.990', period: 'por mês' },
];
export const planName = (id: PlanId) => plans.find((p) => p.id === id)?.name ?? id;

export const modules: ModuleDef[] = [
  { id: 'inicio', label: 'Início', short: 'Início', icon: 'home', roles: ['admin', 'equipe', 'cliente'], pin: 1, group: 'cliente' },
  { id: 'design', label: 'Design', short: 'Design', icon: 'pen', roles: ['admin', 'equipe', 'cliente'], byPlan: true, pin: 3, group: 'cliente' },
  { id: 'conteudo', label: 'Posts', short: 'Posts', icon: 'grid', roles: ['admin', 'equipe', 'cliente'], byPlan: true, pin: 4, group: 'cliente' },
  { id: 'sites', label: 'Sites', short: 'Sites', icon: 'browser', roles: ['admin', 'equipe', 'cliente'], byPlan: true, pin: 6, group: 'cliente' },
  { id: 'servidor', label: 'Servidor', short: 'Servidor', icon: 'server', roles: ['admin', 'equipe', 'cliente'], byPlan: true, group: 'cliente' },
  { id: 'busca', label: 'Busca (SEO)', short: 'Busca', icon: 'search', roles: ['admin', 'equipe', 'cliente'], byPlan: true, group: 'cliente' },
  { id: 'suporte', label: 'Conversa', short: 'Conversa', icon: 'chat', roles: ['admin', 'equipe', 'cliente'], pin: 2, group: 'cliente' },
  { id: 'assinatura', label: 'Assinatura', short: 'Plano', icon: 'card', roles: ['admin', 'cliente'], group: 'cliente' },
  { id: 'clientes', label: 'Clientes', short: 'Clientes', icon: 'users', roles: ['admin', 'equipe'], pin: 2, group: 'estudio' },
  { id: 'acessos', label: 'Acessos', short: 'Acessos', icon: 'key', roles: ['admin'], group: 'estudio' },
  { id: 'conta', label: 'Conta', short: 'Conta', icon: 'user', roles: ['admin', 'equipe', 'cliente'], group: 'conta' },
];
export const moduleById = (id: string) => modules.find((m) => m.id === id);

/** Módulos que dependem de plano */
export const planModules = modules.filter((m) => m.byPlan);

export type PlanMatrix = Record<PlanId, ModuleId[]>;

// Padrão: o que cada pacote do site entrega vira tela no app.
export const defaultMatrix: PlanMatrix = {
  largada: ['design'],
  presenca: ['design', 'conteudo'],
  completo: ['design', 'conteudo', 'sites', 'servidor', 'busca'],
};

const MATRIX_KEY = 'brnz:matrix';

export function loadMatrix(): PlanMatrix {
  try {
    const raw = localStorage.getItem(MATRIX_KEY);
    if (raw) return { ...defaultMatrix, ...JSON.parse(raw) };
  } catch {}
  return structuredClone(defaultMatrix);
}

export function saveMatrix(m: PlanMatrix) {
  try { localStorage.setItem(MATRIX_KEY, JSON.stringify(m)); } catch {}
}

export function resetMatrix() {
  try { localStorage.removeItem(MATRIX_KEY); } catch {}
}

/** Módulos visíveis para um papel, olhando o plano do cliente em foco. */
export function visibleModules(role: Role, plan: PlanId | null, matrix = loadMatrix()): ModuleDef[] {
  return modules.filter((m) => {
    if (!m.roles.includes(role)) return false;
    if (m.byPlan) return plan !== null && matrix[plan].includes(m.id);
    return true;
  });
}

export const can = (role: Role, plan: PlanId | null, id: ModuleId) => visibleModules(role, plan).some((m) => m.id === id);

/** O que o próximo plano libera, para a tela de assinatura. */
export function unlockedBy(from: PlanId, to: PlanId, matrix = loadMatrix()): ModuleDef[] {
  return planModules.filter((m) => matrix[to].includes(m.id) && !matrix[from].includes(m.id));
}
