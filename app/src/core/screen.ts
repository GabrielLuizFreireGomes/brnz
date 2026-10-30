import type { ModuleDef, PlanId } from './access';
import type { Client, User } from '../data/db';
import type { View } from './dom';

export type Ctx = {
  user: User;
  staff: boolean;
  /** Cliente em foco (o próprio cliente, ou o escolhido pela equipe) */
  client: Client;
  plan: PlanId;
  modules: ModuleDef[];
  param?: string;
  /** Pede um novo desenho da tela atual */
  refresh: () => void;
  toast: (text: string) => void;
};

export type Screen = {
  title: (c: Ctx) => string;
  /** Linha de contexto sob o título */
  sub?: (c: Ctx) => string;
  /** Ação principal no cabeçalho */
  action?: (c: Ctx) => View | '';
  view: (c: Ctx) => View;
  /** Liga os eventos depois de desenhar; o retorno roda ao sair da tela */
  mount?: (root: HTMLElement, c: Ctx) => void | (() => void);
};
